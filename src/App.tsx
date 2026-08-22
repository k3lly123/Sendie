import { Suspense, lazy, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PlusCircle,
  Sparkles,
  Sliders,
  HelpCircle,
  Compass,
  UserCheck,
  ArrowRightLeft,
  Info,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  X,
} from 'lucide-react';

import {
  AppScreen,
  Order,
  Customer,
  ApiKey,
  ApiUsageStats,
  BillingState,
  Invoice,
  UserSession,
  Notification,
  OrderStatus,
} from './types';
import { api, clearStoredToken, getStoredToken, storeToken, type WorkspaceSnapshot } from './lib/sendieApi';

const LandingPage = lazy(() => import('./components/LandingPage'));
const LoginPage = lazy(() => import('./components/LoginPage'));
const SignupPage = lazy(() => import('./components/SignupPage'));
const SidebarLayout = lazy(() => import('./components/SidebarLayout'));
const DashboardHome = lazy(() => import('./components/DashboardHome'));
const OrdersPage = lazy(() => import('./components/OrdersPage'));
const CreateOrderPage = lazy(() => import('./components/CreateOrderPage'));
const OrderDetailsPage = lazy(() => import('./components/OrderDetailsPage'));
const TrackingPage = lazy(() => import('./components/TrackingPage'));
const CustomersPage = lazy(() => import('./components/CustomersPage'));
const ApiPage = lazy(() => import('./components/ApiPage'));
const ApiDocsPage = lazy(() => import('./components/ApiDocsPage'));
const SettingsPage = lazy(() => import('./components/SettingsPage'));
const BillingPage = lazy(() => import('./components/BillingPage'));
const PublicTrackingPage = lazy(() => import('./components/PublicTrackingPage'));

export interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

const DEMO_SESSION: UserSession = {
  isLoggedIn: false,
  businessName: '',
  email: '',
  accountType: 'Merchant',
};

const getDefaultScreenForRole = (accountType: UserSession['accountType']): AppScreen => {
  switch (accountType) {
    case 'Developer/Startup':
      return 'api';
    case 'Logistics Company':
    case 'Admin':
      return 'dashboard-home';
    case 'Merchant':
    default:
      return 'dashboard-home';
  }
};

