import React, { useState, useEffect } from 'react';
import { Building2, Search, MapPin, Star, ShoppingCart } from 'lucide-react';
import { inventoryAPI } from '../services/inventory';

const HotelInventory = () => {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cityFilter, setCityFilter] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await inventoryAPI.getHotels({ city: cityFilter });
            setHotels(data);
        } catch (error) {
            console.error('Error fetching hotels:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchData();
    };

    const handleBook = (hotel) => {
        alert(`Booking hotel: ${hotel.name}\nID: ${hotel._id}`);
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
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Hotels</h1>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 lg:p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-end">
                <div className="flex-1 w-full">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-3">City / Location</label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="e.g. Makkah"
                            value={cityFilter}
                            onChange={(e) => setCityFilter(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-bold text-sm"
                        />
                    </div>
                </div>
                <button
                    onClick={handleSearch}
                    className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 h-[46px]"
                >
                    <Search size={16} /> Filter
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotels.length === 0 ? (
                    <div className="col-span-full text-center p-12 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                        <Building2 className="mx-auto text-slate-300 mb-4" size={48} />
                        <h3 className="text-xl font-black text-slate-400 uppercase tracking-wider mb-2">No Hotels Found</h3>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Try searching for a different city</p>
                    </div>
                ) : (
                    hotels.map(hotel => (
                        <HotelCard key={hotel._id} hotel={hotel} onBook={handleBook} />
                    ))
                )}
            </div>
        </div>
    );
};

const HotelCard = ({ hotel, onBook }) => {
    return (
        <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden group flex flex-col h-full">
            <div className="h-48 bg-slate-100 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-slate-300 bg-slate-200">
                    <Building2 size={48} className="opacity-50" />
                </div>
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>

                <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
                    <div>
                        <span className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow-lg">
                            {hotel.city}
                        </span>
                    </div>
                    <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < (hotel.star_rating || 0) ? "currentColor" : "none"} className={i < (hotel.star_rating || 0) ? "" : "text-slate-400/50"} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2 leading-tight min-h-[3.5rem]">{hotel.name}</h3>
                <div className="space-y-4 mb-6 flex-1">
                    <p className="text-xs font-bold text-slate-500 line-clamp-3 leading-relaxed">{hotel.description || 'No description available.'}</p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Starting From</span>
                        {/* Placeholder price if not available directly on hotel object */}
                        <span className="text-lg font-black text-blue-600">On Request</span>
                    </div>
                </div>

                <button
                    onClick={() => onBook && onBook(hotel)}
                    className="w-full py-4 bg-slate-50 text-slate-900 hover:bg-blue-600 hover:text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-blue-100"
                >
                    <ShoppingCart size={16} />
                    Check Availability
                </button>
            </div>
        </div>
    );
};

export default HotelInventory;
