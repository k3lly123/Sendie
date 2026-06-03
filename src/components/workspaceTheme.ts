import type { UserSession } from '../types';

export const roleMeta: Record<UserSession['accountType'], {
  title: string;
  shortTitle: string;
  description: string;
  accent: string;
  softAccent: string;
  borderAccent: string;
  primaryAction: string;
}> = {
  Merchant: {
    title: 'Merchant Console',
    shortTitle: 'Merchant',
    description: 'A premium operations view for sellers, vendors, and fulfillment teams.',
    accent: 'text-blue-700',
    softAccent: 'bg-blue-50 text-blue-700',
    borderAccent: 'border-blue-100',
    primaryAction: 'Create order',
  },
  'Developer/Startup': {
    title: 'Developer Portal',
    shortTitle: 'Developer',
    description: 'A clean integration workspace for APIs, keys, and webhooks.',
    accent: 'text-indigo-700',
    softAccent: 'bg-indigo-50 text-indigo-700',
    borderAccent: 'border-indigo-100',
    primaryAction: 'Generate key',
  },
  'Logistics Company': {
    title: 'Logistics Command',
    shortTitle: 'Logistics',
    description: 'A dispatch-first workspace for operations, delivery visibility, and proof capture.',
    accent: 'text-emerald-700',
    softAccent: 'bg-emerald-50 text-emerald-700',
    borderAccent: 'border-emerald-100',
    primaryAction: 'Open dispatch',
  },
  Admin: {
    title: 'Admin Control',
    shortTitle: 'Admin',
    description: 'Workspace oversight for billing, governance, and reset flows.',
    accent: 'text-slate-700',
    softAccent: 'bg-slate-100 text-slate-700',
    borderAccent: 'border-slate-200',
    primaryAction: 'Open controls',
  },
};

export const getRoleMeta = (accountType: UserSession['accountType']) => roleMeta[accountType] || roleMeta.Merchant;

export const roleLabel = (accountType: UserSession['accountType']) => getRoleMeta(accountType).shortTitle;
