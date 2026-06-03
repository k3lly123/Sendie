import type {
  ApiKey,
  ApiUsageStats,
  Customer,
  Invoice,
  Notification,
  Order,
  OrderStatus,
  UserSession,
} from '../../src/types';

export interface StoredUser {
  id: string;
  businessName: string;
  email: string;
  accountType: UserSession['accountType'];
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrackingEvent {
  id: string;
  status: OrderStatus;
  note?: string;
  createdAt: string;
}

export interface StoredOrder extends Order {
  userId: string;
  trackingEvents: TrackingEvent[];
}

export interface StoredCustomer extends Customer {
  userId: string;
}

export interface StoredApiKey extends ApiKey {
  userId: string;
  lastUsedAt?: string;
}

export interface StoredNotification extends Notification {
  userId: string;
  createdAt: string;
}

export interface BillingState {
  plan: string;
  shipmentsUsed: number;
  shipmentsLimit: number;
  monthlyRevenue: number;
  paymentStatus: 'active' | 'trialing' | 'past_due' | 'pending';
  paymentProvider: 'flutterwave' | 'altixpay' | 'manual';
}

export interface StoredInvoice extends Invoice {
  userId: string;
}

export interface StoredWebhookEvent {
  id: string;
  userId: string;
  eventType: string;
  target: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'delivered' | 'failed';
  createdAt: string;
  deliveredAt?: string;
  responseCode?: number;
}

export interface AppState {
  users: StoredUser[];
  orders: StoredOrder[];
  customers: StoredCustomer[];
  apiKeys: StoredApiKey[];
  notifications: StoredNotification[];
  invoices: StoredInvoice[];
  webhooks: StoredWebhookEvent[];
  apiUsage: ApiUsageStats;
  billing: BillingState;
}

export interface WorkspaceSnapshot {
  user: UserSession;
  orders: Order[];
  customers: Customer[];
  apiKeys: ApiKey[];
  notifications: Notification[];
  invoices: Invoice[];
  webhooks: StoredWebhookEvent[];
  apiStats: ApiUsageStats;
  billing: BillingState;
  dashboard: {
    totalOrders: number;
    pendingOrders: number;
    inTransitOrders: number;
    deliveredOrders: number;
    failedOrders: number;
  };
}
