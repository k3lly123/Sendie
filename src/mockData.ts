import { Order, Customer, ApiKey, ApiUsageStats, Notification } from './types';

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'TRK-9024A',
    customerName: 'Adewale Bashir',
    customerPhone: '+234 803 111 2222',
    itemDescription: 'Air Jordan 1 Retro High',
    pickupLocation: 'Ikeja Logistics Hub, Lagos',
    deliveryLocation: 'Adetokunbo Ademola St, Victoria Island, Lagos',
    status: 'In Transit',
    createdDate: '2026-05-29 09:15 AM',
    estimatedDelivery: 'Today, 04:30 PM',
    trackingLink: 'https://sendie.sh/track/TRK-9024A',
    notes: 'Please call before arrival. Deliver to the receptionist.',
  },
  {
    id: 'TRK-78291',
    customerName: 'Amina Bello',
    customerPhone: '+234 812 345 6789',
    itemDescription: 'Nike Air Max Sneakers',
    pickupLocation: 'Gbagada fulfillment Center, Lagos',
    deliveryLocation: 'Maitama District, Abuja',
    status: 'In Transit',
    createdDate: '2026-05-29 02:40 PM',
    estimatedDelivery: 'Tomorrow, 12:00 PM',
    trackingLink: 'https://sendie.sh/track/TRK-78291',
    notes: 'Leave at gatehouse if customer is unavailable.',
  },
  {
    id: 'TRK-78290',
    customerName: 'Emmanuel Okafor',
    customerPhone: '+234 905 444 3322',
    itemDescription: 'Premium MagSafe iPhone Case',
    pickupLocation: 'Lekki Phase 1 Depot, Lagos',
    deliveryLocation: 'Chevron Drive, Lekki, Lagos',
    status: 'Delivered',
    createdDate: '2026-05-28 11:15 AM',
    estimatedDelivery: 'Delivered (May 28, 03:22 PM)',
    trackingLink: 'https://sendie.sh/track/TRK-78290',
    notes: 'Leave with security staff.',
  },
  {
    id: 'TRK-78289',
    customerName: 'Chioma Nwachukwu',
    customerPhone: '+234 703 555 9901',
    itemDescription: 'Oversized Vintage Cotton T-Shirt',
    pickupLocation: 'Yaba Sorting Office, Lagos',
    deliveryLocation: 'Herbert Macaulay Way, Yaba, Lagos',
    status: 'Picked Up',
    createdDate: '2026-05-29 04:05 PM',
    estimatedDelivery: 'Today, 06:00 PM',
    trackingLink: 'https://sendie.sh/track/TRK-78289',
    notes: 'Call 5 mins before delivery.',
  },
  {
    id: 'TRK-78288',
    customerName: 'Tunde Folawiyo',
    customerPhone: '+234 809 234 1122',
    itemDescription: 'Ultra LTE smart Watch Series 9',
    pickupLocation: 'Ikeja Logistics Hub, Lagos',
    deliveryLocation: 'Allen Avenue, Ikeja, Lagos',
    status: 'Pending',
    createdDate: '2026-05-30 07:15 AM',
    estimatedDelivery: 'Today, 05:00 PM',
    trackingLink: 'https://sendie.sh/track/TRK-78288',
    notes: 'Fragile. Handle with absolute care.',
  },
  {
    id: 'TRK-4911X',
    customerName: 'Fatima Zubairu',
    customerPhone: '+234 815 999 1111',
    itemDescription: 'Sony WH-1000XM5 Headphones',
    pickupLocation: 'Lekki Phase 1 Depot, Lagos',
    deliveryLocation: 'GRA, Port Harcourt',
    status: 'Pending',
    createdDate: '2026-05-30 06:30 AM',
    estimatedDelivery: 'Monday, 02:00 PM',
    trackingLink: 'https://sendie.sh/track/TRK-4911X',
    notes: 'Call primary contact for entry code.',
  },
  {
    id: 'TRK-3211B',
    customerName: 'Kunle Adebayo',
    customerPhone: '+234 802 777 8888',
    itemDescription: 'MacBook Pro 14 Inch M3 Max',
    pickupLocation: 'Ikeja Logistics Hub, Lagos',
    deliveryLocation: 'Bodija Estate, Ibadan',
    status: 'Failed',
    createdDate: '2026-05-27 10:00 AM',
    estimatedDelivery: 'Attempted (May 28)',
    trackingLink: 'https://sendie.sh/track/TRK-3211B',
    notes: 'High value. Recipient was unreachable after 3 call attempts.',
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-3012',
    name: 'Adewale Bashir',
    phone: '+234 803 111 2222',
    email: 'adewale.b@gmail.com',
    totalOrders: 6,
    recentDelivery: 'TRK-9024A',
    joinedDate: '2025-11-12',
  },
  {
    id: 'CUST-3013',
    name: 'Amina Bello',
    phone: '+234 812 345 6789',
    email: 'amina.bello@bello.co',
    totalOrders: 14,
    recentDelivery: 'TRK-78291',
    joinedDate: '2025-08-04',
  },
  {
    id: 'CUST-3014',
    name: 'Emmanuel Okafor',
    phone: '+234 905 444 3322',
    email: 'emman@okaforgroup.org',
    totalOrders: 3,
    recentDelivery: 'TRK-78290',
    joinedDate: '2026-01-15',
  },
  {
    id: 'CUST-3015',
    name: 'Chioma Nwachukwu',
    phone: '+234 703 555 9901',
    email: 'chioma_n@niftylabs.sh',
    totalOrders: 9,
    recentDelivery: 'TRK-78289',
    joinedDate: '2025-05-20',
  },
  {
    id: 'CUST-3016',
    name: 'Tunde Folawiyo',
    phone: '+234 809 234 1122',
    email: 't.folawiyo@capitals.com',
    totalOrders: 1,
    recentDelivery: 'TRK-78288',
    joinedDate: '2026-05-30',
  }
];

export const INITIAL_API_KEYS: ApiKey[] = [
  {
    id: 'KEY-001',
    name: 'Production Environment Secret',
    prefix: 'sk_live_sendie_',
    secret: '•••••••••••••••••••••••••••••••••a1b2c3d4',
    createdDate: '2026-01-10',
  },
  {
    id: 'KEY-002',
    name: 'Development Sandbox',
    prefix: 'sk_test_sendie_',
    secret: '•••••••••••••••••••••••••••••••••z9y8x7w6',
    createdDate: '2026-02-15',
  }
];

export const INITIAL_API_STATS: ApiUsageStats = {
  requestsCount: 148204,
  successfulRequests: 147980,
  failedRequests: 224,
};

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'NOTIF-1',
    text: 'Package TRK-78290 successfully delivered to Chevron Drive, Lekki.',
    time: '2 hours ago',
    unread: true,
  },
  {
    id: 'NOTIF-2',
    text: 'New API Key generated for Development Sandbox.',
    time: '1 day ago',
    unread: false,
  },
  {
    id: 'NOTIF-3',
    text: 'Billing Invoice for May 2026 is now ready.',
    time: '2 days ago',
    unread: false,
  }
];
