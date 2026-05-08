import { useState } from 'react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const [expanded, setExpanded] = useState(false);

  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'inventory', icon: '📦', label: 'Inventory' },
    { id: 'ledger', icon: '📜', label: 'Ledger' },
    { id: 'approvals', icon: '✅', label: 'Approvals' },
  ];

  return (
    <aside
      className={`${
        expanded ? 'w-56' : 'w-20'
      } bg-cura-dark flex flex-col items-center py-8 gap-6 transition-all duration-300 ease-in-out min-h-screen`}
    >
      {/* Logo / Hamburger Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-white font-bold text-xl mb-4 w-full flex items-center justify-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
      >
        <span className="text-2xl">C.</span>
        {expanded && (
          <span className="text-sm font-medium tracking-widest uppercase text-cura-grey overflow-hidden whitespace-nowrap">
            CURA
          </span>
        )}
      </button>

      {/* Divider */}
      <div className={`h-px bg-gray-700 ${expanded ? 'w-4/5' : 'w-10'} transition-all duration-300`} />

      {/* Navigation Items */}
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`${
            expanded ? 'w-4/5 px-4' : 'w-12 justify-center'
          } flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer ${
            activeTab === item.id
              ? 'bg-cura-blue text-white shadow-lg shadow-blue-900/30'
              : 'text-cura-grey hover:bg-gray-800 hover:text-white'
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
    </aside>
  );
};

export default Sidebar;