import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Ledger from './components/Ledger';
import ApprovalQueue from './components/ApprovalQueue';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { label: 'Profile', icon: '👤' },
    { label: 'Settings', icon: '⚙️' },
    { label: 'Help & Support', icon: '❓' },
    { divider: true },
    { label: 'Sign Out', icon: '🚪', danger: true },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 font-jost text-cura-dark">
      {/* Sidebar - Dark theme from branding image */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold capitalize">
            {activeTab.replace('-', ' ')}
          </h1>

          {/* Profile Avatar + Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <span className="text-cura-grey text-sm hidden sm:inline">Welcome, Manager</span>
              <div className="w-10 h-10 rounded-full bg-cura-blue text-white flex items-center justify-center font-bold shadow-md">
                M
              </div>
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div className="absolute right-0 top-14 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-bold text-sm">Manager</p>
                  <p className="text-cura-grey text-xs">manager@cura.org</p>
                </div>

                {/* Menu Items */}
                {menuItems.map((item, i) =>
                  item.divider ? (
                    <div key={i} className="h-px bg-gray-100 my-1" />
                  ) : (
                    <button
                      key={item.label}
                      onClick={() => setMenuOpen(false)}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors cursor-pointer ${
                        item.danger
                          ? 'text-red-500 hover:bg-red-50'
                          : 'text-cura-dark hover:bg-gray-50'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Route Rendering */}
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'inventory' && <Inventory />}
        {activeTab === 'ledger' && <Ledger />}
        {activeTab === 'approvals' && <ApprovalQueue />}
      </main>
    </div>
  );
}

export default App;