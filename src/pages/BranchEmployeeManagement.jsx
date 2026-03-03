import React, { useState, useEffect, useCallback } from 'react';
import {
    Users, Plus, Search, Mail, Phone, ArrowLeft,
    Edit2, Trash2, ShieldCheck, Loader2, AlertCircle,
    Eye, EyeOff, UserCheck, Save, ChevronDown, ChevronRight,
    CheckSquare, Square, Shield
} from 'lucide-react';
import { employeeAPI, branchAuthAPI, commissionAPI } from '../services/api';

// ─── Hardcoded permission catalogue ──────────────────────────────────────────
const STATIC_CATALOGUE = [
    {
        module: 'dashboard', label: 'Dashboard',
        subcategories: [
            { key: 'dashboard.analytics', label: 'Analytics', permissions: [
                { code: 'dashboard.analytics.view', label: 'View Analytics' },
            ]},
            { key: 'dashboard.branch_summary', label: 'Branch Summary', permissions: [
                { code: 'dashboard.branch_summary.view', label: 'View Branch Summary' },
            ]},
        ],
    },
    {
        module: 'bookings', label: 'Bookings',
        subcategories: [
            { key: 'bookings.custom_umrah', label: 'Custom Umrah', permissions: [
                { code: 'bookings.custom_umrah.view',    label: 'View' },
                { code: 'bookings.custom_umrah.create',  label: 'Create' },
                { code: 'bookings.custom_umrah.edit',    label: 'Edit' },
                { code: 'bookings.custom_umrah.delete',  label: 'Delete' },
                { code: 'bookings.custom_umrah.approve', label: 'Approve' },
                { code: 'bookings.custom_umrah.cancel',  label: 'Cancel' },
            ]},
            { key: 'bookings.umrah_package', label: 'Umrah Package', permissions: [
                { code: 'bookings.umrah_package.view',    label: 'View' },
                { code: 'bookings.umrah_package.create',  label: 'Create' },
                { code: 'bookings.umrah_package.edit',    label: 'Edit' },
                { code: 'bookings.umrah_package.delete',  label: 'Delete' },
                { code: 'bookings.umrah_package.approve', label: 'Approve' },
                { code: 'bookings.umrah_package.cancel',  label: 'Cancel' },
            ]},
            { key: 'bookings.ticket', label: 'Ticket Booking', permissions: [
                { code: 'bookings.ticket.view',    label: 'View' },
                { code: 'bookings.ticket.create',  label: 'Create' },
                { code: 'bookings.ticket.edit',    label: 'Edit' },
                { code: 'bookings.ticket.delete',  label: 'Delete' },
                { code: 'bookings.ticket.approve', label: 'Approve' },
                { code: 'bookings.ticket.cancel',  label: 'Cancel' },
            ]},
        ],
    },
    {
        module: 'booking_history', label: 'Booking History',
        subcategories: [
            { key: 'booking_history', label: 'Booking History', permissions: [
                { code: 'booking_history.view',   label: 'View' },
                { code: 'booking_history.export', label: 'Export' },
            ]},
        ],
    },
    {
        module: 'entities', label: 'Entities',
        subcategories: [
            { key: 'entities.agency', label: 'Agency', permissions: [
                { code: 'entities.agency.view',   label: 'View' },
                { code: 'entities.agency.create', label: 'Create' },
                { code: 'entities.agency.edit',   label: 'Edit' },
                { code: 'entities.agency.delete', label: 'Delete' },
            ]},
            { key: 'entities.employee', label: 'Employee', permissions: [
                { code: 'entities.employee.view',   label: 'View' },
                { code: 'entities.employee.create', label: 'Create' },
                { code: 'entities.employee.edit',   label: 'Edit' },
                { code: 'entities.employee.delete', label: 'Delete' },
            ]},
            { key: 'entities.hr', label: 'HR Management', permissions: [
                { code: 'entities.hr.view',   label: 'View' },
                { code: 'entities.hr.create', label: 'Create' },
                { code: 'entities.hr.edit',   label: 'Edit' },
                { code: 'entities.hr.delete', label: 'Delete' },
            ]},
        ],
    },
    {
        module: 'commission', label: 'Commission & Earnings',
        subcategories: [
            { key: 'commission', label: 'Commission', permissions: [
                { code: 'commission.view',      label: 'View' },
                { code: 'commission.calculate', label: 'Calculate' },
                { code: 'commission.edit',      label: 'Edit' },
                { code: 'commission.approve',   label: 'Approve' },
            ]},
        ],
    },
    {
        module: 'hotels', label: 'Hotels',
        subcategories: [
            { key: 'hotels', label: 'Hotels', permissions: [
                { code: 'hotels.view',   label: 'View' },
                { code: 'hotels.add',    label: 'Add' },
                { code: 'hotels.edit',   label: 'Edit' },
                { code: 'hotels.delete', label: 'Delete' },
            ]},
        ],
    },
    {
        module: 'payments', label: 'Payments',
        subcategories: [
            { key: 'payments', label: 'Payments', permissions: [
                { code: 'payments.view',   label: 'View' },
                { code: 'payments.create', label: 'Create' },
                { code: 'payments.verify', label: 'Verify' },
                { code: 'payments.refund', label: 'Refund' },
            ]},
        ],
    },
    {
        module: 'pax_movements', label: 'Pax Movements',
        subcategories: [
            { key: 'pax_movements', label: 'Pax Movements', permissions: [
                { code: 'pax_movements.view',   label: 'View' },
                { code: 'pax_movements.add',    label: 'Add' },
                { code: 'pax_movements.edit',   label: 'Edit' },
                { code: 'pax_movements.delete', label: 'Delete' },
            ]},
        ],
    },
];

