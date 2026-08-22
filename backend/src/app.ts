import express, { type NextFunction, type Request, type Response } from 'express';
import { createHmac } from 'node:crypto';
import type { OrderStatus } from '../../src/types';
import { createApiSecret, createToken, createTrackingId, hashPassword, verifyPassword, verifyToken } from './utils/crypto';
import { getState, pushWebhookEvent, resetState, stripOrder, stripUser, toWorkspaceSnapshot, updateState } from './store';
import type { StoredApiKey, StoredCustomer, StoredInvoice, StoredNotification, StoredOrder, StoredUser } from './types';

const app = express();
const authSecret = process.env.SENDIE_AUTH_SECRET || process.env.JWT_SECRET || 'sendie-dev-secret';
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY || '';
const paystackPublicUrl = (process.env.APP_URL || process.env.SENDIE_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
const paymentProvider = (process.env.SENDIE_PAYMENT_PROVIDER || 'paystack').toLowerCase();

app.disable('x-powered-by');
app.use(
  express.json({
    limit: '1mb',
    verify: (req, _res, buffer) => {
      (req as Request & { rawBody?: string }).rawBody = buffer.toString('utf8');
    },
  }),
);
app.use((_, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key, x-paystack-signature');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  next();
});
app.options('*', (_, res) => {
  res.sendStatus(204);
});

type AuthenticatedRequest = Request & { user?: StoredUser; apiKey?: StoredApiKey };
type WorkspaceRole = StoredUser['accountType'];

const allowedAccountTypes: WorkspaceRole[] = ['Merchant', 'Developer/Startup', 'Logistics Company', 'Admin'];

const isWorkspaceRole = (value: unknown): value is WorkspaceRole =>
  typeof value === 'string' && allowedAccountTypes.includes(value as WorkspaceRole);

const sendSuccess = <T>(res: Response, message: string, data?: T, status = 200) =>
  res.status(status).json({ status: 'success', message, data });

const sendError = (res: Response, status: number, message: string, code?: string) => {
  updateState((state) => {
    state.apiUsage.failedRequests += 1;
  });

  return res.status(status).json({
    status: 'error',
    message,
    error: { code },
  });
};

const incrementSuccess = () => {
  updateState((state) => {
    state.apiUsage.requestsCount += 1;
    state.apiUsage.successfulRequests += 1;
  });
};

const normalizeEmail = (value: string) => value.trim().toLowerCase();

const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authorization = req.header('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return sendError(res, 401, 'Missing bearer token', 'UNAUTHORIZED');
  }

  const token = authorization.slice('Bearer '.length);
  const payload = verifyToken(token, authSecret);

  if (!payload || typeof payload.sub !== 'string') {
    return sendError(res, 401, 'Invalid session token', 'UNAUTHORIZED');
  }

  const state = getState();
  const user = state.users.find((entry) => entry.id === payload.sub);

  if (!user) {
    return sendError(res, 401, 'Session expired', 'UNAUTHORIZED');
  }

  req.user = user;
  return next();
};

const authenticateRole = (...roles: WorkspaceRole[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return sendError(res, 401, 'Unauthorized', 'UNAUTHORIZED');
  }

  if (!roles.includes(req.user.accountType)) {
    return sendError(res, 403, 'Insufficient permissions', 'FORBIDDEN');
  }

  return next();
};

const authenticateApiKey = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const providedKey = req.header('x-api-key') || req.header('authorization')?.replace('Bearer ', '');

  if (!providedKey) {
    return sendError(res, 401, 'Missing API key', 'UNAUTHORIZED');
  }

  const state = getState();
  const apiKey = state.apiKeys.find((key) => `${key.prefix}${key.secret}` === providedKey || key.secret === providedKey);

  if (!apiKey) {
    return sendError(res, 401, 'Invalid API key', 'UNAUTHORIZED');
  }

  const owner = state.users.find((user) => user.id === apiKey.userId);
  if (!owner) {
    return sendError(res, 401, 'API key owner not found', 'UNAUTHORIZED');
  }

  req.apiKey = apiKey;
  req.user = owner;
  return next();
};

const requireFields = (res: Response, fields: Array<{ name: string; value: unknown }>) => {
  const missing = fields.find((field) => {
    if (typeof field.value === 'string') {
      return !field.value.trim();
    }
    return field.value === undefined || field.value === null;
  });

  if (missing) {
    sendError(res, 400, `${missing.name} is required`, 'VALIDATION_ERROR');
    return true;
  }

  return false;
};

const buildTimeline = (order: StoredOrder) => {
  const statuses: OrderStatus[] = ['Pending', 'Picked Up', 'In Transit', 'Delivered'];
  const currentIndex = statuses.indexOf(order.status === 'Failed' ? 'Pending' : order.status);

  return statuses.map((status, index) => ({
    status,
    isComplete: order.status === 'Failed' ? index === 0 : index <= currentIndex,
    isCurrent: order.status !== 'Failed' && index === currentIndex,
  }));
};

const isDeliveryActive = (status: OrderStatus) => status === 'Picked Up' || status === 'In Transit';

type BillingPlan = {
  shipmentsLimit: number;
  amount: number;
  apiKeyLimit: number;
  apiAccess: boolean;
  currency: 'NGN';
};

