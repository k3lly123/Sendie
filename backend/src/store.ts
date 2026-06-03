import { prisma } from './config/prisma';
import { createSeedState } from './seed';
import type {
  AppState,
  StoredApiKey,
  StoredCustomer,
  StoredNotification,
  StoredOrder,
  StoredUser,
  StoredWebhookEvent,
  WorkspaceSnapshot,
} from './types';

const STATE_ROW_ID = 1;

let cachedState: AppState | null = null;
let initPromise: Promise<void> | null = null;
let writeQueue: Promise<void> = Promise.resolve();

const cloneState = (state: AppState) => structuredClone(state) as AppState;

const normalizeBillingState = (billing: Partial<AppState['billing']> & { stripeStatus?: string } | undefined) => ({
  plan: billing?.plan || 'Free',
  shipmentsUsed: billing?.shipmentsUsed ?? 0,
  shipmentsLimit: billing?.shipmentsLimit ?? 0,
  monthlyRevenue: billing?.monthlyRevenue ?? 0,
  paymentStatus:
    billing?.paymentStatus ||
    (billing?.stripeStatus === 'active'
      ? 'active'
      : billing?.stripeStatus === 'past_due'
        ? 'past_due'
        : billing?.plan && billing.plan !== 'Free'
          ? 'pending'
          : 'trialing'),
  paymentProvider: billing?.paymentProvider || 'manual',
});

const normalizeInvoice = (invoice: Partial<AppState['invoices'][number]>) => ({
  ...invoice,
  provider: invoice.provider || 'manual',
  providerReference: invoice.providerReference,
  checkoutUrl: invoice.checkoutUrl,
});

const normalizeState = (state: AppState) =>
  ({
    ...state,
    invoices: state.invoices.map((invoice) => normalizeInvoice(invoice)),
    billing: normalizeBillingState(state.billing),
  }) as AppState;

const persistState = async (state: AppState) => {
  writeQueue = writeQueue.then(async () => {
    await prisma.appState.upsert({
      where: { id: STATE_ROW_ID },
      create: {
        id: STATE_ROW_ID,
        payload: state as never,
      },
      update: {
        payload: state as never,
      },
    });
    cachedState = cloneState(state);
  });

  return writeQueue;
};

const loadState = async (): Promise<AppState> => {
  if (cachedState) {
    return cachedState;
  }

  const record = await prisma.appState.findUnique({
    where: { id: STATE_ROW_ID },
  });

  if (!record) {
    const seedState = createSeedState();
    await persistState(seedState);
    return seedState;
  }

  cachedState = normalizeState(record.payload as unknown as AppState);
  return cachedState;
};

const ensureInitialized = async () => {
  if (!initPromise) {
    initPromise = (async () => {
      const state = await loadState();
      if (state.users.length === 0) {
        await persistState(createSeedState());
        return;
      }

      cachedState = cloneState(state);
      await persistState(state);
    })();
  }

  await initPromise;
};

export const initStore = async () => {
  await ensureInitialized();
};

export const getState = () => {
  if (!cachedState) {
    throw new Error('Store not initialized. Call initStore() before handling requests.');
  }

  return cachedState;
};

export const updateState = (mutator: (state: AppState) => void) => {
  if (!cachedState) {
    throw new Error('Store not initialized. Call initStore() before handling requests.');
  }

  const nextState = cloneState(cachedState);
  mutator(nextState);
  cachedState = nextState;
  void persistState(nextState);
  return nextState;
};

export const resetState = () => {
  const nextState = createSeedState();
  cachedState = nextState;
  void persistState(nextState);
  return nextState;
};

export const toWorkspaceSnapshot = (state: AppState, userId: string): WorkspaceSnapshot => {
  const user = state.users.find((entry) => entry.id === userId);

  if (!user) {
    throw new Error('User not found');
  }

  const orders = state.orders
    .filter((order) => order.userId === userId)
    .sort((left, right) => right.createdDate.localeCompare(left.createdDate))
    .map(stripOrder);

  const customers = state.customers
    .filter((customer) => customer.userId === userId)
    .sort((left, right) => right.joinedDate.localeCompare(left.joinedDate))
    .map(stripCustomer);

  const apiKeys = state.apiKeys
    .filter((key) => key.userId === userId)
    .sort((left, right) => right.createdDate.localeCompare(left.createdDate))
    .map(stripApiKey);

  const notifications = state.notifications
    .filter((notification) => notification.userId === userId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .map(stripNotification);

  const invoices = state.invoices
    .filter((invoice) => invoice.userId === userId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .map(({ userId: _userId, ...rest }) => rest);

  const webhooks = state.webhooks
    .filter((webhook) => webhook.userId === userId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));

  const dashboard = {
    totalOrders: orders.length,
    pendingOrders: orders.filter((order) => order.status === 'Pending').length,
    inTransitOrders: orders.filter((order) => order.status === 'Picked Up' || order.status === 'In Transit').length,
    deliveredOrders: orders.filter((order) => order.status === 'Delivered').length,
    failedOrders: orders.filter((order) => order.status === 'Failed').length,
  };

  return {
    user: {
      isLoggedIn: true,
      businessName: user.businessName,
      email: user.email,
      accountType: user.accountType,
    },
    orders,
    customers,
    apiKeys,
    notifications,
    invoices,
    webhooks,
    apiStats: { ...state.apiUsage },
    billing: { ...state.billing },
    dashboard,
  };
};

export const stripUser = (user: StoredUser) => ({
  id: user.id,
  businessName: user.businessName,
  email: user.email,
  accountType: user.accountType,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const stripOrder = (order: StoredOrder) => {
  const { userId, trackingEvents, ...rest } = order;
  return rest;
};

export const stripCustomer = (customer: StoredCustomer) => {
  const { userId, ...rest } = customer;
  return rest;
};

export const stripApiKey = (apiKey: StoredApiKey) => {
  const { userId, ...rest } = apiKey;
  return rest;
};

export const stripNotification = (notification: StoredNotification) => {
  const { userId, ...rest } = notification;
  return rest;
};

export const pushWebhookEvent = (
  userId: string,
  eventType: string,
  target: string,
  payload: Record<string, unknown>,
  status: StoredWebhookEvent['status'] = 'pending',
) => {
  const event: StoredWebhookEvent = {
    id: `WH-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    eventType,
    target,
    payload,
    status,
    createdAt: new Date().toISOString(),
  };

  updateState((state) => {
    state.webhooks.unshift(event);
  });

  return event;
};

export const getCurrentBilling = (state: AppState) => state.billing;

export const getInvoicesForUser = (state: AppState, userId: string) =>
  state.invoices.filter((invoice) => invoice.userId === userId).map(({ userId: _userId, ...rest }) => rest);

export const closeStore = async () => {
  await prisma.$disconnect();
};
