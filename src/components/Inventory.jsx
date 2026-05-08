import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis 
} from 'recharts';
import { 
  Search, Filter, ChevronDown, ChevronUp, Bot, 
  TrendingDown, AlertCircle, Clock, History, CheckCircle2, 
  ArrowRight, Zap
} from 'lucide-react';

// --- MOCK DATA ---
const inventoryData = [
  { id: 1, name: "Basmati Rice", category: "Food", stock: 120, unit: "kg", consumption: 15, status: 'healthy', trend: [{day: 'Mon', val: 140}, {day: 'Tue', val: 135}, {day: 'Wed', val: 130}, {day: 'Thu', val: 125}, {day: 'Fri', val: 120}] },
  { id: 2, name: "Lentils (Dal)", category: "Food", stock: 15, unit: "kg", consumption: 8, status: 'critical', trend: [{day: 'Mon', val: 40}, {day: 'Tue', val: 32}, {day: 'Wed', val: 24}, {day: 'Thu', val: 18}, {day: 'Fri', val: 15}] },
  { id: 3, name: "Paracetamol", category: "Medical", stock: 450, unit: "tabs", consumption: 20, status: 'healthy', trend: [{day: 'Mon', val: 500}, {day: 'Tue', val: 480}, {day: 'Wed', val: 470}, {day: 'Thu', val: 460}, {day: 'Fri', val: 450}] },
  { id: 4, name: "Antiseptic Liquid", category: "Hygiene", stock: 12, unit: "L", consumption: 2, status: 'warning', trend: [{day: 'Mon', val: 18}, {day: 'Tue', val: 16}, {day: 'Wed', val: 15}, {day: 'Thu', val: 13}, {day: 'Fri', val: 12}] }
];

const reorderHistory = [
  { id: 'PO-209', date: '12 May 2024', item: 'Notebooks (A5)', qty: '200 pcs', vendor: 'Standard Supplies Co.', status: 'Delivered' },
  { id: 'PO-208', date: '08 May 2024', item: 'Milk Powder', qty: '50 kg', vendor: 'Global Wholesale', status: 'Delivered' },
  { id: 'PO-207', date: '05 May 2024', item: 'Amoxicillin', qty: '100 vials', vendor: 'Apollo Med', status: 'Delivered' },
];

const AI_REASONING_STEPS = [
  "Analyzing consumption rate vs current stock...",
  "Querying top 3 local vendors via WhatsApp API...",
  "Comparing quotes & calculating trust scores...",
  "Recommendation ready for approval."
];

// --- SUB-COMPONENTS ---
const SparklineTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-cura-dark dark:bg-white text-white dark:text-cura-dark text-[10px] font-bold px-2 py-1 rounded-md shadow-lg">
        {payload[0].value}
      </div>
    );
  }
  return null;
};

