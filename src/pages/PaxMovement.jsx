import React from 'react';
import {
    Users, MapPin, Plane, Loader2, CheckCircle2,
    Search, Filter, RefreshCw, Building2, Landmark, Hourglass
} from 'lucide-react';

const StatCard = ({ label, value, icon, color }) => {
    const colorStyles = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-emerald-50 text-emerald-600",
        orange: "bg-orange-50 text-orange-600",
        slate: "bg-slate-100 text-slate-600",
        cyan: "bg-cyan-50 text-cyan-600",
    };

    return (
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorStyles[color]} transition-transform group-hover:scale-110`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};

const PaxMovement = () => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Plane className="text-blue-600" size={24} />
                        Pax Movement & Intimation
                    </h1>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wide">
                        Track passenger entry/exit and verify KSA movements
                    </p>
                </div>

                <button className="flex items-center space-x-2 bg-white border border-slate-200 text-blue-600 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
                    <RefreshCw size={14} />
                    <span>Refresh Data</span>
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                <StatCard
                    label="Total Passengers"
                    value="0"
                    icon={<Users size={18} />}
                    color="blue"
                />
                <StatCard
                    label="In Pakistan PK"
                    value="0"
                    icon={<MapPin size={18} />}
                    color="slate"
                />
                <StatCard
                    label="In Flight"
                    value="0"
                    icon={<Plane size={18} />}
                    color="cyan"
                />
                <StatCard
                    label="In Makkah"
                    value="0"
                    icon={<Building2 size={18} />}
                    color="green"
                />
                <StatCard
                    label="In Madina"
                    value="0"
                    icon={<Landmark size={18} />}
                    color="green"
                />
                <StatCard
                    label="Exit Pending"
                    value="0"
                    icon={<Hourglass size={18} />}
                    color="orange"
                />
                <StatCard
                    label="Exited KSA"
                    value="0"
                    icon={<CheckCircle2 size={18} />}
                    color="green"
                />
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search by name, passport, pax ID, or agent..."
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-slate-100 focus:ring-2 focus:ring-blue-100 focus:border-blue-200 text-xs font-bold text-slate-700 outline-none transition-all shadow-sm hover:shadow-md"
                    />
                </div>

                <div className="flex gap-4">
                    {/* Status Filter */}
                    <div className="relative group">
                        <button className="h-full px-5 bg-white border border-slate-100 rounded-2xl flex items-center space-x-2 text-slate-600 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm">
                            <Filter size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Entered KSA</span>
                        </button>
                    </div>

                    {/* City Filter */}
                    <div className="relative">
                        <button className="h-full px-5 bg-white border border-slate-100 rounded-2xl flex items-center space-x-2 text-slate-600 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm">
                            <MapPin size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">All Cities</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content / Empty State */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm min-h-[400px] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-slate-300">
                    <Users size={32} />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">No passengers found</h3>
                <p className="text-xs font-bold text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Try adjusting your search or filter criteria to see passenger details.
                </p>
            </div>

        </div>
    );
};

export default PaxMovement;
