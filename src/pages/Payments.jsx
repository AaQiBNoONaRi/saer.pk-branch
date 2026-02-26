import React, { useState, useEffect, useRef } from 'react';
import {
    Plus, Upload, Eye, Landmark, Building2,
    CheckCircle, XCircle, Loader2, Edit2, Trash2, Clock,
    ChevronLeft, ChevronRight, RefreshCw
} from 'lucide-react';

const API = 'http://localhost:8000';

const StatusBadge = ({ status }) => {
    const styles = {
        pending: 'bg-amber-50 text-amber-700 border-amber-200',
        approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        rejected: 'bg-red-50 text-red-700 border-red-200',
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${styles[status] || styles.pending}`}>
            {status || 'pending'}
        </span>
    );
};

export default function Payments({ onAddAccount, onEditAccount }) {
    const [activeTab, setActiveTab] = useState('Add Deposit');

    // Bank Accounts
    const [accounts, setAccounts] = useState([]);
    const [loadingAccounts, setLoadingAccounts] = useState(false);

    // Deposit form
    const [orgAccounts, setOrgAccounts] = useState([]);
    const [agencyAccounts, setAgencyAccounts] = useState([]);
    const [form, setForm] = useState({
        mode: 'bank',
        beneficiaryAccount: '',
        branchAccount: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        slipFile: null,
    });
    const [slipFileName, setSlipFileName] = useState('No file');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState('');
    const fileRef = useRef();

    // Payment history
    const [payments, setPayments] = useState([]);
    const [loadingPayments, setLoadingPayments] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [page, setPage] = useState(1);
    const perPage = 10;

    const token = () => localStorage.getItem('branch_access_token');

    // ── Fetch on mount / tab change ─────────────────────────────────────────────
    useEffect(() => {
        if (activeTab === 'Bank Accounts') fetchAccounts();
        if (activeTab === 'Add Deposit') {
            fetchBranchBankAccounts();
            fetchPayments();
        }
    }, [activeTab]);

    const fetchAccounts = async () => {
        setLoadingAccounts(true);
        try {
            const res = await fetch(`${API}/api/bank-accounts`, { headers: { Authorization: `Bearer ${token()}` } });
            if (res.ok) setAccounts(await res.json());
        } catch (e) { console.error(e); } finally { setLoadingAccounts(false); }
    };

    const fetchBranchBankAccounts = async () => {
        try {
            const res = await fetch(`${API}/api/bank-accounts/?include_system=true`, {
                headers: { Authorization: `Bearer ${token()}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrgAccounts(data.filter(a => a.account_type === 'Organization'));
                setAgencyAccounts(data.filter(a => a.account_type === 'Branch'));
            }
        } catch (e) { console.error(e); }
    };

    const fetchPayments = async () => {
        setLoadingPayments(true);
        try {
            // exclude_credit=true so credit payments (no DB record needed) don't appear here
            const res = await fetch(`${API}/api/payments/?exclude_credit=true&limit=200`, {
                headers: { Authorization: `Bearer ${token()}` }
            });
            if (res.ok) setPayments(await res.json());
        } catch (e) { console.error(e); } finally { setLoadingPayments(false); }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setForm(f => ({ ...f, slipFile: file }));
            setSlipFileName(file.name);
        }
    };

    const handleSubmit = async () => {
        setSubmitError('');
        setSubmitSuccess('');
        if (!form.amount || parseFloat(form.amount) <= 0) {
            setSubmitError('Please enter a valid amount.');
            return;
        }
        if (form.mode === 'bank' && !form.slipFile) {
            setSubmitError('Upload slip is required for bank transfers.');
            return;
        }

        setIsSubmitting(true);
        try {
            const fd = new FormData();
            // Agency deposits are manual — not linked to a specific booking
            fd.append('booking_id', 'manual');
            fd.append('booking_type', 'manual');
            fd.append('payment_method', form.mode);
            fd.append('amount', form.amount);
            fd.append('payment_date', form.date);
            if (form.notes) fd.append('note', form.notes);
            if (form.beneficiaryAccount) fd.append('beneficiary_account', form.beneficiaryAccount);
            if (form.branchAccount) fd.append('agent_account', form.branchAccount);
            if (form.slipFile) fd.append('slip_file', form.slipFile);

            const res = await fetch(`${API}/api/payments/`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token()}` },
                body: fd
            });

            if (res.ok) {
                setSubmitSuccess('✅ Deposit submitted successfully! Awaiting organization approval.');
                setForm({ mode: 'bank', beneficiaryAccount: '', branchAccount: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '', slipFile: null });
                setSlipFileName('No file');
                if (fileRef.current) fileRef.current.value = '';
                fetchPayments();
            } else {
                const err = await res.json();
                setSubmitError('Error: ' + (err.detail || 'Failed to submit deposit'));
            }
        } catch (e) { setSubmitError('Error: ' + e.message); }
        finally { setIsSubmitting(false); }
    };

    const handleDelete = async (id, type) => {
        if (type !== 'Branch') { alert('You can only delete your own Branch accounts.'); return; }
        if (!window.confirm('Delete this account?')) return;
        try {
            const res = await fetch(`${API}/api/bank-accounts/${id}`, {
                method: 'DELETE', headers: { Authorization: `Bearer ${token()}` }
            });
            if (res.ok) fetchAccounts();
        } catch (e) { console.error(e); }
    };

    // ── Derived data ───────────────────────────────────────────────────────────
    const filtered = payments.filter(p => filterStatus === 'all' || p.status === filterStatus);
    const paginated = filtered.slice((page - 1) * perPage, page * perPage);
    const totalPages = Math.ceil(filtered.length / perPage);

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-full bg-[#F8FAFC]">

            {/* Header */}
            <div className="mb-8 pl-2 pt-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Payments &amp; Finance</h1>
                <p className="text-sm font-bold text-slate-400 mt-1">Add deposits and track payment history</p>
            </div>

            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 flex flex-col">

                {/* Tabs */}
                <div className="flex border-b border-slate-100 px-8 pt-6 gap-8">
                    {['Add Deposit', 'Bank Accounts'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-xs font-black uppercase tracking-widest border-b-2 transition-colors ${activeTab === tab
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="p-8">

                    {/* ── ADD DEPOSIT TAB ───────────────────────────────────────────── */}
                    {activeTab === 'Add Deposit' && (
                        <div className="space-y-8">

                            {/* Form */}
                            <div className="border border-slate-200 rounded-2xl p-6 space-y-5">
                                <h3 className="text-base font-black text-slate-900">Add Deposit</h3>

                                {/* Row 1 */}
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">

                                    {/* Mode */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mode Of Payment</label>
                                        <select value={form.mode} onChange={e => setForm(f => ({ ...f, mode: e.target.value, slipFile: null }), setSlipFileName('No file'))}
                                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:bg-white focus:border-blue-500 focus:outline-none transition-all appearance-none">
                                            <option value="bank">Bank Transfer</option>
                                            <option value="cash">Cash</option>
                                            <option value="cheque">Cheque</option>
                                        </select>
                                    </div>

                                    {/* Beneficiary Account */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Beneficiary Account</label>
                                        <select value={form.beneficiaryAccount} onChange={e => setForm(f => ({ ...f, beneficiaryAccount: e.target.value }))}
                                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:bg-white focus:border-blue-500 focus:outline-none transition-all appearance-none">
                                            <option value="">Select beneficiary</option>
                                            {orgAccounts.map(a => (
                                                <option key={a._id || a.id} value={`${a.bank_name} - ${a.account_number}`}>
                                                    {a.account_title ? `${a.account_title} - ` : ''}{a.bank_name} ({a.account_number})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Branch Account */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Branch Account</label>
                                        <select value={form.branchAccount} onChange={e => setForm(f => ({ ...f, branchAccount: e.target.value }))}
                                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:bg-white focus:border-blue-500 focus:outline-none transition-all appearance-none">
                                            <option value="">Select branch account</option>
                                            {agencyAccounts.map(a => (
                                                <option key={a._id || a.id} value={`${a.bank_name} - ${a.account_number}`}>
                                                    {a.account_title ? `${a.account_title} - ` : ''}{a.bank_name} ({a.account_number})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Amount */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</label>
                                        <input type="number" placeholder="Type Rs.100,000/" value={form.amount}
                                            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:bg-white focus:border-blue-500 focus:outline-none transition-all" />
                                    </div>

                                    {/* Upload Slip */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Slip</label>
                                        <label className="flex items-center gap-2 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black cursor-pointer transition-all">
                                            <Upload size={13} /> Upload Slip
                                            <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
                                        </label>
                                        <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{slipFileName}</p>
                                    </div>
                                </div>

                                {/* Row 2 */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</label>
                                        <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:bg-white focus:border-blue-500 focus:outline-none transition-all" />
                                    </div>
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes</label>
                                        <textarea rows={1} placeholder="Type Note" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:bg-white focus:border-blue-500 focus:outline-none transition-all resize-none" />
                                    </div>
                                </div>

                                {/* Feedback + Submit */}
                                {submitError && (
                                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-xs font-bold">
                                        <XCircle size={14} /> {submitError}
                                    </div>
                                )}
                                {submitSuccess && (
                                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-xs font-bold">
                                        <CheckCircle size={14} /> {submitSuccess}
                                    </div>
                                )}
                                {form.mode === 'bank' && !form.slipFile && (
                                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl px-4 py-2 text-xs font-bold">
                                        Upload slip required
                                    </div>
                                )}

                                <div className="flex justify-end">
                                    <button onClick={handleSubmit} disabled={isSubmitting}
                                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-100">
                                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                        Add Deposit
                                    </button>
                                </div>
                            </div>

                            {/* ── Payment History Table ────────────────────────────────── */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Clock size={16} className="text-slate-400" />
                                        <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Deposit History</h3>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {/* Status filter */}
                                        <div className="flex items-center gap-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                                            <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
                                                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none appearance-none">
                                                <option value="all">All</option>
                                                <option value="pending">Pending</option>
                                                <option value="approved">Approved</option>
                                                <option value="rejected">Rejected</option>
                                            </select>
                                            <button onClick={() => { setFilterStatus('all'); setPage(1); }}
                                                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50">
                                                Reset
                                            </button>
                                        </div>
                                        <button onClick={fetchPayments} className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Refresh">
                                            <RefreshCw size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-slate-50 border-b border-slate-200">
                                                    {['Date', 'Transaction #', 'Trans Type', 'Beneficiary Account (label)', 'Beneficiary Account #', 'Branch Account (label)', 'Branch Account #', 'Amount', 'Status', 'Slip'].map((h, i) => (
                                                        <th key={i} className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider text-left whitespace-nowrap">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {loadingPayments ? (
                                                    <tr><td colSpan={10} className="px-6 py-10 text-center">
                                                        <div className="flex justify-center items-center gap-2 text-slate-400"><Loader2 size={18} className="animate-spin" /> Loading...</div>
                                                    </td></tr>
                                                ) : paginated.length === 0 ? (
                                                    <tr><td colSpan={10} className="px-6 py-10 text-center text-sm text-slate-400 font-medium">No deposits found.</td></tr>
                                                ) : (
                                                    paginated.map(p => {
                                                        const baParts = (p.beneficiary_account || '').split(' - ');
                                                        const agParts = (p.agent_account || '').split(' - ');
                                                        return (
                                                            <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                                                                <td className="px-4 py-3 text-xs font-medium text-slate-600 whitespace-nowrap">{p.payment_date || p.created_at?.split('T')[0]}</td>
                                                                <td className="px-4 py-3 text-xs font-mono text-slate-500">{(p._id || '').slice(-8).toUpperCase()}</td>
                                                                <td className="px-4 py-3">
                                                                    <span className="text-[10px] font-black uppercase bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">{p.payment_method || 'bank'}</span>
                                                                </td>
                                                                <td className="px-4 py-3 text-xs font-medium text-slate-600 whitespace-nowrap">{baParts[0] || '—'}</td>
                                                                <td className="px-4 py-3 text-xs font-mono text-slate-500">{baParts[1] || '—'}</td>
                                                                <td className="px-4 py-3 text-xs font-medium text-slate-600 whitespace-nowrap">{agParts[0] || p.agent_name || '—'}</td>
                                                                <td className="px-4 py-3 text-xs font-mono text-slate-500">{agParts[1] || '—'}</td>
                                                                <td className="px-4 py-3 text-sm font-black text-slate-900 whitespace-nowrap">PKR {Number(p.amount || 0).toLocaleString()}</td>
                                                                <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                                                                <td className="px-4 py-3">
                                                                    {p.slip_url ? (
                                                                        <a href={`${API}${p.slip_url}`} target="_blank" rel="noreferrer"
                                                                            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                                                                            <Eye size={11} /> View
                                                                        </a>
                                                                    ) : <span className="text-slate-300 text-xs">—</span>}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                                        <p className="text-xs font-medium text-slate-400">
                                            Showing {filtered.length === 0 ? '0–0' : `${(page - 1) * perPage + 1}–${Math.min(page * perPage, filtered.length)}`} of {filtered.length}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <select className="px-2 py-1 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 appearance-none focus:outline-none">
                                                <option>10 / page</option>
                                            </select>
                                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1">
                                                <ChevronLeft size={13} /> Prev
                                            </button>
                                            <span className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-black">{page}</span>
                                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                                                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1">
                                                Next <ChevronRight size={13} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── BANK ACCOUNTS TAB ─────────────────────────────────────────── */}
                    {activeTab === 'Bank Accounts' && (
                        <div className="space-y-6">
                            <div className="flex justify-end">
                                <button onClick={onAddAccount}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2">
                                    <Plus size={16} /> Add Account
                                </button>
                            </div>

                            <div className="border border-slate-200 rounded-2xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 border-b border-slate-100">
                                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <th className="px-6 py-4">Bank Name</th>
                                                <th className="px-6 py-4">Account Title</th>
                                                <th className="px-6 py-4">Account Number</th>
                                                <th className="px-6 py-4">IBAN</th>
                                                <th className="px-6 py-4">Type</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {loadingAccounts ? (
                                                <tr><td colSpan={7} className="px-8 py-12 text-center text-slate-400">
                                                    <div className="flex justify-center items-center gap-2"><Loader2 className="animate-spin" size={20} /> Loading...</div>
                                                </td></tr>
                                            ) : accounts.length === 0 ? (
                                                <tr><td colSpan={7} className="px-8 py-12 text-center text-slate-400 font-bold">No bank accounts found</td></tr>
                                            ) : (
                                                accounts.map(acc => (
                                                    <tr key={acc._id} className="hover:bg-blue-50/30 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><Landmark size={16} /></div>
                                                                <span className="text-sm font-bold text-slate-700">{acc.bank_name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-bold text-slate-700">{acc.account_title}</td>
                                                        <td className="px-6 py-4 text-sm font-mono text-slate-600">{acc.account_number}</td>
                                                        <td className="px-6 py-4 text-sm font-mono text-slate-500">{acc.iban || '—'}</td>
                                                        <td className="px-6 py-4">
                                                            {acc.account_type === 'Branch' ? (
                                                                <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg text-[10px] font-black border border-purple-100">
                                                                    <Building2 size={11} /> MY ACCOUNT
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-[10px] font-black border border-blue-100">
                                                                    <Building2 size={11} /> ORGANIZATION
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black border ${acc.status === 'Active'
                                                                ? 'bg-green-50 text-green-700 border-green-100'
                                                                : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                                                {acc.status === 'Active' ? <CheckCircle size={11} /> : <XCircle size={11} />}
                                                                {acc.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            {acc.account_type === 'Branch' && (
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <button onClick={() => onEditAccount(acc)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={15} /></button>
                                                                    <button onClick={() => handleDelete(acc._id, acc.account_type)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={15} /></button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

