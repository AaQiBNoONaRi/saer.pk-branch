import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, Building2, User, Lock, AlertCircle, CheckCircle2, Users } from 'lucide-react';
import { branchAuthAPI } from '../services/api';

export default function BranchLoginPage({ onLogin }) {
    // 'branch' | 'employee'
    const [loginMode, setLoginMode] = useState('branch');

    const [identifier, setIdentifier] = useState('');  // email/username for branch; emp_id for employee
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus(null);
        setErrorMessage('');

        try {
            if (loginMode === 'branch') {
                await branchAuthAPI.login(identifier, password);
            } else {
                await branchAuthAPI.loginEmployee(identifier, password);
            }
            setStatus('success');
            setTimeout(() => onLogin(loginMode), 800);
        } catch (error) {
            setStatus('error');
            const detail = error.response?.data?.detail;
            let msg = 'Unable to connect to server. Please try again.';
            if (typeof detail === 'string') {
                msg = detail;
            } else if (Array.isArray(detail)) {
                msg = detail.map(e => e.msg || JSON.stringify(e)).join(', ');
            } else if (error.response?.status === 401) {
                msg = 'Invalid credentials. Please try again.';
            } else if (error.response?.status === 403) {
                msg = 'Access denied. Portal access may be disabled or account deactivated.';
            }
            setErrorMessage(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const isEmployee = loginMode === 'employee';

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-sans text-left">
            <div className="w-full max-w-[900px] flex bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 flex-col lg:flex-row animate-in zoom-in-95 duration-500">

                {/* Left Side: Branding */}
                <div className="lg:w-[40%] bg-gradient-to-br from-blue-600 to-blue-700 p-8 lg:p-12 flex flex-col items-center justify-center relative min-h-[200px] lg:min-h-[480px] overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24 blur-3xl pointer-events-none" />

                    <div className="relative z-10 bg-white rounded-3xl p-10 shadow-2xl mb-8">
                        {isEmployee
                            ? <Users size={80} className="text-blue-600" />
                            : <Building2 size={80} className="text-blue-600" />}
                    </div>

                    <h2 className="relative z-10 text-white text-center">
                        <span className="block text-2xl font-black uppercase tracking-tight mb-2">
                            {isEmployee ? 'Employee Portal' : 'Branch Portal'}
                        </span>
                        <span className="block text-sm font-bold uppercase tracking-widest opacity-80">Saer.Pk</span>
                    </h2>
                </div>

                {/* Right Side: Login Form */}
                <div className="flex-1 p-6 lg:p-12 flex flex-col justify-center text-left bg-white">
                    <div className="max-w-sm w-full mx-auto lg:mx-0">
                        <h1 className="text-2xl lg:text-3xl font-black text-slate-900 mb-1 uppercase tracking-tight">
                            {isEmployee ? 'Employee Login' : 'Branch Login'}
                        </h1>
                        <p className="text-slate-400 font-bold mb-6 uppercase text-[10px] tracking-[0.2em]">Secure Access Portal</p>

                        {/* Mode Toggle */}
                        <div className="flex bg-slate-100 rounded-xl p-1 mb-6 gap-1">
                            {[['branch', 'Branch'], ['employee', 'Employee']].map(([mode, label]) => (
                                <button
                                    key={mode}
                                    type="button"
                                    onClick={() => { setLoginMode(mode); setIdentifier(''); setStatus(null); setErrorMessage(''); }}
                                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${loginMode === mode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        <form className="space-y-4" onSubmit={handleLogin}>
                            {/* Identifier Field */}
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                    {isEmployee ? 'Email Address' : 'Email / Username'}
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type={isEmployee ? 'email' : 'text'}
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        placeholder={isEmployee ? 'Enter your email address' : 'Enter your email or username'}
                                        autoComplete="username"
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 ring-blue-50 transition-all font-bold text-slate-800 text-sm placeholder:font-normal placeholder:text-slate-400"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 ring-blue-50 transition-all font-bold text-slate-800 text-sm placeholder:font-normal placeholder:text-slate-400"
                                        required
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        disabled={isLoading}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Error Message */}
                            {status === 'error' && errorMessage && (
                                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start space-x-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-black text-red-600 uppercase tracking-wider mb-1">Login Failed</p>
                                        <p className="text-xs font-bold text-red-500">{errorMessage}</p>
                                    </div>
                                </div>
                            )}

                            {/* Success Message */}
                            {status === 'success' && (
                                <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center space-x-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <CheckCircle2 size={20} className="text-green-600" />
                                    <p className="text-xs font-black text-green-600 uppercase tracking-wider">Login Successful! Redirecting...</p>
                                </div>
                            )}

                            {/* Login Button */}
                            <button
                                type="submit"
                                disabled={isLoading || status === 'success'}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-3"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        <span>Authenticating...</span>
                                    </>
                                ) : (
                                    <span>Access {isEmployee ? 'Employee' : 'Branch'} Portal</span>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest">
                                Need help? Contact your organization admin
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
