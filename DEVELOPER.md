# Sendie Developer Guide

## Project Overview

Sendie is a multi-role shipping and logistics platform that provides separate workspaces for different user types:

- **Merchant**: E-commerce businesses managing orders and shipments
- **Developer/Startup**: API-first integrations for programmatic access
- **Logistics Company**: Dispatch and delivery management
- **Admin**: System administration and configuration

Each role operates in an **independent workspace** with role-specific UI, features, and billing tiers.

## Architecture

### Tech Stack

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS for styling
- Motion/Framer Motion for animations
- Vite for build tooling

**Backend:**
- Express.js with TypeScript
- PostgreSQL database
- Prisma ORM for data management
- Session-based authentication

**Payment Integration:**
- Paystack (primary payment provider)
- AltixPay (scaffolded for future use)

### Project Structure

```
sendie/
├── src/                          # Frontend React app
│   ├── components/               # Role-specific UI components
│   │   ├── DashboardHome.tsx    # Dashboard varies by role
│   │   ├── MerchantPages/
│   │   ├── LogisticsPages/
│   │   ├── DeveloperPages/
│   │   └── AdminPages/
│   ├── lib/
│   │   └── sendieApi.ts         # API client
│   ├── types.ts                  # Shared TypeScript interfaces
│   └── main.tsx
│
├── backend/                      # Express API server
│   ├── src/
│   │   ├── app.ts               # Express app setup
│   │   ├── server.ts            # Server entry point
│   │   ├── store.ts             # In-memory state (AppState table)
│   │   ├── types.ts             # Backend interfaces
│   │   ├── config/
│   │   │   └── prisma.ts        # Prisma client configuration
│   │   ├── middleware/          # Auth, error handling
│   │   ├── modules/             # Feature modules
│   │   │   ├── auth/            # Authentication logic
│   │   │   ├── orders/          # Order management
│   │   │   ├── tracking/        # Shipment tracking
│   │   │   ├── users/           # User management
│   │   │   └── apiKeys/         # API key management
│   │   ├── utils/               # Helper functions
│   │   │   ├── crypto.ts        # Encryption utilities
│   │   │   ├── generateOrderId.ts
│   │   │   └── generateTrackingId.ts
│   │   └── seed.ts              # Database seeding
│   │
│   └── schema/
│       └── schema.prisma        # Database schema
│
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # Frontend TypeScript config
├── vite.config.ts               # Vite configuration
└── prisma.config.ts             # Prisma configuration

```

## Role-Based System

### Workspace Structure

Each user has a single `accountType` which determines their workspace:

```typescript
accountType: 'Merchant' | 'Developer/Startup' | 'Logistics Company' | 'Admin'
```

### User Session

```typescript
interface UserSession {
  id: string;
  businessName: string;
  email: string;
  accountType: 'Merchant' | 'Developer/Startup' | 'Logistics Company' | 'Admin';
}
```

### Role Capabilities

#### Merchant
- Create and manage orders
- View customer list and analytics
- Track shipments in real-time
- Manage billing and payment plans
- View invoices and payment history
- Update workspace settings

#### Developer/Startup
- Generate and manage API keys
- Access API documentation
- Monitor API usage and request stats
- Programmatically create orders
- Receive webhooks for order updates
- Test integration endpoints

#### Logistics Company
- View assigned orders/shipments
- Update delivery status
- Capture proof of delivery (photo, OTP, signature)
- Manage driver/rider assignments
- Handle delivery exceptions
- Track GPS location of shipments
- Monitor workspace metrics

#### Admin
- Review all user accounts and billing
- Monitor system usage
- Access workspace controls
- Reset/reseed database for testing
- View notifications and alerts

## Data Model

### Core Entities

