import React, { useState, useEffect } from 'react';
import { Building2, Truck, ShieldCheck, Plane, Utensils, DollarSign, ShoppingCart } from 'lucide-react';
import { inventoryAPI } from '../services/inventory';

const PackageInventory = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await inventoryAPI.getPackages({ is_active: true });
            setPackages(data);
        } catch (error) {
            console.error('Error fetching packages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBook = (pkg) => {
        alert(`Booking package: ${pkg.title}\nID: ${pkg._id}`);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600"></div>
        </div>
    );

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                <div>
                    <p className="text-[#0061FF] font-bold text-[10px] tracking-[0.2em] mb-2 uppercase">Inventory</p>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Packages</h1>
                </div>
            </div>

            <div className="space-y-6">
                {packages.length === 0 ? (
                    <div className="text-center p-12 bg-slate-50 rounded-[40px] border-2 border-slate-200 border-dashed">
                        <Building2 className="mx-auto text-slate-300 mb-4" size={48} />
                        <h3 className="text-xl font-black text-slate-400 uppercase tracking-wider mb-2">No Packages Available</h3>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Check back later for new offers</p>
                    </div>
                ) : (
                    packages.map(pkg => (
                        <PackageCard
                            key={pkg._id}
                            packageData={pkg}
                            onBook={handleBook}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

const PackageCard = ({ packageData, onBook }) => {
    const hotels = packageData.hotels || [];
    const prices = packageData.package_prices || {};

    return (
        <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm p-6 lg:p-10 hover:shadow-xl transition-all duration-500 group">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                <div className="flex-1">
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-3 group-hover:text-blue-600 transition-colors">{packageData.title}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                        {packageData.flight && (
                            <FeatureBadge icon={<Plane size={12} />} label="Flight Included" />
                        )}
                        {packageData.visa_pricing && (
                            <FeatureBadge icon={<ShieldCheck size={12} />} label="Visa Included" />
                        )}
                        {packageData.food && (
                            <FeatureBadge icon={<Utensils size={12} />} label="Food Included" />
                        )}
                        {packageData.transport && (
                            <FeatureBadge icon={<Truck size={12} />} label={packageData.transport.sector} />
                        )}
                    </div>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-2">{packageData.pax_capacity} Seats Capacity</span>
                    <div className="w-full sm:w-32 h-2.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-600 w-2/3"></div></div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-8">

                {/* Left Column: Services Details (7 cols) */}
                <div className="xl:col-span-7 space-y-6">

                    {/* Hotels */}
                    {hotels.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {hotels.map((hotel, index) => (
                                <QuickInfo
                                    key={index}
                                    label={`${hotel.city} Hotel`}
                                    value={hotel.name || 'Not specified'}
                                    icon={<Building2 size={16} />}
                                />
                            ))}
                        </div>
                    )}

                    {/* Flight Details */}
                    {packageData.flight && (
                        <div className="bg-slate-50 rounded-[28px] p-6 border border-slate-100">
                            <div className="flex items-center gap-2 mb-4">
                                <Plane size={18} className="text-blue-600" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Flight Details</span>
                            </div>

                            <div className="space-y-4">
                                {/* Outbound */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Outbound</p>
                                        <p className="text-sm font-black text-slate-900">{packageData.flight.airline}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Route</p>
                                        <p className="text-sm font-black text-slate-900">
                                            {packageData.flight.departure_city} <span className="text-slate-400 mx-1">→</span> {packageData.flight.arrival_city}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Pricing (5 cols) */}
                <div className="xl:col-span-5">
                    <div className="bg-slate-900 rounded-[32px] p-8 text-white h-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                                    <DollarSign size={20} className="text-emerald-400" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Box Office Pricing plan</span>
                            </div>

                            <div className="space-y-4">
                                {prices.sharing && <PriceRow label="Sharing" price={prices.sharing.selling} />}
                                {prices.quint && <PriceRow label="Quint" price={prices.quint.selling} />}
                                {prices.quad && <PriceRow label="Quad" price={prices.quad.selling} />}
                                {prices.triple && <PriceRow label="Triple" price={prices.triple.selling} />}
                                {prices.double && <PriceRow label="Double" price={prices.double.selling} />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Book Button */}
            <button
                onClick={() => onBook && onBook(packageData)}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.99]"
            >
                <ShoppingCart size={18} />
                Book This Package
            </button>
        </div>
    );
};

const FeatureBadge = ({ icon, label }) => (
    <span className="bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors hover:bg-white hover:shadow-sm">
        <span className="text-blue-600">{icon}</span>
        <span className="text-[10px] font-black uppercase tracking-wide">{label}</span>
    </span>
);

const QuickInfo = ({ label, value, icon }) => (
    <div className="min-w-0 bg-slate-50 rounded-2xl p-5 border border-slate-100 hover:bg-white hover:shadow-sm transition-all">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
        <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                {icon}
            </div>
            <span className="text-xs font-black text-slate-900 truncate uppercase tracking-tight" title={value}>{value}</span>
        </div>
    </div>
);

const PriceRow = ({ label, price }) => (
    <div className="flex items-center justify-between border-b border-white/10 pb-4 last:border-0 last:pb-0 group">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">{label}</span>
        <div className="text-right">
            <span className="text-[10px] text-emerald-400 font-bold mr-1.5 opacity-50">PKR</span>
            <span className="text-xl font-black tracking-tight">{price ? price.toLocaleString() : 'N/A'}</span>
        </div>
    </div>
);

export default PackageInventory;