const billingPlans: Record<string, BillingPlan> = {
  Free: { shipmentsLimit: 15, amount: 0, apiKeyLimit: 0, apiAccess: false, currency: 'NGN' },
  Starter: { shipmentsLimit: 150, amount: 5000, apiKeyLimit: 0, apiAccess: false, currency: 'NGN' },
  Business: { shipmentsLimit: 800, amount: 15000, apiKeyLimit: 0, apiAccess: false, currency: 'NGN' },
  Enterprise: { shipmentsLimit: 5000, amount: 50000, apiKeyLimit: 0, apiAccess: false, currency: 'NGN' },
  Sandbox: { shipmentsLimit: 50, amount: 0, apiKeyLimit: 1, apiAccess: true, currency: 'NGN' },
  Build: { shipmentsLimit: 250, amount: 10000, apiKeyLimit: 5, apiAccess: true, currency: 'NGN' },
  Scale: { shipmentsLimit: 1000, amount: 30000, apiKeyLimit: 20, apiAccess: true, currency: 'NGN' },
  Dispatch: { shipmentsLimit: 300, amount: 15000, apiKeyLimit: 3, apiAccess: true, currency: 'NGN' },
  Fleet: { shipmentsLimit: 1200, amount: 45000, apiKeyLimit: 10, apiAccess: true, currency: 'NGN' },
  Internal: { shipmentsLimit: 0, amount: 0, apiKeyLimit: 0, apiAccess: false, currency: 'NGN' },
  Ops: { shipmentsLimit: 0, amount: 0, apiKeyLimit: 0, apiAccess: false, currency: 'NGN' },
  Control: { shipmentsLimit: 0, amount: 0, apiKeyLimit: 0, apiAccess: false, currency: 'NGN' },
};

const getBillingPlan = (plan: string) => billingPlans[plan] || billingPlans.Free;

const createInvoice = (userId: string, plan: string, options?: { provider?: 'paystack' | 'altixpay' | 'manual'; providerReference?: string; checkoutUrl?: string }) => {
  const planDetails = getBillingPlan(plan);
  const invoice: StoredInvoice = {
    id: `INV-${Date.now()}`,
    userId,
    plan,
    amount: planDetails.amount,
    currency: planDetails.currency,
    status: planDetails.amount === 0 ? 'paid' : 'pending',
    createdAt: new Date().toISOString(),
    dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    paidAt: planDetails.amount === 0 ? new Date().toISOString() : undefined,
    provider: options?.provider || (planDetails.amount === 0 ? 'manual' : 'paystack'),
    providerReference: options?.providerReference,
    checkoutUrl: options?.checkoutUrl,
  };

  updateState((state) => {
    state.invoices.unshift(invoice);
    if (planDetails.amount === 0) {
      state.billing.plan = plan;
      state.billing.shipmentsLimit = planDetails.shipmentsLimit;
      state.billing.monthlyRevenue = planDetails.amount;
      state.billing.paymentStatus = 'active';
      state.billing.paymentProvider = options?.provider || 'manual';
    } else {
      state.billing.paymentStatus = 'pending';
      state.billing.paymentProvider = options?.provider || 'paystack';
    }
  });

  pushWebhookEvent(userId, 'billing.invoice.created', 'local-ledger', { invoiceId: invoice.id, plan, amount: invoice.amount });
  return invoice;
};

const activateInvoice = (userId: string, invoiceId: string) => {
  const updated = updateState((draft) => {
    const invoice = draft.invoices.find((entry) => entry.userId === userId && entry.id === invoiceId);

    if (!invoice) {
      return;
    }

    const planDetails = getBillingPlan(invoice.plan);

    draft.invoices = draft.invoices.map((entry) =>
      entry.userId === userId && entry.id === invoiceId
        ? {
            ...entry,
            status: 'paid',
            paidAt: entry.paidAt || new Date().toISOString(),
          }
        : entry,
    );
    draft.billing.plan = invoice.plan;
    draft.billing.shipmentsLimit = planDetails.shipmentsLimit;
    draft.billing.monthlyRevenue = invoice.amount;
    draft.billing.paymentStatus = 'active';
    draft.billing.paymentProvider = invoice.provider || 'paystack';
  });

  return updated.invoices.find((entry) => entry.userId === userId && entry.id === invoiceId);
};

const isValidPaystackWebhook = (rawBody: string, signature?: string | string[]) => {
  if (!paystackSecretKey || !signature || typeof signature !== 'string') {
    return false;
  }

  const expected = createHmac('sha512', paystackSecretKey).update(rawBody).digest('hex');
  return expected === signature;
};

const createPaystackCheckout = async (params: {
  user: StoredUser;
  invoice: StoredInvoice;
}) => {
  if (!paystackSecretKey) {
    return null;
  }

  const reference = `${params.invoice.id}-${Date.now()}`;
  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${paystackSecretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: params.invoice.amount * 100,
      reference,
      currency: params.invoice.currency,
      email: params.user.email,
      callback_url: `${paystackPublicUrl}/?checkout=completed&invoice=${params.invoice.id}`,
      metadata: { invoiceId: params.invoice.id, plan: params.invoice.plan },
    }),
  });

  const payload = (await response.json().catch(() => null)) as { status?: boolean; data?: { authorization_url?: string; reference?: string } } | null;

  if (!response.ok || payload?.status !== true || !payload.data?.authorization_url) {
    throw new Error('Paystack checkout could not be created');
  }

  return { checkoutUrl: payload.data.authorization_url, providerReference: payload.data.reference || reference };
};

const findTrackingOrder = (state: ReturnType<typeof getState>, trackingId: string) =>
  state.orders.find((entry) => entry.id === trackingId || entry.trackingLink.endsWith(trackingId));

const buildTrackingPayload = (order: StoredOrder) => ({
  order: stripOrder(order),
  timeline: buildTimeline(order),
});

const upsertCustomer = (stateUserId: string, payload: { customerName: string; customerPhone: string; customerEmail?: string; orderId: string }) => {
  const existing = getState().customers.find((customer) => customer.userId === stateUserId && customer.phone === payload.customerPhone);

  if (!existing) {
    const newCustomer: StoredCustomer = {
      id: `CUST-${Math.floor(4000 + Math.random() * 5000)}`,
      name: payload.customerName,
      phone: payload.customerPhone,
      email: payload.customerEmail || `${payload.customerName.toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`,
      totalOrders: 1,
      recentDelivery: payload.orderId,
      joinedDate: new Date().toISOString().split('T')[0],
      userId: stateUserId,
    };

    updateState((state) => {
      state.customers.push(newCustomer);
    });

    return newCustomer;
  }

  const updated = updateState((state) => {
    state.customers = state.customers.map((customer) => {
      if (customer.userId === stateUserId && customer.phone === payload.customerPhone) {
        return {
          ...customer,
          totalOrders: customer.totalOrders + 1,
          recentDelivery: payload.orderId,
        };
      }

      return customer;
    });
  });

  return updated.customers.find((customer) => customer.userId === stateUserId && customer.phone === payload.customerPhone)!;
};