**Order**
```typescript
interface Order {
  id: string;                    // Unique order ID
  customerName: string;
  customerPhone: string;
  itemDescription: string;
  pickupLocation: string;
  deliveryLocation: string;
  status: 'Pending' | 'Picked Up' | 'In Transit' | 'Delivered' | 'Failed';
  createdDate: string;
  estimatedDelivery: string;
  trackingLink: string;
  riderAssignment?: {
    name: string;
    phone?: string;
    status: 'unassigned' | 'assigned' | 'accepted';
  };
  proofOfDelivery?: {
    method: 'photo' | 'otp' | 'signature';
    status: 'pending' | 'captured';
  };
  deliveryException?: {
    type: 'address_issue' | 'customer_unreachable' | 'delay' | 'other';
    status: 'open' | 'resolved';
  };
  gpsTracking?: {
    enabled: boolean;
    lastKnownLocation?: string;
    signal?: 'good' | 'weak' | 'offline';
  };
}
```

**Customer**
```typescript
interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalOrders: number;
  recentDelivery: string;
  joinedDate: string;
}
```

**API Key**
```typescript
interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  secret: string;
  createdDate: string;
}
```

**Billing State**
```typescript
interface BillingState {
  plan: string;                  // 'Free', 'Basic', 'Pro', etc.
  shipmentsUsed: number;
  shipmentsLimit: number;
  monthlyRevenue: number;
  paymentStatus: 'active' | 'trialing' | 'past_due' | 'pending';
  paymentProvider: 'paystack' | 'altixpay' | 'manual';
}
```

### Database Schema

Currently uses a single `AppState` table (JSON-based):

```prisma
model AppState {
  id        Int      @id @default(1)
  payload   Json                    // Contains all workspace state
  updatedAt DateTime @updatedAt
}
```

**AppState payload structure:**
```typescript
{
  users: StoredUser[];
  orders: StoredOrder[];
  customers: StoredCustomer[];
  apiKeys: StoredApiKey[];
  invoices: Invoice[];
  notifications: StoredNotification[];
  billingState: BillingState;
}
```

## Setup & Installation

### Prerequisites

- Node.js 20+
- PostgreSQL database
- npm or yarn

### Installation Steps

1. **Clone and install dependencies:**
   ```bash
   git clone https://github.com/k3lly123/Sendie.git
   cd Sendie
   npm install
   ```

2. **Environment configuration:**
   ```bash
   cp .env.example .env
   ```

3. **Configure `.env`:**
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/sendie_db
   DIRECT_URL=postgresql://user:password@localhost:5432/sendie_db
   
   # Payment Provider (Optional - for testing without payment)
  PAYSTACK_SECRET_KEY=your_paystack_secret_key
   APP_URL=http://localhost:3000
  SENDIE_PAYMENT_PROVIDER=paystack
   ```

4. **Setup database:**
   ```bash
   npm run db:generate    # Generate Prisma client
   npm run db:push       # Push schema to database
   npm run db:seed       # (Optional) Seed initial data
   ```

5. **Start development servers:**
   
   Terminal 1 - Frontend:
   ```bash
   npm run dev
   ```
   
   Terminal 2 - Backend:
   ```bash
   npm run dev:api
   ```

   Frontend: http://localhost:3000
   Backend API: http://localhost:4000

## API Endpoints

### Authentication
- `POST /auth/signup` - Create account
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `GET /auth/session` - Get current session

### Orders (Merchant & Logistics)
- `GET /orders` - List orders
- `POST /orders` - Create order
- `GET /orders/:id` - Get order details
- `PATCH /orders/:id` - Update order status
- `DELETE /orders/:id` - Delete order

### Customers (Merchant)
- `GET /customers` - List customers
- `GET /customers/:id` - Get customer details

### API Keys (Developer)
- `GET /api-keys` - List API keys
- `POST /api-keys` - Generate new key
- `DELETE /api-keys/:id` - Revoke key
- `GET /api/usage` - Get usage statistics

### Tracking (Public)
- `GET /tracking/:trackingLink` - Public tracking page

### Billing (Merchant & Logistics)
- `GET /billing` - Get billing state
- `POST /billing/checkout` - Initialize Paystack checkout
- `POST /billing/paystack/verify` - Verify a Paystack transaction
- `POST /billing/paystack/webhook` - Handle Paystack payment webhooks

## Development Workflow

### Adding a New Feature

1. **Determine the role(s)** affected by the feature
2. **Update TypeScript interfaces** in `src/types.ts` and `backend/src/types.ts`
3. **Add backend logic** in `backend/src/modules/`
4. **Create API endpoints** in Express
5. **Add UI components** in `src/components/`
6. **Test with different roles** to ensure role-based access control

### Testing Different Roles

1. Sign up with different account types
2. Use workspace reset in Admin dashboard to reseed
3. Test role-specific features and UI changes

### Database Migrations

When modifying the schema:

```bash
# Update schema.prisma
# Then regenerate the Prisma client:
npm run db:generate

