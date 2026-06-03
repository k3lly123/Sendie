export type OrderStatus = 'Pending' | 'Picked Up' | 'In Transit' | 'Delivered' | 'Failed';

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  itemDescription: string;
  pickupLocation: string;
  deliveryLocation: string;
  dropOffContactName?: string;
  dropOffContactPhone?: string;
  dropOffLandmark?: string;
  status: OrderStatus;
  createdDate: string;
  estimatedDelivery: string;
  trackingLink: string;
  notes?: string;
  proofOfDelivery?: {
    method: 'photo' | 'otp' | 'signature';
    status: 'pending' | 'captured';
    note?: string;
    capturedAt?: string;
  };
  riderAssignment?: {
    name: string;
    phone?: string;
    vehicle?: string;
    status: 'unassigned' | 'assigned' | 'accepted';
    assignedAt?: string;
  };
  deliveryException?: {
    type: 'address_issue' | 'customer_unreachable' | 'delay' | 'failed_pickup' | 'weather' | 'other';
    status: 'open' | 'resolved';
    note?: string;
    raisedAt?: string;
    resolvedAt?: string;
  };
  gpsTracking?: {
    enabled: boolean;
    lastKnownLocation?: string;
    lastUpdatedAt?: string;
    signal?: 'good' | 'weak' | 'offline';
  };
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalOrders: number;
  recentDelivery: string;
  joinedDate: string;
}

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  secret: string;
  createdDate: string;
}

export interface ApiUsageStats {
  requestsCount: number;
  successfulRequests: number;
  failedRequests: number;
}

export interface BillingState {
  plan: string;
  shipmentsUsed: number;
  shipmentsLimit: number;
  monthlyRevenue: number;
  paymentStatus: 'active' | 'trialing' | 'past_due' | 'pending';
  paymentProvider: 'flutterwave' | 'altixpay' | 'manual';
}

export interface Invoice {
  id: string;
  plan: string;
  amount: number;
  currency: string;
  status: 'draft' | 'pending' | 'paid' | 'failed';
  createdAt: string;
  dueAt: string;
  paidAt?: string;
  provider?: 'flutterwave' | 'altixpay' | 'manual';
  providerReference?: string;
  checkoutUrl?: string;
}

export interface UserSession {
  isLoggedIn: boolean;
  businessName: string;
  email: string;
  accountType: 'Merchant' | 'Developer/Startup' | 'Logistics Company' | 'Admin';
}

export interface Notification {
  id: string;
  text: string;
  time: string;
  unread: boolean;
}

export type AppScreen =
  | 'landing'
  | 'login'
  | 'signup'
  | 'dashboard-home'
  | 'orders'
  | 'create-order'
  | 'order-details'
  | 'tracking'
  | 'customers'
  | 'api'
  | 'api-docs'
  | 'settings'
  | 'billing'
  | 'public-tracking';
