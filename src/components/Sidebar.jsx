import { useState, useRef, useEffect } from 'react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const [expanded, setExpanded] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'inventory', icon: '📦', label: 'Inventory' },
    { id: 'ledger', icon: '📜', label: 'Ledger' },
    { id: 'approvals', icon: '✅', label: 'Approvals' },
  ];

  const profileMenuItems = [
    { label: 'Profile', icon: '👤' },
    { label: 'Settings', icon: '⚙️' },
    { label: 'Help & Support', icon: '❓' },
    { divider: true },
    { label: 'Sign Out', icon: '🚪', danger: true },
  ];

  return (
    <aside
      className={`${
        expanded ? 'w-56' : 'w-20'
      } bg-white border-r border-gray-200 flex flex-col items-center py-8 gap-6 transition-all duration-300 ease-in-out min-h-screen relative overflow-visible`}
    >
      {/* Logo / Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-cura-dark font-bold text-xl mb-4 w-full flex items-center justify-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
      >
        <span className="text-2xl">C.</span>
        {expanded && (
          <span className="text-sm font-medium tracking-widest uppercase text-cura-grey overflow-hidden whitespace-nowrap">
            CURA
          </span>
        )}
      </button>

      <div className={`h-px bg-gray-200 ${expanded ? 'w-4/5' : 'w-10'} transition-all duration-300`} />

      {/* Navigation Items */}
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`${
            expanded ? 'w-4/5 px-4' : 'w-12 justify-center'
          } flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer ${
            activeTab === item.id
              ? 'bg-cura-blue text-white shadow-lg shadow-blue-900/30'
              : 'text-cura-grey hover:bg-cura-blue/10 hover:text-cura-blue'
          }`}
        >
          <span className="text-xl flex-shrink-0">{item.icon}</span>
          {expanded && (
            <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
              {item.label}
            </span>
          )}
        </button>
      ))}

      {/* Spacer to push profile to bottom */}
      <div className="flex-1" />

      {/* Divider above profile */}
      <div className={`h-px bg-gray-200 ${expanded ? 'w-4/5' : 'w-10'} transition-all duration-300`} />

      {/* Profile 3-dot menu at bottom */}
      <div className="relative w-full flex justify-center" ref={profileRef}>
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className={`${
            expanded ? 'w-4/5 px-4' : 'w-12 justify-center'
          } flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer text-cura-grey hover:bg-cura-blue/10 hover:text-cura-blue`}
        >
          {/* 3-dot icon */}
          <span className="text-xl flex-shrink-0 leading-none tracking-widest">•••</span>
          {expanded && (
            <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
              More
            </span>
          )}
        </button>

        {/* Popover Menu (opens to the right of sidebar) */}
        {profileOpen && (
          <div
            className="absolute bottom-0 left-full ml-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50"
          >
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-cura-blue text-white flex items-center justify-center font-bold text-sm shadow-md">
                  M
                </div>
                <div>
                  <p className="font-bold text-sm text-cura-dark">Manager</p>
                  <p className="text-cura-grey text-xs">manager@cura.org</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            {profileMenuItems.map((item, i) =>
              item.divider ? (
                <div key={i} className="h-px bg-gray-100 my-1" />
              ) : (
                <button
                  key={item.label}
                  onClick={() => setProfileOpen(false)}
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
    </aside>
  );
};

export default Sidebar;