export type OrderStatus = 'Pending' | 'Picked Up' | 'In Transit' | 'Delivered' | 'Failed';

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  itemDescription: string;
  pickupLocation: string;
  deliveryLocation: string;
  status: OrderStatus;
  createdDate: string;
  estimatedDelivery: string;
  trackingLink: string;
  notes?: string;
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

export interface UserSession {
  isLoggedIn: boolean;
  businessName: string;
  email: string;
  accountType: 'Merchant' | 'Startup' | 'Developer';
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
  | 'billing';
