import React, { useState, useEffect } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

import { 
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis 
} from 'recharts';
import { 
  Search, Filter, ChevronDown, ChevronUp, Bot, 
  TrendingDown, AlertCircle, Clock, History, CheckCircle2, 
  ArrowRight, Zap
} from 'lucide-react';

// --- MOCK DATA FOR OTHER SECTIONS (We will move this to Firebase next!) ---
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

// --- COMPONENT 1: Individual Row in the Table ---
const InventoryRow = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [sourcingState, setSourcingState] = useState('idle');
  const [reasoningStep, setReasoningStep] = useState(0);

  // Fallback calculations
  const consumption = item.consumption || 1; 
  const stock = item.stock || 0;
  const daysLeft = Math.floor(stock / consumption);
  
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
          <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 w-max ${
            item.status === 'critical' ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
            item.status === 'warning' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
            'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
          }`}>
            {item.status === 'critical' ? <AlertCircle size={12} /> : <Clock size={12} />}
            {daysLeft} days left
          </span>
        </td>
        <td className="py-5 px-6 text-right">
          <button 
            className="p-2 text-cura-grey dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </td>
      </tr>

      {/* Expanded Details Row */}
      {isExpanded && (
        <tr className="bg-gray-50/30 dark:bg-gray-800/20 border-b border-gray-50 dark:border-gray-800">
          <td colSpan="5" className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: Trend Graph */}
              <div className="bg-white dark:bg-gray-900 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                <h4 className="text-xs font-bold text-cura-grey dark:text-gray-400 uppercase tracking-wider mb-4">Consumption Trend</h4>
                <div className="h-32 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={item.trend || []}>
                      <defs>
                        <linearGradient id={`gradient-${item.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#17439B" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#17439B" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" hide />
                      <Tooltip 
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{ stroke: '#f3f4f6', strokeWidth: 2 }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="val" 
                        stroke="#17439B" 
                        strokeWidth={3}
                        fill={`url(#gradient-${item.id})`} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Right: AI Action Panel */}
              <div className="flex flex-col justify-center">
                <div className="bg-blue-50/50 dark:bg-cura-blue/10 rounded-[2rem] p-6 border border-blue-100 dark:border-cura-blue/20">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-cura-blue text-white flex items-center justify-center flex-shrink-0 shadow-md">
                      <Bot size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-cura-dark dark:text-gray-100 mb-1">CURA AI Sourcing</h4>
                      <p className="text-sm text-cura-grey dark:text-gray-400 mb-4">
                        Autonomous agent can negotiate with local vendors for {item.name}.
                      </p>
                      
                      {sourcingState === 'idle' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); triggerSourcing(); }}
                          className="w-full py-2.5 bg-cura-dark hover:bg-black dark:bg-cura-blue dark:hover:bg-blue-600 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                        >
                          Trigger AI Sourcing <ArrowRight size={16} />
                        </button>
                      )}

                      {sourcingState === 'thinking' && (
                        <div className="space-y-3">
                          {AI_REASONING_STEPS.slice(0, reasoningStep + 1).map((step, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-cura-dark dark:text-gray-200 animate-in fade-in slide-in-from-bottom-2">
                              {idx === reasoningStep ? (
                                <Zap size={14} className="text-amber-500 animate-pulse" />
                              ) : (
                                <CheckCircle2 size={14} className="text-emerald-500" />
                              )}
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {sourcingState === 'done' && (
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-emerald-100 dark:border-emerald-900/50 shadow-sm flex justify-between items-center animate-in fade-in zoom-in-95">
                          <div>
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-0.5">Best Quote Found</p>
                            <p className="text-sm font-bold dark:text-gray-100">Fresh Mart - ₹42/kg</p>
                          </div>
                          <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors">
                            Send to Approvals
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// --- COMPONENT 2: MAIN INVENTORY PAGE ---
const Inventory = () => {
  const [activeTab, setActiveTab] = useState('All');
  const tabs = ['All', 'Food', 'Medical', 'Education', 'Hygiene'];

  // 1. STATE FOR LIVE DATA (Correctly placed!)
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. FETCH FROM FIREBASE
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "inventory"));
        const liveData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setInventoryData(liveData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching live inventory: ", error);
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  // 3. SHOW LOADING SCREEN WHILE FETCHING
  if (loading) {
    return (
      <div className="w-full min-h-screen p-8 flex items-center justify-center font-jost">
        <div className="flex flex-col items-center gap-4">
          <Bot size={40} className="text-cura-blue animate-bounce" />
          <p className="text-cura-dark dark:text-white font-bold text-xl">Connecting to Database...</p>
        </div>
      </div>
    );
  }

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
          
          {/* Empty State */}
          {inventoryData.length === 0 && (
             <div className="p-8 text-center text-cura-grey dark:text-gray-400 font-bold">
                No items found in Firebase. Ensure you seeded the database!
             </div>
          )}
        </div>
      </div>

      {/* Secondary Section: Reorder History */}
      <div>
        <div className="flex items-center gap-2 mb-4 px-2">
          <History size={18} className="text-cura-grey dark:text-gray-400" />
          <h3 className="font-bold text-lg dark:text-gray-100">Recent Purchase Orders</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reorderHistory.map((po) => (
            <div key={po.id} className="bg-white dark:bg-gray-900 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-800 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-cura-blue bg-blue-50 dark:bg-cura-blue/10 px-2 py-1 rounded-md">{po.id}</span>
                <span className="text-[10px] text-cura-grey dark:text-gray-500 font-bold uppercase tracking-wider">{po.date}</span>
              </div>
              <div>
                <p className="font-bold text-cura-dark dark:text-gray-100">{po.item}</p>
                <p className="text-sm text-cura-grey dark:text-gray-400">{po.qty} • {po.vendor}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Inventory;