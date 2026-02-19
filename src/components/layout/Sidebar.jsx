import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, Box, Users, UsersRound, ScanLine,
    ShieldCheck, Truck, ClipboardList, LogOut, UserCircle,
    ChevronUp, ChevronDown, CreditCard, Landmark, Menu, X,
    Building2, Ticket, TrendingUp, Settings, Package, Plane, History
} from 'lucide-react';
import { branchAuthAPI } from '../../services/api';

export default function Sidebar({ activeTab, setActiveTab, isSidebarOpen, setSidebarOpen, setIsLoggedIn }) {
    const [isBookingsOpen, setBookingsOpen] = useState(false);
    const [isEntitiesOpen, setEntitiesOpen] = useState(false);
    const [isUserMenuOpen, setUserMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [userData, setUserData] = useState(null);

    // Sync mobile state
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (!mobile) setSidebarOpen(true);
            else setSidebarOpen(false);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, [setSidebarOpen]);

    useEffect(() => {
        const user = branchAuthAPI.getUserData();
        setUserData(user);
    }, []);

    const handleNavClick = (tab) => {
        setActiveTab(tab);
        if (isMobile) setSidebarOpen(false);
    };

    const handleLogout = () => {
        branchAuthAPI.logout();
        setIsLoggedIn(false);
    };

    return (
        <>
            {/* 1. Backdrop Overlay for Mobile */}
            {isSidebarOpen && isMobile && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[45] transition-opacity duration-300"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* 2. Main Sidebar Container */}
            <aside
                className={`fixed inset-y-0 left-0 lg:relative z-[50] flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out shrink-0 overflow-hidden shadow-xl lg:shadow-none
                ${isSidebarOpen ? 'w-72 translate-x-0' : isMobile ? 'w-72 -translate-x-full' : 'w-20 translate-x-0'}`}
            >
                {/* Logo Section */}
                <div className="p-6 flex items-center justify-between shrink-0 h-24 border-b border-slate-50">
                    <div className="flex items-center gap-3 overflow-hidden min-w-0">
                        <div className={`w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0 transition-all ${!isSidebarOpen && 'mx-auto'}`}>
                            <Building2 size={20} />
                        </div>
                        {isSidebarOpen && (
                            <div className="flex flex-col animate-in fade-in zoom-in-95 duration-300">
                                <h1 className="text-xl font-black text-blue-600 uppercase tracking-tighter">
                                    Saer<span className="text-slate-400">.Pk</span>
                                </h1>
                            </div>
                        )}
                    </div>
                    {isSidebarOpen && isMobile && (
                        <button onClick={() => setSidebarOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Scrollable Navigation Area */}
                <nav className="flex-1 overflow-y-auto px-4 space-y-4 py-6 scrollbar-hide">
                    <NavGroup title="Core Business" isOpen={isSidebarOpen}>
                        <NavItem
                            icon={<LayoutDashboard size={20} />}
                            label="Dashboard"
                            active={activeTab === 'Dashboard'}
                            onClick={() => handleNavClick('Dashboard')}
                            isOpen={isSidebarOpen}
                        />

                        <NavDropdown
                            icon={<Ticket size={20} />}
                            label="Bookings"
                            isOpen={isSidebarOpen}
                            isExpanded={isBookingsOpen}
                            onClick={() => setBookingsOpen(!isBookingsOpen)}
                            active={['Bookings', 'Inventory/Packages', 'Inventory/Hotels', 'Inventory/Flights', 'Inventory/Tickets'].includes(activeTab)}
                        >
                            <DropdownItem label="All Bookings" active={activeTab === 'Bookings'} onClick={() => handleNavClick('Bookings')} />
                            <DropdownItem label="Packages" active={activeTab === 'Inventory/Packages'} onClick={() => handleNavClick('Inventory/Packages')} />
                            <DropdownItem label="Hotels" active={activeTab === 'Inventory/Hotels'} onClick={() => handleNavClick('Inventory/Hotels')} />
                            <DropdownItem label="Tickets" active={activeTab === 'Inventory/Tickets'} onClick={() => handleNavClick('Inventory/Tickets')} />
                            <DropdownItem label="Flights" active={activeTab === 'Inventory/Flights'} onClick={() => handleNavClick('Inventory/Flights')} />
                        </NavDropdown>

                        <NavItem
                            icon={<CreditCard size={20} />}
                            label="Payments"
                            active={activeTab === 'Payments'}
                            onClick={() => handleNavClick('Payments')}
                            isOpen={isSidebarOpen}
                        />
                    </NavGroup>

                    <NavGroup title="Operations" isOpen={isSidebarOpen}>
                        <NavItem icon={<Plane size={20} />} label="Pax Movement" active={activeTab === 'Pax Movement'} onClick={() => handleNavClick('Pax Movement')} isOpen={isSidebarOpen} />

                        <NavDropdown
                            icon={<UsersRound size={20} />}
                            label="Entities"
                            isOpen={isSidebarOpen}
                            isExpanded={isEntitiesOpen}
                            onClick={() => setEntitiesOpen(!isEntitiesOpen)}
                            active={['Agencies', 'Employees'].includes(activeTab)}
                        >
                            <DropdownItem label="Agencies" active={activeTab === 'Agencies'} onClick={() => handleNavClick('Agencies')} />
                            <DropdownItem label="Employees" active={activeTab === 'Employees'} onClick={() => handleNavClick('Employees')} />
                        </NavDropdown>
                    </NavGroup>

                    <NavGroup title="CRM & Reports" isOpen={isSidebarOpen}>
                        <NavItem icon={<History size={20} />} label="Booking History" active={activeTab === 'Booking History'} onClick={() => handleNavClick('Booking History')} isOpen={isSidebarOpen} />
                        <NavItem icon={<UsersRound size={20} />} label="Customers" active={activeTab === 'Customers'} onClick={() => handleNavClick('Customers')} isOpen={isSidebarOpen} />
                        <NavItem icon={<TrendingUp size={20} />} label="Reports" active={activeTab === 'Reports'} onClick={() => handleNavClick('Reports')} isOpen={isSidebarOpen} />
                        <NavItem icon={<Settings size={20} />} label="Settings" active={activeTab === 'Settings'} onClick={() => handleNavClick('Settings')} isOpen={isSidebarOpen} />
                    </NavGroup>
                </nav>

                {/* Footer Profile Section */}
                <div className="p-4 border-t bg-slate-50 shrink-0 relative">
                    {isUserMenuOpen && isSidebarOpen && (
                        <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-2 duration-200 z-[60]">
                            {/*  Profile Setup - Optional
                            <button onClick={() => { handleNavClick('Settings'); setUserMenuOpen(false); }} className="w-full flex items-center space-x-3 p-4 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-50 text-left">
                                <UserCircle size={18} className="text-slate-400" />
                                <span>Profile Setup</span>
                            </button>
                            */}
                            <button onClick={handleLogout} className="w-full flex items-center space-x-3 p-4 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors text-left">
                                <LogOut size={18} />
                                <span>Logout</span>
                            </button>
                        </div>
                    )}

                    <div
                        className={`flex items-center p-2 rounded-2xl transition-all cursor-pointer hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 ${!isSidebarOpen ? 'justify-center' : ''}`}
                        onClick={() => isSidebarOpen && setUserMenuOpen(!isUserMenuOpen)}
                    >
                        <div className="flex items-center space-x-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center font-bold shadow-lg shrink-0 uppercase">
                                {userData?.username?.substring(0, 2) || userData?.name?.substring(0, 2) || 'BR'}
                            </div>
                            {isSidebarOpen && (
                                <div className="min-w-0 transition-opacity duration-200">
                                    <p className="text-xs font-black text-slate-800 uppercase truncate">
                                        {userData?.name || userData?.branch_name || userData?.username || 'Branch User'}
                                    </p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest truncate">
                                        {userData?.role === 'branch' ? 'Branch Manager' : userData?.role || 'User'}
                                    </p>
                                </div>
                            )}
                        </div>
                        {isSidebarOpen && (
                            <ChevronUp size={16} className={`ml-auto text-slate-300 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180 text-blue-600' : ''}`} />
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}

// --- HELPER COMPONENTS ---

const NavGroup = ({ title, children, isOpen }) => (
    <div className="mb-2 shrink-0">
        {isOpen ? (
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-3 pl-4 whitespace-nowrap animate-in fade-in duration-300">
                {title}
            </p>
        ) : (
            <div className="h-4" />
        )}
        <div className="space-y-1">{children}</div>
    </div>
);

const NavDropdown = ({ icon, label, children, isOpen, isExpanded, onClick, active }) => (
    <div className="overflow-hidden">
        <button
            onClick={onClick}
            className={`flex items-center justify-between w-full p-3 rounded-xl transition-all group ${active
                ? 'bg-blue-50 text-blue-600 shadow-sm'
                : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                } ${!isOpen ? 'justify-center' : ''}`}
        >
            <div className="flex items-center">
                <div className={`transition-colors ${active ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`}>{icon}</div>
                {isOpen && (
                    <span className="ml-3 text-[10px] font-black uppercase tracking-wider whitespace-nowrap">{label}</span>
                )}
            </div>
            {isOpen && (
                <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-blue-600' : 'text-slate-300'}`} />
            )}
        </button>
        <div className={`space-y-1 transition-all duration-300 ease-in-out ${isExpanded && isOpen ? 'max-h-96 opacity-100 mt-2 pb-2' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <div className={`pl-4 space-y-1 ${!isOpen && 'hidden'}`}>
                <div className="ml-4 pl-4 border-l-2 border-slate-100 space-y-1">
                    {children}
                </div>
            </div>
        </div>
    </div>
);

const NavItem = ({ icon, label, active, onClick, isOpen }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full p-3 rounded-xl transition-all group overflow-hidden ${active
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
            : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
            } ${!isOpen ? 'justify-center' : ''}`}
    >
        <div className={`shrink-0 transition-colors ${active ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`}>
            {icon}
        </div>
        {isOpen && (
            <span className="ml-3 text-[10px] font-black uppercase tracking-wider whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                {label}
            </span>
        )}
    </button>
);

const DropdownItem = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full text-left py-2 px-3 rounded-lg text-[9px] font-black uppercase tracking-[1.5px] transition-all whitespace-nowrap ${active ? 'text-blue-600 bg-blue-50/50 font-black' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
    >
        {label}
    </button>
);
