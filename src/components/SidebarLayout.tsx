import React, { useState } from 'react';
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
  Globe,
  PlusCircle,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import { AppScreen, UserSession, Notification } from '../types';

interface SidebarLayoutProps {
  currentScreen: AppScreen;
  user: UserSession;
  notifications: Notification[];
  onNavigate: (screen: AppScreen) => void;
  onLogout: () => void;
  onMarkNotificationsRead: () => void;
  children: React.ReactNode;
}

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

  const navigationItems = [
    { screen: 'dashboard-home' as AppScreen, label: 'Dashboard', icon: <LayoutDashboard className="h-4.5 w-4.5" /> },
    { screen: 'orders' as AppScreen, label: 'Orders', icon: <OrderIcon className="h-4.5 w-4.5" /> },
    { screen: 'customers' as AppScreen, label: 'Customers', icon: <User className="h-4.5 w-4.5" /> },
    { screen: 'tracking' as AppScreen, label: 'Tracking Portal', icon: <MapPin className="h-4.5 w-4.5" /> },
    { screen: 'api' as AppScreen, label: 'API Keys', icon: <Terminal className="h-4.5 w-4.5" /> },
    { screen: 'api-docs' as AppScreen, label: 'API Docs', icon: <FileText className="h-4.5 w-4.5" /> },
    { screen: 'billing' as AppScreen, label: 'Billing Plan', icon: <CreditCard className="h-4.5 w-4.5" /> },
    { screen: 'settings' as AppScreen, label: 'Settings', icon: <Settings className="h-4.5 w-4.5" /> },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleNavClick = (screen: AppScreen) => {
    onNavigate(screen);
    setMobileMenuOpen(false);
  };

  return (
    <div id="authenticated-app-frame" className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row relative">
      
      {/* MOBILE HEADER BAR */}
      <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <BrandLogo size="sm" />
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={() => setShowNotifDropdown(!showNotifDropdown)} 
            className="p-1.5 text-slate-500 hover:text-slate-800 relative rounded-full hover:bg-slate-100"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="p-1.5 text-slate-600 rounded-lg focus:outline-none hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* PERSISTENT DESKTOP SIDEBAR */}
      <aside id="sidebar" className="hidden md:flex md:w-64 bg-slate-900 text-slate-300 flex-col justify-between border-r border-slate-800 flex-shrink-0 h-screen sticky top-0">
        <div>
          {/* Logo container */}
          <div className="p-6 border-b border-slate-800 select-none bg-slate-950/40">
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('landing'); }}>
              <BrandLogo size="md" className="brightness-200" />
            </a>
          </div>

          {/* Quick Creator Shortcut */}
          <div className="p-4 border-b border-slate-800/60">
            <button
              id="sidebar-quick-create-btn"
              onClick={() => onNavigate('create-order')}
              className="cursor-pointer w-full bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 px-3 font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow active:scale-98"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create New Order</span>
            </button>
          </div>

          {/* Menu items */}
          <nav className="p-3 space-y-1">
            {navigationItems.map((item) => {
              const active = currentScreen === item.screen;
              return (
                <button
                  key={item.screen}
                  onClick={() => handleNavClick(item.screen)}
                  className={`cursor-pointer w-full text-left rounded-lg px-3 py-2 flex items-center justify-between text-xs font-semibold transition-all group ${active ? 'bg-blue-600/95 text-white font-bold shadow-md' : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.screen === 'api' && (
                    <span className="text-[9px] bg-slate-800 text-slate-400 font-mono px-1.5 py-0.5 rounded font-bold uppercase">Sandbox</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer User Details */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs shadow-inner">
              {user.businessName[0]?.toUpperCase() || 'M'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-white truncate leading-none mb-1">{user.businessName}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            id="sidebar-logout-btn"
            onClick={onLogout}
            className="cursor-pointer w-full text-left rounded-lg px-2.5 py-1.5 flex items-center gap-2 text-[11px] font-bold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout session</span>
          </button>
        </div>
      </aside>

      {/* MOBILE SLIDE OVER MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-30 md:hidden"
            />
            {/* Drawer */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-64 bg-slate-900 text-slate-300 z-40 flex flex-col justify-between md:hidden shadow-2xl"
            >
              <div>
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <BrandLogo size="sm" className="brightness-200" />
                  <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="p-3 border-b border-slate-800">
                  <button
                    onClick={() => handleNavClick('create-order')}
                    className="cursor-pointer w-full bg-blue-600 text-white rounded-lg py-2 px-3 font-semibold text-xs flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Create New Order</span>
                  </button>
                </div>

                <nav className="p-3 space-y-1">
                  {navigationItems.map((item) => {
                    const active = currentScreen === item.screen;
                    return (
                      <button
                        key={item.screen}
                        onClick={() => handleNavClick(item.screen)}
                        className={`w-full text-left rounded-lg px-3 py-2 flex items-center justify-between text-xs font-semibold ${active ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:bg-slate-800'}`}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-4 border-t border-slate-800 bg-slate-950/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                    {user.businessName[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-none">{user.businessName}</p>
                    <span className="text-[10px] text-slate-500">{user.email}</span>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="w-full text-left rounded-lg py-1.5 flex items-center gap-2 text-xs text-slate-400 hover:text-red-400"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* DESKTOP TOP HEADER */}
        <header className="hidden md:flex h-16 bg-white border-b border-slate-200 px-8 items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <h2 id="dashboard-page-title" className="text-sm font-bold text-slate-900 tracking-wider uppercase font-display">
              {navigationItems.find(item => item.screen === currentScreen)?.label || 'System Desk'}
            </h2>
            <div className="h-4 w-[1px] bg-slate-200"></div>
            <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded text-[10px] font-bold text-blue-700 uppercase">
              <Sparkles className="h-3 w-3 text-blue-600" />
              <span>{user.accountType} Partner</span>
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
            
            {/* NOTIFICATIONS TRIGGER */}
            <div className="relative">
              <button 
                id="header-notification-bell"
                onClick={() => {
                  setShowNotifDropdown(!showNotifDropdown);
                  setShowProfileDropdown(false);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span id="notif-badge" className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                )}
              </button>

              {/* NOTIFICATION CARD DROPDOWN */}
              {showNotifDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowNotifDropdown(false)}></div>
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-20 overflow-hidden transform origin-top-right">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                      <span className="text-xs font-bold text-slate-800">System Notifications</span>
                      {unreadCount > 0 && (
                        <button 
                          onClick={() => {
                            onMarkNotificationsRead();
                            setShowNotifDropdown(false);
                          }}
                          className="text-[11px] text-blue-600 hover:underline font-bold"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-center text-xs text-slate-400">No active alerts.</p>
                      ) : (
                        notifications.map((notif) => (
                          <div key={notif.id} className={`p-3 text-xs transition-colors hover:bg-slate-50 ${notif.unread ? 'bg-blue-50/40' : ''}`}>
                            <p className="text-slate-800 leading-normal">{notif.text}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block font-mono">{notif.time}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* AVATAR TOGGLE */}
            <div className="relative">
              <button
                id="header-avatar-toggle"
                onClick={() => {
                  setShowProfileDropdown(!showProfileDropdown);
                  setShowNotifDropdown(false);
                }}
                className="flex items-center gap-2 hover:bg-slate-100 p-1.5 rounded-lg transition-colors text-left"
              >
                <div className="h-8 w-8 rounded-full bg-slate-800 text-white font-extrabold flex items-center justify-center text-xs border border-slate-200 shadow-sm leading-none">
                  {user.businessName[0]?.toUpperCase()}
                </div>
                <div className="hidden lg:block leading-tight">
                  <p className="text-xs font-bold text-slate-800">{user.businessName}</p>
                  <p className="text-[9px] text-slate-400">Platform Admin</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
              </button>

              {/* PROFILE DROPDOWN MENU */}
              {showProfileDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowProfileDropdown(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-200 z-20 overflow-hidden py-1">
                    <button
                      onClick={() => { onNavigate('settings'); setShowProfileDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-semibold"
                    >
                      <User className="h-4 w-4 text-slate-400" />
                      Settings Profile
                    </button>
                    <button
                      onClick={() => { onNavigate('billing'); setShowProfileDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-semibold"
                    >
                      <CreditCard className="h-4 w-4 text-slate-400" />
                      Manage Billing
                    </button>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={() => { onLogout(); setShowProfileDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </header>

        {/* NOTIFICATION OVERLAYS FOR MOBILE DROPDOWN */}
        {showNotifDropdown && (
          <div className="md:hidden bg-slate-100 border-b border-slate-200 p-4 absolute top-12 left-0 right-0 z-30 shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-slate-800">Notifications</span>
              <button onClick={() => setShowNotifDropdown(false)} className="text-xs text-slate-400 hover:text-slate-700">Close</button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {notifications.map(notif => (
                <div key={notif.id} className="text-xs p-2 bg-white rounded border border-slate-200">
                  <p className="text-slate-700">{notif.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SCREEN INNER CHILDREN VIEW */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
