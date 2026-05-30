import React, { useState } from 'react';
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
  X
} from 'lucide-react';

// Seed data
import { 
  INITIAL_ORDERS, 
  INITIAL_CUSTOMERS, 
  INITIAL_API_KEYS, 
  INITIAL_API_STATS, 
  INITIAL_NOTIFICATIONS 
} from './mockData';

// Types
import { AppScreen, Order, Customer, ApiKey, ApiUsageStats, UserSession, Notification, OrderStatus } from './types';

// Screens
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import SidebarLayout from './components/SidebarLayout';
import DashboardHome from './components/DashboardHome';
import OrdersPage from './components/OrdersPage';
import CreateOrderPage from './components/CreateOrderPage';
import OrderDetailsPage from './components/OrderDetailsPage';
import TrackingPage from './components/TrackingPage';
import CustomersPage from './components/CustomersPage';
import ApiPage from './components/ApiPage';
import ApiDocsPage from './components/ApiDocsPage';
import SettingsPage from './components/SettingsPage';
import BillingPage from './components/BillingPage';

export interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export default function App() {
  // Stateful engines
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('landing');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };
  const [session, setSession] = useState<UserSession>({
    isLoggedIn: false,
    businessName: 'Delta Commerce',
    email: 'admin@deltacommerce.sh',
    accountType: 'Merchant',
  });

  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(INITIAL_API_KEYS);
  const [apiStats, setApiStats] = useState<ApiUsageStats>(INITIAL_API_STATS);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('TRK-9024A');
  const [evalPanelCollapsed, setEvalPanelCollapsed] = useState(false);

  // AUTH STATEHANDLES
  const handleLoginSuccess = (businessName: string, email: string, accountType: 'Merchant' | 'Startup' | 'Developer') => {
    setSession({
      isLoggedIn: true,
      businessName,
      email,
      accountType,
    });
    // Add simulation welcome notification
    const newNotif: Notification = {
      id: `NOTIF-${Date.now()}`,
      text: `Welcome back, ${businessName}! Secure sandbox session established successfully.`,
      time: 'Just now',
      unread: true
    };
    setNotifications(prev => [newNotif, ...prev]);
    setCurrentScreen('dashboard-home');
  };

  const handleSignupSuccess = (businessName: string, email: string, accountType: 'Merchant' | 'Startup' | 'Developer') => {
    setSession({
      isLoggedIn: true,
      businessName,
      email,
      accountType,
    });
    // New account notice
    const newNotif: Notification = {
      id: `NOTIF-${Date.now()}`,
      text: `Account initialized on the Sendie Logistics Mesh. Sandbox environment active.`,
      time: 'Just now',
      unread: true
    };
    setNotifications(prev => [newNotif, ...prev]);
    setCurrentScreen('dashboard-home');
  };

  const handleLogout = () => {
    setSession(prev => ({ ...prev, isLoggedIn: false }));
    setCurrentScreen('landing');
  };

  // SHIPMENT HANDLERS
  const handleAddOrder = (newFields: Omit<Order, 'id' | 'createdDate' | 'trackingLink' | 'estimatedDelivery'>) => {
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const newId = `TRK-${randomSuffix}`;
    const generatedTrackingLink = `https://sendie.sh/track/${newId}`;
    
    const formattedDate = new Date().toISOString().replace('T', ' ').substring(0, 16);
    
    const newOrder: Order = {
      ...newFields,
      id: newId,
      createdDate: formattedDate,
      estimatedDelivery: 'Tomorrow, 03:30 PM',
      trackingLink: generatedTrackingLink,
    };

    // Update orders list
    setOrders(prev => [newOrder, ...prev]);

    // Check if customer exists in CRM, if not, automatically populate!
    const customerExists = customers.some(c => c.phone === newFields.customerPhone);
    if (!customerExists) {
      const newCust: Customer = {
        id: `CUST-${Math.floor(Math.random() * 1000 + 4000)}`,
        name: newFields.customerName,
        phone: newFields.customerPhone,
        email: `${newFields.customerName.toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`,
        totalOrders: 1,
        recentDelivery: newId,
        joinedDate: new Date().toISOString().split('T')[0]
      };
      setCustomers(prev => [...prev, newCust]);
    } else {
      // Increment customer density
      setCustomers(prev => prev.map(c => {
        if (c.phone === newFields.customerPhone) {
          return {
            ...c,
            totalOrders: c.totalOrders + 1,
            recentDelivery: newId
          };
        }
        return c;
      }));
    }

    // Trigger API metrics increment as demo simulation
    setApiStats(prev => ({
      ...prev,
      requestsCount: prev.requestsCount + 1,
      successfulRequests: prev.successfulRequests + 1,
    }));

    // Trigger success notification logs
    const newNotif: Notification = {
      id: `NOTIF-${Date.now()}`,
      text: `Cargo order ${newId} dispatched for ${newFields.customerName}. Routing parameters optimization complete.`,
      time: 'Just now',
      unread: true,
    };
    setNotifications(prev => [newNotif, ...prev]);

    return newOrder;
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    // Trigger notification
    const newNotif: Notification = {
      id: `NOTIF-${Date.now()}`,
      text: `Shipment dispatch ${orderId} successfully revoked from tracking nodes.`,
      time: 'Just now',
      unread: true
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleUpdateStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status,
          estimatedDelivery: status === 'Delivered' ? `Delivered today!` : o.estimatedDelivery,
        };
      }
      return o;
    }));

    // Notification update
    const newNotif: Notification = {
      id: `NOTIF-${Date.now()}`,
      text: `Package ${orderId} shifted to state: ${status}. Notifications dispatched.`,
      time: 'Just now',
      unread: true
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleUpdateSession = (businessName: string, email: string) => {
    setSession(prev => ({
      ...prev,
      businessName,
      email
    }));
  };

  // API KEY HANDLERS
  const handleGenerateApiKey = (name: string) => {
    const randomHex = Math.random().toString(36).substring(2, 10);
    const newKey: ApiKey = {
      id: `KEY-${Date.now()}`,
      name,
      prefix: 'sk_test_sendie_',
      secret: `••••••••••••••••••••••••••••${randomHex}`,
      createdDate: new Date().toISOString().split('T')[0],
    };
    setApiKeys(prev => [newKey, ...prev]);
  };

  const handleRevokeApiKey = (keyId: string) => {
    setApiKeys(prev => prev.filter(k => k.id !== keyId));
  };

  // CLEAR UNREAD METRIC
  const handleMarkNotifRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  // MASTER ROUTER SWITCH
  const renderScreenContent = () => {
    switch (currentScreen) {
      case 'landing':
        return (
          <LandingPage 
            onNavigate={setCurrentScreen} 
            onSelectTrackId={(id) => { setSelectedOrderId(id); }}
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
          />
        );
      
      // AUTHENTICATED OR ROOT-LAYOUT INTEGRATED VIEWS
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
              orders={orders} 
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
              order={orders.find(o => o.id === selectedOrderId) || null}
              onNavigate={setCurrentScreen}
              onUpdateStatus={handleUpdateStatus}
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
            <ApiDocsPage />
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
            <BillingPage user={session} onShowToast={showToast} />
          </SidebarLayout>
        );

      default:
        return <div className="p-8 text-center bg-white border self-center">Viewport error state.</div>;
    }
  };

  const isPublicScreen = currentScreen === 'landing' || currentScreen === 'login' || currentScreen === 'signup';

  return (
    <div id="app-root-wrapper" className="min-h-screen bg-slate-50 flex flex-col justify-between relative selection:bg-blue-500 selection:text-white">
      
      {/* Dynamic Screen contents rendering */}
      <div className="flex-1 w-full">
        {renderScreenContent()}
      </div>

      {/* Dynamic Toast Notifications */}
      <div id="toast-notifications-container" className="fixed bottom-6 left-6 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            let toastIcon = <Info className="h-5 w-5 text-blue-500" />;
            let borderStyle = 'border-blue-500/20';
            if (t.type === 'success') {
              toastIcon = <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
              borderStyle = 'border-emerald-500/20';
            } else if (t.type === 'warning') {
              toastIcon = <AlertTriangle className="h-5 w-5 text-amber-500" />;
              borderStyle = 'border-amber-500/20';
            } else if (t.type === 'error') {
              toastIcon = <XCircle className="h-5 w-5 text-red-500" />;
              borderStyle = 'border-red-500/20';
            }

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                className={`pointer-events-auto flex items-start gap-3 bg-slate-950/95 border ${borderStyle} text-slate-100 rounded-xl p-3.5 pr-10 shadow-2xl backdrop-blur-md relative`}
              >
                <div className="flex-shrink-0 mt-0.5">{toastIcon}</div>
                <div className="flex-1">
                  <p className="text-xs font-semibold leading-relaxed font-sans text-slate-200">{t.message}</p>
                </div>
                <button
                  onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
                  className="absolute top-3 right-3 p-0.5 text-slate-500 hover:text-slate-300 rounded transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* FLOAT EVALUATOR TOOLBOX: 1-Click access to any of the 13 MVP Screens */}
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
              Use this sandbox controller to jump instantly to any of the 13 specifications-required screens:
            </p>

            {/* Public Section links */}
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Public screens</p>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: 'landing' as AppScreen, text: 'Landing' },
                  { id: 'login' as AppScreen, text: 'Login' },
                  { id: 'signup' as AppScreen, text: 'Signup' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setCurrentScreen(s.id);
                    }}
                    className={`p-1 rounded text-[10px] font-bold tracking-wide text-center transition-colors ${currentScreen === s.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {s.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Dashboard Workspace */}
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Authenticated SaaS workspace</p>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: 'dashboard-home' as AppScreen, text: 'Dashboard' },
                  { id: 'orders' as AppScreen, text: 'Orders List' },
                  { id: 'create-order' as AppScreen, text: 'Create order' },
                  { id: 'order-details' as AppScreen, text: 'Timeline view' },
                  { id: 'tracking' as AppScreen, text: 'Mobile tracking' },
                  { id: 'customers' as AppScreen, text: 'Customers' },
                  { id: 'api' as AppScreen, text: 'API Keys' },
                  { id: 'api-docs' as AppScreen, text: 'API Docs' },
                  { id: 'settings' as AppScreen, text: 'Settings' },
                  { id: 'billing' as AppScreen, text: 'Manage Billing' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      // Silently make sure they are in simulated logged-in state so workspace parameters render perfectly
                      if (!session.isLoggedIn) {
                        setSession(prev => ({ ...prev, isLoggedIn: true }));
                      }
                      setCurrentScreen(s.id);
                    }}
                    className={`p-1 rounded text-[10px] font-bold tracking-wide text-center transition-colors ${currentScreen === s.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {s.text}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-2 text-[10px] text-slate-400 font-semibold flex justify-between">
              <span>Current session: {session.isLoggedIn ? 'Authenticated' : 'Visitor Guest'}</span>
              <span className="text-blue-600 font-bold uppercase">Sandbox V2.4</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
