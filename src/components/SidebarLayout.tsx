import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  MapPin,
  Settings,
  Terminal,
  FileText,
  LogOut,
  Bell,
  User,
  CreditCard,
  Notebook as OrderIcon,
  ChevronDown,
  PlusCircle,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  Shield,
  Truck,
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import { AppScreen, UserSession, Notification } from '../types';
import { getRoleMeta } from './workspaceTheme';

interface SidebarLayoutProps {
  currentScreen: AppScreen;
  user: UserSession;
  notifications: Notification[];
  onNavigate: (screen: AppScreen) => void;
  onLogout: () => void;
  onMarkNotificationsRead: () => void;
  children: React.ReactNode;
}

const navigationByRole: Record<UserSession['accountType'], Array<{ screen: AppScreen; label: string; icon: React.ReactNode }>> = {
  Merchant: [
    { screen: 'dashboard-home', label: 'Dashboard', icon: <LayoutDashboard className="h-4.5 w-4.5" /> },
    { screen: 'orders', label: 'Orders', icon: <OrderIcon className="h-4.5 w-4.5" /> },
    { screen: 'create-order', label: 'Create Order', icon: <PlusCircle className="h-4.5 w-4.5" /> },
    { screen: 'tracking', label: 'Tracking', icon: <MapPin className="h-4.5 w-4.5" /> },
    { screen: 'customers', label: 'Customers', icon: <User className="h-4.5 w-4.5" /> },
    { screen: 'billing', label: 'Billing', icon: <CreditCard className="h-4.5 w-4.5" /> },
    { screen: 'settings', label: 'Settings', icon: <Settings className="h-4.5 w-4.5" /> },
  ],
  'Developer/Startup': [
    { screen: 'dashboard-home', label: 'Dashboard', icon: <LayoutDashboard className="h-4.5 w-4.5" /> },
    { screen: 'orders', label: 'Orders', icon: <OrderIcon className="h-4.5 w-4.5" /> },
    { screen: 'create-order', label: 'Create Order', icon: <PlusCircle className="h-4.5 w-4.5" /> },
    { screen: 'api', label: 'API Keys', icon: <Terminal className="h-4.5 w-4.5" /> },
    { screen: 'api-docs', label: 'API Docs', icon: <FileText className="h-4.5 w-4.5" /> },
    { screen: 'tracking', label: 'Tracking', icon: <MapPin className="h-4.5 w-4.5" /> },
    { screen: 'settings', label: 'Settings', icon: <Settings className="h-4.5 w-4.5" /> },
  ],
  'Logistics Company': [
    { screen: 'dashboard-home', label: 'Dashboard', icon: <LayoutDashboard className="h-4.5 w-4.5" /> },
    { screen: 'orders', label: 'Dispatch Board', icon: <Truck className="h-4.5 w-4.5" /> },
    { screen: 'create-order', label: 'Create Shipment', icon: <PlusCircle className="h-4.5 w-4.5" /> },
    { screen: 'tracking', label: 'Live Tracking', icon: <MapPin className="h-4.5 w-4.5" /> },
    { screen: 'customers', label: 'Clients', icon: <User className="h-4.5 w-4.5" /> },
    { screen: 'billing', label: 'Billing', icon: <CreditCard className="h-4.5 w-4.5" /> },
    { screen: 'settings', label: 'Settings', icon: <Settings className="h-4.5 w-4.5" /> },
  ],
  Admin: [
    { screen: 'dashboard-home', label: 'Dashboard', icon: <LayoutDashboard className="h-4.5 w-4.5" /> },
    { screen: 'orders', label: 'Orders', icon: <OrderIcon className="h-4.5 w-4.5" /> },
    { screen: 'customers', label: 'Customers', icon: <User className="h-4.5 w-4.5" /> },
    { screen: 'create-order', label: 'Create Order', icon: <PlusCircle className="h-4.5 w-4.5" /> },
    { screen: 'api', label: 'API Keys', icon: <Terminal className="h-4.5 w-4.5" /> },
    { screen: 'billing', label: 'Billing', icon: <CreditCard className="h-4.5 w-4.5" /> },
    { screen: 'settings', label: 'Settings', icon: <Settings className="h-4.5 w-4.5" /> },
  ],
};