// Flatten all codes once
const ALL_CODES = STATIC_CATALOGUE.flatMap(m =>
    m.subcategories.flatMap(s => s.permissions.map(p => p.code))
);

// ─── Predefined role templates (key → permission codes) ───────────────────────
const STATIC_ROLES = [
    {
        id: 'branch_manager', name: 'Branch Manager',
        permissions: ALL_CODES,
    },
    {
        id: 'admin', name: 'Admin',
        permissions: ALL_CODES,
    },
    {
        id: 'sales', name: 'Sales',
        permissions: [
            'dashboard.analytics.view', 'dashboard.branch_summary.view',
            'bookings.custom_umrah.view', 'bookings.custom_umrah.create', 'bookings.custom_umrah.edit',
            'bookings.umrah_package.view', 'bookings.umrah_package.create', 'bookings.umrah_package.edit',
            'bookings.ticket.view', 'bookings.ticket.create', 'bookings.ticket.edit',
            'booking_history.view',
            'payments.view', 'payments.create',
            'hotels.view',
            'pax_movements.view',
        ],
    },
    {
        id: 'accountant', name: 'Accountant',
        permissions: [
            'dashboard.analytics.view', 'dashboard.branch_summary.view',
            'booking_history.view', 'booking_history.export',
            'commission.view', 'commission.calculate', 'commission.approve',
            'payments.view', 'payments.create', 'payments.verify', 'payments.refund',
        ],
    },
    {
        id: 'hr', name: 'HR',
        permissions: [
            'dashboard.branch_summary.view',
            'entities.employee.view', 'entities.employee.create', 'entities.employee.edit', 'entities.employee.delete',
            'entities.hr.view', 'entities.hr.create', 'entities.hr.edit', 'entities.hr.delete',
            'pax_movements.view', 'pax_movements.add', 'pax_movements.edit', 'pax_movements.delete',
        ],
    },
];