const appendNotification = (userId: string, text: string) => {
  const notification: StoredNotification = {
    id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    text,
    time: 'Just now',
    unread: true,
    createdAt: new Date().toISOString(),
    userId,
  };

  updateState((state) => {
    state.notifications.unshift(notification);
  });

  return notification;
};

const updateUsageAfterSuccess = () => {
  incrementSuccess();
};

app.get('/health', (_, res) => {
  res.json({ status: 'ok', service: 'sendie-api' });
});

app.get('/api/bootstrap', authenticate, (req: AuthenticatedRequest, res) => {
  const workspace = toWorkspaceSnapshot(getState(), req.user!.id);
  updateUsageAfterSuccess();
  return sendSuccess(res, 'Workspace loaded', workspace);
});

app.post('/api/auth/signup', (req: Request, res: Response) => {
  const body = req.body as {
    businessName?: string;
    email?: string;
    password?: string;
    accountType?: StoredUser['accountType'];
  };

  if (
    requireFields(res, [
      { name: 'businessName', value: body.businessName },
      { name: 'email', value: body.email },
      { name: 'password', value: body.password },
    ])
  ) {
    return;
  }

  const normalizedEmail = normalizeEmail(body.email!);
  const existing = getState().users.find((user) => user.email === normalizedEmail);
  if (existing) {
    return sendError(res, 409, 'Email already in use', 'EMAIL_EXISTS');
  }

  const user: StoredUser = {
    id: `user_${Date.now()}`,
    businessName: body.businessName!.trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(body.password!),
    accountType: isWorkspaceRole(body.accountType) ? body.accountType : 'Merchant',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  updateState((state) => {
    state.users.push(user);
  });

  appendNotification(user.id, `Welcome to Sendie, ${user.businessName}. Your merchant workspace is ready.`);

  const token = createToken(user.id, authSecret);
  const workspace = toWorkspaceSnapshot(getState(), user.id);
  updateUsageAfterSuccess();

  return sendSuccess(res, 'Account created', { token, user: stripUser(user), workspace }, 201);
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const body = req.body as { email?: string; password?: string };

  if (
    requireFields(res, [
      { name: 'email', value: body.email },
      { name: 'password', value: body.password },
    ])
  ) {
    return;
  }

  const normalizedEmail = normalizeEmail(body.email!);
  const user = getState().users.find((entry) => entry.email === normalizedEmail);

  if (!user || !verifyPassword(body.password!, user.passwordHash)) {
    return sendError(res, 401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const token = createToken(user.id, authSecret);
  const workspace = toWorkspaceSnapshot(getState(), user.id);
  updateUsageAfterSuccess();

  return sendSuccess(res, 'Signed in successfully', { token, user: stripUser(user), workspace });
});

app.post('/api/auth/refresh', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const token = createToken(req.user!.id, authSecret);
  const workspace = toWorkspaceSnapshot(getState(), req.user!.id);
  updateUsageAfterSuccess();
  return sendSuccess(res, 'Session refreshed', { token, user: stripUser(req.user!), workspace });
});

app.get('/api/auth/me', authenticate, (req: AuthenticatedRequest, res: Response) => {
  updateUsageAfterSuccess();
  return sendSuccess(res, 'Current user loaded', stripUser(req.user!));
});

app.patch('/api/auth/me', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const body = req.body as { businessName?: string; email?: string };

  if (
    requireFields(res, [
      { name: 'businessName', value: body.businessName },
      { name: 'email', value: body.email },
    ])
  ) {
    return;
  }

  const normalizedEmail = normalizeEmail(body.email!);
  const state = getState();
  const conflict = state.users.find((entry) => entry.email === normalizedEmail && entry.id !== req.user!.id);

  if (conflict) {
    return sendError(res, 409, 'Email already in use', 'EMAIL_EXISTS');
  }

  const updatedUser = updateState((draft) => {
    draft.users = draft.users.map((entry) =>
      entry.id === req.user!.id
        ? {
            ...entry,
            businessName: body.businessName!.trim(),
            email: normalizedEmail,
            updatedAt: new Date().toISOString(),
          }
        : entry,
    );
  }).users.find((entry) => entry.id === req.user!.id)!;

  appendNotification(req.user!.id, 'Business profile updated successfully.');
  const workspace = toWorkspaceSnapshot(getState(), req.user!.id);
  updateUsageAfterSuccess();

  return sendSuccess(res, 'Profile updated', { user: stripUser(updatedUser), workspace });
});

app.get('/api/orders', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const orders = getState().orders.filter((order) => order.userId === req.user!.id).map(stripOrder);
  updateUsageAfterSuccess();
  return sendSuccess(res, 'Orders retrieved', orders);
});

app.get('/api/orders/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const order = getState().orders.find((entry) => entry.userId === req.user!.id && entry.id === req.params.id);
  if (!order) {
    return sendError(res, 404, 'Order not found', 'ORDER_NOT_FOUND');
  }

  updateUsageAfterSuccess();
  return sendSuccess(res, 'Order retrieved', stripOrder(order));
});