# Push changes to database:
npm run db:push
```

## State Management

The application uses a **JSON-based state model** stored in PostgreSQL via the `AppState` table. 

**Key files:**
- `backend/src/store.ts` - State loading and management
- `backend/src/config/prisma.ts` - Prisma client setup

All workspace data (users, orders, customers, billing, etc.) is stored as a single JSON document and retrieved/updated on each request.

## Payment Processing

### Paystack Integration

1. **Checkout Flow:**
   - User clicks "Subscribe" in Billing page
  - Backend initiates Paystack hosted checkout
  - User is redirected to the Paystack payment page
  - After payment, Paystack redirects back to the app with a transaction reference

2. **Webhook Handling:**
  - Paystack sends signed events to `/billing/paystack/webhook`
   - Backend validates and updates billing state
   - User account activated automatically

### For Development (Without Payment)

Leave `PAYSTACK_SECRET_KEY` unset in `.env` to use manual billing mode for testing.

## Building for Production

```bash
npm run build
```

Outputs:
- Frontend: `dist/` (static files)
- Backend: Ready for deployment as Node.js app

## Debugging

### View Backend Logs

Terminal running backend server shows detailed logs.

### Check Database State

Connect to PostgreSQL and query the `app_state` table:

```sql
SELECT payload FROM "AppState" LIMIT 1;
```

### TypeScript Checking

```bash
npm run lint
```

## Common Development Tasks

### Reset workspace (Admin)
```
Dashboard > Settings > Workspace Controls > Reset Workspace
```

### Generate API key (Developer)
```
Dashboard > API Documentation > Generate New Key
```

### Create test order (Merchant or Developer)
```
POST /orders with order details
```

### Update order status (Logistics)
```
PATCH /orders/:id with new status
```

## Deployment

### Environment Variables for Production

```env
DATABASE_URL=postgresql://prod_user:prod_pass@prod_db:5432/sendie_prod
NODE_ENV=production
PAYSTACK_SECRET_KEY=your_prod_secret_key
APP_URL=https://yourdomain.com
```

### Recommended Deployment Platforms

- **Frontend:** Vercel, Netlify
- **Backend:** Railway, Render, AWS EC2, DigitalOcean
- **Database:** AWS RDS, Railway Postgres, Supabase

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes following the role-based structure
3. Test with all affected roles
4. Commit and push: `git push origin feature/your-feature`
5. Create a Pull Request

## Troubleshooting

### Database connection errors
- Verify `DATABASE_URL` in `.env`
- Check PostgreSQL is running
- Ensure database exists and user has permissions

### Frontend not loading
- Clear browser cache
- Check `npm run dev` is running on port 3000
- Verify no port conflicts

### API endpoints 404
- Ensure `npm run dev:api` is running
- Check backend is on port 4000
- Verify endpoint names match routes

### Payment errors
- Verify the Paystack secret key is correct
- Check `APP_URL` matches the callback URL configured in Paystack
- Review the Paystack dashboard for transaction details

## License

Proprietary - Sendie

## Contact

For development questions, reach out to the team.
