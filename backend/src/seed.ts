import type { AppState } from './types';
import { hashPassword } from './utils/crypto';

const adminEmail = process.env.SENDIE_ADMIN_EMAIL || 'admin@sendie.local';
const adminPassword = process.env.SENDIE_ADMIN_PASSWORD || 'admin1234';

export const createSeedState = (): AppState => ({
  users: [
    {
      id: 'user_admin_local',
      businessName: 'Sendie Admin',
      email: adminEmail,
      accountType: 'Admin',
      passwordHash: hashPassword(adminPassword, 'sendie-admin-salt'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  orders: [
    {
      id: 'TRK-DEMO-001',
      customerName: 'Adewale Bashir',
      customerPhone: '+234 803 111 2222',
      itemDescription: 'Air Jordan 1 Retro',
      pickupLocation: 'Ikeja Hub, Lagos',
      deliveryLocation: 'Victoria Island, Lagos',
      dropOffContactName: 'Ayo Daniel',
      dropOffContactPhone: '+234 807 222 8899',
      dropOffLandmark: 'Adjacent to Civic Centre',
      status: 'In Transit',
      createdDate: new Date().toISOString(),
      estimatedDelivery: 'Today, 05:30 PM',
      trackingLink: 'https://sendie.sh/track/TRK-DEMO-001',
      notes: 'Handle with care',
      proofOfDelivery: {
        method: 'photo',
        status: 'pending',
      },
      riderAssignment: {
        name: 'Alex Rider',
        phone: '+234 801 222 3344',
        vehicle: 'Motorbike',
        status: 'accepted',
        assignedAt: new Date().toISOString(),
      },
      deliveryException: {
        type: 'delay',
        status: 'resolved',
        note: 'No open exception',
        resolvedAt: new Date().toISOString(),
      },
      gpsTracking: {
        enabled: true,
        lastKnownLocation: 'Lekki Phase 1, Lagos',
        lastUpdatedAt: new Date().toISOString(),
        signal: 'good',
      },
      userId: 'user_admin_local',
      trackingEvents: [
        {
          id: 'evt_TRK-DEMO-001_created',
          status: 'Pending',
          note: 'Demo order created',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'evt_TRK-DEMO-001_picked_up',
          status: 'Picked Up',
          note: 'Parcel collected from pickup point',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'evt_TRK-DEMO-001_in_transit',
          status: 'In Transit',
          note: 'Courier is en route',
          createdAt: new Date().toISOString(),
        },
      ],
    },
  ],
  customers: [],
  apiKeys: [],
  notifications: [],
  invoices: [],
  webhooks: [],
  apiUsage: {
    requestsCount: 0,
    successfulRequests: 0,
    failedRequests: 0,
  },
  billing: {
    plan: 'Free',
    shipmentsUsed: 0,
    shipmentsLimit: 0,
    monthlyRevenue: 0,
    paymentStatus: 'trialing',
    paymentProvider: 'manual',
  },
});