const canAccessScreen = (screen: AppScreen, accountType: UserSession['accountType']) => {
  if (accountType === 'Merchant' || accountType === 'Logistics Company') {
    return !['api', 'api-docs'].includes(screen);
  }
  return true;
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('landing');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [session, setSession] = useState<UserSession>(DEMO_SESSION);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [apiStats, setApiStats] = useState<ApiUsageStats>({ requestsCount: 0, successfulRequests: 0, failedRequests: 0 });
  const [billing, setBilling] = useState<BillingState>({ plan: 'Free', shipmentsUsed: 0, shipmentsLimit: 0, monthlyRevenue: 0, paymentStatus: 'trialing', paymentProvider: 'manual' });
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [webhooks, setWebhooks] = useState<WorkspaceSnapshot['webhooks']>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [freeAlertsEnabled, setFreeAlertsEnabled] = useState(() => localStorage.getItem('sendie.freeAlerts') === 'true');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [evalPanelCollapsed, setEvalPanelCollapsed] = useState(false);

  const setAppPath = (screen: AppScreen, trackingId?: string) => {
    if (screen === 'public-tracking' && trackingId) {
      window.history.pushState({}, '', `/track/${trackingId}`);
      return;
    }

    if (screen === 'landing') {
      window.history.pushState({}, '', '/');
      return;
    }

    window.history.pushState({}, '', '/');
  };

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4500);
  };

  const triggerFreeAlert = async (title: string, message: string) => {
    if (!freeAlertsEnabled || typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    if (window.Notification.permission === 'default') {
      try {
        const permission = await window.Notification.requestPermission();
        if (permission !== 'granted') {
          return;
        }
      } catch {
        return;
      }
    }

    if (window.Notification.permission === 'granted') {
      new window.Notification(title, { body: message, silent: true });
    }
  };

  const setFreeAlerts = async (enabled: boolean) => {
    setFreeAlertsEnabled(enabled);
    localStorage.setItem('sendie.freeAlerts', String(enabled));

    if (enabled && typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'default') {
      try {
        await window.Notification.requestPermission();
      } catch {
        // noop
      }
    }
  };

  const restoreEmptyState = () => {
    setSession(DEMO_SESSION);
    setOrders([]);
    setCustomers([]);
    setApiKeys([]);
    setApiStats({ requestsCount: 0, successfulRequests: 0, failedRequests: 0 });
    setBilling({ plan: 'Free', shipmentsUsed: 0, shipmentsLimit: 0, monthlyRevenue: 0, paymentStatus: 'trialing', paymentProvider: 'manual' });
    setInvoices([]);
    setWebhooks([]);
    setNotifications([]);
    setSelectedOrderId('');
  };

  const syncWorkspace = (workspace: WorkspaceSnapshot) => {
    setSession({
      ...workspace.user,
      isLoggedIn: true,
    });
    setOrders(workspace.orders);
    setCustomers(workspace.customers);
    setApiKeys(workspace.apiKeys);
    setApiStats(workspace.apiStats);
    setBilling(workspace.billing);
    setInvoices(workspace.invoices);
    setWebhooks(workspace.webhooks);
    setNotifications(workspace.notifications);
    setSelectedOrderId((currentSelected) =>
      workspace.orders.some((order) => order.id === currentSelected)
        ? currentSelected
        : workspace.orders[0]?.id || '',
    );
  };

  const refreshWorkspace = async () => {
    const token = getStoredToken();
    if (!token) {
      restoreEmptyState();
      const match = window.location.pathname.match(/^\/track\/([^/]+)$/);
      if (match) {
        setSelectedOrderId(match[1]);
        setCurrentScreen('public-tracking');
      } else {
        setCurrentScreen('landing');
      }
      return;
    }

    try {
      const session = await api.auth.refresh();
      storeToken(session.token);
      syncWorkspace(session.workspace);
      if (!window.location.pathname.startsWith('/track/')) {
        const searchParams = new URLSearchParams(window.location.search);
        const reference = searchParams.get('reference') || '';
        const invoiceId = searchParams.get('invoice') || searchParams.get('invoiceId') || '';

        if (reference) {
          try {
            const result = await api.billing.verifyPaystack({ reference, invoiceId: invoiceId || undefined });
            syncWorkspace(result.workspace);
            setCurrentScreen('billing');
            setAppPath('billing');
            window.history.replaceState({}, '', '/');
            showToast('Paystack payment verified.', 'success');
            return;
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to verify payment';
            showToast(message, 'error');
          }
        }

        const nextScreen = getDefaultScreenForRole(session.workspace.user.accountType);
        setCurrentScreen(nextScreen);
        setAppPath(nextScreen);
      }
    } catch {
      clearStoredToken();
      restoreEmptyState();
    }
  };

  useEffect(() => {
    const match = window.location.pathname.match(/^\/track\/([^/]+)$/);
    if (match) {
      setSelectedOrderId(match[1]);
      setCurrentScreen('public-tracking');
    }

    void refreshWorkspace();
  }, []);

  const handleLoginSuccess = (businessName: string, email: string, accountType: UserSession['accountType']) => {
    setSession({
      isLoggedIn: true,
      businessName,
      email,
      accountType,
    });
    const nextScreen = getDefaultScreenForRole(accountType);
    setCurrentScreen(nextScreen);
    setAppPath(nextScreen);
    void refreshWorkspace();
  };

  const handleSignupSuccess = (businessName: string, email: string, accountType: UserSession['accountType']) => {
    setSession({
      isLoggedIn: true,
      businessName,
      email,
      accountType,
    });
    const nextScreen = getDefaultScreenForRole(accountType);
    setCurrentScreen(nextScreen);
    setAppPath(nextScreen);
    void refreshWorkspace();
  };

  const handleLogout = () => {
    clearStoredToken();
    restoreEmptyState();
    setCurrentScreen('landing');
    setAppPath('landing');
  };

  const handleAddOrder = async (newFields: Omit<Order, 'id' | 'createdDate' | 'trackingLink' | 'estimatedDelivery'>) => {
    try {
      const result = await api.orders.create({
        customerName: newFields.customerName,
        customerPhone: newFields.customerPhone,
        itemDescription: newFields.itemDescription,
        pickupLocation: newFields.pickupLocation,
        deliveryLocation: newFields.deliveryLocation,
        dropOffContactName: newFields.dropOffContactName,
        dropOffContactPhone: newFields.dropOffContactPhone,
        dropOffLandmark: newFields.dropOffLandmark,
        notes: newFields.notes,
        status: newFields.status,
      });

      syncWorkspace(result.workspace);
      setSelectedOrderId(result.order.id);
      void triggerFreeAlert('Sendie order created', `Order ${result.order.id} was created for ${result.order.customerName}.`);
      return result.order;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create order';
      showToast(message, 'error');
      throw error;
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const result = await api.orders.delete(orderId);
      syncWorkspace(result.workspace);
      void triggerFreeAlert('Sendie order cancelled', `Order ${orderId} was removed from active tracking.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to delete order';
      showToast(message, 'error');
    }
  };

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const result = await api.orders.updateStatus(orderId, status);
      syncWorkspace(result.workspace);
      void triggerFreeAlert('Sendie status updated', `Order ${orderId} moved to ${status}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update order status';
      showToast(message, 'error');
    }
  };

  const handleCaptureProof = async (orderId: string, method: 'photo' | 'otp' | 'signature', note?: string) => {
    try {
      const result = await api.orders.updateProof(orderId, { method, note });
      syncWorkspace(result.workspace);
      void triggerFreeAlert('Sendie proof captured', `Proof of delivery was captured for ${orderId}.`);
      showToast(`Proof of delivery captured for ${orderId}.`, 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to capture proof';
      showToast(message, 'error');
    }
  };

  const handleAssignRider = async (orderId: string, body: { name: string; phone?: string; vehicle?: string; accepted?: boolean }) => {
    try {
      const result = await api.orders.assignRider(orderId, body);
      syncWorkspace(result.workspace);
      void triggerFreeAlert('Sendie rider assigned', `Rider assigned to ${orderId}.`);
      showToast(`Rider assigned to ${orderId}.`, 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to assign rider';
      showToast(message, 'error');
    }
  };

  const handleLogException = async (
    orderId: string,
    body: { type: 'address_issue' | 'customer_unreachable' | 'delay' | 'failed_pickup' | 'weather' | 'other'; note?: string; status?: 'open' | 'resolved' },
  ) => {
    try {
      const result = await api.orders.logException(orderId, body);
      syncWorkspace(result.workspace);
      void triggerFreeAlert('Sendie delivery exception', `An exception was logged for ${orderId}.`);
      showToast(`Delivery exception logged for ${orderId}.`, 'warning');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to log exception';
      showToast(message, 'error');
    }
  };

  const handleUpdateGps = async (orderId: string, body: { enabled?: boolean; lastKnownLocation?: string; signal?: 'good' | 'weak' | 'offline' }) => {
    try {
      const result = await api.orders.updateGps(orderId, body);
      syncWorkspace(result.workspace);
      void triggerFreeAlert('Sendie GPS updated', `GPS-lite was updated for ${orderId}.`);
      showToast(`GPS-lite updated for ${orderId}.`, 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update GPS-lite';
      showToast(message, 'error');
    }
  };

  const handleUpdateSession = async (businessName: string, email: string) => {
    try {
      const result = await api.auth.updateProfile({ businessName, email });
      syncWorkspace(result.workspace);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update profile';
      showToast(message, 'error');
    }
  };

  const handleGenerateApiKey = async (name: string) => {
    try {
      const result = await api.apiKeys.create(name);
      syncWorkspace(result.workspace);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to generate API key';
      showToast(message, 'error');
    }
  };

  const handleRevokeApiKey = async (keyId: string) => {
    try {
      const result = await api.apiKeys.revoke(keyId);
      syncWorkspace(result.workspace);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to revoke API key';
      showToast(message, 'error');
    }
  };

  const handleMarkNotifRead = async () => {
    try {
      const result = await api.notifications.markRead();
      syncWorkspace(result.workspace);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update notifications';
      showToast(message, 'error');
    }
  };

  const handleCheckoutPlan = async (plan: string) => {
    try {
      const result = await api.billing.checkout(plan);
      syncWorkspace(result.workspace);
      if (result.checkoutUrl) {
        showToast(`Redirecting to Paystack for ${plan}.`, 'info');
        window.location.assign(result.checkoutUrl);
        return;
      }

      showToast(`Invoice created for ${plan}.`, 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to start checkout';
      showToast(message, 'error');
    }
  };

  const handleMarkInvoicePaid = async (invoiceId: string) => {
    try {
      const result = await api.billing.markPaid(invoiceId);
      syncWorkspace(result.workspace);
      showToast(`Invoice ${invoiceId} marked paid.`, 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update invoice';
      showToast(message, 'error');
    }
  };

  const handleResetWorkspace = async () => {
    try {
      await api.admin.resetWorkspace();
      const session = await api.auth.refresh();
      storeToken(session.token);
      syncWorkspace(session.workspace);
      showToast('Workspace reset to a clean seed.', 'success');
    } catch (error) {
      clearStoredToken();
      restoreEmptyState();
      setCurrentScreen('landing');
      setAppPath('landing');
      const message = error instanceof Error ? error.message : 'Unable to reset workspace';
      showToast(message, 'error');
    }
  };

  const renderScreenContent = () => {
    if (session.isLoggedIn && !canAccessScreen(currentScreen, session.accountType)) {
      return (
        <SidebarLayout
          currentScreen="dashboard-home"
          user={session}
          notifications={notifications}
          onNavigate={setCurrentScreen}
          onLogout={handleLogout}
          onMarkNotificationsRead={handleMarkNotifRead}
        >
          <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-premium">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Restricted</p>
            <h2 className="mt-3 text-2xl font-display font-extrabold text-slate-950">This area is not part of the merchant flow.</h2>
            <p className="mt-3 text-sm text-slate-500">
              Merchants stay on the order, tracking, customers, billing, and settings path.
            </p>
            <button
              onClick={() => setCurrentScreen('dashboard-home')}
              className="mt-6 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white"
            >
              Back to merchant dashboard
            </button>
          </div>
        </SidebarLayout>
      );
    }

    switch (currentScreen) {
      case 'landing':
        return (
          <LandingPage
            onNavigate={setCurrentScreen}
            onSelectTrackId={(id) => {
              setSelectedOrderId(id);
              setCurrentScreen('public-tracking');
              setAppPath('public-tracking', id);
            }}
          />
        );
      case 'login':
        return (
          <LoginPage
            onNavigate={setCurrentScreen}
            onLoginSuccess={handleLoginSuccess}
            onShowToast={showToast}
          />
        );
      case 'signup':
        return (
          <SignupPage
            onNavigate={setCurrentScreen}
            onSignupSuccess={handleSignupSuccess}
            onShowToast={showToast}
          />
        );
      case 'dashboard-home':
        return (
          <SidebarLayout
            currentScreen={currentScreen}
            user={session}
            notifications={notifications}
            onNavigate={setCurrentScreen}
            onLogout={handleLogout}
            onMarkNotificationsRead={handleMarkNotifRead}
          >
            <DashboardHome
              user={session}
              orders={orders}
              customers={customers}
              apiKeys={apiKeys}
              apiStats={apiStats}
              billing={billing}
              webhooks={webhooks}
              notifications={notifications}
              onNavigate={setCurrentScreen}
              onSelectOrder={setSelectedOrderId}
            />
          </SidebarLayout>
        );
      case 'orders':
        return (
          <SidebarLayout
            currentScreen={currentScreen}
            user={session}
            notifications={notifications}
            onNavigate={setCurrentScreen}
            onLogout={handleLogout}
            onMarkNotificationsRead={handleMarkNotifRead}
          >
            <OrdersPage
              orders={orders}
              onNavigate={setCurrentScreen}
              onSelectOrder={setSelectedOrderId}
              onDeleteOrder={handleDeleteOrder}
            />
          </SidebarLayout>
        );
      case 'create-order':
        return (
          <SidebarLayout
            currentScreen={currentScreen}
            user={session}
            notifications={notifications}
            onNavigate={setCurrentScreen}
            onLogout={handleLogout}
            onMarkNotificationsRead={handleMarkNotifRead}
          >
            <CreateOrderPage
              onAddOrder={handleAddOrder}
              onNavigate={setCurrentScreen}
              onSelectOrder={setSelectedOrderId}
              onShowToast={showToast}
            />
          </SidebarLayout>
        );
      case 'order-details':
        return (
          <SidebarLayout
            currentScreen={currentScreen}
            user={session}
            notifications={notifications}
            onNavigate={setCurrentScreen}
            onLogout={handleLogout}
            onMarkNotificationsRead={handleMarkNotifRead}
          >
            <OrderDetailsPage
              order={orders.find((order) => order.id === selectedOrderId) || null}
              onNavigate={setCurrentScreen}
              onUpdateStatus={handleUpdateStatus}
              onCaptureProof={handleCaptureProof}
              onAssignRider={handleAssignRider}
              onLogException={handleLogException}
              onUpdateGps={handleUpdateGps}
              onCancelOrder={handleDeleteOrder}
              onShowToast={showToast}
            />
          </SidebarLayout>
        );
      case 'tracking':
        return (
          <SidebarLayout
            currentScreen={currentScreen}
            user={session}
            notifications={notifications}
            onNavigate={setCurrentScreen}
            onLogout={handleLogout}
            onMarkNotificationsRead={handleMarkNotifRead}
          >
            <TrackingPage
              orders={orders}
              selectedOrderId={selectedOrderId}
              onSelectOrderId={setSelectedOrderId}
              onShowToast={showToast}
            />
          </SidebarLayout>
        );
      case 'public-tracking':
        return (
          <PublicTrackingPage
            trackingId={selectedOrderId}
            onBack={() => {
              setCurrentScreen('landing');
              setAppPath('landing');
            }}
          />
        );
      case 'customers':
        return (
          <SidebarLayout
            currentScreen={currentScreen}
            user={session}
            notifications={notifications}
            onNavigate={setCurrentScreen}
            onLogout={handleLogout}
            onMarkNotificationsRead={handleMarkNotifRead}
          >
            <CustomersPage
              customers={customers}
              onNavigate={setCurrentScreen}
              onSelectOrder={setSelectedOrderId}
              onShowToast={showToast}
            />
          </SidebarLayout>
        );
      case 'api':
        return (
          <SidebarLayout
            currentScreen={currentScreen}
            user={session}
            notifications={notifications}
            onNavigate={setCurrentScreen}
            onLogout={handleLogout}
            onMarkNotificationsRead={handleMarkNotifRead}
          >
            <ApiPage
              apiKeys={apiKeys}
              stats={apiStats}
              webhooks={webhooks}
              billing={billing}
              user={session}
              onGenerateApiKey={handleGenerateApiKey}
              onRevokeApiKey={handleRevokeApiKey}
              onNavigate={setCurrentScreen}
            />
          </SidebarLayout>
        );
      case 'api-docs':
        return (
          <SidebarLayout
            currentScreen={currentScreen}
            user={session}
            notifications={notifications}
            onNavigate={setCurrentScreen}
            onLogout={handleLogout}
            onMarkNotificationsRead={handleMarkNotifRead}
          >
            <ApiDocsPage billing={billing} user={session} />
          </SidebarLayout>
        );
      case 'settings':
        return (
          <SidebarLayout
            currentScreen={currentScreen}
            user={session}
            notifications={notifications}
            onNavigate={setCurrentScreen}
            onLogout={handleLogout}
            onMarkNotificationsRead={handleMarkNotifRead}
          >
          <SettingsPage
              user={session}
              onUpdateUser={handleUpdateSession}
              freeAlertsEnabled={freeAlertsEnabled}
              onToggleFreeAlerts={setFreeAlerts}
              onResetWorkspace={handleResetWorkspace}
              onShowToast={showToast}
            />
          </SidebarLayout>
        );
      case 'billing':
        return (
          <SidebarLayout
            currentScreen={currentScreen}
            user={session}
            notifications={notifications}
            onNavigate={setCurrentScreen}
            onLogout={handleLogout}
            onMarkNotificationsRead={handleMarkNotifRead}
          >
            <BillingPage
              user={session}
              billing={billing}
              invoices={invoices}
              onCheckoutPlan={handleCheckoutPlan}
              onMarkInvoicePaid={handleMarkInvoicePaid}
              onShowToast={showToast}
            />
          </SidebarLayout>
        );
      default:
        return <div className="p-8 text-center bg-white border self-center">Viewport error state.</div>;
    }
  };

  return (
    <div id="app-root-wrapper" className="min-h-screen bg-slate-50 flex flex-col justify-between relative selection:bg-blue-500 selection:text-white">
      <div className="flex-1 w-full">
        <Suspense
          fallback={
            <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
              Loading Sendie...
            </div>
          }
        >
          {renderScreenContent()}
        </Suspense>
      </div>

      <div id="toast-notifications-container" className="fixed bottom-6 left-6 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            let toastIcon = <Info className="h-5 w-5 text-blue-500" />;
            let borderStyle = 'border-blue-500/20';

            if (toast.type === 'success') {
              toastIcon = <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
              borderStyle = 'border-emerald-500/20';
            } else if (toast.type === 'warning') {
              toastIcon = <AlertTriangle className="h-5 w-5 text-amber-500" />;
              borderStyle = 'border-amber-500/20';
            } else if (toast.type === 'error') {
              toastIcon = <XCircle className="h-5 w-5 text-red-500" />;
              borderStyle = 'border-red-500/20';
            }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                className={`pointer-events-auto flex items-start gap-3 bg-slate-950/95 border ${borderStyle} text-slate-100 rounded-xl p-3.5 pr-10 shadow-2xl backdrop-blur-md relative`}
              >
                <div className="flex-shrink-0 mt-0.5">{toastIcon}</div>
                <div className="flex-1">
                  <p className="text-xs font-semibold leading-relaxed font-sans text-slate-200">{toast.message}</p>
                </div>
                <button
                  onClick={() => setToasts((prev) => prev.filter((item) => item.id !== toast.id))}
                  className="absolute top-3 right-3 p-0.5 text-slate-500 hover:text-slate-300 rounded transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div
        id="aistudio-evaluation-toolbox"
        className="fixed bottom-4 right-4 z-50 bg-white border border-slate-300 shadow-2xl rounded-2xl p-4 max-w-sm hidden md:block"
        style={{ borderWidth: '1.5px' }}
      >
        <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
          <div className="flex items-center gap-1.5">
            <Sliders className="h-4 w-4 text-blue-600 animate-spin" />
            <span className="text-xs font-display font-extrabold text-slate-800 tracking-wide">SENDIE MVP MONITOR</span>
          </div>
          <button
            onClick={() => setEvalPanelCollapsed(!evalPanelCollapsed)}
            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
          >
            {evalPanelCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {!evalPanelCollapsed && (
          <div className="space-y-3">
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
              Use this panel to jump to the core product screens.
            </p>

            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Public screens</p>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: 'landing' as AppScreen, text: 'Landing' },
                  { id: 'login' as AppScreen, text: 'Login' },
                  { id: 'signup' as AppScreen, text: 'Signup' },
                ].map((screen) => (
                  <button
                    key={screen.id}
                    onClick={() => setCurrentScreen(screen.id)}
                    className={`p-1 rounded text-[10px] font-bold tracking-wide text-center transition-colors ${currentScreen === screen.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {screen.text}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Authenticated workspace</p>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: 'dashboard-home' as AppScreen, text: 'Dashboard' },
                  { id: 'orders' as AppScreen, text: 'Orders List' },
                  { id: 'create-order' as AppScreen, text: 'Create order' },
                  { id: 'order-details' as AppScreen, text: 'Timeline view' },
                  { id: 'tracking' as AppScreen, text: 'Tracking' },
                  { id: 'customers' as AppScreen, text: 'Customers' },
                  { id: 'api' as AppScreen, text: 'API Keys' },
                  { id: 'api-docs' as AppScreen, text: 'API Docs' },
                  { id: 'settings' as AppScreen, text: 'Settings' },
                  { id: 'billing' as AppScreen, text: 'Billing' },
                ].map((screen) => (
                  <button
                    key={screen.id}
                    onClick={() => {
                      if (!session.isLoggedIn) {
                        setSession((prev) => ({ ...prev, isLoggedIn: true }));
                      }
                      setCurrentScreen(screen.id);
                    }}
                    className={`p-1 rounded text-[10px] font-bold tracking-wide text-center transition-colors ${currentScreen === screen.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {screen.text}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-2 text-[10px] text-slate-400 font-semibold flex justify-between">
              <span>Current session: {session.isLoggedIn ? 'Authenticated' : 'Visitor Guest'}</span>
              <span className="text-blue-600 font-bold uppercase">Sendie Core</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
