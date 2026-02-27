import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Building2, Menu, ChevronRight, Bell, Search, LogOut } from 'lucide-react';

import BranchLoginPage from './components/BranchLoginPage';
import Sidebar from './components/layout/Sidebar';
import { branchAuthAPI } from './services/api';

// ---------------------------------------------------------------------------
// Pages — same set as the agency portal
// ---------------------------------------------------------------------------
import Dashboard from './pages/Dashboard';
import AgentUmrahCalculator from './pages/UmrahCalculator';   // renamed export handled below
import AgencyManagement from './pages/AgencyManagement';
import BranchEmployeeManagement from './pages/BranchEmployeeManagement';
import UmrahPackagePage from './pages/UmrahPackagePage';
import UmrahBookingPage from './pages/UmrahBookingPage';
import TicketPage from './pages/TicketPage';
import CustomBookingPage from './pages/CustomBookingPage';
import BookingHistory from './pages/BookingHistory';
import Payments from './pages/Payments';
import AddBankAccount from './pages/AddBankAccount';
import HotelsPage from './pages/HotelsPage';
import PaxMovement from './pages/PaxMovement';
import BookingVoucher from './pages/BookingVoucher';
import BookingInvoice from './pages/BookingInvoice';

// --- MAIN APP ---
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [branchData, setBranchData] = useState(null);
  const [userType, setUserType] = useState('branch'); // 'branch' | 'employee'
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [editingAccount, setEditingAccount] = useState(null);

  // Umrah Package booking state
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [bookingFlights, setBookingFlights] = useState([]);
  const [bookingAirlines, setBookingAirlines] = useState([]);

  // Custom Umrah (Calculator → Booking) state
  const [customBookingData, setCustomBookingData] = useState(null);

  // Booking Voucher / Invoice state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedBookingType, setSelectedBookingType] = useState(null);

  // Check auth on mount
  useEffect(() => {
    if (branchAuthAPI.isAuthenticated()) {
      const userData = branchAuthAPI.getUserData();
      setBranchData(userData);
      // Determine stored type — employee_data in localStorage means employee
      const type = localStorage.getItem('employee_data') ? 'employee' : 'branch';
      setUserType(type);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (mode = 'branch') => {
    setBranchData(branchAuthAPI.getUserData());
    setUserType(mode);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    branchAuthAPI.logout();
    setBranchData(null);
    setIsLoggedIn(false);
    setActiveTab('Dashboard');
  };

  // Package → booking flow (mirrors agency)
  const handleBookPackage = (pkg, flights = [], airlines = []) => {
    setSelectedPackage(pkg);
    setBookingFlights(flights);
    setBookingAirlines(airlines);
    setActiveTab('Umrah Package Booking');
  };

  // Calculator → custom booking flow (mirrors agency)
  const handleBookCustomPackage = (data) => {
    setCustomBookingData(data);
    setActiveTab('Custom Umrah Booking');
  };

  // History → Voucher / Invoice
  const handleViewVoucher = (booking, type) => {
    setSelectedBooking(booking);
    setSelectedBookingType(type);
    setActiveTab('Booking/Voucher');
  };
  const handleViewInvoice = (booking, type) => {
    setSelectedBooking(booking);
    setSelectedBookingType(type);
    setActiveTab('Booking/Invoice');
  };

  if (!isLoggedIn) return <BranchLoginPage onLogin={handleLogin} />;

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <Dashboard />;

      // ── Custom Umrah (Calculator) ────────────────────────────────────────
      case 'Custom Umrah':
        return <AgentUmrahCalculator onBookCustomPackage={handleBookCustomPackage} />;
      case 'Custom Umrah Booking':
        return customBookingData ? (
          <CustomBookingPage
            calculatorData={customBookingData}
            onBack={() => {
              setActiveTab('Custom Umrah');
              setCustomBookingData(null);
            }}
          />
        ) : null;

      // ── Umrah Package ───────────────────────────────────────────────────
      case 'Umrah Package':
        return <UmrahPackagePage onBookPackage={handleBookPackage} />;
      case 'Umrah Package Booking':
        return selectedPackage ? (
          <UmrahBookingPage
            packageData={selectedPackage}
            flights={bookingFlights}
            airlines={bookingAirlines}
            onBack={() => {
              setActiveTab('Umrah Package');
              setSelectedPackage(null);
            }}
          />
        ) : null;

      // ── Ticket ──────────────────────────────────────────────────────────
      case 'Ticket':
        return <TicketPage />;

      // ── Hotels ─────────────────────────────────────────────────────────
      case 'Hotels':
        return <HotelsPage />;

      // ── Entities ───────────────────────────────────────────────────────
      case 'Agencies':
        return <AgencyManagement />;
      case 'Employees':
        return <BranchEmployeeManagement />;

      // ── Payments ────────────────────────────────────────────────────────
      case 'Payments':
        return (
          <Payments
            onAddAccount={() => { setEditingAccount(null); setActiveTab('Payments/Add'); }}
            onEditAccount={(acc) => { setEditingAccount(acc); setActiveTab('Payments/Add'); }}
          />
        );
      case 'Payments/Add':
        return (
          <AddBankAccount
            onBack={() => { setEditingAccount(null); setActiveTab('Payments'); }}
            editingAccount={editingAccount}
          />
        );

      // ── Booking History ─────────────────────────────────────────────────
      case 'Booking History':
        return (
          <BookingHistory
            onViewVoucher={handleViewVoucher}
            onViewInvoice={handleViewInvoice}
          />
        );
      case 'Booking/Voucher':
        return (
          <BookingVoucher
            booking={selectedBooking}
            bookingType={selectedBookingType}
            onBack={() => setActiveTab('Booking History')}
          />
        );
      case 'Booking/Invoice':
        return (
          <BookingInvoice
            booking={selectedBooking}
            bookingType={selectedBookingType}
            onBack={() => setActiveTab('Booking History')}
          />
        );

      // ── Umrah Calculator (standalone) ────────────────────────────────────
      case 'Umrah Calculator':
        return <AgentUmrahCalculator />;

      // ── Pax Movement ────────────────────────────────────────────────────
      case 'Pax Movement':
        return <PaxMovement />;

      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
            <Building2 size={64} className="mb-4 opacity-20" />
            <h2 className="text-xl font-black uppercase tracking-widest">Section Under Construction</h2>
            <p className="text-xs font-bold mt-2 uppercase tracking-tighter">Module: {activeTab}</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Toaster position="top-right" />
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setSidebarOpen={setSidebarOpen}
        setIsLoggedIn={setIsLoggedIn}
        userType={userType}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 shrink-0">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors lg:hidden">
              <Menu size={22} />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-xs font-black uppercase tracking-[3px] text-slate-400 mb-0.5">Current Section</h2>
              <div className="flex items-center space-x-2">
                <span className="text-base font-black text-slate-900 uppercase tracking-tight">{activeTab}</span>
                <ChevronRight size={14} className="text-slate-300" />
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-lg">Branch Portal</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative hidden md:flex items-center">
              <Search className="absolute left-3 text-slate-400" size={16} />
              <input type="text" placeholder="Search..." className="w-56 pl-10 pr-4 py-2 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-100 text-xs font-bold transition-all focus:w-72 outline-none" />
            </div>
            <button className="p-2 bg-slate-50 rounded-xl text-slate-500 hover:text-blue-600 transition-all">
              <Bell size={18} />
            </button>
            <button onClick={handleLogout} className="p-2 bg-red-50 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
