import React, { useState } from 'react';

const AutomationCard = ({ title, description, agent, status, onToggle }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
    <div className="flex justify-between items-start">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-cura-blue bg-blue-50 px-2 py-1 rounded-md mb-2 inline-block">
          {agent}
        </span>
        <h3 className="text-lg font-bold text-cura-dark">{title}</h3>
      </div>
      <div 
        onClick={onToggle}
        className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ${
          status === 'autonomous' ? 'bg-cura-blue' : 'bg-gray-200'
        }`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${
          status === 'autonomous' ? 'left-7' : 'left-1'
        }`} />
      </div>
    </div>
    <p className="text-sm text-cura-grey leading-relaxed">
      {description}
    </p>
    <div className="flex items-center gap-2 mt-2">
      <div className={`w-2 h-2 rounded-full ${status === 'autonomous' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
      <span className="text-[10px] font-bold uppercase text-cura-grey">
        Mode: {status === 'autonomous' ? 'Full Autonomy' : 'Human Approval Required'}
      </span>
    </div>
  </div>
);

const Automations = () => {
  const [configs, setConfigs] = useState([
    {
      id: 'procurement',
      title: 'Vendor Negotiation',
      agent: 'Procurement Agent',
      description: 'AI autonomously messages vendors on WhatsApp, parses quotes, and selects the best price.',
      status: 'approval'
    },
    {
      id: 'donations',
      title: 'Donation Allocation',
      agent: 'Finance Agent',
      description: 'AI automatically maps incoming funds to high-priority orphanage needs (food, medicine, education).',
      status: 'autonomous'
    },
    {
      id: 'reports',
      title: 'Impact Reporting',
      agent: 'Communication Agent',
      description: 'AI sends real-time WhatsApp updates to donors when their funds are spent, including receipts.',
      status: 'autonomous'
    },
    {
      id: 'compliance',
      title: 'Receipt Generation',
      agent: 'Compliance Agent',
      description: 'AI generates and verifies tax-exemption receipts for Indian donors automatically.',
      status: 'approval'
    }
  ]);

  const toggleStatus = (id) => {
    setConfigs(configs.map(c => 
      c.id === id ? { ...c, status: c.status === 'autonomous' ? 'approval' : 'autonomous' } : c
    ));
  };

  return (
    <div className="space-y-8 font-jost">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold text-cura-dark">AI Governance & Automations</h2>
        <p className="text-cura-grey text-sm mt-2">
          Configure the "Human-in-the-Loop" guardrails for CURA's autonomous agents. 
          Tasks set to <b>Approval</b> will queue in the Approvals tab.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {configs.map(config => (
          <AutomationCard 
            key={config.id} 
            {...config} 
            onToggle={() => toggleStatus(config.id)} 
          />
        ))}
      </div>
    </div>
  );
};

export default Automations;