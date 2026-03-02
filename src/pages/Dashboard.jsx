import React, { useState, useEffect, useCallback } from 'react';
import {
  Ticket, CreditCard, Users, DollarSign,
  ChevronRight, Plane, Package, Briefcase,
  AlertCircle, RefreshCw, Loader2,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtAmount(amount) {
  const n = Number(amount) || 0;
  if (n === 0) return 'Rs. 0';
  if (n >= 1_000_000) return `Rs. ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `Rs. ${(n / 1_000).toFixed(0)}k`;
  return `Rs. ${n.toFixed(0)}`;
}

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Math.floor((Date.now() - new Date(iso + 'Z')) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const STATUS_STYLES = {
  approved:      'bg-green-50 text-green-600 border-green-100',
  done:          'bg-green-50 text-green-600 border-green-100',
  confirmed:     'bg-blue-50 text-blue-600 border-blue-100',
  booked:        'bg-blue-50 text-blue-600 border-blue-100',
  pending:       'bg-orange-50 text-orange-600 border-orange-100',
  underprocess:  'bg-yellow-50 text-yellow-600 border-yellow-100',
  under_process: 'bg-yellow-50 text-yellow-600 border-yellow-100',
  cancelled:     'bg-red-50 text-red-600 border-red-100',
  rejected:      'bg-red-50 text-red-600 border-red-100',
  expired:       'bg-red-50 text-red-600 border-red-100',
};

const StatusBadge = ({ status }) => {
  const key = (status || '').toLowerCase();
  return (
    <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border-2 tracking-widest ${STATUS_STYLES[key] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
      {status || 'unknown'}
    </span>
  );
};

// ── KPI Card ──────────────────────────────────────────────────────────────────

const KpiCard = ({ label, value, icon, color, subtext, loading }) => (
  <div className="bg-white p-6 lg:p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group cursor-default relative overflow-hidden">
    <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10 transition-transform group-hover:scale-125 duration-700 ${color === 'green' ? 'bg-green-500' : 'bg-blue-500'}`} />
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-8">
        <div className={`w-14 h-14 rounded-[22px] flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 duration-500 ${color === 'green' ? 'bg-green-600 shadow-green-100' : 'bg-blue-600 shadow-blue-100'}`}>
          {icon}
        </div>
      </div>
      <p className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 mb-2">{label}</p>
      {loading
        ? <div className="h-9 rounded-xl bg-slate-100 animate-pulse w-2/3 mb-2" />
        : <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2 group-hover:text-blue-600 transition-colors">{value}</h3>
      }
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4 flex items-center">
        {subtext}
        <ChevronRight size={12} className="ml-1 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
      </p>
    </div>
  </div>
);

// ── Booking Status Tracker (donut) ────────────────────────────────────────────