app.post('/api/orders', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const body = req.body as {
    customerName?: string;
    customerPhone?: string;
    itemDescription?: string;
    pickupLocation?: string;
    deliveryLocation?: string;
    dropOffContactName?: string;
    dropOffContactPhone?: string;
    dropOffLandmark?: string;
    notes?: string;
    status?: OrderStatus;
  };

  if (
    requireFields(res, [
      { name: 'customerName', value: body.customerName },
      { name: 'customerPhone', value: body.customerPhone },
      { name: 'itemDescription', value: body.itemDescription },
      { name: 'pickupLocation', value: body.pickupLocation },
      { name: 'deliveryLocation', value: body.deliveryLocation },
    ])
  ) {
    return;
  }

  const orderId = createTrackingId();
  const trackingId = orderId;
  const createdAt = new Date().toISOString();
  const estimatedDelivery = body.status === 'Delivered' ? 'Delivered just now' : 'Tomorrow, 03:30 PM';

  const order: StoredOrder = {
    id: orderId,
    customerName: body.customerName!.trim(),
    customerPhone: body.customerPhone!.trim(),
    itemDescription: body.itemDescription!.trim(),
    pickupLocation: body.pickupLocation!.trim(),
    deliveryLocation: body.deliveryLocation!.trim(),
    dropOffContactName: body.dropOffContactName?.trim() || undefined,
    dropOffContactPhone: body.dropOffContactPhone?.trim() || undefined,
    dropOffLandmark: body.dropOffLandmark?.trim() || undefined,
    status: body.status || 'Pending',
    createdDate: createdAt,
    estimatedDelivery,
    trackingLink: `https://sendie.sh/track/${trackingId}`,
    notes: body.notes?.trim() || undefined,
    proofOfDelivery: {
      method: 'photo',
      status: 'pending',
    },
    riderAssignment: {
      name: 'Unassigned',
      status: 'unassigned',
    },
    deliveryException: {
      type: 'delay',
      status: 'resolved',
    },
    gpsTracking: {
      enabled: false,
      lastKnownLocation: body.deliveryLocation!.trim(),
      lastUpdatedAt: createdAt,
      signal: 'offline',
    },
    userId: req.user!.id,
    trackingEvents: [
      {
        id: `evt_${orderId}_created`,
        status: 'Pending',
        note: 'Order created',
        createdAt,
      },
    ],
  };

  updateState((state) => {
    state.orders.unshift(order);
    state.billing.shipmentsUsed += 1;
  });

  const customer = upsertCustomer(req.user!.id, {
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    orderId: order.id,
  });

  appendNotification(req.user!.id, `Delivery order ${order.id} created for ${order.customerName}. Tracking is live.`);
  pushWebhookEvent(req.user!.id, 'order.created', 'workspace-feed', { orderId: order.id, status: order.status }, 'delivered');
  const workspace = toWorkspaceSnapshot(getState(), req.user!.id);
  updateUsageAfterSuccess();

  return sendSuccess(res, 'Order created successfully', {
    order: stripOrder(order),
    customer: customer && { ...customer, userId: undefined },
    workspace,
  }, 201);
});

app.patch('/api/orders/:id/status', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const body = req.body as { status?: OrderStatus };
  if (requireFields(res, [{ name: 'status', value: body.status }])) {
    return;
  }

  const state = getState();
  const order = state.orders.find((entry) => entry.userId === req.user!.id && entry.id === req.params.id);
  if (!order) {
    return sendError(res, 404, 'Order not found', 'ORDER_NOT_FOUND');
  }

  updateState((draft) => {
    draft.orders = draft.orders.map((entry) => {
      if (entry.userId !== req.user!.id || entry.id !== req.params.id) {
        return entry;
      }

      const nextOrder: StoredOrder = {
        ...entry,
        status: body.status!,
        estimatedDelivery: body.status === 'Delivered' ? 'Delivered today!' : entry.estimatedDelivery,
        gpsTracking: {
          ...entry.gpsTracking,
          enabled: isDeliveryActive(body.status!),
          signal: body.status === 'Failed' ? 'offline' : isDeliveryActive(body.status!) ? 'good' : entry.gpsTracking?.signal || 'offline',
          lastUpdatedAt: new Date().toISOString(),
        },
        trackingEvents: [
          ...entry.trackingEvents,
          {
            id: `evt_${entry.id}_${Date.now()}`,
            status: body.status!,
            note: `Status changed to ${body.status}`,
            createdAt: new Date().toISOString(),
          },
        ],
      };

      return nextOrder;
    });
  });

  appendNotification(req.user!.id, `Package ${order.id} moved to ${body.status}.`);
  pushWebhookEvent(req.user!.id, 'order.status.updated', 'workspace-feed', { orderId: order.id, status: body.status }, 'delivered');
  const workspace = toWorkspaceSnapshot(getState(), req.user!.id);
  updateUsageAfterSuccess();

  return sendSuccess(res, 'Order updated', {
    order: stripOrder(getState().orders.find((entry) => entry.id === req.params.id)!),
    workspace,
  });
});

app.patch('/api/orders/:id/assignment', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const body = req.body as { name?: string; phone?: string; vehicle?: string; accepted?: boolean };

  if (requireFields(res, [{ name: 'name', value: body.name }])) {
    return;
  }

  const state = getState();
  const order = state.orders.find((entry) => entry.userId === req.user!.id && entry.id === req.params.id);
  if (!order) {
    return sendError(res, 404, 'Order not found', 'ORDER_NOT_FOUND');
  }

  updateState((draft) => {
    draft.orders = draft.orders.map((entry) => {
      if (entry.userId !== req.user!.id || entry.id !== req.params.id) {
        return entry;
      }

      return {
        ...entry,
        riderAssignment: {
          name: body.name!.trim(),
          phone: body.phone?.trim() || undefined,
          vehicle: body.vehicle?.trim() || undefined,
          status: body.accepted ? 'accepted' : 'assigned',
          assignedAt: new Date().toISOString(),
        },
        trackingEvents: [
          ...entry.trackingEvents,
          {
            id: `evt_${entry.id}_rider_${Date.now()}`,
            status: entry.status,
            note: `Rider assigned: ${body.name!.trim()}`,
            createdAt: new Date().toISOString(),
          },
        ],
      };
    });
  });

  appendNotification(req.user!.id, `Rider assigned to ${order.id}.`);
  pushWebhookEvent(req.user!.id, 'order.rider.assigned', 'workspace-feed', { orderId: order.id, riderName: body.name }, 'delivered');
  const workspace = toWorkspaceSnapshot(getState(), req.user!.id);
  updateUsageAfterSuccess();

  return sendSuccess(res, 'Rider assigned', {
    order: stripOrder(getState().orders.find((entry) => entry.id === req.params.id)!),
    workspace,
  });
});

