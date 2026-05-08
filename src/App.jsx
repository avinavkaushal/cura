import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Ledger from './components/Ledger';
import ApprovalQueue from './components/ApprovalQueue';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex min-h-screen bg-gray-50 font-jost text-cura-dark">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold capitalize">
            {activeTab.replace('-', ' ')}
          </h1>
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