const InventoryRow = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [sourcingState, setSourcingState] = useState('idle');
  const [reasoningStep, setReasoningStep] = useState(0);

  const daysLeft = Math.floor(item.stock / item.consumption);
  
  const triggerSourcing = () => {
    setSourcingState('thinking');
    setReasoningStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step < AI_REASONING_STEPS.length) {
        setReasoningStep(step);
      } else {
        clearInterval(interval);
        setSourcingState('done');
      }
    }, 1500);
  };

  return (
    <>
      <tr 
        className={`border-b border-gray-50 dark:border-gray-800 transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50 cursor-pointer ${isExpanded ? 'bg-blue-50/30 dark:bg-gray-800' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <td className="py-5 px-6">
          <div className="flex items-center gap-3">
            <div>
              <p className="font-bold text-cura-dark dark:text-gray-100">{item.name}</p>
              <p className="text-[10px] uppercase tracking-wider text-cura-grey dark:text-gray-500 font-bold">{item.category}</p>
            </div>
          </div>
        </td>
        <td className="py-5 px-6">
          <span className="font-bold text-lg dark:text-gray-100">{item.stock}</span>
          <span className="text-xs text-cura-grey dark:text-gray-500 ml-1">{item.unit}</span>
        </td>
        <td className="py-5 px-6">
          <div className="flex items-center gap-2">
            <TrendingDown size={14} className="text-cura-grey dark:text-gray-500" />
            <span className="text-sm font-semibold dark:text-gray-200">{item.consumption} {item.unit}/day</span>
          </div>
        </td>
        <td className="py-5 px-6">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-800 text-cura-dark dark:text-gray-300">
            {daysLeft} Days Left
          </span>
        </td>
        <td className="py-5 px-6 text-right">
          <button className="text-cura-grey dark:text-gray-500 hover:text-cura-blue dark:hover:text-blue-400 transition-colors">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </td>
      </tr>

      {isExpanded && (
        <tr>
          <td colSpan="5" className="px-6 py-0 bg-blue-50/10 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
            <div className="py-6 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-2 duration-300">
              
              {/* Left: Consumption Sparkline */}
              <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm dark:shadow-none">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cura-grey dark:text-gray-400 mb-4">Consumption Trend (Past 5 Days)</h4>
                <div className="h-32 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={item.trend} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#17439B" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#17439B" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Tooltip content={<SparklineTooltip />} cursor={{ stroke: '#17439B', strokeWidth: 1, strokeDasharray: '4 4' }} />
                      <Area type="monotone" dataKey="val" stroke="#17439B" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Right: AI Sourcing Panel */}
              <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm dark:shadow-none flex flex-col justify-center">
                {sourcingState === 'idle' && (
                  <div className="text-center space-y-4">
                    <Bot size={32} className="mx-auto text-cura-grey dark:text-gray-500 opacity-50" />
                    <div>
                      <h4 className="font-bold text-cura-dark dark:text-gray-100">Agent Standing By</h4>
                      <p className="text-xs text-cura-grey dark:text-gray-400 mt-1">Trigger the AI to find the best local vendor quotes.</p>
                    </div>
                    <button 
                      onClick={triggerSourcing}
                      className="bg-cura-blue text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:scale-105 transition-all flex items-center gap-2 mx-auto"
                    >
                      <Zap size={16} /> Trigger AI Sourcing
                    </button>
                  </div>
                )}

                {sourcingState === 'thinking' && (
                  <div className="space-y-4 w-full max-w-sm mx-auto">
                    <div className="flex items-center gap-3 text-cura-blue dark:text-blue-400 font-bold mb-6">
                      <Bot size={24} className="animate-pulse" />
                      <span>Agent At Work...</span>
                    </div>
                    <div className="space-y-3">
                      {AI_REASONING_STEPS.map((stepText, idx) => (
                        <div key={idx} className={`flex items-start gap-3 transition-opacity duration-500 ${idx > reasoningStep ? 'opacity-20' : 'opacity-100'}`}>
                          {idx < reasoningStep ? (
                            <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
                          ) : idx === reasoningStep ? (
                            <div className="w-4 h-4 rounded-full border-2 border-cura-blue dark:border-blue-400 border-t-transparent animate-spin mt-0.5 shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-gray-200 dark:border-gray-700 mt-0.5 shrink-0" />
                          )}
                          <p className={`text-sm ${idx === reasoningStep ? 'text-cura-dark dark:text-gray-200 font-semibold' : 'text-cura-grey dark:text-gray-500'}`}>
                            {stepText}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {sourcingState === 'done' && (
                  <div className="w-full h-full flex flex-col justify-center text-center space-y-3 animate-in zoom-in-95 duration-300">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle2 size={24} />
                    </div>
                    <h4 className="font-bold text-lg text-cura-dark dark:text-gray-100">Quotes Sourced</h4>
                    <p className="text-xs text-cura-grey dark:text-gray-400 pb-2">3 local vendors evaluated. Best match found.</p>
                    <button className="bg-cura-dark dark:bg-gray-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md dark:shadow-none hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 w-full">
                      View in Approvals <ArrowRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// --- MAIN INVENTORY COMPONENT ---
const Inventory = () => {
  const [activeTab, setActiveTab] = useState('All');
  const tabs = ['All', 'Food', 'Medical', 'Education', 'Hygiene'];

  return (
    <div className="w-full min-h-screen bg-transparent p-8 font-jost text-cura-dark dark:text-gray-100 flex flex-col gap-8">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Resource Inventory</h2>
          <p className="text-sm text-cura-grey dark:text-gray-400 font-medium mt-1">Predictive tracking & autonomous procurement</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input 
              type="text" 
              placeholder="Search items..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:border-cura-blue focus:ring-1 focus:ring-cura-blue transition-all dark:text-white"
            />
          </div>
          <button className="p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-cura-dark dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab 
                ? 'bg-cura-dark dark:bg-cura-blue text-white shadow-md' 
                : 'bg-white dark:bg-gray-900 text-cura-grey dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-sm shadow-gray-100/50 dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-[10px] uppercase tracking-wider text-cura-grey dark:text-gray-400 font-bold border-b border-transparent dark:border-gray-800">
              <tr>
                <th className="py-4 px-6 rounded-tl-[2.5rem]">Item & Category</th>
                <th className="py-4 px-6">Current Stock</th>
                <th className="py-4 px-6">Est. Consumption</th>
                <th className="py-4 px-6">Predicted Stockout</th>
                <th className="py-4 px-6 text-right rounded-tr-[2.5rem]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventoryData.filter(item => activeTab === 'All' || item.category === activeTab).map(item => (
                <InventoryRow key={item.id} item={item} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reorder History Section */}
      <div className="mt-4">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <History size={18} className="text-cura-blue dark:text-blue-400" />
          Recent Reorder History
        </h3>
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm shadow-gray-100/50 dark:shadow-none border border-gray-100 dark:border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reorderHistory.map((record, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col gap-2 transition-all hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cura-blue dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md">
                    {record.id}
                  </span>
                  <span className="text-xs font-semibold text-cura-grey dark:text-gray-500 flex items-center gap-1">
                    <Clock size={12} /> {record.date}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-cura-dark dark:text-gray-100">{record.item}</h4>
                  <p className="text-sm text-cura-grey dark:text-gray-400">{record.qty} from {record.vendor}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;