app.patch('/api/orders/:id/exception', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const body = req.body as {
    type?: 'address_issue' | 'customer_unreachable' | 'delay' | 'failed_pickup' | 'weather' | 'other';
    note?: string;
    status?: 'open' | 'resolved';
  };

  if (requireFields(res, [{ name: 'type', value: body.type }])) {
    return;
  }

  const state = getState();
  const order = state.orders.find((entry) => entry.userId === req.user!.id && entry.id === req.params.id);
  if (!order) {
    return sendError(res, 404, 'Order not found', 'ORDER_NOT_FOUND');
  }

  updateState((draft) => {
    draft.orders = draft.orders.map((entry) => {
      if (entry.userId !== req.user!.id || entry.id !== req.params.id) {
        return entry;
      }

      return {
        ...entry,
        deliveryException: {
          type: body.type!,
          status: body.status || 'open',
          note: body.note?.trim() || undefined,
          raisedAt: entry.deliveryException?.raisedAt || new Date().toISOString(),
          resolvedAt: body.status === 'resolved' ? new Date().toISOString() : undefined,
        },
        trackingEvents: [
          ...entry.trackingEvents,
          {
            id: `evt_${entry.id}_exception_${Date.now()}`,
            status: entry.status,
            note: `Exception flagged: ${body.type}`,
            createdAt: new Date().toISOString(),
          },
        ],
      };
    });
  });

  appendNotification(req.user!.id, `Delivery exception logged for ${order.id}.`);
  pushWebhookEvent(req.user!.id, 'order.exception.logged', 'workspace-feed', { orderId: order.id, type: body.type, status: body.status || 'open' }, 'delivered');
  const workspace = toWorkspaceSnapshot(getState(), req.user!.id);
  updateUsageAfterSuccess();

  return sendSuccess(res, 'Delivery exception updated', {
    order: stripOrder(getState().orders.find((entry) => entry.id === req.params.id)!),
    workspace,
  });
});

app.patch('/api/orders/:id/gps', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const body = req.body as { enabled?: boolean; lastKnownLocation?: string; signal?: 'good' | 'weak' | 'offline' };
  if (typeof body.enabled !== 'boolean' && !body.lastKnownLocation && !body.signal) {
    return sendError(res, 400, 'At least one GPS field is required', 'VALIDATION_ERROR');
  }

  const state = getState();
  const order = state.orders.find((entry) => entry.userId === req.user!.id && entry.id === req.params.id);
  if (!order) {
    return sendError(res, 404, 'Order not found', 'ORDER_NOT_FOUND');
  }

  updateState((draft) => {
    draft.orders = draft.orders.map((entry) => {
      if (entry.userId !== req.user!.id || entry.id !== req.params.id) {
        return entry;
      }

      return {
        ...entry,
        gpsTracking: {
          enabled: body.enabled ?? entry.gpsTracking?.enabled ?? false,
          lastKnownLocation: body.lastKnownLocation?.trim() || entry.gpsTracking?.lastKnownLocation,
          lastUpdatedAt: new Date().toISOString(),
          signal: body.signal || entry.gpsTracking?.signal || 'good',
        },
      };
    });
  });

  appendNotification(req.user!.id, `GPS-lite updated for ${order.id}.`);
  pushWebhookEvent(req.user!.id, 'order.gps.updated', 'workspace-feed', { orderId: order.id, enabled: body.enabled ?? order.gpsTracking?.enabled ?? false }, 'delivered');
  const workspace = toWorkspaceSnapshot(getState(), req.user!.id);
  updateUsageAfterSuccess();

  return sendSuccess(res, 'GPS status updated', {
    order: stripOrder(getState().orders.find((entry) => entry.id === req.params.id)!),
    workspace,
  });
});

app.patch('/api/orders/:id/proof', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const body = req.body as {
    method?: 'photo' | 'otp' | 'signature';
    note?: string;
  };

  if (requireFields(res, [{ name: 'method', value: body.method }])) {
    return;
  }

  const state = getState();
  const order = state.orders.find((entry) => entry.userId === req.user!.id && entry.id === req.params.id);

  if (!order) {
    return sendError(res, 404, 'Order not found', 'ORDER_NOT_FOUND');
  }

  updateState((draft) => {
    draft.orders = draft.orders.map((entry) => {
      if (entry.userId !== req.user!.id || entry.id !== req.params.id) {
        return entry;
      }

      return {
        ...entry,
        proofOfDelivery: {
          method: body.method!,
          status: 'captured',
          note: body.note?.trim() || undefined,
          capturedAt: new Date().toISOString(),
        },
        trackingEvents: [
          ...entry.trackingEvents,
          {
            id: `evt_${entry.id}_proof_${Date.now()}`,
            status: entry.status,
            note: `Proof of delivery captured via ${body.method}`,
            createdAt: new Date().toISOString(),
          },
        ],
      };
    });
  });

  appendNotification(req.user!.id, `Proof of delivery captured for ${order.id}.`);
  pushWebhookEvent(req.user!.id, 'order.proof.captured', 'workspace-feed', { orderId: order.id, method: body.method }, 'delivered');
  const workspace = toWorkspaceSnapshot(getState(), req.user!.id);
  updateUsageAfterSuccess();

  return sendSuccess(res, 'Proof of delivery captured', {
    order: stripOrder(getState().orders.find((entry) => entry.id === req.params.id)!),
    workspace,
  });
});

app.delete('/api/orders/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const state = getState();
  const exists = state.orders.some((entry) => entry.userId === req.user!.id && entry.id === req.params.id);
  if (!exists) {
    return sendError(res, 404, 'Order not found', 'ORDER_NOT_FOUND');
  }

  updateState((draft) => {
    draft.orders = draft.orders.filter((entry) => !(entry.userId === req.user!.id && entry.id === req.params.id));
  });

  appendNotification(req.user!.id, `Shipment ${req.params.id} was removed from active tracking.`);
  pushWebhookEvent(req.user!.id, 'order.deleted', 'workspace-feed', { orderId: req.params.id }, 'delivered');
  const workspace = toWorkspaceSnapshot(getState(), req.user!.id);
  updateUsageAfterSuccess();

  return sendSuccess(res, 'Order deleted', { workspace });
});

