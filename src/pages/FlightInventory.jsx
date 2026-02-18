import React, { useState, useEffect } from 'react';
import { Search, MoveRight, Plane, ShoppingCart } from 'lucide-react';
import { inventoryAPI } from '../services/inventory';

const FlightInventory = () => {
    const [tickets, setTickets] = useState([]);
    const [airlines, setAirlines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchFilters, setSearchFilters] = useState({
        departureCity: '',
        arrivalCity: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [ticketsData, airlinesData] = await Promise.all([
                inventoryAPI.getFlights(),
                inventoryAPI.getAirlines()
            ]);
            setTickets(ticketsData);
            setAirlines(airlinesData);
        } catch (err) {
            setError(err.message || 'Failed to fetch data');
            console.error('Error fetching flight data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        try {
            setLoading(true);
            // Search by sector matches either departure or arrival
            const sector = searchFilters.departureCity || searchFilters.arrivalCity;
            const data = await inventoryAPI.getFlights({ sector });
            setTickets(data);
        } catch (err) {
            setError('Search failed');
        } finally {
            setLoading(false);
        }
    };

    const handleBook = (ticket) => {
        // In the future, this will open a booking modal
        alert(`Initiating booking for flight ID: ${ticket._id}`);
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
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Flight Tickets</h1>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-6 lg:p-10 rounded-[40px] border border-slate-100 shadow-sm flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-3">Departure</label>
                        <input
                            type="text"
                            placeholder="Karachi (KHI)"
                            value={searchFilters.departureCity}
                            onChange={(e) => setSearchFilters({ ...searchFilters, departureCity: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-bold text-sm"
                        />
                    </div>
                    <div className="hidden lg:flex items-center justify-center pt-8">
                        <MoveRight className="text-slate-200" size={24} />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-3">Destination</label>
                        <input
                            type="text"
                            placeholder="Jeddah (JED)"
                            value={searchFilters.arrivalCity}
                            onChange={(e) => setSearchFilters({ ...searchFilters, arrivalCity: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-bold text-sm"
                        />
                    </div>
                    <div className="lg:pt-6">
                        <button
                            onClick={handleSearch}
                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                        >
                            <Search size={16} /> Search
                        </button>
                    </div>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                    <p className="text-red-600 font-bold text-sm">{error}</p>
                    <button onClick={fetchData} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all">
                        Retry
                    </button>
                </div>
            )}

            {/* Tickets Grid */}
            {!error && (
                <div className="space-y-6">
                    {tickets.length === 0 ? (
                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px] p-12 text-center">
                            <Plane className="mx-auto text-slate-300 mb-4" size={48} />
                            <h3 className="text-xl font-black text-slate-400 uppercase tracking-wider mb-2">No Flights Found</h3>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Adjust your filters or try again later</p>
                        </div>
                    ) : (
                        tickets.map((ticket) => (
                            <TicketCard key={ticket._id} ticket={ticket} airlines={airlines} onBook={handleBook} />
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

const TicketCard = ({ ticket, airlines, onBook }) => {
    const { departure_trip, return_trip, total_seats, available_seats, adult_selling } = ticket;
    const selling = adult_selling || 0;

    const LegRow = ({ trip, isReturn }) => {
        const airlineData = airlines.find(a => a.airline_name === trip.airline);
        const logoUrl = airlineData?.logo_url ? `http://localhost:8000${airlineData.logo_url}` : null;

        return (
            <div className="flex items-center gap-6 py-4">
                {/* Airline Info */}
                <div className="w-40 shrink-0 flex items-center space-x-4">
                    <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center p-2 overflow-hidden shadow-sm">
                        {logoUrl ? (
                            <img
                                src={logoUrl}
                                alt={trip.airline}
                                className="w-full h-full object-contain"
                                onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'block'; }}
                            />
                        ) : null}
                        <Plane className={`${logoUrl ? 'hidden' : ''} ${isReturn ? 'text-emerald-500 rotate-180' : 'text-blue-500'}`} size={24} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">
                            {isReturn ? 'Return' : 'Departure'}
                        </p>
                        <p className="text-xs font-black text-slate-900 truncate uppercase leading-none">{trip.airline}</p>
                    </div>
                </div>

                {/* Route Visualizer */}
                <div className="flex-1 flex items-center gap-6">
                    <div className="text-left w-28">
                        <p className="text-xl font-black text-slate-900 leading-none mb-1.5">
                            {new Date(trip.departure_datetime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase truncate tracking-wide">{trip.departure_city}</p>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center px-4">
                        <div className="w-full flex items-center justify-between mb-2">
                            <span className={`text-[8px] font-black uppercase tracking-widest ${isReturn ? 'text-emerald-500' : 'text-blue-500'}`}>
                                {isReturn ? 'Inbound' : 'Outbound'}
                            </span>
                            <Plane size={12} className={`${isReturn ? 'text-emerald-500 rotate-180' : 'text-blue-500'}`} />
                        </div>
                        <div className="w-full h-0.5 bg-slate-100 relative">
                            <div className={`absolute top-0 bottom-0 left-0 right-0 rounded-full opacity-30 ${isReturn ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                            {new Date(trip.departure_datetime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                    </div>

                    <div className="text-right w-28">
                        <p className="text-xl font-black text-slate-900 leading-none mb-1.5">
                            {new Date(trip.arrival_datetime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase truncate tracking-wide">{trip.arrival_city}</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden flex flex-col xl:flex-row group">
            {/* Left: Flight Details */}
            <div className="flex-1 p-8 xl:p-10 space-y-2 border-b xl:border-b-0 xl:border-r border-slate-100">
                <LegRow trip={departure_trip} isReturn={false} />
                {return_trip && (
                    <>
                        <div className="py-2"><div className="border-t border-slate-100 border-dashed"></div></div>
                        <LegRow trip={return_trip} isReturn={true} />
                    </>
                )}
            </div>

            {/* Right: Pricing & Actions */}
            <div className="w-full xl:w-96 bg-slate-50 p-8 xl:p-10 flex flex-col justify-between">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Seats</span>
                        <span className={`text-sm font-black ${available_seats < 5 ? 'text-red-500' : 'text-slate-900'}`}>
                            {available_seats} / {total_seats}
                        </span>
                    </div>

                    <div className="p-6 bg-white rounded-[24px] border border-slate-100 shadow-sm">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Price Per Adult</p>
                            <p className="text-3xl font-black text-blue-600">Rs. {selling.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <button
                        onClick={() => onBook && onBook(ticket)}
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <ShoppingCart size={16} />
                        Book Ticket
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FlightInventory;
