import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Ledger from './components/Ledger';
import ApprovalQueue from './components/ApprovalQueue';
import Automations from './components/Automations';

function App() {
  // We use the location hook to know what the current URL is
  const location = useLocation();
  
  // Clean up the path name for the title and sidebar (e.g., '/inventory' -> 'inventory')
  const currentPath = location.pathname.replace('/', '') || 'dashboard';

  const [badges] = useState({
    approvals: 2,
    inventory: 0
  });

  return (
    <div className="flex min-h-screen bg-gray-50 font-jost text-cura-dark">
      {/* Sidebar 
          Note: We pass a dummy function for setActiveTab right now. 
          The sidebar buttons won't work perfectly until we do Step 4! */}
      <Sidebar activeTab={currentPath} setActiveTab={() => {}} badges={badges} />

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold capitalize">
            {currentPath.replace('-', ' ')}
          </h1>
        </header>

        {/* Dynamic Route Rendering based on URL */}
        <Routes>
          {/* Default route redirects to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/ledger" element={<Ledger />} />
          <Route path="/approvals" element={<ApprovalQueue />} />
          <Route path="/automations" element={<Automations />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;