app.get('/api/customers', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const customers = getState().customers.filter((customer) => customer.userId === req.user!.id).map(({ userId, ...rest }) => rest);
  updateUsageAfterSuccess();
  return sendSuccess(res, 'Customers retrieved', customers);
});

app.get('/api/notifications', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const notifications = getState().notifications.filter((notification) => notification.userId === req.user!.id).map(({ userId, ...rest }) => rest);
  updateUsageAfterSuccess();
  return sendSuccess(res, 'Notifications retrieved', notifications);
});

app.patch('/api/notifications/read', authenticate, (req: AuthenticatedRequest, res: Response) => {
  updateState((draft) => {
    draft.notifications = draft.notifications.map((notification) =>
      notification.userId === req.user!.id
        ? {
            ...notification,
            unread: false,
          }
        : notification,
    );
  });

  const workspace = toWorkspaceSnapshot(getState(), req.user!.id);
  updateUsageAfterSuccess();
  return sendSuccess(res, 'Notifications marked read', { workspace });
});

app.get('/api/webhooks', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (req.user!.accountType === 'Merchant') {
    return sendError(res, 403, 'Merchant accounts cannot access webhooks', 'FORBIDDEN');
  }

  const webhooks = getState().webhooks
    .filter((entry) => entry.userId === req.user!.id)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));

  updateUsageAfterSuccess();
  return sendSuccess(res, 'Webhook events retrieved', webhooks);
});

app.get('/api/billing/invoices', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const invoices = getState().invoices
    .filter((invoice) => invoice.userId === req.user!.id)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .map(({ userId, ...rest }) => rest);

  updateUsageAfterSuccess();
  return sendSuccess(res, 'Invoices retrieved', invoices);
});

app.post('/api/billing/checkout', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const body = req.body as { plan?: string };
  if (requireFields(res, [{ name: 'plan', value: body.plan }])) {
    return;
  }

  const selectedPlan = body.plan!.trim();
  const planDetails = getBillingPlan(selectedPlan);

  if (planDetails.amount === 0) {
    const invoice = createInvoice(req.user!.id, selectedPlan, { provider: 'manual' });
    appendNotification(req.user!.id, `Free plan activated for ${invoice.plan}.`);
    const workspace = toWorkspaceSnapshot(getState(), req.user!.id);
    updateUsageAfterSuccess();
    return sendSuccess(res, 'Checkout created', { invoice: { ...invoice, userId: undefined }, workspace }, 201);
  }

  if (paymentProvider === 'altixpay') {
    return sendError(res, 501, 'AltixPay checkout is not configured yet. Add the provider credentials to enable it.', 'PAYMENT_PROVIDER_UNAVAILABLE');
  }

  const invoiceDraft = createInvoice(req.user!.id, selectedPlan, { provider: paystackSecretKey ? 'paystack' : 'manual' });
  let checkoutUrl: string | undefined;

  try {
    const checkout = await createPaystackCheckout({ user: req.user!, invoice: invoiceDraft });
    if (checkout) {
      checkoutUrl = checkout.checkoutUrl;
      updateState((draft) => {
        draft.invoices = draft.invoices.map((entry) =>
          entry.userId === req.user!.id && entry.id === invoiceDraft.id
            ? { ...entry, provider: 'paystack', providerReference: checkout.providerReference, checkoutUrl: checkout.checkoutUrl }
            : entry,
        );
      });
    }
  } catch (error) {
    console.error('Paystack checkout creation failed:', error);
  }

  appendNotification(req.user!.id, `Checkout session created for ${invoiceDraft.plan}.`);
  const workspace = toWorkspaceSnapshot(getState(), req.user!.id);
  updateUsageAfterSuccess();

  return sendSuccess(res, 'Checkout created', {
    invoice: { ...getState().invoices.find((entry) => entry.userId === req.user!.id && entry.id === invoiceDraft.id)!, userId: undefined },
    checkoutUrl,
    workspace,
  }, 201);
});

app.patch('/api/billing/invoices/:id/pay', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const state = getState();
  const invoice = state.invoices.find((entry) => entry.userId === req.user!.id && entry.id === req.params.id);

  if (!invoice) {
    return sendError(res, 404, 'Invoice not found', 'INVOICE_NOT_FOUND');
  }

  activateInvoice(req.user!.id, req.params.id);

  pushWebhookEvent(req.user!.id, 'billing.invoice.paid', 'local-ledger', { invoiceId: invoice.id, plan: invoice.plan, amount: invoice.amount }, 'delivered');
  appendNotification(req.user!.id, `Invoice ${invoice.id} was marked as paid.`);
  const workspace = toWorkspaceSnapshot(getState(), req.user!.id);
  updateUsageAfterSuccess();

  const updatedInvoice = getState().invoices.find((entry) => entry.userId === req.user!.id && entry.id === req.params.id)!;
  return sendSuccess(res, 'Invoice marked paid', { invoice: { ...updatedInvoice, userId: undefined }, workspace });
});

