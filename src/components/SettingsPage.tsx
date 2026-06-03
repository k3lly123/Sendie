import React, { useState } from 'react';
import { User, Bell, Key, Save, Check, RotateCcw, BadgeInfo } from 'lucide-react';
import { UserSession } from '../types';
import { getRoleMeta } from './workspaceTheme';

interface SettingsPageProps {
  user: UserSession;
  onUpdateUser: (businessName: string, email: string) => void;
  freeAlertsEnabled: boolean;
  onToggleFreeAlerts: (enabled: boolean) => void | Promise<void>;
  onResetWorkspace?: () => void;
  onShowToast?: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export default function SettingsPage({ user, onUpdateUser, freeAlertsEnabled, onToggleFreeAlerts, onResetWorkspace, onShowToast }: SettingsPageProps) {
  const [bName, setBName] = useState(user.businessName);
  const [emailValue, setEmailValue] = useState(user.email);
  const [newPassword, setNewPassword] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bName.trim() || !emailValue.trim()) return;
    onUpdateUser(bName.trim(), emailValue.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const role = getRoleMeta(user.accountType);

  return (
    <div id="settings-view-root" className="max-w-3xl mx-auto space-y-6">
      <div className={`rounded-[28px] border ${role.borderAccent} bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur md:p-6`}>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className={`inline-flex items-center gap-2 rounded-full border ${role.borderAccent} ${role.softAccent} px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]`}>
              <BadgeInfo className="h-3.5 w-3.5" />
              <span>{role.title}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold font-display tracking-tight text-slate-950">
              Keep the workspace polished and easy to trust.
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xl">
              Keep account settings, notification preferences, and workspace controls in one calm place.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 max-w-xs">
            <p className="font-bold text-slate-900">Role</p>
            <p className="mt-1">{role.description}</p>
          </div>
        </div>
      </div>
      
      {/* CARD 1: Profile and Info setup */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6">
        <div className="border-b border-slate-100 pb-3 mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.22em] text-slate-900">Business profile</h3>
            <p className="mt-1 text-xs text-slate-500">Update the workspace name and contact email for this account.</p>
          </div>
          <User className="h-5 w-5 text-slate-400" />
        </div>

        <form onSubmit={handleSubmitProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider block text-slate-500">Business name</label>
              <input
                id="settings-business-name"
                type="text"
                value={bName}
                onChange={(e) => setBName(e.target.value)}
                className="w-full bg-[#FAFBFD] focus:bg-white border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-semibold text-slate-900 focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider block text-slate-500">Account email</label>
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
            <span className="text-[10px] text-slate-400 uppercase font-bold">Account Role: {user.accountType}</span>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-700"
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
      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6">
        <div className="border-b border-slate-100 pb-3 mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.22em] text-slate-900">Free delivery alerts</h3>
            <p className="mt-1 text-xs text-slate-500">Use browser alerts and in-app notifications instead of paid SMS.</p>
          </div>
          <Bell className="h-5 w-5 text-slate-400" />
        </div>

        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4 p-3 rounded-lg border border-slate-100 hover:bg-slate-50/50 transition-colors">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-800">Browser notifications</p>
              <p className="text-[10.5px] text-slate-400 leading-normal">Free alerts for order created, status changed, and proof captured.</p>
            </div>
            <input
              type="checkbox"
              checked={freeAlertsEnabled}
              onChange={(e) => void onToggleFreeAlerts(e.target.checked)}
              className="h-4.5 w-4.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
            />
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs text-slate-500">
            In-app notifications stay on for every workspace event. Browser alerts are optional and free.
          </div>
        </div>
      </div>

      {user.accountType === 'Admin' && (
        <div className="rounded-[28px] border border-slate-800 bg-slate-950 p-5 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)] md:p-6">
          <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4 mb-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.22em]">Workspace controls</h3>
              <p className="mt-1 text-xs text-slate-300">Use this when you want a clean seed workspace for testing.</p>
            </div>
            <RotateCcw className="h-5 w-5 text-blue-300" />
          </div>
          <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
            Resetting clears the current test data, billing state, and sample notifications so the team can replay the full role flow from the start.
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Resetting will return the workspace to the seeded state so we can test signup, login, orders, billing, and API setup again from a fresh baseline.
            </p>
            <button
              type="button"
              onClick={() => {
                if (!onResetWorkspace) return;
                onResetWorkspace();
              }}
              className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg bg-white text-slate-950 px-4 py-2 text-xs font-bold shadow-sm hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Reset workspace
            </button>
          </div>
        </div>
      )}

      {/* CARD 3: Custom Password system */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6">
        <div className="border-b border-slate-100 pb-3 mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.22em] text-slate-900">Workspace security</h3>
            <p className="mt-1 text-xs text-slate-500">Password updates should be connected to the auth service next.</p>
          </div>
          <Key className="h-5 w-5 text-slate-400" />
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider block text-slate-500">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter a new password"
              className="w-full rounded-lg border border-slate-300 bg-[#FAFBFD] px-3 py-2 text-xs font-semibold focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                  onShowToast('Password update is not connected yet.', 'info');
                } else {
                  alert('Password update is not connected yet.');
                }
              setNewPassword('');
            }}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-black"
          >
            Update password
          </button>
        </div>
      </div>

    </div>
  );
}
