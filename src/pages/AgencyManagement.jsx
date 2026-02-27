import React, { useState, useEffect } from 'react';
import {
    Building2, Plus, Search, MapPin, Phone, Mail, ArrowLeft,
    Edit2, Trash2, ShieldCheck, Loader2, AlertCircle, CreditCard,
    Eye, EyeOff, Building, FileText, Clock, AlertTriangle, Users,
    Briefcase, CheckCircle2, History, MessageSquare, ChevronRight, Save
} from 'lucide-react';
import { agencyAPI, branchAuthAPI } from '../services/api';

const AgencyManagement = () => {
    const [agencies, setAgencies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAgency, setSelectedAgency] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list', 'detail', 'add', 'edit'
    const [agencyStats, setAgencyStats] = useState({
        total_bookings: 0,
        on_time_payments: 0,
        late_payments: 0,
        disputes: 0
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [agencyTypeFilter, setAgencyTypeFilter] = useState('all');
    const [activeTab, setActiveTab] = useState('overview');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        agency_type: 'full',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        is_active: true,
        portal_access_enabled: true,
        username: '',
        password: '',
        credit_limit: 0,
        credit_limit_days: 30,
        agreement_status: 'active',
        commission_group: 'Standard',
        logo: ''
    });

    const branchData = branchAuthAPI.getUserData();

    useEffect(() => {
        fetchAgencies();
    }, []);

    const fetchAgencies = async () => {
        try {
            setIsLoading(true);
            const branchId = branchData?._id || branchData?.id;
            if (branchId) {
                const data = await agencyAPI.getAll(branchId);
                setAgencies(data);
            }
        } catch (err) {
            console.error("Failed to fetch agencies", err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAgencyStats = async (agencyId) => {
        try {
            const stats = await agencyAPI.getStats(agencyId);
            setAgencyStats(stats);
        } catch (err) {
            console.error("Failed to fetch agency stats", err);
            // Keep default values if fetch fails
            setAgencyStats({
                total_bookings: 0,
                on_time_payments: 0,
                late_payments: 0,
                disputes: 0
            });
        }
    };

    const handleViewAgencyDetails = (agency) => {
        setSelectedAgency(agency);
        setViewMode('detail');
        // Fetch stats for this agency
        fetchAgencyStats(agency._id || agency.id);
    };

    const handleConfirmDelete = async (agency) => {
        if (!window.confirm(`Are you sure you want to delete "${agency.name}"?`)) return;
        try {
            await agencyAPI.delete(agency._id || agency.id);
            const updatedList = agencies.filter(a => (a._id || a.id) !== (agency._id || agency.id));
            setAgencies(updatedList);
            if (selectedAgency && (selectedAgency._id || selectedAgency.id) === (agency._id || agency.id)) {
                setSelectedAgency(null);
                setViewMode('list');
            }
        } catch (err) {
            alert('Failed to delete agency');
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'email') {
            setFormData(prev => ({
                ...prev,
                email: value,
                username: value
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const openAddForm = () => {
        setFormData({
            name: '',
            code: '',
            agency_type: 'full',
            contact_person: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            country: '',
            is_active: true,
            portal_access_enabled: true,
            username: '',
            password: '',
            credit_limit: 0,
            credit_limit_days: 30,
            agreement_status: 'active',
            commission_group: 'Standard',
            logo: ''
        });
        setError('');
        setViewMode('add');
    };

    const openEditForm = (agency) => {
        setFormData({
            name: agency.name || '',
            code: agency.code || '',
            agency_type: agency.agency_type || 'full',
            contact_person: agency.contact_person || '',
            email: agency.email || '',
            phone: agency.phone || '',
            address: agency.address || '',
            city: agency.city || '',
            country: agency.country || '',
            is_active: agency.is_active ?? true,
            portal_access_enabled: agency.portal_access_enabled ?? true,
            username: agency.username || agency.email || '',
            password: '',
            credit_limit: agency.credit_limit || 0,
            credit_limit_days: agency.credit_limit_days || 30,
            agreement_status: agency.agreement_status || 'active',
            commission_group: agency.commission_group || 'Standard',
            logo: agency.logo || ''
        });
        setSelectedAgency(agency);
        setError('');
        setViewMode('edit');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        if (!formData.name.trim()) {
            setError('Agency name is required');
            setIsSubmitting(false);
            return;
        }
        if (formData.portal_access_enabled) {
            if (!formData.username?.trim()) {
                setError('Username is required for portal access');
                setIsSubmitting(false);
                return;
            }
            if (viewMode === 'add' && !formData.password?.trim()) {
                setError('Password is required for new agency');
                setIsSubmitting(false);
                return;
            }
        }

        try {
            const payload = {
                ...formData,
                branch_id: branchData._id || branchData.id,
                organization_id: branchData.organization_id,
                credit_limit: parseFloat(formData.credit_limit) || 0,
                credit_limit_days: parseInt(formData.credit_limit_days) || 0
            };

            // Remove password/username if portal access is disabled
            if (!payload.portal_access_enabled) {
                delete payload.password;
                delete payload.username;
            } else if (viewMode === 'edit' && !payload.password) {
                // If editing and password is empty, don't send it
                delete payload.password;
            }

            let savedAgency;
            if (viewMode === 'edit') {
                savedAgency = await agencyAPI.update(selectedAgency._id || selectedAgency.id, payload);
                setAgencies(prev => prev.map(a => (a._id === savedAgency._id ? savedAgency : a)));
            } else {
                savedAgency = await agencyAPI.create(payload);
                setAgencies(prev => [...prev, savedAgency]);
            }

            setSelectedAgency(savedAgency);
            setViewMode('detail');
        } catch (err) {
            console.error(err);
            let errorMessage = 'Failed to save agency';
            if (err.response?.data?.detail) {
                if (typeof err.response.data.detail === 'string') {
                    errorMessage = err.response.data.detail;
                } else if (Array.isArray(err.response.data.detail)) {
                    errorMessage = err.response.data.detail.map(e => e.msg).join(', ');
                }
            }
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredAgencies = agencies.filter(agency => {
        const matchesSearch = agency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            agency.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            agency.code?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterType === 'all'
            ? true
            : filterType === 'active' ? agency.is_active
                : !agency.is_active;
        const matchesAgencyType = agencyTypeFilter === 'all'
            ? true
            : agency.agency_type === agencyTypeFilter;
        return matchesSearch && matchesFilter && matchesAgencyType;
    });

    const StatCard = ({ icon: Icon, label, value, color }) => (
        <div className={`flex-1 bg-${color}-50 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2 border border-${color}-100`}>
            <Icon className={`text-${color}-500`} size={24} />
            <span className={`text-2xl font-black text-${color}-600`}>{value}</span>
            <span className={`text-[10px] font-bold text-${color}-400 uppercase tracking-widest`}>{label}</span>
        </div>
    );

    // LIST VIEW
    if (viewMode === 'list') {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <Building2 className="text-blue-600" size={24} />
                            Agencies <span className="text-slate-400 text-sm">({filteredAgencies.length})</span>
                        </h1>
                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wide">
                            Manage your branch agency partners
                        </p>
                    </div>
                    <button
                        onClick={openAddForm}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:scale-105 transition-all"
                    >
                        <Plus size={16} />
                        <span>Add New Agency</span>
                    </button>
                </div>

                <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm">
                    <div className="space-y-4 mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search agencies..."
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-none"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active Only</option>
                                <option value="inactive">Inactive Only</option>
                            </select>
                            <select
                                value={agencyTypeFilter}
                                onChange={(e) => setAgencyTypeFilter(e.target.value)}
                                className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-none"
                            >
                                <option value="all">All Types</option>
                                <option value="full">Full Agency</option>
                                <option value="area">Area Agency</option>
                            </select>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
                    ) : filteredAgencies.length === 0 ? (
                        <div className="text-center p-12 text-slate-400 text-sm font-bold">No agencies found</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredAgencies.map(agency => (
                                <div
                                    key={agency._id || agency.id}
                                    onClick={() => handleViewAgencyDetails(agency)}
                                    className="p-6 rounded-2xl border border-slate-100 cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] active:scale-95 bg-white"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-black text-base text-slate-800">{agency.name}</h3>
                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${agency.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {agency.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium mb-3">{agency.code || 'NO-REF'}</p>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                            <Building size={12} />
                                            <span>{agency.contact_person || 'No Contact'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                            <Phone size={12} />
                                            <span>{agency.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                            <Mail size={12} />
                                            <span className="truncate">{agency.email}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ADD/EDIT FORM VIEW
    if (viewMode === 'add' || viewMode === 'edit') {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setViewMode('list')}
                        className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            {viewMode === 'add' ? 'Add New Agency' : 'Edit Agency'}
                        </h1>
                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wide">
                            {viewMode === 'add' ? 'Create a new agency partner' : `Editing: ${selectedAgency?.name}`}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Agency Name *</label>
                            <input required type="text" name="name" value={formData.name} onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100" placeholder="Enter agency name" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Contact Person *</label>
                            <input required type="text" name="contact_person" value={formData.contact_person} onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100" placeholder="Enter contact person" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone Number *</label>
                            <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100" placeholder="+92-3001234567" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100" placeholder="agency@example.com" />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Address</label>
                            <textarea name="address" value={formData.address} onChange={handleInputChange} rows="2"
                                className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 resize-none" placeholder="Enter agency address" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">City</label>
                            <input type="text" name="city" value={formData.city} onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100" placeholder="Enter city" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Credit Limit</label>
                            <input type="number" name="credit_limit" value={formData.credit_limit} onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100" placeholder="50000" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Credit Limit Days</label>
                            <input type="number" name="credit_limit_days" value={formData.credit_limit_days} onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100" placeholder="30" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Branch *</label>
                            <input type="text" value={branchData?.name || 'Current Branch'} readOnly
                                className="w-full px-4 py-3 bg-slate-100 rounded-2xl text-sm font-bold text-slate-500 cursor-not-allowed" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Agency Type</label>
                            <select name="agency_type" value={formData.agency_type} onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100">
                                <option value="full">Full Agency</option>
                                <option value="area">Area Agency</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Agreement Status</label>
                            <select name="agreement_status" value={formData.agreement_status} onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100">
                                <option value="active">Active</option>
                                <option value="pending">Pending</option>
                                <option value="suspended">Suspended</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Commission Group</label>
                            <select name="commission_group" value={formData.commission_group} onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100">
                                <option value="Standard">Standard</option>
                                <option value="Premium">Premium</option>
                            </select>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                        <div className="flex items-center gap-3 mb-4">
                            <input type="checkbox" name="portal_access_enabled" id="portal_access" checked={formData.portal_access_enabled} onChange={handleInputChange}
                                className="w-5 h-5 text-blue-600 rounded-lg bg-slate-100 border-none" />
                            <label htmlFor="portal_access" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Enable Portal Access</label>
                        </div>
                        {formData.portal_access_enabled && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Username</label>
                                    <input type="text" value={formData.username} readOnly className="w-full px-4 py-3 bg-slate-100 rounded-2xl text-sm font-bold text-slate-500" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Password</label>
                                    <input type="password" name="password" value={formData.password} onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100" placeholder={viewMode === 'edit' ? "Leave blank to keep" : "Enter password"} />
                                </div>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <div className="flex gap-4 pt-4 border-t border-slate-100">
                        <button type="button" onClick={() => setViewMode('list')} className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-100">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 flex justify-center items-center gap-2">
                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> {viewMode === 'edit' ? 'Update Agency' : 'Create Agency'}</>}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    // DETAIL VIEW (same as before, just with back button)
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setViewMode('list')}
                    className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Agency Details</h1>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wide">View and manage agency information</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => openEditForm(selectedAgency)}
                        className="flex items-center gap-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-colors"
                    >
                        <Edit2 size={14} /> Edit
                    </button>
                    <button
                        onClick={() => handleConfirmDelete(selectedAgency)}
                        className="flex items-center gap-1 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-colors"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                <div className="flex gap-6 mb-8">
                    <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300">
                        {selectedAgency.logo ? (
                            <img src={selectedAgency.logo} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                            <Building2 size={32} />
                        )}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-black text-slate-900 mb-1">{selectedAgency.name}</h2>
                        <p className="text-sm font-bold text-slate-500 mb-2">{selectedAgency.contact_person}</p>
                        <div className="flex gap-4 text-xs font-medium text-slate-400">
                            <span className="flex items-center gap-1"><Phone size={14} />{selectedAgency.phone}</span>
                            <span className="flex items-center gap-1"><Mail size={14} />{selectedAgency.email}</span>
                        </div>
                        <div className="mt-3 flex gap-2">
                            {!selectedAgency.portal_access_enabled && (
                                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                    Profile Missing
                                </span>
                            )}
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                                <MapPin size={14} /> {selectedAgency.address || 'No Address'}, {selectedAgency.city}
                            </span>
                        </div>
                    </div>
                    <span className="px-4 py-2 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-200 h-fit">
                        {selectedAgency.agreement_status} Agreement
                    </span>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-8">
                    <StatCard icon={Briefcase} label="Total Bookings" value={agencyStats.total_bookings} color="blue" />
                    <StatCard icon={CheckCircle2} label="On-Time Payments" value={agencyStats.on_time_payments} color="green" />
                    <StatCard icon={Clock} label="Late Payments" value={agencyStats.late_payments} color="amber" />
                    <StatCard icon={AlertTriangle} label="Disputes" value={agencyStats.disputes} color="red" />
                </div>

                <div className="border-t border-slate-100 pt-6">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-4">Additional Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="text-slate-400 font-bold">Code:</span> <span className="font-black text-slate-700">{selectedAgency.code || 'N/A'}</span></div>
                        <div><span className="text-slate-400 font-bold">Type:</span> <span className="font-black text-slate-700">{selectedAgency.agency_type || 'N/A'}</span></div>
                        <div><span className="text-slate-400 font-bold">Credit Limit:</span> <span className="font-black text-blue-600">Rs. {selectedAgency.credit_limit || 0}</span></div>
                        <div><span className="text-slate-400 font-bold">Commission Group:</span> <span className="font-black text-slate-700">{selectedAgency.commission_group || 'Standard'}</span></div>
                    </div>
                </div>

                {/* Agency Login Credentials */}
                {selectedAgency.portal_access_enabled && (
                    <div className="border-t border-slate-100 pt-6 mt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                                <ShieldCheck size={16} className="text-green-600" /> Agency Portal Access
                            </h3>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                Enabled
                            </span>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Username</label>
                                    <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-slate-200">
                                        <Mail size={16} className="text-slate-400" />
                                        <span className="text-sm font-bold text-slate-700">{selectedAgency.username || selectedAgency.email}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Login Email</label>
                                    <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-slate-200">
                                        <Mail size={16} className="text-slate-400" />
                                        <span className="text-sm font-bold text-slate-700">{selectedAgency.email}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <p className="text-xs font-bold text-blue-700 flex items-center gap-2">
                                    <AlertCircle size={14} />
                                    This agency can log in to the Agency Portal using their email and password
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgencyManagement;
