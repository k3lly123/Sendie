import type { ApiKey, ApiUsageStats, BillingState, Customer, Invoice, Notification, Order, OrderStatus, UserSession } from '../types';

export interface WorkspaceSnapshot {
  user: UserSession;
  orders: Order[];
  customers: Customer[];
  apiKeys: ApiKey[];
  notifications: Notification[];
  apiStats: ApiUsageStats;
  billing: BillingState;
  invoices: Invoice[];
  webhooks: Array<{
    id: string;
    eventType: string;
    target: string;
    payload: Record<string, unknown>;
    status: 'pending' | 'delivered' | 'failed';
    createdAt: string;
    deliveredAt?: string;
    responseCode?: number;
  }>;
  dashboard: {
    totalOrders: number;
    pendingOrders: number;
    inTransitOrders: number;
    deliveredOrders: number;
    failedOrders: number;
  };
}

interface ApiEnvelope<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
  error?: {
    code?: string;
  };
}

export interface AuthResult {
  token: string;
  user: UserSession;
  workspace: WorkspaceSnapshot;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const TOKEN_STORAGE_KEY = 'sendie.session.token';

export const getStoredToken = () => localStorage.getItem(TOKEN_STORAGE_KEY);

export const storeToken = (token: string) => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const clearStoredToken = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

const buildHeaders = (includeAuth = true, extraHeaders?: HeadersInit) => {
  const headers = new Headers(extraHeaders);
  headers.set('Content-Type', 'application/json');

  if (includeAuth) {
    const token = getStoredToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  return headers;
};

const request = async <T>(
  path: string,
  options?: RequestInit,
  includeAuth = true,
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(includeAuth, options?.headers),
  });

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok || !payload || payload.status === 'error') {
    throw new Error(payload?.message || `Request failed with status ${response.status}`);
  }

  return payload.data;
};

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<AuthResult>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }, false),
    signup: (body: {
      businessName: string;
      email: string;
      password: string;
      accountType: UserSession['accountType'];
    }) =>
      request<AuthResult>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(body),
      }, false),
    me: () => request<UserSession>('/auth/me'),
    refresh: () => request<AuthResult>('/auth/refresh', {
      method: 'POST',
    }),
    updateProfile: (body: { businessName: string; email: string }) =>
      request<{ user: UserSession; workspace: WorkspaceSnapshot }>('/auth/me', {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
  },
  workspace: {
    bootstrap: () => request<WorkspaceSnapshot>('/bootstrap'),
  },
  orders: {
    create: (body: {
      customerName: string;
      customerPhone: string;
      itemDescription: string;
      pickupLocation: string;
      deliveryLocation: string;
      dropOffContactName?: string;
      dropOffContactPhone?: string;
      dropOffLandmark?: string;
      notes?: string;
      status?: OrderStatus;
    }) =>
      request<{ order: Order; customer?: Customer; workspace: WorkspaceSnapshot }>('/orders', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    updateStatus: (orderId: string, status: OrderStatus) =>
      request<{ order: Order; workspace: WorkspaceSnapshot }>(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    updateProof: (orderId: string, body: { method: 'photo' | 'otp' | 'signature'; note?: string }) =>
      request<{ order: Order; workspace: WorkspaceSnapshot }>(`/orders/${orderId}/proof`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    assignRider: (orderId: string, body: { name: string; phone?: string; vehicle?: string; accepted?: boolean }) =>
      request<{ order: Order; workspace: WorkspaceSnapshot }>(`/orders/${orderId}/assignment`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    logException: (
      orderId: string,
      body: { type: 'address_issue' | 'customer_unreachable' | 'delay' | 'failed_pickup' | 'weather' | 'other'; note?: string; status?: 'open' | 'resolved' },
    ) =>
      request<{ order: Order; workspace: WorkspaceSnapshot }>(`/orders/${orderId}/exception`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    updateGps: (orderId: string, body: { enabled?: boolean; lastKnownLocation?: string; signal?: 'good' | 'weak' | 'offline' }) =>
      request<{ order: Order; workspace: WorkspaceSnapshot }>(`/orders/${orderId}/gps`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    delete: (orderId: string) =>
      request<{ workspace: WorkspaceSnapshot }>(`/orders/${orderId}`, {
        method: 'DELETE',
      }),
  },
  customers: {
    list: () => request<Customer[]>('/customers'),
  },
  notifications: {
    list: () => request<Notification[]>('/notifications'),
    markRead: () => request<{ workspace: WorkspaceSnapshot }>('/notifications/read', {
      method: 'PATCH',
    }),
  },
  apiKeys: {
    list: () => request<ApiKey[]>('/api-keys'),
    create: (name: string) =>
      request<{ apiKey: ApiKey; workspace: WorkspaceSnapshot }>('/api-keys', {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
    revoke: (id: string) =>
      request<{ workspace: WorkspaceSnapshot }>(`/api-keys/${id}`, {
        method: 'DELETE',
      }),
  },
  dashboard: {
    summary: () => request<WorkspaceSnapshot['dashboard']>('/dashboard/summary'),
  },
  billing: {
    invoices: () => request<Invoice[]>('/billing/invoices'),
    checkout: (plan: string) =>
      request<{ invoice: Invoice; workspace: WorkspaceSnapshot; checkoutUrl?: string }>('/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({ plan }),
      }),
    markPaid: (invoiceId: string) =>
      request<{ invoice: Invoice; workspace: WorkspaceSnapshot }>(`/billing/invoices/${invoiceId}/pay`, {
        method: 'PATCH',
      }),
    verifyPaystack: (body: { reference: string; invoiceId?: string }) =>
      request<{ invoice: Invoice; workspace: WorkspaceSnapshot }>('/billing/paystack/verify', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },
  admin: {
    resetWorkspace: () =>
      request<{ users: number; orders: number }>('/admin/reset-workspace', {
        method: 'POST',
      }),
  },
  public: {
    createDelivery: (body: {
      customer_name: string;
      customer_phone: string;
      item_description: string;
      pickup_location: string;
      delivery_location: string;
      pickup_notes?: string;
      apiKey: string;
    }) =>
      request<{ delivery: Order; trackingUrl: string; workspace: WorkspaceSnapshot }>(
        '/public/v1/deliveries',
        {
          method: 'POST',
          headers: {
            'X-API-Key': body.apiKey,
          },
          body: JSON.stringify({
            customer_name: body.customer_name,
            customer_phone: body.customer_phone,
            item_description: body.item_description,
            pickup_location: body.pickup_location,
            delivery_location: body.delivery_location,
            pickup_notes: body.pickup_notes,
          }),
        },
        false,
      ),
    tracking: (trackingId: string) =>
      request<{
        order: Order;
        timeline: Array<{ status: string; isComplete: boolean; isCurrent: boolean }>;
      }>(`/public/v1/tracking/${trackingId}`, undefined, false),
  },
};

export type { Order, Customer, ApiKey, Notification, ApiUsageStats, UserSession, OrderStatus };