const quickActionByRole: Record<UserSession['accountType'], { label: string; target: AppScreen; icon: React.ReactNode }> = {
  Merchant: { label: 'Create order', target: 'create-order', icon: <PlusCircle className="h-4 w-4" /> },
  'Developer/Startup': { label: 'Open API', target: 'api', icon: <Terminal className="h-4 w-4" /> },
  'Logistics Company': { label: 'Open dispatch', target: 'orders', icon: <Truck className="h-4 w-4" /> },
  Admin: { label: 'Open controls', target: 'settings', icon: <Shield className="h-4 w-4" /> },
};

export default function SidebarLayout({
  currentScreen,
  user,
  notifications,
  onNavigate,
  onLogout,
  onMarkNotificationsRead,
  children,
}: SidebarLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const role = getRoleMeta(user.accountType);
  const navigationItems = navigationByRole[user.accountType] ?? navigationByRole.Merchant;
  const quickAction = quickActionByRole[user.accountType] ?? quickActionByRole.Merchant;
  const unreadCount = notifications.filter((notification) => notification.unread).length;

  const currentTitle = useMemo(() => {
    return navigationItems.find((item) => item.screen === currentScreen)?.label || role.title;
  }, [currentScreen, navigationItems, role.title]);

  const navigate = (screen: AppScreen) => {
    onNavigate(screen);
    setMobileMenuOpen(false);
    setShowNotifDropdown(false);
    setShowProfileDropdown(false);
  };

  const primaryAction = () => navigate(quickAction.target);

  const renderNavItems = () => (
    <nav className="p-3 space-y-1">
      {navigationItems.map((item) => {
        const active = currentScreen === item.screen;
        return (
          <button
            key={item.screen}
            onClick={() => navigate(item.screen)}
            className={`w-full text-left rounded-2xl px-3 py-2.5 flex items-center justify-between text-xs font-semibold transition-all group ${
              active
                ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/10'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
            {item.screen === 'api' && (
              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${active ? 'bg-white/15 text-white' : 'bg-slate-200 text-slate-500'}`}>
                Live
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );

  return (
    <div id="authenticated-app-frame" className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.08),_transparent_35%),#f8fafc] flex flex-col md:flex-row relative">
      <header className="md:hidden sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl px-4 py-3 flex items-center justify-between">
        <BrandLogo size="sm" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowNotifDropdown((value) => !value)}
            className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white" />}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((value) => !value)}
            className="rounded-full p-2 text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <aside className="hidden md:flex md:w-80 flex-col justify-between border-r border-slate-200/70 bg-slate-950 text-white sticky top-0 h-screen overflow-hidden">
        <div className="relative flex-1 overflow-y-auto">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_35%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(15,23,42,0.98))]" />
          <div className="relative z-10">
            <div className="p-6 border-b border-white/10">
              <a href="#" onClick={(event) => { event.preventDefault(); navigate('landing'); }}>
                <BrandLogo size="md" className="brightness-200" />
              </a>
              <div className={`mt-6 rounded-3xl border border-white/10 bg-white/5 p-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.28em] text-slate-400">{role.shortTitle}</p>
                    <h2 className="mt-2 text-lg font-display font-extrabold tracking-tight">{role.title}</h2>
                  </div>
                  <div className={`rounded-2xl px-3 py-2 text-xs font-bold ${role.softAccent}`}>
                    <Sparkles className="inline-block h-3.5 w-3.5 mr-1" />
                    Ready
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{role.description}</p>
                <button
                  type="button"
                  onClick={primaryAction}
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white text-slate-950 px-4 py-2.5 text-xs font-bold shadow-lg shadow-black/10 transition-transform hover:-translate-y-0.5"
                >
                  {quickAction.icon}
                  <span>{quickAction.label}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-3">
              {renderNavItems()}
            </div>
          </div>
        </div>

        <div className="relative z-10 border-t border-white/10 bg-black/20 p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-950 font-black">
              {user.businessName?.[0]?.toUpperCase() || 'S'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{user.businessName}</p>
              <p className="truncate text-xs text-slate-400">{user.email}</p>
            </div>
          </div>
          <button
            id="sidebar-logout-btn"
            onClick={onLogout}
            className="mt-3 flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-xs font-bold text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-slate-950 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-40 w-[86vw] max-w-sm bg-slate-950 text-white shadow-2xl md:hidden"
            >
              <div className="flex h-full flex-col justify-between">
                <div className="overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-white/10 p-4">
                    <BrandLogo size="sm" className="brightness-200" />
                    <button onClick={() => setMobileMenuOpen(false)} className="rounded-full p-2 text-slate-300 hover:bg-white/5">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="p-4">
                    <div className={`rounded-3xl border border-white/10 bg-white/5 p-4`}>
                      <p className="text-[10px] uppercase tracking-[0.28em] text-slate-400">{role.shortTitle}</p>
                      <p className="mt-2 text-lg font-display font-extrabold">{role.title}</p>
                      <p className="mt-2 text-sm text-slate-300">{role.description}</p>
                      <button
                        type="button"
                        onClick={primaryAction}
                        className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-bold text-slate-950"
                      >
                        {quickAction.icon}
                        <span>{quickAction.label}</span>
                      </button>
                    </div>
                  </div>
                  {renderNavItems()}
                </div>
                <div className="border-t border-white/10 p-4">
                  <button
                    onClick={onLogout}
                    className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/5"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="hidden md:flex h-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl px-8 items-center justify-between flex-shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-slate-400">{role.shortTitle} workspace</p>
              <h2 id="dashboard-page-title" className="text-lg font-display font-extrabold tracking-tight text-slate-950">
                {currentTitle}
              </h2>
            </div>
            <div className="hidden xl:block h-10 w-px bg-slate-200" />
            <div className={`hidden xl:inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] ${role.softAccent} ${role.borderAccent}`}>
              <Sparkles className="h-3.5 w-3.5" />
              <span>{role.description}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
            <button
              type="button"
              onClick={() => {
                setShowNotifDropdown((value) => !value);
                setShowProfileDropdown(false);
              }}
              className="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white" />}
            </button>

            <div className="relative">
              <button
                id="header-avatar-toggle"
                onClick={() => {
                  setShowProfileDropdown((value) => !value);
                  setShowNotifDropdown(false);
                }}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition-colors hover:bg-slate-50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-xs font-black text-white">
                  {user.businessName?.[0]?.toUpperCase() || 'S'}
                </div>
                <div className="hidden lg:block text-left leading-tight">
                  <p className="text-xs font-bold text-slate-900">{user.businessName}</p>
                  <p className="text-[10px] text-slate-500">{user.email}</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              <AnimatePresence>
                {showProfileDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowProfileDropdown(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl z-20"
                    >
                      <button
                        onClick={() => navigate('settings')}
                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Settings className="h-4 w-4 text-slate-400" />
                        Settings
                      </button>
                      <button
                        onClick={() => navigate('billing')}
                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <CreditCard className="h-4 w-4 text-slate-400" />
                        Billing
                      </button>
                      <div className="my-1 border-t border-slate-100" />
                      <button
                        onClick={onLogout}
                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          <AnimatePresence>
            {showNotifDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowNotifDropdown(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  className="absolute right-28 top-16 w-96 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl z-20"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Notifications</p>
                      <p className="text-[10px] text-slate-500">{unreadCount} unread items</p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => {
                          onMarkNotificationsRead();
                          setShowNotifDropdown(false);
                        }}
                        className="text-[11px] font-bold text-blue-600 hover:underline"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-center text-xs text-slate-400">You’re all caught up.</p>
                    ) : (
                      notifications.map((notification) => (
                        <div key={notification.id} className={`p-4 text-xs ${notification.unread ? 'bg-blue-50/40' : ''}`}>
                          <p className="leading-relaxed text-slate-700">{notification.text}</p>
                          <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-slate-400">{notification.time}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="px-4 py-6 md:px-8 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
