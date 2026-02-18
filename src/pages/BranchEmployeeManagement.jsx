import React, { useState, useEffect } from 'react';
import {
    Users, Plus, Search, Mail, Phone, ArrowLeft,
    Edit2, Trash2, ShieldCheck, Loader2, AlertCircle,
    Eye, EyeOff, UserCheck, Save, Building
} from 'lucide-react';
import { employeeAPI, branchAuthAPI } from '../services/api';

const BranchEmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list', 'add', 'edit'
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const userData = branchAuthAPI.getUserData();
    const branchId = userData?.type === 'branch' ? (userData._id || userData.id) : userData?.entity_id;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'agent',
        password: '',
        is_active: true,
        portal_access_enabled: true,
        username: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const fetchEmployees = async () => {
        try {
            if (branchId) {
                const data = await employeeAPI.getAll(branchId);
                setEmployees(data);
            }
        } catch (err) {
            console.error("Failed to fetch employees", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            const updates = { [name]: type === 'checkbox' ? checked : value };
            if (name === 'email' && prev.portal_access_enabled) {
                updates.username = value;
            }
            return { ...prev, ...updates };
        });
    };

    const openAddForm = () => {
        setEditingEmployee(null);
        setFormData({
            name: '',
            email: '',
            phone: '',
            role: 'agent',
            password: '',
            is_active: true,
            portal_access_enabled: true,
            username: ''
        });
        setShowPassword(false);
        setError('');
        setViewMode('add');
    };

    const openEditForm = (employee) => {
        setEditingEmployee(employee);
        setFormData({
            name: employee.name || '',
            email: employee.email || '',
            phone: employee.phone || '',
            role: employee.role || 'agent',
            password: '',
            is_active: employee.is_active ?? true,
            portal_access_enabled: employee.portal_access_enabled ?? true,
            username: employee.username || employee.email || ''
        });
        setShowPassword(false);
        setError('');
        setViewMode('edit');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        if (!formData.name.trim()) {
            setError('Employee name is required');
            setIsSubmitting(false);
            return;
        }

        if (formData.portal_access_enabled) {
            if (!formData.username?.trim()) {
                setError('Username is required for portal access');
                setIsSubmitting(false);
                return;
            }
            if (!editingEmployee && !formData.password?.trim()) {
                setError('Password is required for new employees');
                setIsSubmitting(false);
                return;
            }
        }

        try {
            const payload = {
                ...formData,
                entity_type: 'branch',
                entity_id: branchId
            };

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
            let errorMessage = 'Failed to save employee';
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

    const handleDelete = async (employee) => {
        if (!window.confirm(`Are you sure you want to delete "${employee.name}"?`)) return;
        try {
            await employeeAPI.delete(employee._id || employee.id);
            setEmployees(prev => prev.filter(e => (e._id || e.id) !== (employee._id || employee.id)));
        } catch (err) {
            alert('Failed to delete employee');
        }
    };

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.emp_id?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // LIST VIEW
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
                            Manage your branch staff members
                        </p>
                    </div>
                    <button
                        onClick={openAddForm}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:scale-105 transition-all"
                    >
                        <Plus size={16} />
                        <span>Add New Employee</span>
                    </button>
                </div>

                <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm">
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search employees..."
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
                    ) : filteredEmployees.length === 0 ? (
                        <div className="text-center p-12 text-slate-400 text-sm font-bold">No employees found</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredEmployees.map(employee => (
                                <div
                                    key={employee._id || employee.id}
                                    className="p-6 rounded-2xl border border-slate-100 transition-all hover:shadow-xl hover:scale-[1.02] bg-white"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <h3 className="font-black text-base text-slate-800 mb-1">{employee.name}</h3>
                                            <p className="text-xs text-slate-500 font-medium">{employee.emp_id || 'NO-ID'}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${employee.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {employee.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                            <Mail size={12} />
                                            <span className="truncate">{employee.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                            <Phone size={12} />
                                            <span>{employee.phone || 'No phone'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                            <UserCheck size={12} />
                                            <span className="uppercase">{employee.role || 'agent'}</span>
                                        </div>
                                    </div>

                                    {employee.portal_access_enabled && (
                                        <div className="mb-4 px-3 py-2 bg-green-50 rounded-xl flex items-center gap-2">
                                            <ShieldCheck size={14} className="text-green-600" />
                                            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Portal Enabled</span>
                                        </div>
                                    )}

                                    <div className="flex gap-2 pt-4 border-t border-slate-100">
                                        <button
                                            onClick={() => openEditForm(employee)}
                                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-colors"
                                        >
                                            <Edit2 size={12} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(employee)}
                                            className="px-3 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                                        >
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

    // ADD/EDIT FORM VIEW
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
                        {viewMode === 'add' ? 'Add New Employee' : 'Edit Employee'}
                    </h1>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wide">
                        {viewMode === 'add' ? 'Create a new staff member' : `Editing: ${editingEmployee?.name}`}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-8">
                {/* Employee Information */}
                <div>
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
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Role</label>
                            <select name="role" value={formData.role} onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100">
                                <option value="agent">Agent</option>
                                <option value="manager">Manager</option>
                                <option value="supervisor">Supervisor</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Branch</label>
                            <input type="text" value={userData?.name || userData?.branch_name || 'Current Branch'} readOnly
                                className="w-full px-4 py-3 bg-slate-100 rounded-2xl text-sm font-bold text-slate-500 cursor-not-allowed" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</label>
                            <select name="is_active" value={formData.is_active} onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100">
                                <option value={true}>Active</option>
                                <option value={false}>Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Portal Access */}
                <div className="border-t border-slate-100 pt-8">
                    <div className="flex items-center gap-3 mb-6">
                        <input type="checkbox" name="portal_access_enabled" id="portal_access" checked={formData.portal_access_enabled} onChange={handleInputChange}
                            className="w-5 h-5 text-blue-600 rounded-lg bg-slate-100 border-none" />
                        <label htmlFor="portal_access" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Enable Portal Access</label>
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
                                    Password {viewMode === 'edit' ? '(Leave blank to keep)' : '*'}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 pr-12"
                                        placeholder={viewMode === 'edit' ? "Leave blank to keep" : "Enter password"}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
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
                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> {viewMode === 'edit' ? 'Update Employee' : 'Create Employee'}</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BranchEmployeeManagement;