// ─────────────────────────────────────────────────────────────────────────────
//  PermissionPicker – grouped checkbox panel
// ─────────────────────────────────────────────────────────────────────────────
const PermissionPicker = ({ catalogue, selected, onChange }) => {
    const [openModules, setOpenModules] = useState({});

    const toggle = (moduleKey) =>
        setOpenModules(prev => ({ ...prev, [moduleKey]: !prev[moduleKey] }));

    const isAllSubSelected = (permissions) =>
        permissions.every(p => selected.has(p.code));

    const isSomeSubSelected = (permissions) =>
        permissions.some(p => selected.has(p.code));

    const toggleSub = (permissions, checked) => {
        const next = new Set(selected);
        permissions.forEach(p => checked ? next.add(p.code) : next.delete(p.code));
        onChange(next);
    };

    const toggleOne = (code) => {
        const next = new Set(selected);
        next.has(code) ? next.delete(code) : next.add(code);
        onChange(next);
    };

    const toggleModule = (module, checked) => {
        const next = new Set(selected);
        (module.subcategories || []).forEach(sub =>
            (sub.permissions || []).forEach(p => checked ? next.add(p.code) : next.delete(p.code))
        );
        onChange(next);
    };

    const isAllModuleSelected = (module) =>
        (module.subcategories || []).every(sub =>
            (sub.permissions || []).every(p => selected.has(p.code))
        );

    return (
        <div className="space-y-3">
            {catalogue.map((module) => {
                const isOpen = openModules[module.module] ?? false;
                const allSel = isAllModuleSelected(module);

                return (
                    <div key={module.module} className="border border-slate-100 rounded-2xl overflow-hidden">
                        {/* Module header */}
                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors">
                            <button
                                type="button"
                                onClick={() => toggleModule(module, !allSel)}
                                className="flex-shrink-0 text-blue-600"
                            >
                                {allSel
                                    ? <CheckSquare size={18} />
                                    : <Square size={18} className="text-slate-300" />}
                            </button>
                            <button
                                type="button"
                                className="flex-1 flex items-center gap-2 text-left"
                                onClick={() => toggle(module.module)}
                            >
                                <span className="text-xs font-black text-slate-700 uppercase tracking-widest flex-1">
                                    {module.label}
                                </span>
                                {isOpen
                                    ? <ChevronDown size={14} className="text-slate-400" />
                                    : <ChevronRight size={14} className="text-slate-400" />}
                            </button>
                        </div>

                        {/* Subcategories */}
                        {isOpen && (
                            <div className="px-4 pb-4 pt-2 space-y-4 bg-white">
                                {(module.subcategories || []).map((sub) => {
                                    const allSubSel = isAllSubSelected(sub.permissions || []);
                                    const someSel = isSomeSubSelected(sub.permissions || []);
                                    return (
                                        <div key={sub.key}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleSub(sub.permissions || [], !allSubSel)}
                                                    className="text-blue-500"
                                                >
                                                    {allSubSel
                                                        ? <CheckSquare size={15} />
                                                        : someSel
                                                            ? <CheckSquare size={15} className="text-blue-300" />
                                                            : <Square size={15} className="text-slate-300" />}
                                                </button>
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                    {sub.label}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pl-5">
                                                {(sub.permissions || []).map((perm) => (
                                                    <label key={perm.code} className="flex items-center gap-2 cursor-pointer group">
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only"
                                                            checked={selected.has(perm.code)}
                                                            onChange={() => toggleOne(perm.code)}
                                                        />
                                                        <div className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border-2 transition-colors ${selected.has(perm.code)
                                                            ? 'bg-blue-600 border-blue-600'
                                                            : 'border-slate-300 group-hover:border-blue-400'
                                                            }`}>
                                                            {selected.has(perm.code) && (
                                                                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                                                                    <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-600 leading-tight">{perm.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};


// ─────────────────────────────────────────────────────────────────────────────
//  Main Component
// ─────────────────────────────────────────────────────────────────────────────
const BranchEmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [commissionGroups, setCommissionGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'add' | 'edit'
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Selected permission codes (a JS Set) tracked separately – not in formData
    const [selectedPermissions, setSelectedPermissions] = useState(new Set());
    // The static role whose template is currently applied (used for diff computation)
    const [activeRole, setActiveRole] = useState(null);

    const userData = branchAuthAPI.getUserData();
    const branchId = userData?.type === 'branch'
        ? (userData._id || userData.id)
        : userData?.entity_id;

    const [formData, setFormData] = useState({
        name: '', email: '', phone: '',
        role: '',       // display label kept for backward compat
        role_id: '',    // RBAC role document _id
        password: '', is_active: true, portal_access_enabled: true,
        username: '', group_id: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // ── Fetch employees + commissions only (roles/catalogue are hardcoded) ─────
    const fetchData = useCallback(async () => {
        try {
            if (!branchId) return;
            const [employeesData, commissionsData] = await Promise.all([
                employeeAPI.getAll(branchId),
                commissionAPI.getForEmployees().catch(() => []),
            ]);
            setEmployees(employeesData);
            setCommissionGroups(commissionsData.filter(c => c.is_active));
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setIsLoading(false);
        }
    }, [branchId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ── Apply static role template to permission checkboxes ─────────────────
    const applyRole = useCallback((roleId) => {
        const role = STATIC_ROLES.find(r => r.id === roleId);
        setActiveRole(role || null);
        setSelectedPermissions(new Set(role?.permissions || []));
    }, []);

    // ── Form helpers ─────────────────────────────────────────────────────────
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            const updates = { [name]: type === 'checkbox' ? checked : value };
            if (name === 'email' && prev.portal_access_enabled) updates.username = value;
            return { ...prev, ...updates };
        });
    };

    const resetForm = () => {
        setFormData({ name: '', email: '', phone: '', role: '', role_id: '', password: '', is_active: true, portal_access_enabled: true, username: '', group_id: '' });
        setSelectedPermissions(new Set());
        setActiveRole(null);
        setShowPassword(false);
        setError('');
    };

    const openAddForm = () => { setEditingEmployee(null); resetForm(); setViewMode('add'); };

    const openEditForm = (employee) => {
        setEditingEmployee(employee);
        const roleId = employee.role_id || '';
        const role = STATIC_ROLES.find(r => r.id === roleId);

        setFormData({
            name: employee.name || '', email: employee.email || '', phone: employee.phone || '',
            role: employee.role || '', role_id: roleId, password: '',
            is_active: employee.is_active ?? true, portal_access_enabled: employee.portal_access_enabled ?? true,
            username: employee.username || employee.email || '', group_id: employee.group_id || '',
        });
        setActiveRole(role || null);

        // Load permissions saved on the employee record, or fall back to role defaults
        const savedPerms = employee.permissions;
        if (Array.isArray(savedPerms) && savedPerms.length > 0) {
            setSelectedPermissions(new Set(savedPerms));
        } else {
            setSelectedPermissions(new Set(role?.permissions || []));
        }

        setShowPassword(false);
        setError('');
        setViewMode('edit');
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        if (!formData.name.trim()) { setError('Employee name is required'); setIsSubmitting(false); return; }
        if (formData.portal_access_enabled) {
            if (!formData.username?.trim()) { setError('Username is required for portal access'); setIsSubmitting(false); return; }
            if (!editingEmployee && !formData.password?.trim()) { setError('Password is required for new employees'); setIsSubmitting(false); return; }
        }

        try {
            // Save employee document with selected permissions
            const payload = {
                ...formData,
                entity_type: 'branch',
                entity_id: branchId,
                permissions: [...selectedPermissions],
            };
            if (!payload.group_id) delete payload.group_id;
            if (editingEmployee && !payload.password) delete payload.password;

            let savedEmployee;
            if (editingEmployee) {
                savedEmployee = await employeeAPI.update(editingEmployee._id || editingEmployee.id, payload);
                setEmployees(prev => prev.map(e => (e._id === savedEmployee._id ? savedEmployee : e)));
            } else {
                savedEmployee = await employeeAPI.create(payload);
                setEmployees(prev => [...prev, savedEmployee]);
            }
            setViewMode('list');
        } catch (err) {
            console.error(err);
            let msg = 'Failed to save employee';
            if (err.response?.data?.detail) {
                msg = typeof err.response.data.detail === 'string'
                    ? err.response.data.detail
                    : err.response.data.detail.map(d => d.msg).join(', ');
            }
            setError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (employee) => {
        if (!window.confirm(`Delete "${employee.name}"?`)) return;
        try {
            await employeeAPI.delete(employee._id || employee.id);
            setEmployees(prev => prev.filter(e => (e._id || e.id) !== (employee._id || employee.id)));
        } catch (_) { alert('Failed to delete employee'); }
    };

    const filteredEmployees = employees.filter(emp =>
        emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.emp_id?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getRoleName = (employee) => {
        const role = STATIC_ROLES.find(r => r.id === employee.role_id);
        return role?.name || employee.role || '—';
    };

    // ── LIST VIEW ─────────────────────────────────────────────────────────────
    if (viewMode === 'list') {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <Users className="text-blue-600" size={24} />
                            Employees <span className="text-slate-400 text-sm">({filteredEmployees.length})</span>
                        </h1>
                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wide">
                            Manage branch staff & permissions
                        </p>
                    </div>
                    <button onClick={openAddForm} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:scale-105 transition-all">
                        <Plus size={16} /> Add Employee
                    </button>
                </div>

                <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm">
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search employees..."
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none" />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
                    ) : filteredEmployees.length === 0 ? (
                        <div className="text-center p-12 text-slate-400 text-sm font-bold">No employees found</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredEmployees.map(employee => (
                                <div key={employee._id || employee.id} className="p-6 rounded-2xl border border-slate-100 hover:shadow-xl hover:scale-[1.02] transition-all bg-white">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <h3 className="font-black text-base text-slate-800 mb-1">{employee.name}</h3>
                                            <p className="text-xs text-slate-500 font-medium">{employee.emp_id || 'NO-ID'}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${employee.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {employee.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                            <Mail size={12} /><span className="truncate">{employee.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                            <Phone size={12} /><span>{employee.phone || 'No phone'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                            <Shield size={12} />
                                            <span className="uppercase">{getRoleName(employee)}</span>
                                        </div>
                                    </div>
                                    {employee.portal_access_enabled && (
                                        <div className="mb-4 px-3 py-2 bg-green-50 rounded-xl flex items-center gap-2">
                                            <ShieldCheck size={14} className="text-green-600" />
                                            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Portal Enabled</span>
                                        </div>
                                    )}
                                    <div className="flex gap-2 pt-4 border-t border-slate-100">
                                        <button onClick={() => openEditForm(employee)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100">
                                            <Edit2 size={12} /> Edit
                                        </button>
                                        <button onClick={() => handleDelete(employee)} className="px-3 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ── ADD / EDIT FORM ───────────────────────────────────────────────────────
    const deviatedCount = (() => {
        const rolePerms = new Set(activeRole?.permissions || []);
        const extra = [...selectedPermissions].filter(p => !rolePerms.has(p)).length;
        const removed = [...rolePerms].filter(p => !selectedPermissions.has(p)).length;
        return extra + removed;
    })();

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => setViewMode('list')} className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                        {viewMode === 'add' ? 'Add New Employee' : 'Edit Employee'}
                    </h1>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wide">
                        {viewMode === 'add' ? 'Create a new staff member' : `Editing: ${editingEmployee?.name}`}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* ── Section 1: Employee Information ──────────────────────── */}
                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <UserCheck size={14} /> Employee Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Name *</label>
                            <input required type="text" name="name" value={formData.name} onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100" placeholder="Enter full name" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Address *</label>
                            <input required type="email" name="email" value={formData.email} onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100" placeholder="employee@example.com" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone Number</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100" placeholder="+92-3001234567" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</label>
                            <select name="is_active" value={formData.is_active} onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100">
                                <option value={true}>Active</option>
                                <option value={false}>Inactive</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Commission Group</label>
                            <select name="group_id" value={formData.group_id} onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100">
                                <option value="">No Commission Group</option>
                                {commissionGroups.map(group => (
                                    <option key={group._id} value={group._id}>{group.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* ── Section 2: Role & Permissions ────────────────────────── */}
                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Shield size={14} /> Role & Permissions
                    </h4>
                    <p className="text-[10px] font-bold text-slate-400 mb-6">
                        Pick a role to auto-fill permissions. You can customise individual permissions after.
                    </p>

                    {/* Role selector buttons */}
                    <div className="mb-6">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">
                            Assign Role
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {STATIC_ROLES.map(role => {
                                const isSelected = formData.role_id === role.id;
                                return (
                                    <button key={role.id} type="button"
                                        onClick={() => {
                                            setFormData(prev => ({ ...prev, role_id: role.id, role: role.name }));
                                            applyRole(role.id);
                                        }}
                                        className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${isSelected
                                            ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-100'
                                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-300 hover:bg-blue-50'}`}>
                                        {role.name}
                                    </button>
                                );
                            })}
                            <button type="button"
                                onClick={() => {
                                    setFormData(prev => ({ ...prev, role_id: '', role: '' }));
                                    setActiveRole(null);
                                    setSelectedPermissions(new Set());
                                }}
                                className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${!formData.role_id
                                    ? 'border-slate-400 bg-slate-200 text-slate-700'
                                    : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300'}`}>
                                No Role
                            </button>
                        </div>
                    </div>

                    {/* Deviation badge */}
                    {(formData.role_id || selectedPermissions.size > 0) && (
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl mb-6 ${deviatedCount > 0 ? 'bg-amber-50 border border-amber-100' : 'bg-green-50 border border-green-100'}`}>
                            <Shield size={14} className={deviatedCount > 0 ? 'text-amber-500' : 'text-green-500'} />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${deviatedCount > 0 ? 'text-amber-700' : 'text-green-700'}`}>
                                {deviatedCount > 0
                                    ? `${deviatedCount} custom change(s) from "${activeRole?.name || 'role'}" template`
                                    : `Using default "${activeRole?.name}" permissions — no overrides`}
                            </span>
                            <span className="ml-auto text-[10px] font-bold text-slate-500">
                                {selectedPermissions.size} selected
                            </span>
                        </div>
                    )}

                    {/* Permission Picker – uses hardcoded catalogue */}
                    <PermissionPicker catalogue={STATIC_CATALOGUE} selected={selectedPermissions} onChange={setSelectedPermissions} />
                </div>

                {/* ── Section 3: Portal Access ──────────────────────────────── */}
                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <input type="checkbox" name="portal_access_enabled" id="portal_access"
                            checked={formData.portal_access_enabled} onChange={handleInputChange}
                            className="w-5 h-5 text-blue-600 rounded-lg" />
                        <label htmlFor="portal_access" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Enable Portal Access
                        </label>
                    </div>
                    {formData.portal_access_enabled && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Username *</label>
                                <input type="text" name="username" value={formData.username} onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100" placeholder="Username for login" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    Password {viewMode === 'edit' ? '(leave blank to keep)' : '*'}
                                </label>
                                <div className="relative">
                                    <input type={showPassword ? 'text' : 'password'} name="password"
                                        value={formData.password} onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 pr-12"
                                        placeholder={viewMode === 'edit' ? 'Leave blank to keep' : 'Enter password'} />
                                    <button type="button" onClick={() => setShowPassword(s => !s)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-4">
                    <button type="button" onClick={() => setViewMode('list')}
                        className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-100">
                        Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting}
                        className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 flex justify-center items-center gap-2 disabled:opacity-60">
                        {isSubmitting
                            ? <Loader2 size={16} className="animate-spin" />
                            : <><Save size={16} /> {viewMode === 'edit' ? 'Update Employee' : 'Create Employee'}</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BranchEmployeeManagement;
