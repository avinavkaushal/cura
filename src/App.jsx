import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Ledger from './components/Ledger';
import ApprovalQueue from './components/ApprovalQueue';
import Automations from './components/Automations';
import { ThemeProvider } from './context/ThemeContext';
import Auth from './components/Auth';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';



import { db } from './firebase'; 
import { ref, set, push } from "firebase/database";

function App() {
  const location = useLocation();
  const currentPath = location.pathname.replace('/', '') || 'dashboard';
  
  const { currentUser } = useAuth();
  const isAuthenticated = !!currentUser;

  const [badges] = useState({
    approvals: 2,
    inventory: 0
  });

  // If not authenticated, only show the Auth page without the Sidebar
  if (!isAuthenticated) {
    return (
      <ThemeProvider>
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 font-jost text-cura-dark dark:text-gray-100 transition-colors duration-300">
          <div className="flex-1">
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="*" element={<Navigate to="/auth" replace />} />
            </Routes>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  // Once authenticated, show the full Dashboard with Sidebar
  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 font-jost text-cura-dark dark:text-gray-100 transition-colors duration-300">
        
        {/* Sidebar */}
        <Sidebar activeTab={currentPath} badges={badges} />

        {/* Main Content Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          <header className="mb-8">
            <h1 className="text-2xl font-bold capitalize">
              {currentPath.replace('-', ' ')}
            </h1>
          </header>

          {/* Dynamic Route Rendering based on URL */}
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/ledger" element={<Ledger />} />
            <Route path="/approvals" element={<ApprovalQueue />} />
            <Route path="/automations" element={<Automations />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;