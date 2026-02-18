import React, { useState, useEffect } from 'react';
import { Tag, Search, Archive, ShoppingCart, Plane } from 'lucide-react';
import { inventoryAPI } from '../services/inventory';

const TicketInventory = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await inventoryAPI.getTicketInventory({ group_name: filter, is_active: true });
            setTickets(data);
        } catch (error) {
            console.error('Error fetching ticket inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchData();
    };

    const handleBook = (ticket) => {
        alert(`Booking items from group: ${ticket.group_name}\nID: ${ticket._id}`);
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
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Bulk Tickets</h1>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 lg:p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-end">
                <div className="flex-1 w-full">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-3">Group Name / Airline</label>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search ticket groups..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
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
                {tickets.length === 0 ? (
                    <div className="col-span-full text-center p-12 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                        <Archive className="mx-auto text-slate-300 mb-4" size={48} />
                        <h3 className="text-xl font-black text-slate-400 uppercase tracking-wider mb-2">No Ticket Groups Found</h3>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Adjust filters to see improved results</p>
                    </div>
                ) : (
                    tickets.map(ticket => (
                        <TicketInventoryCard key={ticket._id} ticket={ticket} onBook={handleBook} />
                    ))
                )}
            </div>
        </div>
    );
};

const TicketInventoryCard = ({ ticket, onBook }) => (
    <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full group">
        <div className="p-8 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                    <Plane size={24} />
                </div>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                    {ticket.trip_type}
                </span>
            </div>

            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2 leading-tight">{ticket.group_name}</h3>

            <div className="flex items-center gap-2 mb-6">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Airline:</span>
                <span className="text-sm font-black text-slate-700 uppercase">{ticket.airline}</span>
            </div>

            <div className="space-y-4 flex-1">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Available</span>
                    <span className="text-sm font-black text-slate-900">{ticket.available_qty} / {ticket.total_qty}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">PNR</span>
                    <span className="text-sm font-black text-slate-900 tracking-wide font-mono">{ticket.pnr || 'N/A'}</span>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-end justify-between">
                <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Price</p>
                    <p className="text-2xl font-black text-blue-600">Rs. {(ticket.selling_price || 0).toLocaleString()}</p>
                </div>
            </div>
        </div>

        <button
            onClick={() => onBook && onBook(ticket)}
            className="mx-8 mb-8 py-4 bg-slate-900 text-white hover:bg-blue-600 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 shadow-lg group-hover:shadow-blue-200"
        >
            <ShoppingCart size={16} />
            Book Now
        </button>
    </div>
);

export default TicketInventory;
