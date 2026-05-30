import React, { useState } from 'react';
import { Shield, Sparkles, User, Bell, Key, Save, AlertCircle, Check } from 'lucide-react';
import { UserSession } from '../types';

interface SettingsPageProps {
  user: UserSession;
  onUpdateUser: (businessName: string, email: string) => void;
  onShowToast?: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export default function SettingsPage({ user, onUpdateUser, onShowToast }: SettingsPageProps) {
  const [bName, setBName] = useState(user.businessName);
  const [emailValue, setEmailValue] = useState(user.email);
  const [newPassword, setNewPassword] = useState('');
  const [notifSms, setNotifSms] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifApi, setNotifApi] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bName.trim() || !emailValue.trim()) return;
    onUpdateUser(bName.trim(), emailValue.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div id="settings-view-root" className="max-w-2xl mx-auto space-y-6">
      
      {/* CARD 1: Profile and Info setup */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-premium p-5 md:p-6">
        <div className="border-b border-slate-100 pb-3 mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Business registration info</h3>
            <p className="text-xs text-slate-400 mt-1">Update your client identity credentials on the Sendie node</p>
          </div>
          <User className="h-5 w-5 text-slate-400" />
        </div>

        <form onSubmit={handleSubmitProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Business Name</label>
              <input
                id="settings-business-name"
                type="text"
                value={bName}
                onChange={(e) => setBName(e.target.value)}
                className="w-full bg-[#FAFBFD] focus:bg-white border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-semibold text-slate-900 focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Administrator Email</label>
              <input
                id="settings-admin-email"
                type="email"
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                className="w-full bg-[#FAFBFD] focus:bg-white border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-semibold text-slate-900 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Partner Account: {user.accountType}</span>
            <button
              type="submit"
              className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
            >
              {saved ? (
                <>
                  <Check className="h-4 w-4 text-green-300" />
                  <span>Config Saved</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Update Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* CARD 2: Notification setup */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-premium p-5 md:p-6">
        <div className="border-b border-slate-100 pb-3 mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Dynamic dispatch notifications</h3>
            <p className="text-xs text-slate-400 mt-1">Configure automated communication channels</p>
          </div>
          <Bell className="h-5 w-5 text-slate-400" />
        </div>

        <div className="space-y-4">
          {[
            { label: 'Automated SMS Alerts', desc: 'Notify delivery contact when status is set to In Transit.', val: notifSms, set: setNotifSms },
            { label: 'Customer email invoices', desc: 'Email shipping receipts and map trace URLs immediately after creation.', val: notifEmail, set: setNotifEmail },
            { label: 'Webhook webhook callbacks', desc: 'Trigger webhook queries to your backup servers over sandbox keys.', val: notifApi, set: setNotifApi },
          ].map((not, i) => (
            <div key={i} className="flex items-start justify-between gap-4 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50/50 transition-colors">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800">{not.label}</p>
                <p className="text-[10.5px] text-slate-400 leading-normal">{not.desc}</p>
              </div>
              <input
                type="checkbox"
                checked={not.val}
                onChange={(e) => not.set(e.target.checked)}
                className="h-4.5 w-4.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      {/* CARD 3: Custom Password system */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-premium p-5 md:p-6">
        <div className="border-b border-slate-100 pb-3 mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Change console credentials</h3>
            <p className="text-xs text-slate-400 mt-1">Reset your local merchant console password</p>
          </div>
          <Key className="h-5 w-5 text-slate-400" />
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">New Secret Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#FAFBFD] focus:bg-white border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-semibold focus:outline-none"
            />
          </div>
          <button
            onClick={() => {
              if (newPassword.length < 6) {
                if (onShowToast) {
                  onShowToast('Secret password must contain at least 6 secure characters.', 'warning');
                } else {
                  alert('Secret password must contain at least 6 secure characters.');
                }
                return;
              }
              if (onShowToast) {
                onShowToast('Password modified successfully in sandbox environments.', 'success');
              } else {
                alert('Password modified successfully in sandbox environments.');
              }
              setNewPassword('');
            }}
            className="cursor-pointer bg-slate-900 hover:bg-black text-white font-bold text-xs py-2 px-4 rounded-lg transition-all"
          >
            Update password
          </button>
        </div>
      </div>

    </div>
  );
}