const BookingStatusTracker = ({ label, stats, loading, icon: Icon }) => {
  const total     = stats?.total     || 0;
  const done      = stats?.done      || 0;
  const booked    = stats?.booked    || 0;
  const cancelled = stats?.cancelled || 0;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const dasharray = 251.2;
  const dashoffset = dasharray - (dasharray * pct) / 100;

  return (
    <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} className="text-blue-500" />}
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">{label} Status</h3>
        </div>
        <span className="text-xs font-black text-slate-900">{loading ? '—' : `${total} Total`}</span>
      </div>
      {loading ? (
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 rounded-full bg-slate-100 animate-pulse mb-6" />
          <div className="grid grid-cols-3 gap-4 w-full">
            {[0,1,2].map(i => <div key={i} className="h-8 rounded bg-slate-100 animate-pulse" />)}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32 mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="#F1F5F9" strokeWidth="10" fill="transparent" />
              <circle cx="50" cy="50" r="40" stroke="#3B82F6" strokeWidth="10" fill="transparent"
                strokeDasharray={dasharray} strokeDashoffset={dashoffset} strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-900">{pct}%</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Done</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 w-full text-center">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Done</p>
              <p className="text-sm font-black text-green-600">{done}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Booked</p>
              <p className="text-sm font-black text-blue-600">{booked}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cancel</p>
              <p className="text-sm font-black text-red-600">{cancelled}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Activity helpers ──────────────────────────────────────────────────────────

function activityIconBg(item) {
  if (item.type === 'payment') return 'bg-green-50';
  const t = (item.booking_type || '').toLowerCase();
  if (t.includes('ticket')) return 'bg-blue-50';
  if (t.includes('umrah'))  return 'bg-purple-50';
  return 'bg-slate-100';
}

const ActivityIcon = ({ item }) => {
  if (item.type === 'payment') return <CreditCard size={14} className="text-green-600" />;
  const t = (item.booking_type || '').toLowerCase();
  if (t.includes('ticket')) return <Plane    size={14} className="text-blue-600"   />;
  if (t.includes('umrah'))  return <Package  size={14} className="text-purple-600" />;
  return <Briefcase size={14} className="text-slate-500" />;
};

// ── Error Banner ──────────────────────────────────────────────────────────────

const ErrorBanner = ({ message, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center justify-between">
    <div className="flex items-center gap-3 text-red-600">
      <AlertCircle size={20} />
      <span className="text-sm font-bold">{message}</span>
    </div>
    <button onClick={onRetry}
      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-xl transition-all">
      <RefreshCw size={12} /> Retry
    </button>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('branch_access_token');
      if (!token) throw new Error('Not authenticated — please log out and log in again.');
      const res = await fetch(`${API_BASE}/dashboard/branch/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.detail || `Server error ${res.status}`);
      }
      setData(await res.json());
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const kpis  = data?.kpis           || {};
  const stats = data?.booking_stats  || {};
  const feed  = data?.recent_activity || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">

      {error && !loading && <ErrorBanner message={error} onRetry={fetchDashboard} />}

      {/* Refresh row */}
      <div className="flex justify-end">
        <button onClick={fetchDashboard} disabled={loading}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 hover:border-blue-300 text-slate-500 hover:text-blue-600 px-4 py-2.5 rounded-2xl shadow-sm transition-all disabled:opacity-50">
          {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard label="Today's Bookings"
          value={loading ? '—' : String(kpis.today_bookings ?? 0)}
          icon={<Ticket size={24} />} color="blue"
          subtext="All Booking Types" loading={loading} />
        <KpiCard label="Pending Payments"
          value={loading ? '—' : fmtAmount(kpis.pending_payments_amount ?? 0)}
          icon={<CreditCard size={24} />} color="blue"
          subtext={loading ? 'Awaiting ORG Approval' : `${kpis.pending_payments_count ?? 0} payment(s) pending`}
          loading={loading} />
        <KpiCard label="Active Employees"
          value={loading ? '—' : String(kpis.active_employees ?? 0)}
          icon={<Users size={24} />} color="green"
          subtext="Branch Staff" loading={loading} />
        <KpiCard label="Monthly Revenue"
          value={loading ? '—' : fmtAmount(kpis.monthly_revenue ?? 0)}
          icon={<DollarSign size={24} />} color="green"
          subtext="Approved Payments This Month" loading={loading} />
      </div>

      {/* Booking Status Trackers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <BookingStatusTracker label="Tickets" stats={stats.tickets} loading={loading} icon={Plane} />
        <BookingStatusTracker label="Umrah"   stats={stats.umrah}   loading={loading} icon={Package} />
        <BookingStatusTracker label="Custom"  stats={stats.custom}  loading={loading} icon={Briefcase} />
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Recent Activity</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              LATEST BRANCH EVENTS &middot; BOOKINGS &amp; PAYMENTS
            </p>
          </div>
          <button onClick={fetchDashboard} disabled={loading}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2">
            {loading && <Loader2 size={12} className="animate-spin" />}
            {loading ? 'Loading...' : 'Refresh Feed'}
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-100 rounded-lg w-1/3" />
                    <div className="h-2 bg-slate-100 rounded-lg w-1/5" />
                  </div>
                  <div className="h-3 bg-slate-100 rounded-lg w-20" />
                  <div className="h-6 bg-slate-100 rounded-xl w-16" />
                </div>
              ))}
            </div>
          ) : feed.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              <Briefcase size={40} className="mx-auto mb-4 opacity-20" />
              <p className="text-xs font-black uppercase tracking-widest">No recent activity yet</p>
            </div>
          ) : (
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-slate-50/50">
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">
                  <th className="px-8 py-5">Agent / Reference</th>
                  <th className="px-8 py-5">Event</th>
                  <th className="px-8 py-5">Amount</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {feed.map((row, i) => (
                  <tr key={i} className="hover:bg-blue-50/20 transition-all cursor-default">
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-slate-900">{row.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 tracking-tighter">{row.reference || '—'}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-2 text-xs font-black text-slate-600">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activityIconBg(row)}`}>
                          <ActivityIcon item={row} />
                        </div>
                        <span>{row.event}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-black text-blue-600">
                      {row.amount > 0 ? fmtAmount(row.amount) : '—'}
                    </td>
                    <td className="px-8 py-6"><StatusBadge status={row.status} /></td>
                    <td className="px-8 py-6 text-right text-[10px] font-bold text-slate-400 tracking-tighter">
                      {timeAgo(row.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
