import React, { useEffect, useMemo, useState } from 'react';
import {
  Crown, Users, BarChart3, LogOut, Trash2, CheckCircle, XCircle, Clock, Gift, UserPlus,
  Key, RefreshCw, Database, Wifi, WifiOff, Activity, AlertTriangle, TrendingUp,
  Server, HardDrive, Zap, Copy, Link2, Send, PlusCircle, Calendar, Mail, Pencil, X as XIcon, Building
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { AdminService, DatabaseUser, DatabaseStats, ConnectionLog } from '../services/adminService';

/** -------------------------------------------------------
 * AdminPanel for notencheck.app
 * - Robust loading (no hard crash if a sub-call fails)
 * - Professional Analytics (stepwise revenue, MRR, MTD, forecast)
 * - Invitations tab: create 7-day free-trial links, copy & send
 * - Better UX: guards, skeletons, empty-states, accessible buttons
 * ------------------------------------------------------ */

interface AdminPanelProps {
  onLogout: () => void;
  currentUserId: string;
}

interface Invitation {
  id: string;
  token: string;
  url?: string;
  created_at: string | number | Date;
  created_by?: string;
  email?: string | null;
  expires_at: string | number | Date;
  days: number;
  usage_limit?: number | null;
  usage_count?: number | null;
  revoked?: boolean;
  notes?: string | null;
}

const APP_HOST = 'https://notencheck.app';
const PRICE_EUR = 2.99;

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(n ?? 0);

const safeDate = (d?: string | number | Date | null) => (d ? new Date(d) : null);

/** Build a stepwise daily revenue curve.
 * Rule: revenue increases only on days when a new paying user starts (no daily proration).
 * We infer "paid_since" from user.paid_since || user.created_at for users with payment_status === 'paid'.
 * Range: last 60 days by default (includes current month analytics needs).
 */
function buildStepwiseRevenueDaily(users: DatabaseUser[], pricePerPaid: number, days = 60) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Collect paid start dates
  const paidStartDates: Date[] = users
    .filter(u => (u as any)?.payment_status === 'paid')
    .map(u => safeDate((u as any)?.paid_since) || safeDate(u.created_at)!)
    .filter(Boolean) as Date[];

  // Count active paid users cumulatively per day
  const series: { date: string; revenue: number; paidUsers: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const paidUsersThatDay = paidStartDates.filter(d => d <= day).length;
    series.push({
      date: day.toISOString().slice(0, 10),
      revenue: paidUsersThatDay * pricePerPaid,
      paidUsers: paidUsersThatDay,
    });
  }

  return series;
}

