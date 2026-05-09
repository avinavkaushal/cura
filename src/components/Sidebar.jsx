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
  ChevronRight,
  Sun,   // Added for theme toggle
  Moon   // Added for theme toggle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext'; // Import our new hook

const Sidebar = ({ activeTab, badges }) => {
  const [expanded, setExpanded] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const { theme, toggleTheme } = useTheme(); // Consume the theme context

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
      } bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-800 flex flex-col py-6 transition-all duration-300 ease-in-out h-screen sticky top-0 z-40`}
    >
      {/* Logo / Toggle */}
      <div className="px-4 mb-8 flex justify-center">
        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center gap-3 w-full p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${expanded ? 'justify-start px-4' : 'justify-center'}`}
        >
          <div className="w-8 h-8 rounded-lg bg-cura-blue text-white flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-md shadow-blue-200 dark:shadow-none">
            C
          </div>
          {expanded && (
            <span className="font-bold text-lg tracking-wide text-cura-dark dark:text-gray-100 overflow-hidden whitespace-nowrap">
              CURA<span className="text-cura-blue dark:text-blue-400">.ai</span>
            </span>
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex flex-col gap-2 px-3 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
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
                  : 'text-cura-grey dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-900 hover:text-cura-blue dark:hover:text-blue-400'
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
                    : 'top-1 right-1 w-3.5 h-3.5 text-[0px] border-white dark:border-gray-950'
                } ${isActive && !expanded ? 'border-cura-blue' : ''}`}>
                  {expanded ? item.badge : ''}
                </span>
              )}

              {/* Tooltip on hover when collapsed */}
              {!expanded && (
                <div className="absolute left-14 bg-cura-dark dark:bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Theme Toggle Button inserted just above the profile section */}
      <div className="px-4 mb-4">
        <button
          onClick={toggleTheme}
          className={`flex items-center w-full p-2.5 rounded-xl transition-all duration-200 text-cura-grey dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-cura-dark dark:hover:text-gray-100 ${
            expanded ? 'justify-start px-3' : 'justify-center'
          }`}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          {expanded && (
            <span className="ml-3 text-sm font-semibold">
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </span>
          )}
        </button>
      </div>

      {/* Profile Section at Bottom */}
      <div className="px-3 relative" ref={profileRef}>
        <div className="h-px bg-gray-100 dark:bg-gray-800 w-full mb-3" />
        
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className={`w-full flex items-center p-2 rounded-xl transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-900 border border-transparent hover:border-gray-100 dark:hover:border-gray-800 ${
            expanded ? 'justify-between px-3' : 'justify-center'
          }`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 flex-shrink-0 rounded-full bg-gradient-to-tr from-cura-blue to-blue-400 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white dark:ring-gray-950">
              M
            </div>
            {expanded && (
              <div className="text-left overflow-hidden">
                <p className="font-bold text-sm text-cura-dark dark:text-gray-100 truncate leading-tight">Manager</p>
                <p className="text-[10px] font-semibold text-cura-grey dark:text-gray-500 truncate">manager@cura.org</p>
              </div>
            )}
          </div>
          
          {expanded && <MoreVertical size={16} className="text-gray-400 dark:text-gray-600 flex-shrink-0" />}
        </button>

        {/* Popover Menu */}
        {profileOpen && (
          <div className="absolute bottom-full left-4 mb-2 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 py-2 z-50 origin-bottom-left animate-in fade-in zoom-in-95 duration-200">
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-800 mb-1">
              <p className="font-bold text-sm text-cura-dark dark:text-gray-100">manager@cura.org</p>
            </div>

            {/* Menu Items */}
            {profileMenuItems.map((item, i) => {
              if (item.divider) return <div key={i} className="h-px bg-gray-50 dark:bg-gray-800 my-1" />;
              
              const MenuIcon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => setProfileOpen(false)}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between group transition-colors ${
                    item.danger
                      ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 font-semibold'
                      : 'text-cura-dark dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MenuIcon size={16} className={item.danger ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-cura-blue dark:group-hover:text-blue-400 transition-colors'} />
                    <span>{item.label}</span>
                  </div>
                  {!item.danger && <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-gray-300 dark:text-gray-600" />}
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