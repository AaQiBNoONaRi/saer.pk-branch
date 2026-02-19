import React, { useState, useEffect } from 'react';
import {
  Building2, Menu, X, Bell, Search, LogOut, ChevronRight,
  Ticket, CreditCard, Users, DollarSign, ArrowUpRight, ArrowDownRight,
  Plane, Eye
} from 'lucide-react';

import BranchLoginPage from './components/BranchLoginPage';
import Sidebar from './components/layout/Sidebar';
import { branchAuthAPI } from './services/api';

// Pages
import AgencyManagement from './pages/AgencyManagement';
import BranchEmployeeManagement from './pages/BranchEmployeeManagement';
import FlightInventory from './pages/FlightInventory';
import HotelInventory from './pages/HotelInventory';
import PackageInventory from './pages/PackageInventory';
// import TicketInventory from './pages/TicketInventory';
import TicketInventory from './pages/TicketInventory';
import BookingHistory from './pages/BookingHistory';
import Payments from './pages/Payments';
import AddBankAccount from './pages/AddBankAccount';

// --- SHARED UI COMPONENTS ---

const StatusBadge = ({ status }) => {
  const styles = {
    ACTIVE: "bg-blue-50 text-blue-600 border-blue-100",
    DONE: "bg-green-50 text-green-600 border-green-100",
    CONFIRMED: "bg-green-50 text-green-600 border-green-100",
    PENDING: "bg-orange-50 text-orange-600 border-orange-100",
    BOOKED: "bg-blue-50 text-blue-600 border-blue-100",
    CANCELLED: "bg-red-50 text-red-600 border-red-100",
    INACTIVE: "bg-slate-100 text-slate-500 border-slate-200"
  };
  return (
    <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border-2 tracking-widest ${styles[status] || styles.INACTIVE}`}>
      {status}
    </span>
  );
};

const KpiCard = ({ label, value, trend, trendUp, icon, color, subtext }) => (
  <div className="bg-white p-6 lg:p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group cursor-default relative overflow-hidden">
    <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10 transition-transform group-hover:scale-125 duration-700 ${color === 'green' ? 'bg-green-500' : 'bg-blue-500'}`}></div>

    <div className="relative z-10">
      <div className="flex justify-between items-start mb-8">
        <div className={`w-14 h-14 rounded-[22px] flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 duration-500 ${color === 'green' ? 'bg-green-600 shadow-green-100' : 'bg-blue-600 shadow-blue-100'}`}>
          {icon}
        </div>

        {trend && (
          <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest ${trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            <span>{trend}</span>
          </div>
        )}
      </div>

      <p className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 mb-2">{label}</p>
      <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2 group-hover:text-blue-600 transition-colors">{value}</h3>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4 flex items-center">
        {subtext}
        <ChevronRight size={12} className="ml-1 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
      </p>
    </div>
  </div>
);

const OrderStatusTracker = ({ label, total, done, booked, cancelled }) => {
  const percentage = (done / total) * 100;
  return (
    <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">{label} Status</h3>
        <span className="text-xs font-black text-slate-900">{total} Total</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="#F1F5F9" strokeWidth="10" fill="transparent" />
            <circle
              cx="50" cy="50" r="40" stroke="#3B82F6" strokeWidth="10" fill="transparent"
              strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * percentage) / 100} strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-slate-900">{Math.round(percentage)}%</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 w-full text-center">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Done</p>
            <p className="text-sm font-black text-green-600">{done}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Booked</p>
            <p className="text-sm font-black text-blue-600">{booked}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cancl</p>
            <p className="text-sm font-black text-red-600">{cancelled}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- PAGE COMPONENTS ---

const DashboardPage = () => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <KpiCard
        label="Today's Bookings"
        value="24"
        trend="+15%"
        trendUp={true}
        icon={<Ticket size={24} />}
        color="blue"
        subtext="View All Bookings"
      />
      <KpiCard
        label="Pending Payments"
        value="Rs. 125k"
        trend="-2%"
        trendUp={false}
        icon={<CreditCard size={24} />}
        color="blue"
        subtext="Financial Logs"
      />
      <KpiCard
        label="Active Customers"
        value="842"
        trend="+8%"
        trendUp={true}
        icon={<Users size={24} />}
        color="green"
        subtext="Client Database"
      />
      <KpiCard
        label="Monthly Revenue"
        value="Rs. 2.4M"
        trend="+12%"
        trendUp={true}
        icon={<DollarSign size={24} />}
        color="green"
        subtext="Revenue Reports"
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <OrderStatusTracker label="Tickets" total={150} done={100} booked={40} cancelled={10} />
      <OrderStatusTracker label="Hotels" total={80} done={45} booked={30} cancelled={5} />
      <OrderStatusTracker label="Visa" total={45} done={32} booked={10} cancelled={3} />
    </div>

    <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Recent Activity</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">LATEST BRANCH TRANSACTIONS</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:scale-105 transition-all">
          Generate Report
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-slate-50/50">
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">
              <th className="px-8 py-5">Customer</th>
              <th className="px-8 py-5">Service Type</th>
              <th className="px-8 py-5">Amount</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {[
              { name: "Ahmed Raza", service: "Flight Ticket - LHE to DXB", amount: "Rs. 85,000", status: "CONFIRMED" },
              { name: "Sara Malik", service: "Hotel Booking - 3 Nights", amount: "Rs. 45,000", status: "PENDING" },
              { name: "John Doe", service: "Visa Service - UK Standard", amount: "Rs. 320,000", status: "CANCELLED" },
              { name: "Zeeshan Ali", service: "Holiday Package - Turkey", amount: "Rs. 150,000", status: "DONE" },
            ].map((row, i) => (
              <tr key={i} className="hover:bg-blue-50/20 transition-all group cursor-pointer">
                <td className="px-8 py-6">
                  <p className="text-sm font-black text-slate-900">{row.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 tracking-tighter">REF: #SAER-{1024 + i}</p>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center space-x-2 text-xs font-black text-slate-600">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-blue-600">
                      <Plane size={14} />
                    </div>
                    <span>{row.service}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-sm font-black text-blue-600">{row.amount}</td>
                <td className="px-8 py-6"><StatusBadge status={row.status} /></td>
                <td className="px-8 py-6 text-right">
                  <button className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-blue-600 shadow-sm transition-all border border-transparent hover:border-slate-100">
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const BookingsPage = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
    <Building2 size={64} className="mb-4 opacity-20" />
    <h2 className="text-xl font-black uppercase tracking-widest">Bookings Module</h2>
    <p className="text-xs font-bold mt-2 uppercase tracking-tighter">Under Development</p>
  </div>
);

// --- MAIN APP COMPONENT ---

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [branchData, setBranchData] = useState(null);
  const [currentPage, setCurrentPage] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingAccount, setEditingAccount] = useState(null);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      if (branchAuthAPI.isAuthenticated()) {
        const data = branchAuthAPI.getUserData(); // Use getUserData to support employees too
        setBranchData(data);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = () => {
    const data = branchAuthAPI.getUserData();
    setBranchData(data);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    branchAuthAPI.logout();
    setBranchData(null);
    setIsLoggedIn(false);
    setCurrentPage('Dashboard');
  };

  if (!isLoggedIn) {
    return <BranchLoginPage onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'Dashboard': return <DashboardPage />;

      // Inventory
      case 'Inventory/Packages': return <PackageInventory />;
      case 'Inventory/Hotels': return <HotelInventory />;
      case 'Inventory/Tickets': return <TicketInventory />;
      case 'Inventory/Flights': return <FlightInventory />;

      // Operations
      case 'Bookings': return <BookingsPage />;
      case 'Agencies': return <AgencyManagement />;
      case 'Employees': return <BranchEmployeeManagement />;
      case 'Booking History': return <BookingHistory />;
      case 'Booking History': return <BookingHistory />;
      case 'Payments': return (
        <Payments
          onAddAccount={() => {
            setEditingAccount(null);
            setCurrentPage('Payments/Add');
          }}
          onEditAccount={(acc) => {
            setEditingAccount(acc);
            setCurrentPage('Payments/Add');
          }}
        />
      );
      case 'Payments/Add': return (
        <AddBankAccount
          onBack={() => {
            setEditingAccount(null);
            setCurrentPage('Payments');
          }}
          editingAccount={editingAccount}
        />
      );

      // Default / Placeholder
      default: return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
          <Building2 size={64} className="mb-4 opacity-20" />
          <h2 className="text-xl font-black uppercase tracking-widest">Section Under Construction</h2>
          <p className="text-xs font-bold mt-2 uppercase tracking-tighter">Module: {currentPage}</p>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden">

      {/* Sidebar Component */}
      <Sidebar
        activeTab={currentPage}
        setActiveTab={setCurrentPage}
        isSidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        setIsLoggedIn={setIsLoggedIn}
      />

      {/* Main Panel */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

        {/* Header */}
        <header className="h-24 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 z-40 shrink-0">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-3 bg-slate-50 rounded-2xl text-slate-500 hover:text-blue-600 transition-colors lg:hidden">
              <Menu size={20} />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-xs font-black uppercase tracking-[3px] text-slate-400 mb-1">Current Section</h2>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black text-slate-900 uppercase tracking-tight">
                  {currentPage.includes('/') ? currentPage.split('/')[1].replace('Add', 'Add New') : currentPage}
                </span>
                <ChevronRight size={16} className="text-slate-300" />
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-lg">LIVE PORTAL</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 lg:space-x-8">
            <div className="relative hidden md:flex items-center">
              <Search className="absolute left-4 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Global Search..."
                className="w-64 pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-100 text-xs font-bold transition-all w-48 focus:w-80"
              />
            </div>

            <div className="flex items-center space-x-3">
              <button className="relative p-3 bg-slate-50 rounded-2xl text-slate-500 hover:text-blue-600 transition-all hover:scale-110">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">3</span>
              </button>
              <button
                onClick={handleLogout}
                className="p-3 bg-red-50 rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all hover:scale-110"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 bg-[#F8FAFC] scrollbar-hide">
          <div className="max-w-[1600px] mx-auto min-h-full">
            {renderPage()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