app.post('/api/billing/paystack/verify', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const body = req.body as { reference?: string; invoiceId?: string };
  if (!body.reference) {
    return sendError(res, 400, 'reference is required', 'VALIDATION_ERROR');
  }

  const state = getState();
  const invoice =
    (body.invoiceId && state.invoices.find((entry) => entry.userId === req.user!.id && entry.id === body.invoiceId)) ||
    state.invoices.find((entry) => entry.userId === req.user!.id && entry.providerReference === body.reference) ||
    undefined;

  if (!invoice) {
    return sendError(res, 404, 'Invoice not found', 'INVOICE_NOT_FOUND');
  }

  if (invoice.status === 'paid') {
    const workspace = toWorkspaceSnapshot(getState(), req.user!.id);
    return sendSuccess(res, 'Invoice already paid', { invoice: { ...invoice, userId: undefined }, workspace });
  }

  if (!paystackSecretKey) {
    return sendError(res, 503, 'Paystack is not configured', 'PAYMENT_PROVIDER_UNAVAILABLE');
  }

  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(body.reference)}`, {
    headers: {
      Authorization: `Bearer ${paystackSecretKey}`,
      'Content-Type': 'application/json',
    },
  });

  const payload = (await response.json().catch(() => null)) as
    | {
        status?: boolean;
        data?: {
          status?: string;
          reference?: string;
          amount?: number;
          currency?: string;
        };
      }
    | null;

  if (!response.ok || payload?.status !== true || payload.data?.status !== 'success') {
    return sendError(res, 402, 'Payment verification did not succeed', 'PAYMENT_NOT_VERIFIED');
  }

  if (payload.data.reference && invoice.providerReference && payload.data.reference !== invoice.providerReference) {
    return sendError(res, 400, 'Transaction reference does not match this invoice', 'PAYMENT_REFERENCE_MISMATCH');
  }

  if (payload.data.amount !== invoice.amount * 100 || payload.data.currency !== invoice.currency) {
    return sendError(res, 400, 'Payment amount or currency does not match this invoice', 'PAYMENT_AMOUNT_MISMATCH');
  }

  const activatedInvoice = activateInvoice(req.user!.id, invoice.id);
  if (!activatedInvoice) {
    return sendError(res, 404, 'Invoice not found', 'INVOICE_NOT_FOUND');
  }

  pushWebhookEvent(req.user!.id, 'billing.invoice.paid', 'paystack', { invoiceId: invoice.id, plan: invoice.plan, amount: invoice.amount }, 'delivered');
  appendNotification(req.user!.id, `Invoice ${invoice.id} was verified and activated.`);
  const workspace = toWorkspaceSnapshot(getState(), req.user!.id);
  updateUsageAfterSuccess();

  return sendSuccess(res, 'Payment verified', { invoice: { ...activatedInvoice, userId: undefined }, workspace });
});

app.post('/api/billing/paystack/webhook', async (req: Request, res: Response) => {
  const signature = req.header('x-paystack-signature');
  const rawBody = (req as Request & { rawBody?: string }).rawBody || '';

  if (!isValidPaystackWebhook(rawBody, signature)) {
    return res.status(401).end();
  }

  const payload = req.body as {
    event?: string;
    data?: {
      id?: number | string;
      reference?: string;
      amount?: number;
      currency?: string;
      status?: string;
    };
  };

  const reference = payload.data?.reference;
  if (!reference) {
    return res.status(200).end();
  }

  const state = getState();
  const invoice = state.invoices.find((entry) => entry.providerReference === reference);

  if (!invoice) {
    return res.status(200).end();
  }

  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: {
      Authorization: `Bearer ${paystackSecretKey}`,
      'Content-Type': 'application/json',
    },
  });

  const verification = (await response.json().catch(() => null)) as
    | {
        status?: boolean;
        data?: {
          status?: string;
          reference?: string;
          amount?: number;
          currency?: string;
        };
      }
    | null;

  if (response.ok && verification?.status === true && verification.data?.status === 'success') {
    if (verification.data.amount === invoice.amount * 100 && verification.data.currency === invoice.currency) {
      activateInvoice(invoice.userId, invoice.id);
      pushWebhookEvent(invoice.userId, 'billing.invoice.paid', 'paystack-webhook', { invoiceId: invoice.id, plan: invoice.plan, amount: invoice.amount }, 'delivered');
      appendNotification(invoice.userId, `Invoice ${invoice.id} was confirmed by Paystack.`);
    }
  }

  return res.status(200).end();
});

app.get('/api/api-keys', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (req.user!.accountType !== 'Developer/Startup' && req.user!.accountType !== 'Admin') {
    return sendError(res, 403, 'This workspace does not have developer API access', 'FORBIDDEN');
  }

  const keys = getState().apiKeys.filter((key) => key.userId === req.user!.id).map(({ userId, ...rest }) => rest);
  updateUsageAfterSuccess();
  return sendSuccess(res, 'API keys retrieved', keys);
});

app.post('/api/api-keys', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (req.user!.accountType !== 'Developer/Startup' && req.user!.accountType !== 'Admin') {
    return sendError(res, 403, 'This workspace does not have developer API access', 'FORBIDDEN');
  }

  const billing = getBillingPlan(getState().billing.plan);
  if (!billing.apiAccess) {
    return sendError(res, 402, 'Upgrade to a developer plan to create API keys', 'PLAN_REQUIRED');
  }

  const activeKeys = getState().apiKeys.filter((key) => key.userId === req.user!.id);
  if (billing.apiKeyLimit > 0 && activeKeys.length >= billing.apiKeyLimit) {
    return sendError(res, 429, `API key limit reached for the ${getState().billing.plan} plan`, 'API_KEY_LIMIT_REACHED');
  }

  const body = req.body as { name?: string };

  if (requireFields(res, [{ name: 'name', value: body.name }])) {
    return;
  }

  const apiKey: StoredApiKey = {
    id: `KEY-${Date.now()}`,
    name: body.name!.trim(),
    prefix: 'sk_sendie_',
    secret: createApiSecret(),
    createdDate: new Date().toISOString().split('T')[0],
    userId: req.user!.id,
  };

  updateState((state) => {
    state.apiKeys.unshift(apiKey);
  });

  appendNotification(req.user!.id, `New API key "${apiKey.name}" generated for Sendie integrations.`);
  const workspace = toWorkspaceSnapshot(getState(), req.user!.id);
  updateUsageAfterSuccess();

  return sendSuccess(res, 'API key generated', {
    apiKey: { ...apiKey, userId: undefined },
    workspace,
  }, 201);
});

app.delete('/api/api-keys/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (req.user!.accountType !== 'Developer/Startup' && req.user!.accountType !== 'Admin') {
    return sendError(res, 403, 'This workspace does not have developer API access', 'FORBIDDEN');
  }

  const found = getState().apiKeys.some((apiKey) => apiKey.userId === req.user!.id && apiKey.id === req.params.id);
  if (!found) {
    return sendError(res, 404, 'API key not found', 'API_KEY_NOT_FOUND');
  }

  updateState((state) => {
    state.apiKeys = state.apiKeys.filter((apiKey) => !(apiKey.userId === req.user!.id && apiKey.id === req.params.id));
  });

  appendNotification(req.user!.id, `API key ${req.params.id} was revoked.`);
  const workspace = toWorkspaceSnapshot(getState(), req.user!.id);
  updateUsageAfterSuccess();

  return sendSuccess(res, 'API key revoked', { workspace });
});

app.get('/api/dashboard/summary', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const workspace = toWorkspaceSnapshot(getState(), req.user!.id);
  updateUsageAfterSuccess();
  return sendSuccess(res, 'Dashboard summary loaded', workspace.dashboard);
});

app.get('/api/tracking/:trackingId', (req: Request, res: Response) => {
  const state = getState();
  const order = findTrackingOrder(state, req.params.trackingId);

  if (!order) {
    updateState((draft) => {
      draft.apiUsage.failedRequests += 1;
    });
    return sendError(res, 404, 'Tracking record not found', 'TRACKING_NOT_FOUND');
  }

  updateUsageAfterSuccess();
  return sendSuccess(res, 'Tracking retrieved', buildTrackingPayload(order));
});

app.get('/api/public/v1/tracking/:trackingId', (req: Request, res: Response) => {
  const state = getState();
  const order = findTrackingOrder(state, req.params.trackingId);

  if (!order) {
    updateState((draft) => {
      draft.apiUsage.failedRequests += 1;
    });
    return sendError(res, 404, 'Tracking record not found', 'TRACKING_NOT_FOUND');
  }

  updateUsageAfterSuccess();
  return sendSuccess(res, 'Public tracking retrieved', buildTrackingPayload(order));
});

app.post('/api/public/v1/deliveries', authenticateApiKey, (req: AuthenticatedRequest, res: Response) => {
  const billing = getBillingPlan(getState().billing.plan);
  if (!billing.apiAccess) {
    return sendError(res, 402, 'Upgrade to a developer plan to use the public delivery API', 'PLAN_REQUIRED');
  }

  const body = req.body as {
    customer_name?: string;
    customer_phone?: string;
    item_description?: string;
    pickup_location?: string;
    delivery_location?: string;
    pickup_notes?: string;
  };

  if (
    requireFields(res, [
      { name: 'customer_name', value: body.customer_name },
      { name: 'customer_phone', value: body.customer_phone },
      { name: 'item_description', value: body.item_description },
      { name: 'pickup_location', value: body.pickup_location },
      { name: 'delivery_location', value: body.delivery_location },
    ])
  ) {
    return;
  }

  const orderId = createTrackingId();
  const trackingId = orderId;
  const createdAt = new Date().toISOString();

  const order: StoredOrder = {
    id: orderId,
    customerName: body.customer_name!.trim(),
    customerPhone: body.customer_phone!.trim(),
    itemDescription: body.item_description!.trim(),
    pickupLocation: body.pickup_location!.trim(),
    deliveryLocation: body.delivery_location!.trim(),
    status: 'Pending',
    createdDate: createdAt,
    estimatedDelivery: 'Tomorrow, 03:30 PM',
    trackingLink: `https://sendie.sh/track/${trackingId}`,
    notes: body.pickup_notes?.trim() || undefined,
    proofOfDelivery: {
      method: 'photo',
      status: 'pending',
    },
    riderAssignment: {
      name: 'Unassigned',
      status: 'unassigned',
    },
    deliveryException: {
      type: 'delay',
      status: 'resolved',
    },
    gpsTracking: {
      enabled: false,
      lastKnownLocation: body.delivery_location!.trim(),
      lastUpdatedAt: createdAt,
      signal: 'offline',
    },
    userId: req.user!.id,
    trackingEvents: [
      {
        id: `evt_${orderId}_created`,
        status: 'Pending',
        note: 'Order created from public API',
        createdAt,
      },
    ],
  };

  updateState((state) => {
    state.orders.unshift(order);
    state.billing.shipmentsUsed += 1;
  });

  upsertCustomer(req.user!.id, {
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    orderId: order.id,
  });

  appendNotification(req.user!.id, `Public API created order ${order.id} for ${order.customerName}.`);
  pushWebhookEvent(req.user!.id, 'order.created.public', 'workspace-feed', { orderId: order.id, source: 'public-api' }, 'delivered');
  const workspace = toWorkspaceSnapshot(getState(), req.user!.id);
  updateUsageAfterSuccess();

  return sendSuccess(res, 'Public delivery created', {
    delivery: stripOrder(order),
    trackingUrl: order.trackingLink,
    workspace,
  }, 201);
});

app.get('/api/public/v1/deliveries/:trackingId', (req: Request, res: Response) => {
  const state = getState();
  const order = state.orders.find((entry) => entry.id === req.params.trackingId || entry.trackingLink.endsWith(req.params.trackingId));

  if (!order) {
    updateState((draft) => {
      draft.apiUsage.failedRequests += 1;
    });
    return sendError(res, 404, 'Tracking record not found', 'TRACKING_NOT_FOUND');
  }

  updateUsageAfterSuccess();
  return sendSuccess(res, 'Delivery retrieved', {
    delivery: stripOrder(order),
    timeline: buildTimeline(order),
  });
});

app.post('/api/admin/reset-workspace', authenticate, authenticateRole('Admin'), (_req: AuthenticatedRequest, res: Response) => {
  const nextState = resetState();
  return sendSuccess(res, 'Workspace reset', {
    users: nextState.users.length,
    orders: nextState.orders.length,
  });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  return sendError(res, 500, 'Unexpected server error', 'INTERNAL_ERROR');
});

export { app };