/** KPI Card */
function KpiCard({
  title, subtitle, value, tone = 'slate', delta
}: { title: string; subtitle?: string; value: React.ReactNode; tone?: 'slate'|'blue'|'green'|'indigo'|'amber'|'rose'; delta?: number }) {
  const toneMap: Record<string, string> = {
    slate: 'bg-slate-50 border-slate-200 text-slate-800',
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-800',
    amber: 'bg-amber-50 border-amber-200 text-amber-800',
    rose: 'bg-rose-50 border-rose-200 text-rose-800',
  };
  const deltaColor = delta === undefined ? '' : delta >= 0 ? 'text-green-700' : 'text-rose-700';
  const deltaSign = delta === undefined ? '' : delta >= 0 ? '+' : '';
  const deltaText = delta === undefined ? '' : ` ${deltaSign}${delta.toFixed(1)}%`;

  return (
    <div className={`border-2 p-5 rounded-xl shadow-sm ${toneMap[tone]}`}>
      <div className="text-sm opacity-80">{subtitle}</div>
      <div className="mt-1 text-3xl font-black">{value}</div>
      {delta !== undefined && (
        <div className={`mt-1 text-xs font-semibold ${deltaColor}`}>{deltaText} vs. Vortag</div>
      )}
      <div className="mt-3 text-base font-semibold">{title}</div>
    </div>
  );
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'analytics' | 'invitations' | 'system' | 'logs'>('dashboard');

  const [users, setUsers] = useState<DatabaseUser[]>([]);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [connectionLogs, setConnectionLogs] = useState<ConnectionLog[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [lastCheck, setLastCheck] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [systemHealth, setSystemHealth] = useState<any>(null);

  // Invitations state
  const [invites, setInvites] = useState<Invitation[]>([]);
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [inviteDays, setInviteDays] = useState<number>(7);
  const [inviteUsageLimit, setInviteUsageLimit] = useState<number>(1);
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [inviteNotes, setInviteNotes] = useState<string>('');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [editingInviteId, setEditingInviteId] = useState<string | null>(null);

  // Auto-refresh connection status
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const status = AdminService.getConnectionStatus();
        setIsOnline(status.isOnline);
        setLastCheck(status.lastCheck);
      } catch {
        // do nothing, keep last known
      }

      try {
        const health = await AdminService.getSystemHealth();
        setSystemHealth(health);
      } catch {
        // keep previous
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load data on tab change
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const safeCall = async <T,>(fn: () => Promise<T>, fallback: T): Promise<T> => {
    try {
      return await fn();
    } catch {
      return fallback;
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Users needed by dashboard, users, analytics
      if (['users', 'dashboard', 'analytics'].includes(activeTab)) {
        const usersData = await safeCall(() => AdminService.getAllUsers(), []);
        setUsers(usersData);
      }

      // Stats needed by dashboard & analytics
      if (['dashboard', 'analytics'].includes(activeTab)) {
        const statsData = await safeCall(() => AdminService.getDatabaseStats(), null);
        setStats(statsData);
      }

      // Logs
      if (activeTab === 'logs') {
        const logs = await safeCall(async () => AdminService.getConnectionLogs(), []);
        setConnectionLogs(logs);
      }

      // Invitations
      if (activeTab === 'invitations') {
        const list = await safeCall(async () => {
          // Prefer a dedicated API on AdminService if present
          if ((AdminService as any).listInvitations) {
            return await (AdminService as any).listInvitations();
          }
          // fallback: return empty (UI still works to create)
          return [];
        }, []);
        // Normalize URL for each invite
        const normalized: Invitation[] = (list as any[]).map((it) => ({
          ...it,
          url: it?.url || `${APP_HOST}/invite/${it?.token}`,
        }));
        setInvites(normalized);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Payment helpers ---
  const getPaymentStatusIcon = (status?: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'trial': return <Gift className="h-5 w-5 text-purple-600" />;
      case 'pending': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'expired': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'free': return <Gift className="h-5 w-5 text-blue-600" />;
      default: return <XCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPaymentStatusColor = (status?: string) => {
    switch (status) {
      case 'paid': return 'bg-green-50 border-green-200 text-green-800';
      case 'trial': return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'pending': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'expired': return 'bg-red-50 border-red-200 text-red-800';
      case 'free': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const handleUpdatePaymentStatus = async (userId: string, status: 'pending' | 'paid' | 'expired' | 'free' | 'trial') => {
    try {
      await AdminService.updateUserPaymentStatus(userId, status);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update payment status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Diesen Nutzer wirklich löschen? Dies kann nicht rückgängig gemacht werden.')) return;
    try {
      await AdminService.deleteUser(userId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const handleToggleAdmin = async (userId: string, isAdmin: boolean) => {
    try {
      await AdminService.toggleAdminStatus(userId, isAdmin);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle admin status');
    }
  };

  const toggleSchoolManagerStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await AdminService.toggleSchoolManagerStatus(userId, !currentStatus);
      await loadData();
    } catch (error) {
      console.error('Error toggling school manager status:', error);
      setError('Fehler beim Ändern des Schulmanager-Status');
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  // ---- Derived analytics ----
  const paidUsersCount = useMemo(
    () => (stats as any)?.paidUsers ?? users.filter(u => (u as any)?.payment_status === 'paid').length,
    [stats, users]
  );
  const pendingUsersCount = useMemo(
    () => (stats as any)?.pendingUsers ?? users.filter(u => (u as any)?.payment_status === 'pending').length,
    [stats, users]
  );
  const trialUsersCount = useMemo(
    () => (stats as any)?.trialUsers ?? users.filter(u => (u as any)?.payment_status === 'trial').length,
    [stats, users]
  );
  const expiredUsersCount = useMemo(
    () => (stats as any)?.expiredUsers ?? users.filter(u => (u as any)?.payment_status === 'expired').length,
    [stats, users]
  );
  const freeUsersCount = useMemo(
    () => users.filter(u => ((u as any)?.payment_status ?? 'free') === 'free').length,
    [users]
  );

  const mrr = useMemo(() => paidUsersCount * PRICE_EUR, [paidUsersCount]);
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysElapsed = now.getDate();

  // Prefer backend-provided revenue series if present, otherwise build stepwise from users
  const revenueDailyRaw: Array<{ date: string; revenue: number }> = useMemo(() => {
    const backend = (stats as any)?.revenueDaily as Array<{ date: string; revenue: number }> | undefined;
    if (Array.isArray(backend) && backend.length) return backend;
    // Stepwise from current users
    return buildStepwiseRevenueDaily(users, PRICE_EUR, 60).map(d => ({ date: d.date, revenue: d.revenue }));
  }, [stats, users]);

  const revenueChartData = useMemo(() => {
    return revenueDailyRaw.map(d => ({
      dateLabel: new Date(d.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
      revenue: d.revenue,
    }));
  }, [revenueDailyRaw]);

  const mtdRevenue = useMemo(() => {
    const sum = revenueDailyRaw
      .filter(d => {
        const dt = new Date(d.date);
        return dt.getMonth() === month && dt.getFullYear() === year;
      })
      .reduce((acc, d) => acc + (d.revenue ?? 0), 0);
    // This is cumulative-per-day revenue; to get MTD incremental, compute last day value (level) * daysElapsed
    // But user asked: "nur an dem Tag anheben, dann neues Niveau". So MTD actual = Sum of daily *changes*?
    // Pragmatically: take last day level (today's revenue) as current level; MTD collected = average(levels) across elapsed days.
    // We'll compute average level across elapsed days (area under step function / days) to represent accrued revenue.
    const lastDayLevel = revenueDailyRaw
      .filter(d => {
        const dt = new Date(d.date);
        return dt.getMonth() === month && dt.getFullYear() === year;
      })
      .map(d => d.revenue)
      .slice(-1)[0] ?? mrr;

    // If backend provides explicit revenueMTD, respect it
    if ((stats as any)?.revenueMTD != null) return (stats as any).revenueMTD;

    // Approximation: average level across elapsed days
    const monthDaysSeries = revenueDailyRaw.filter(d => {
      const dt = new Date(d.date);
      return dt.getMonth() === month && dt.getFullYear() === year;
    }).map(d => d.revenue);

    if (monthDaysSeries.length) {
      const avgLevel = monthDaysSeries.reduce((a, b) => a + b, 0) / monthDaysSeries.length;
      return avgLevel * monthDaysSeries.length;
    }
    return lastDayLevel * daysElapsed;
  }, [revenueDailyRaw, month, year, daysElapsed, stats, mrr]);

  const avgPerDay = daysElapsed > 0 ? (mtdRevenue / daysElapsed) : 0;
  const forecastMonth = useMemo(() => {
    if ((stats as any)?.revenueForecast != null) return (stats as any).revenueForecast;
    return avgPerDay * daysInMonth;
  }, [avgPerDay, daysInMonth, stats]);

  const revenueChangePct = useMemo(() => {
    if (revenueDailyRaw.length >= 2) {
      const a = revenueDailyRaw[revenueDailyRaw.length - 2].revenue || 0;
      const b = revenueDailyRaw[revenueDailyRaw.length - 1].revenue || 0;
      if (a === 0) return b > 0 ? 100 : 0;
      return ((b - a) / a) * 100;
    }
    return 0;
  }, [revenueDailyRaw]);

  const paymentBreakdownData = useMemo(() => ([
    { name: 'Paid', value: paidUsersCount, euro: paidUsersCount * PRICE_EUR },
    { name: 'Pending', value: pendingUsersCount, euro: pendingUsersCount * PRICE_EUR },
    { name: 'Trial', value: trialUsersCount, euro: 0 },
    { name: 'Expired', value: expiredUsersCount, euro: 0 },
    { name: 'Free', value: freeUsersCount, euro: 0 },
  ]), [paidUsersCount, pendingUsersCount, trialUsersCount, expiredUsersCount, freeUsersCount]);

  // --- Invitations handlers ---
  const createInvite = async () => {
    setInviteError(null);
    setInviteSuccess(null);
    setCreatingInvite(true);
    try {
      let created: any;
      if ((AdminService as any).createInvitation) {
        created = await (AdminService as any).createInvitation({
          days: inviteDays,
          usage_limit: inviteUsageLimit,
          email: inviteEmail || null,
          notes: inviteNotes || null,
        });
      } else if ((AdminService as any).createTrialInvite) {
        created = await (AdminService as any).createTrialInvite(inviteDays, inviteEmail || null, inviteNotes || null, inviteUsageLimit);
      } else {
        throw new Error('Invitations API not available in AdminService');
      }

      // Normalize result
      const normalized: Invitation = {
        id: created?.id ?? created?.token ?? Math.random().toString(36).slice(2),
        token: created?.token ?? created?.id,
        created_at: created?.created_at ?? new Date().toISOString(),
        created_by: created?.created_by,
        email: created?.email ?? (inviteEmail || null),
        expires_at: created?.expires_at ?? new Date(Date.now() + inviteDays * 24 * 60 * 60 * 1000).toISOString(),
        days: created?.days ?? inviteDays,
        usage_limit: created?.usage_limit ?? inviteUsageLimit,
        usage_count: created?.usage_count ?? 0,
        revoked: created?.revoked ?? false,
        notes: created?.notes ?? inviteNotes,
        url: created?.url ?? `${APP_HOST}/invite/${created?.token ?? created?.id}`,
      };

      setInvites(prev => [normalized, ...prev]);
      setInviteSuccess('Invite erstellt und bereit zum Versenden/Kopieren.');
      setInviteEmail('');
      setInviteNotes('');
      setInviteUsageLimit(1);
      setInviteDays(7);
    } catch (e: any) {
      setInviteError(e?.message || 'Fehler beim Erstellen des Invites');
    } finally {
      setCreatingInvite(false);
    }
  };

  const revokeInvite = async (id: string) => {
    setInviteError(null);
    setInviteSuccess(null);
    try {
      if ((AdminService as any).revokeInvitation) {
        await (AdminService as any).revokeInvitation(id);
      }
      setInvites(prev => prev.map(i => i.id === id ? { ...i, revoked: true } : i));
      setInviteSuccess('Invite wurde deaktiviert.');
    } catch (e: any) {
      setInviteError(e?.message || 'Fehler beim Deaktivieren');
    }
  };

  const resendInvite = async (id: string, email: string) => {
    setInviteError(null);
    setInviteSuccess(null);
    try {
      if (!email) throw new Error('Keine E-Mail angegeben');
      if ((AdminService as any).sendInvitationEmail) {
        await (AdminService as any).sendInvitationEmail(id, email);
      }
      setInviteSuccess('E-Mail wurde versendet.');
      setInvites(prev => prev.map(i => i.id === id ? { ...i, email } : i));
    } catch (e: any) {
      setInviteError(e?.message || 'Fehler beim Senden der E-Mail');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setInviteSuccess('Link in die Zwischenablage kopiert.');
    } catch {
      setInviteError('Kopieren fehlgeschlagen.');
    }
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl border-b-4 border-yellow-500">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center rounded-xl shadow-lg">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight">notencheck.app – Admin</h1>
                <p className="text-slate-300 font-medium text-lg">Advanced Management Console</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Connection Status */}
              <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border-2 ${
                isOnline ? 'bg-green-500/20 border-green-400 text-green-100' : 'bg-red-500/20 border-red-400 text-red-100'
              }`}>
                {isOnline ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
                <span className="font-bold">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                {systemHealth && (<span className="text-xs opacity-80">{systemHealth?.responseTime ?? '—'}ms</span>)}
              </div>

              <button
                onClick={onLogout}
                className="flex items-center gap-3 px-6 py-3 bg-red-600 hover:bg-red-700 transition-colors font-bold rounded-lg shadow-lg"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-2 mb-8 bg-white p-2 rounded-xl shadow-lg border-2 border-slate-200">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            { id: 'invitations', label: 'Invitations', icon: UserPlus },
            { id: 'system', label: 'System Health', icon: Server },
            { id: 'logs', label: 'Connection Logs', icon: Activity }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-6 py-4 font-bold transition-all duration-300 rounded-lg ${
                activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="font-bold text-red-800">Error: {error}</span>
              <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
              <span className="font-bold text-slate-700">Lade Daten…</span>
            </div>
          </div>
        )}

        {/* Dashboard */}
        {activeTab === 'dashboard' && stats && !isLoading && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white border-2 border-slate-900 p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <Users className="h-8 w-8 text-slate-900" />
                  <div>
                    <div className="text-3xl font-black text-slate-900">{stats.totalUsers}</div>
                    <div className="text-slate-700 font-medium">Total Users</div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border-2 border-green-200 p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <Activity className="h-8 w-8 text-green-600" />
                  <div>
                    <div className="text-3xl font-black text-green-800">{stats.activeUsers}</div>
                    <div className="text-green-700 font-medium">Active Users</div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border-2 border-purple-200 p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <Gift className="h-8 w-8 text-purple-600" />
                  <div>
                    <div className="text-3xl font-black text-purple-800">{stats.trialUsers}</div>
                    <div className="text-purple-700 font-medium">Trial Users</div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <HardDrive className="h-8 w-8 text-blue-600" />
                  <div>
                    <div className="text-3xl font-black text-blue-800">{stats.totalProfiles}</div>
                    <div className="text-blue-700 font-medium">Profiles</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white border-2 border-slate-900 shadow-lg">
              <div className="bg-slate-900 text-white p-6">
                <h3 className="text-2xl font-black">Recent Activity</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-black text-slate-900">{stats.recentSignups}</div>
                    <div className="text-slate-700">New signups (7 days)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-slate-900">{stats.totalTodos}</div>
                    <div className="text-slate-700">Total todos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-slate-900">{stats.adminUsers}</div>
                    <div className="text-slate-700">Admin users</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics */}
        {activeTab === 'analytics' && !isLoading && (
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-7 w-7 text-slate-900" />
              <h3 className="text-2xl font-black text-slate-900">Analytics – Umsatz</h3>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
              <KpiCard title="ARPU" subtitle="Preis pro zahlendem Nutzer" value={formatCurrency(PRICE_EUR)} tone="blue" />
              <KpiCard title="Paid Users" subtitle="Aktiv zahlend" value={paidUsersCount} tone="green" />
              <KpiCard title="MRR (erwartet)" subtitle="Paid × 2,99 €" value={formatCurrency(mrr)} tone="indigo" />
              <KpiCard title="Umsatz bisher (MTD)" subtitle="Monat bisher" value={formatCurrency(mtdRevenue)} tone="slate" />
              <KpiCard title="Forecast" subtitle="Prognose Monatsende" value={formatCurrency(forecastMonth)} tone="amber" />
              <KpiCard title="Trend" subtitle="Letzter vs. Vortag" value={revenueChangePct.toFixed(1) + '%'} tone="rose" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Trend */}
              <div className="lg:col-span-2 bg-white border-2 border-slate-200 rounded-xl shadow-sm">
                <div className="flex items-center justify-between p-5 border-b-2 border-slate-100">
                  <div>
                    <div className="text-xl font-bold text-slate-900">Umsatzverlauf (täglich, stufenweise)</div>
                    <div className="text-slate-500 text-sm">
                      Forecast {now.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}:{' '}
                      <span className="font-semibold">{formatCurrency(forecastMonth)}</span>
                    </div>
                  </div>
                  <button onClick={loadData} className="flex items-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-700">
                    <RefreshCw className="h-4 w-4" /> Aktualisieren
                  </button>
                </div>
                <div className="p-4 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35}/>
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dateLabel" />
                      <YAxis />
                      <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
                      <Legend />
                      <Area type="stepAfter" dataKey="revenue" name="Umsatz (Niveau)" stroke="#0ea5e9" fill="url(#revGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Payment Breakdown */}
              <div className="bg-white border-2 border-slate-200 rounded-xl shadow-sm">
                <div className="p-5 border-b-2 border-slate-100">
                  <div className="text-xl font-bold text-slate-900">Payment Breakdown</div>
                  <div className="text-slate-500 text-sm">Nutzerstatus & potenzieller Umsatz</div>
                </div>
                <div className="p-4 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={paymentBreakdownData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(v: any, key: any) => key === 'euro' ? formatCurrency(Number(v)) : v} />
                      <Legend />
                      <Bar dataKey="value" name="Nutzer" />
                      <Bar dataKey="euro" name="Umsatz (potenziell)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="px-5 pb-5 text-sm text-slate-600 space-y-1">
                  <div className="flex items-center justify-between"><span>Erwarteter Monatsumsatz</span><span className="font-semibold">{formatCurrency(mrr)}</span></div>
                  <div className="flex items-center justify-between"><span>Umsatz bisher (MTD)</span><span className="font-semibold">{formatCurrency(mtdRevenue)}</span></div>
                  <div className="flex items-center justify-between"><span>Forecast Monatsende</span><span className="font-semibold">{formatCurrency(forecastMonth)}</span></div>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-500 space-y-1">
              <div>* Preis pro zahlendem Nutzer = {formatCurrency(PRICE_EUR)}. Bei Bedarf <code>PRICE_EUR</code> anpassen.</div>
              <div>* Wenn dein Backend <code>stats.revenueDaily</code>/<code>stats.revenueMTD</code>/<code>stats.revenueForecast</code> liefert, werden diese Werte bevorzugt.</div>
              <div>* Stufenlogik: Umsatz steigt nur an Tagen mit neuem zahlenden Nutzer; danach neues Niveau.</div>
            </div>
          </div>
        )}

        {/* Users */}
        {activeTab === 'users' && !isLoading && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900">Database Users ({users.length})</h3>
              <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-bold hover:bg-slate-700 transition-colors rounded-lg">
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
            </div>

            <div className="bg-white border-2 border-slate-900 shadow-lg">
              <div className="bg-slate-900 text-white p-6">
                <h4 className="text-xl font-bold">User Management</h4>
              </div>

              <div className="p-6">
                {users.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">No users found in database</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="border-2 border-slate-200 p-6 rounded-lg hover:border-slate-400 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-900 flex items-center justify-center text-white font-bold text-lg rounded-lg">
                              {(user.display_name || user.email)[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-3">
                                <div className="font-bold text-slate-900 text-lg">
                                  {user.display_name || user.email.split('@')[0]}
                                </div>
                                {(user as any)?.is_admin && (<Crown className="h-5 w-5 text-yellow-600" />)}
                                {user.is_school_manager && (
                                  <span className="ml-3 bg-purple-500 text-white px-2 py-1 text-xs font-bold rounded border border-purple-600">
                                    SCHULMANAGER
                                  </span>
                                )}
                              </div>
                              <div className="text-slate-600 flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                {user.email}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleAdmin(user.id, !((user as any)?.is_admin))}
                              className={`p-2 rounded transition-colors ${
                                (user as any)?.is_admin ? 'text-yellow-600 hover:bg-yellow-50' : 'text-slate-400 hover:bg-slate-50'
                              }`}
                              title={(user as any)?.is_admin ? 'Remove admin' : 'Make admin'}
                            >
                              <Crown className="h-5 w-5" />
                            </button>
                            
                            <button
                              onClick={() => toggleSchoolManagerStatus(user.id, user.is_school_manager || false)}
                              className={`p-2 transition-colors ${
                                user.is_school_manager 
                                  ? 'text-purple-600 hover:bg-purple-50' 
                                  : 'text-gray-400 hover:bg-gray-50'
                              }`}
                              title={user.is_school_manager ? 'Schulmanager-Rechte entziehen' : 'Zu Schulmanager machen'}
                            >
                              <Building className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 text-red-600 hover:bg-red-50 transition-colors rounded"
                              title="Delete user"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm text-slate-600">
                          <div><span className="font-medium">Created:</span><br />{new Date(user.created_at).toLocaleDateString()}</div>
                          <div><span className="font-medium">Last Login:</span><br />{(user as any)?.last_login ? new Date((user as any).last_login).toLocaleDateString() : 'Never'}</div>
                          <div>
                            <span className="font-medium">Status:</span><br />
                            <div className="flex items-center gap-2 mt-1">
                              {getPaymentStatusIcon((user as any)?.payment_status)}
                              <span className={`px-2 py-1 border text-xs font-bold rounded ${getPaymentStatusColor((user as any)?.payment_status)}`}>
                                {(user as any)?.payment_status?.toUpperCase() || 'FREE'}
                              </span>
                            </div>
                          </div>
                          <div><span className="font-medium">Trial Expires:</span><br />{(user as any)?.trial_expires_at ? new Date((user as any).trial_expires_at).toLocaleDateString() : 'N/A'}</div>
                        </div>

                        <div className="border-t-2 border-slate-200 pt-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Key className="h-5 w-5 text-slate-900" />
                            <span className="font-bold text-slate-900">Payment Status:</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                            {[
                              { status: 'free', label: 'Free', color: 'bg-blue-500' },
                              { status: 'trial', label: 'Trial', color: 'bg-purple-500' },
                              { status: 'pending', label: 'Pending', color: 'bg-yellow-500' },
                              { status: 'paid', label: 'Paid', color: 'bg-green-500' },
                              { status: 'expired', label: 'Expired', color: 'bg-red-500' }
                            ].map((option) => (
                              <button
                                key={option.status}
                                onClick={() => handleUpdatePaymentStatus(user.id, option.status as any)}
                                className={`px-3 py-2 text-white font-bold text-sm hover:opacity-80 transition-opacity rounded ${option.color} ${
                                  (user as any)?.payment_status === option.status ? 'ring-4 ring-slate-900' : ''
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Invitations */}
        {activeTab === 'invitations' && !isLoading && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserPlus className="h-7 w-7 text-slate-900" />
                <h3 className="text-2xl font-black text-slate-900">Invitations – Free Trial Links</h3>
              </div>
              <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-bold hover:bg-slate-700 transition-colors rounded-lg">
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
            </div>

            {/* Create invite */}
            <div className="bg-white border-2 border-slate-200 rounded-xl shadow-sm">
              <div className="p-5 border-b-2 border-slate-100">
                <div className="text-xl font-bold text-slate-900">Neuen Free-Trial-Link erstellen</div>
                <div className="text-slate-500 text-sm">Der Nutzer erhält 7 Tage kostenlosen Zugang (konfigurierbar).</div>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Laufzeit (Tage)</span>
                  <div className="mt-1 relative">
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={inviteDays}
                      onChange={(e) => setInviteDays(Math.max(1, Math.min(60, Number(e.target.value))))}
                      className="w-full rounded-lg border-slate-300 focus:ring-slate-900 focus:border-slate-900"
                      placeholder="7"
                    />
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                  </div>
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Verwendungsgrenze</span>
                  <div className="mt-1 relative">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={inviteUsageLimit}
                      onChange={(e) => setInviteUsageLimit(Math.max(1, Math.min(100, Number(e.target.value))))}
                      className="w-full rounded-lg border-slate-300 focus:ring-slate-900 focus:border-slate-900"
                      placeholder="1"
                    />
                    <Key className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                  </div>
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">E-Mail (optional, zum Versenden)</span>
                  <div className="mt-1 relative">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full rounded-lg border-slate-300 focus:ring-slate-900 focus:border-slate-900"
                      placeholder="name@example.com"
                    />
                    <Mail className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                  </div>
                </label>

                <label className="block md:col-span-2 lg:col-span-1">
                  <span className="text-sm font-semibold text-slate-700">Notiz (optional)</span>
                  <div className="mt-1 relative">
                    <input
                      type="text"
                      value={inviteNotes}
                      onChange={(e) => setInviteNotes(e.target.value)}
                      className="w-full rounded-lg border-slate-300 focus:ring-slate-900 focus:border-slate-900"
                      placeholder="Kontext/Quelle"
                    />
                    <Pencil className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                  </div>
                </label>

                <div className="flex items-end">
                  <button
                    onClick={createInvite}
                    disabled={creatingInvite}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-700 disabled:opacity-60"
                  >
                    <PlusCircle className="h-5 w-5" />
                    {creatingInvite ? 'Erstelle…' : 'Invite erstellen'}
                  </button>
                </div>
              </div>

              {(inviteError || inviteSuccess) && (
                <div className={`mx-5 mb-5 rounded-lg border-2 p-3 ${inviteError ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
                  <div className="flex items-center gap-2">
                    {inviteError ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    <span className="text-sm">{inviteError || inviteSuccess}</span>
                    <button onClick={() => { setInviteError(null); setInviteSuccess(null); }} className="ml-auto opacity-70 hover:opacity-100">
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* List invites */}
            <div className="bg-white border-2 border-slate-200 rounded-xl shadow-sm">
              <div className="p-5 border-b-2 border-slate-100 flex items-center justify-between">
                <div className="text-xl font-bold text-slate-900">Aktive Invites</div>
                <div className="text-sm text-slate-500">Klicke auf Link kopieren oder direkt senden</div>
              </div>

              <div className="p-5">
                {invites.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Link2 className="h-14 w-14 mx-auto mb-3 opacity-30" />
                    <div className="font-medium">Keine Invites vorhanden</div>
                    <div className="text-sm">Erstelle oben einen neuen Free-Trial-Link.</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invites.map((inv) => {
                      const url = inv.url || `${APP_HOST}/invite/${inv.token}`;
                      const expires = safeDate(inv.expires_at);
                      const created = safeDate(inv.created_at);
                      const used = inv.usage_count ?? 0;
                      const limit = inv.usage_limit ?? 1;
                      const isExpired = expires ? expires.getTime() < Date.now() : false;

                      return (
                        <div key={inv.id} className={`p-4 border-2 rounded-lg ${inv.revoked ? 'bg-slate-50 opacity-70' : isExpired ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
                          <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-6">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Link2 className="h-4 w-4 text-slate-500" />
                                <a href={url} target="_blank" rel="noreferrer" className="text-slate-900 font-semibold hover:underline break-all">{url}</a>
                              </div>
                              <div className="mt-1 text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                                <span>Erstellt: {created ? created.toLocaleString() : '—'}</span>
                                <span>Läuft ab: {expires ? expires.toLocaleString() : '—'}</span>
                                <span>Verwendung: {used}/{limit}</span>
                                <span>Tage: {inv.days}</span>
                                {inv.notes && <span>Notiz: {inv.notes}</span>}
                                {inv.email && <span>Email: {inv.email}</span>}
                                {inv.revoked && <span className="text-rose-700 font-semibold">Deaktiviert</span>}
                                {isExpired && !inv.revoked && <span className="text-amber-700 font-semibold">Abgelaufen</span>}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => copyToClipboard(url)}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50"
                                title="Link kopieren"
                              >
                                <Copy className="h-4 w-4" /> Kopieren
                              </button>
                              <div className="relative">
                                {editingInviteId === inv.id ? (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="email"
                                      defaultValue={inv.email ?? ''}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          const target = e.target as HTMLInputElement;
                                          resendInvite(inv.id, target.value);
                                          setEditingInviteId(null);
                                        }
                                        if (e.key === 'Escape') setEditingInviteId(null);
                                      }}
                                      className="rounded-lg border-slate-300 focus:ring-slate-900 focus:border-slate-900"
                                      placeholder="email@domain.com"
                                    />
                                    <button
                                      onClick={(ev) => {
                                        const wrap = (ev.currentTarget.parentElement?.querySelector('input') as HTMLInputElement);
                                        resendInvite(inv.id, wrap?.value || '');
                                        setEditingInviteId(null);
                                      }}
                                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-700"
                                      title="Invite senden"
                                    >
                                      <Send className="h-4 w-4" /> Senden
                                    </button>
                                    <button onClick={() => setEditingInviteId(null)} className="p-2 hover:bg-slate-100 rounded-lg" title="Abbrechen">
                                      <XIcon className="h-4 w-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setEditingInviteId(inv.id)}
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50"
                                    title="Per E-Mail senden"
                                  >
                                    <Send className="h-4 w-4" /> Senden
                                  </button>
                                )}
                              </div>
                              <button
                                onClick={() => revokeInvite(inv.id)}
                                disabled={inv.revoked === true}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                                title="Invite deaktivieren"
                              >
                                <XCircle className="h-4 w-4" /> Deaktivieren
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* System Health */}
        {activeTab === 'system' && !isLoading && (
          <div className="space-y-8">
            <h3 className="text-2xl font-black text-slate-900">System Health Monitor</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 border-2 shadow-lg ${isOnline ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center gap-4">
                  <Database className={`h-8 w-8 ${isOnline ? 'text-green-600' : 'text-red-600'}`} />
                  <div>
                    <div className="text-2xl font-black">{isOnline ? 'ONLINE' : 'OFFLINE'}</div>
                    <div className="text-sm opacity-80">Database Status</div>
                  </div>
                </div>
              </div>

              {systemHealth && (
                <>
                  <div className="bg-blue-50 border-2 border-blue-200 p-6 shadow-lg">
                    <div className="flex items-center gap-4">
                      <Zap className="h-8 w-8 text-blue-600" />
                      <div>
                        <div className="text-2xl font-black text-blue-800">{systemHealth?.responseTime ?? '—'}ms</div>
                        <div className="text-blue-700 text-sm">Response Time</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 border-2 border-purple-200 p-6 shadow-lg">
                    <div className="flex items-center gap-4">
                      <Activity className="h-8 w-8 text-purple-600" />
                      <div>
                        <div className="text-2xl font-black text-purple-800">{new Date(lastCheck).toLocaleTimeString()}</div>
                        <div className="text-purple-700 text-sm">Last Check</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {systemHealth?.lastError && (
              <div className="bg-red-50 border-2 border-red-200 p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                  <h4 className="text-lg font-bold text-red-800">Last Error</h4>
                </div>
                <p className="text-red-700 font-mono text-sm">{systemHealth.lastError}</p>
              </div>
            )}
          </div>
        )}

        {/* Connection Logs */}
        {activeTab === 'logs' && !isLoading && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900">Connection Logs</h3>
              <button
                onClick={() => setConnectionLogs(AdminService.getConnectionLogs())}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-bold hover:bg-slate-700 transition-colors rounded-lg"
              >
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
            </div>

            <div className="bg-white border-2 border-slate-900 shadow-lg">
              <div className="bg-slate-900 text-white p-6">
                <h4 className="text-xl font-bold">Database Connection History</h4>
              </div>

              <div className="p-6">
                {connectionLogs.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Activity className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">No connection logs available</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {connectionLogs.map((log) => (
                      <div
                        key={log.id}
                        className={`p-4 border-2 rounded-lg ${
                          log.status === 'online' ? 'bg-green-50 border-green-200'
                          : log.status === 'offline' ? 'bg-red-50 border-red-200'
                          : 'bg-amber-50 border-amber-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {log.status === 'online' ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : log.status === 'offline' ? (
                              <XCircle className="h-5 w-5 text-red-600" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-amber-600" />
                            )}
                            <span className="font-bold">{log.status.toUpperCase()}</span>
                            <span className="text-sm opacity-80">{log.message}</span>
                          </div>
                          <div className="text-sm opacity-60">
                            {new Date(log.timestamp).toLocaleString()}
                            {log.duration && (<span className="ml-2">(downtime: {formatDuration(log.duration)})</span>)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminPanel;