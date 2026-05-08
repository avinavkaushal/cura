import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  BookOpen, 
  CheckSquare, 
  Bot, 
  User, 
  Settings, 
  HelpCircle, 
  LogOut, 
  MoreVertical,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ activeTab, badges }) => {
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
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'inventory', icon: Package, label: 'Inventory' },
    { id: 'ledger', icon: BookOpen, label: 'Ledger' },
    { id: 'approvals', icon: CheckSquare, label: 'Approvals', badge: badges?.approvals },
    { id: 'automations', icon: Bot, label: 'Automations'},
  ];

  const profileMenuItems = [
    { label: 'Profile', icon: User },
    { label: 'Settings', icon: Settings },
    { label: 'Help & Support', icon: HelpCircle },
    { divider: true },
    { label: 'Sign Out', icon: LogOut, danger: true },
  ];

  return (
    <aside
      className={`${
        expanded ? 'w-64' : 'w-20'
      } bg-white border-r border-gray-100 flex flex-col py-6 transition-all duration-300 ease-in-out min-h-screen relative z-40`}
    >
      {/* Logo / Toggle */}
      <div className="px-4 mb-8 flex justify-center">
        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center gap-3 w-full p-2 rounded-xl hover:bg-gray-50 transition-colors ${expanded ? 'justify-start px-4' : 'justify-center'}`}
        >
          <div className="w-8 h-8 rounded-lg bg-cura-blue text-white flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-md shadow-blue-200">
            C
          </div>
          {expanded && (
            <span className="font-bold text-lg tracking-wide text-cura-dark overflow-hidden whitespace-nowrap">
              CURA<span className="text-cura-blue">.ai</span>
            </span>
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex flex-col gap-2 px-3 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          // We check the activeTab passed down from the App's URL logic
          const isActive = activeTab === item.id;
          
          return (
            <NavLink
              key={item.id}
              to={`/${item.id}`}
              className={`flex items-center p-3 rounded-xl transition-all duration-200 group relative ${
                expanded ? 'justify-start px-4' : 'justify-center'
              } ${
                isActive
                  ? 'bg-cura-blue text-white shadow-md shadow-blue-900/20'
                  : 'text-cura-grey hover:bg-blue-50 hover:text-cura-blue'
              }`}
            >
              <Icon 
                size={22} 
                strokeWidth={isActive ? 2.5 : 2} 
                className={`flex-shrink-0 transition-transform duration-200 ${!isActive && 'group-hover:scale-110'}`} 
              />
              
              {expanded && (
                <span className="ml-3 text-sm font-semibold whitespace-nowrap overflow-hidden">
                  {item.label}
                </span>
              )}
              
              {/* Active Tab Indicator (when collapsed) */}
              {isActive && !expanded && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cura-blue rounded-r-full" />
              )}
              
              {/* Badge System */}
              {item.badge > 0 && (
                <span className={`absolute bg-red-500 text-white font-bold flex items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  expanded 
                    ? 'right-4 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] min-w-[20px] border-transparent shadow-sm' 
                    : 'top-1 right-1 w-3.5 h-3.5 text-[0px] border-white'
                } ${isActive && !expanded ? 'border-cura-blue' : ''}`}>
                  {expanded ? item.badge : ''}
                </span>
              )}

              {/* Tooltip on hover when collapsed */}
              {!expanded && (
                <div className="absolute left-14 bg-cura-dark text-white text-xs font-bold px-2 py-1 rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Profile Section at Bottom */}
      <div className="px-3 relative" ref={profileRef}>
        <div className="h-px bg-gray-100 w-full mb-3" />
        
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className={`w-full flex items-center p-2 rounded-xl transition-all duration-200 hover:bg-gray-50 border border-transparent hover:border-gray-100 ${
            expanded ? 'justify-between px-3' : 'justify-center'
          }`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 flex-shrink-0 rounded-full bg-gradient-to-tr from-cura-blue to-blue-400 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white">
              M
            </div>
            {expanded && (
              <div className="text-left overflow-hidden">
                <p className="font-bold text-sm text-cura-dark truncate leading-tight">Manager</p>
                <p className="text-[10px] font-semibold text-cura-grey truncate">manager@cura.org</p>
              </div>
            )}
          </div>
          
          {expanded && <MoreVertical size={16} className="text-gray-400 flex-shrink-0" />}
        </button>

        {/* Popover Menu */}
        {profileOpen && (
          <div className="absolute bottom-full left-4 mb-2 w-56 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 py-2 z-50 origin-bottom-left animate-in fade-in zoom-in-95 duration-200">
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-gray-50 mb-1">
              <p className="font-bold text-sm text-cura-dark">manager@cura.org</p>
            </div>

            {/* Menu Items */}
            {profileMenuItems.map((item, i) => {
              if (item.divider) return <div key={i} className="h-px bg-gray-50 my-1" />;
              
              const MenuIcon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => setProfileOpen(false)}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between group transition-colors ${
                    item.danger
                      ? 'text-red-600 hover:bg-red-50 font-semibold'
                      : 'text-cura-dark hover:bg-gray-50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MenuIcon size={16} className={item.danger ? 'text-red-500' : 'text-gray-400 group-hover:text-cura-blue transition-colors'} />
                    <span>{item.label}</span>
                  </div>
                  {!item.danger && <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-gray-300" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;