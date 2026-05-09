import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs, addDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import Papa from 'papaparse';

import { 
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis 
} from 'recharts';
import { 
  Search, Filter, ChevronDown, ChevronUp, Bot, 
  TrendingDown, AlertCircle, Clock, History, CheckCircle2, 
  ArrowRight, Zap, Plus, X, Upload 
} from 'lucide-react';

// --- MOCK DATA FOR REORDER HISTORY ---
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
const InventoryRow = ({ item, vendors }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [sourcingState, setSourcingState] = useState('idle');
  const [reasoningStep, setReasoningStep] = useState(0);

  // Dynamic calculations
  const consumption = item.daily_consumption || item.consumption || 1; 
  const stock = item.stock || 0;
  const daysLeft = Math.floor(stock / consumption);
  const isBelowThreshold = stock < (item.reorder_threshold || 20);
  
  const triggerSourcing = async () => {
    // 1. Find the best vendor in the database for this item's category
    const relevantVendor = vendors.find(v => v.categories?.includes(item.category)) || vendors[0];
    
    // 1. Start UI animation
    setSourcingState('thinking');
    setReasoningStep(0);
    
    const uiInterval = setInterval(() => {
      setReasoningStep((prev) => (prev < AI_REASONING_STEPS.length - 1 ? prev + 1 : prev));
    }, 1500);

    try {
      console.log(`🚀 Routing ${item.name} to the local AI Swarm...`);

      // 2. THE BRIDGE: Hitting your FastAPI backend
      const response = await fetch("http://127.0.0.1:8000/trigger-procurement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_name: item.name,
          current_stock: item.stock,
          threshold: item.reorder_threshold, // Send real threshold to AI
          vendor_name: relevantVendor?.name || "Local Market",
          vendor_contact: relevantVendor?.whatsapp_number || ""
        })
      });

      const data = await response.json();
      console.log("🧠 Swarm Response Received:", data);

      // --- THE FIREBASE BRIDGE: Send directly to Approvals Queue ---
      const currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      const requiredQty = 30; // Amount we asked the AI to source

      const newApprovalCard = {
        quoteId: `Q-${Math.floor(Math.random() * 9000) + 1000}`, 
        vendor: data.vendor || "Local Mandi Services",
        item: item.name,
        quantity: `${requiredQty} ${item.unit}`,
        price: (item.stock + requiredQty) * 45, // Generating a mock price for the UI based on stock
        marketAvg: ((item.stock + requiredQty) * 45) + 300, // Fake market avg for the UI
        score: 95, 
        reasoning: [
           data.agent_reasoning || "AI verified safety constraints.",
           "Price negotiated down based on predictive volume."
        ],
        timeline: [
           { time: currentTime, text: "AI triggered by low stock alert." },
           { time: currentTime, text: "WhatsApp draft generated and audited." }
        ],
        final_message: data.message_to_send,
        status: 'pending' // Approvals page looks for 'pending' quotes
      };
      
      await addDoc(collection(db, "quotes"), newApprovalCard);
      console.log("✅ Successfully saved to Firebase Quotes!");
      // -----------------------------------------------------------

      // 3. Stop the animation and lock in the success UI
      clearInterval(uiInterval);
      setReasoningStep(AI_REASONING_STEPS.length - 1);
      setSourcingState('done');
      
    } catch (error) {
      console.error("❌ API Connection Failed. Is the Uvicorn server running?", error);
      clearInterval(uiInterval);
      setSourcingState('idle'); 
    }
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
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-0.5">Sourcing Complete</p>
                            <p className="text-sm font-bold dark:text-gray-100">Draft saved to Approvals.</p>
                          </div>
                          <button className="px-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors opacity-50 cursor-not-allowed">
                            Ready
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

  // 1. STATE FOR LIVE DATA & FILTERS
  const [inventoryData, setInventoryData] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('name'); // 'name', 'stockLow', 'stockHigh'

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '', category: 'Food', stock: '', unit: 'kg', consumption: ''
  });
  
  // CSV Upload State & Ref
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStats, setUploadStats] = useState({ total: 0, current: 0 });
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data;
        setUploadStats({ total: rows.length, current: 0 });
        let newItems = [];

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          try {
            const newItem = {
              name: row.name || 'Unnamed Item',
              category: row.category || 'Other',
              stock: Number(row.stock) || 0,
              unit: row.unit || 'units',
              daily_consumption: Number(row.consumption) || 1,
              reorder_threshold: Number(row.threshold) || 20,
              last_updated: serverTimestamp(),
              trend: []
            };

            const docRef = await addDoc(collection(db, "inventory"), newItem);
            newItems.push({ id: docRef.id, ...newItem });
            
            setUploadStats(prev => ({ ...prev, current: i + 1 }));
          } catch (err) {
            console.error("Error uploading row:", err);
          }
        }

        setInventoryData(prev => [...newItems, ...prev]);
        setIsUploading(false);
        if(fileInputRef.current) fileInputRef.current.value = '';
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
        setIsUploading(false);
        alert("Failed to parse CSV file.");
      }
    });
  };

  useEffect(() => {
    // 1. Live listener for Inventory
    const unsubInv = onSnapshot(collection(db, "inventory"), (snapshot) => {
      const items = snapshot.docs.map(doc => {
        const data = doc.data();
        // Logic: Status is now derived from the 'reorder_threshold' in DB
        let derivedStatus = 'healthy';
        if (data.stock <= (data.reorder_threshold || 10)) derivedStatus = 'critical';
        else if (data.stock <= ((data.reorder_threshold || 10) * 1.5)) derivedStatus = 'warning';
        
        return { id: doc.id, ...data, status: derivedStatus };
      });
      setInventoryData(items);
    });

    // 2. Live listener for Vendors (to pass to AI Agent)
    const unsubVendors = onSnapshot(collection(db, "vendors"), (snapshot) => {
      setVendors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => { unsubInv(); unsubVendors(); };
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newItem = {
        name: formData.name,
        category: formData.category,
        stock: Number(formData.stock),
        unit: formData.unit,
        consumption: Number(formData.consumption),
        status: 'healthy', 
        trend: [] 
      };

      const docRef = await addDoc(collection(db, "inventory"), newItem);
      setInventoryData([...inventoryData, { id: docRef.id, ...newItem }]);
      
      setFormData({ name: '', category: 'Food', stock: '', unit: 'kg', consumption: '' });
      setIsAddModalOpen(false);
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error adding item:", error);
      setIsSubmitting(false);
    }
  };

  // --- 2. FILTER & SORT LOGIC ---
  const displayedData = inventoryData
    .filter(item => {
      const matchesTab = activeTab === 'All' || item.category === activeTab;
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesTab && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'stockLow') return a.stock - b.stock;
      if (sortBy === 'stockHigh') return b.stock - a.stock;
      return a.name.localeCompare(b.name);
    });

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
          {/* Active Search Bar */}
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search items..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:border-cura-blue focus:ring-1 focus:ring-cura-blue transition-all dark:text-white"
            />
          </div>
          
          {/* Active Filter Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-cura-dark dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Filter size={18} />
            </button>
            
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg z-10 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-2 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-gray-400 px-3 pt-1 pb-2">Sort By</p>
                  <button onClick={() => { setSortBy('name'); setIsFilterOpen(false); }} className={`w-full text-left px-3 py-2 text-sm font-semibold rounded-lg ${sortBy === 'name' ? 'bg-blue-50 text-cura-blue dark:bg-blue-900/30 dark:text-blue-400' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-cura-dark dark:text-gray-200'}`}>A-Z (Name)</button>
                  <button onClick={() => { setSortBy('stockLow'); setIsFilterOpen(false); }} className={`w-full text-left px-3 py-2 text-sm font-semibold rounded-lg ${sortBy === 'stockLow' ? 'bg-blue-50 text-cura-blue dark:bg-blue-900/30 dark:text-blue-400' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-cura-dark dark:text-gray-200'}`}>Stock: Low to High</button>
                  <button onClick={() => { setSortBy('stockHigh'); setIsFilterOpen(false); }} className={`w-full text-left px-3 py-2 text-sm font-semibold rounded-lg ${sortBy === 'stockHigh' ? 'bg-blue-50 text-cura-blue dark:bg-blue-900/30 dark:text-blue-400' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-cura-dark dark:text-gray-200'}`}>Stock: High to Low</button>
                </div>
              </div>
            )}
          </div>

          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current.click()}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-cura-dark dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
          >
            <Upload size={18} /> Upload CSV
          </button>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-cura-dark dark:bg-cura-blue rounded-xl hover:bg-black dark:hover:bg-blue-600 transition-all shadow-md"
          >
            <Plus size={18} /> Add Resource
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
              {displayedData.map(item => (
                <InventoryRow key={item.id} item={item} vendors={vendors} />
              ))}
            </tbody>
          </table>
          
          {/* Empty State */}
          {displayedData.length === 0 && (
             <div className="p-12 flex flex-col items-center justify-center text-center">
                <Search size={32} className="text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-cura-dark dark:text-gray-300 font-bold text-lg">No items found</p>
                <p className="text-sm text-cura-grey dark:text-gray-500 mt-1">Try adjusting your search or category filter.</p>
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
      
      {/* ADD ITEM MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
              <div>
                <h3 className="font-bold text-lg text-cura-dark dark:text-gray-100">Add New Resource</h3>
                <p className="text-xs text-cura-grey dark:text-gray-400 font-medium">Log a new item into your Firebase inventory.</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddItem} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-cura-grey dark:text-gray-400">Item Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-cura-dark dark:text-gray-200 text-sm font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cura-blue/30" placeholder="e.g., Apple Juice" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-cura-grey dark:text-gray-400">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-cura-dark dark:text-gray-200 text-sm font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cura-blue/30">
                  <option>Food</option>
                  <option>Medical</option>
                  <option>Education</option>
                  <option>Hygiene</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-cura-grey dark:text-gray-400">Initial Stock</label>
                  <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-cura-dark dark:text-gray-200 text-sm font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cura-blue/30" placeholder="e.g., 50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-cura-grey dark:text-gray-400">Unit Type</label>
                  <input required type="text" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-cura-dark dark:text-gray-200 text-sm font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cura-blue/30" placeholder="kg, boxes, L..." />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-cura-grey dark:text-gray-400">Est. Daily Consumption</label>
                <input required type="number" value={formData.consumption} onChange={e => setFormData({...formData, consumption: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-cura-dark dark:text-gray-200 text-sm font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cura-blue/30" placeholder="e.g., 2" />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full mt-4 py-3.5 bg-cura-dark dark:bg-cura-blue text-white font-bold rounded-xl hover:bg-black dark:hover:bg-blue-600 transition-colors shadow-lg disabled:opacity-50">
                {isSubmitting ? 'Saving to Database...' : 'Save Resource'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CSV UPLOADING OVERLAY */}
      {isUploading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-cura-blue/20 border-t-cura-blue rounded-full animate-spin"></div>
            <h3 className="text-xl font-bold text-cura-dark dark:text-gray-100">Processing CSV...</h3>
            <p className="text-sm font-bold text-cura-grey dark:text-gray-400 bg-white dark:bg-gray-900 px-4 py-2 rounded-full shadow-sm border border-gray-100 dark:border-gray-800">
              Uploaded {uploadStats.current} of {uploadStats.total} items
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default Inventory;