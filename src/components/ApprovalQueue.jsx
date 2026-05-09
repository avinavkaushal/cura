import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { 
  CheckSquare, Square, BrainCircuit, 
  CheckCircle2, History, ListChecks 
} from 'lucide-react';

// --- INITIAL MOCK DATA (For Auto-Seeding) ---
const initialPendingQuotes = [
  { quoteId: 'Q-8829', vendor: "Global Wholesale Traders", item: "Wheat Flour (Aashirvaad)", quantity: "100kg", price: 4200, marketAvg: 4800, score: 98, reasoning: ["Price is 12.5% below current local market average.", "Vendor has a 4.8/5 on-time delivery rating across 40 orders.", "Volume discount of 5% successfully negotiated by AI."], timeline: [{ time: "09:00 AM", text: "Low stock detected, AI initiated sourcing." }, { time: "09:15 AM", text: "WhatsApp RFQ sent to 4 vendors." }, { time: "10:30 AM", text: "AI negotiated final price down from ₹4,400." }] },
  { quoteId: 'Q-8830', vendor: "Local Mandi Services", item: "Organic Lentils", quantity: "25kg", price: 2850, marketAvg: 2900, score: 82, reasoning: ["Price is slightly below market average.", "Vendor delivery times fluctuate (historically 1-3 days).", "Only vendor currently holding required organic stock."], timeline: [{ time: "Yesterday, 4:00 PM", text: "Manual sourcing triggered by manager." }, { time: "Today, 08:30 AM", text: "Quote received and parsed by AI." }] }
];
const initialRejectedHistory = [
  { quoteId: 'Q-8710', vendor: "Standard Supplies Co.", item: "Paracetamol (500mg)", quantity: "1000 tabs", price: 1500, score: 45, rejectedAt: "10 May 2024, 2:15 PM", reasoning: ["Price was 20% above wholesale.", "Vendor lacks medical distribution certification."] }
];

// --- SUB-COMPONENTS ---
const QuoteCard = ({ quote, isSelected, onToggleSelect, isHistory, onApprove, onReject }) => (
  <div className={`bg-white dark:bg-gray-900 p-6 rounded-2xl border transition-all ${
    isSelected ? 'border-cura-blue shadow-md ring-1 ring-cura-blue/20' : 'border-gray-100 dark:border-gray-800 shadow-sm dark:shadow-none hover:border-gray-300 dark:hover:border-gray-700'
  }`}>
    
    <div className="flex justify-between items-start mb-4 gap-4">
      <div className="flex gap-4">
        {!isHistory && (
          <button onClick={() => onToggleSelect(quote.id)} className="mt-1 flex-shrink-0 text-cura-grey dark:text-gray-500 hover:text-cura-blue transition-colors">
            {isSelected ? <CheckSquare size={20} className="text-cura-blue" /> : <Square size={20} />}
          </button>
        )}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-cura-blue bg-blue-50 dark:bg-cura-blue/10 px-2 py-0.5 rounded-md">{quote.quoteId || quote.id}</span>
            <span className="text-[10px] font-bold text-cura-grey dark:text-gray-500 uppercase tracking-wider">{quote.vendor}</span>
          </div>
          <h3 className="text-lg font-bold text-cura-dark dark:text-gray-100">{quote.item}</h3>
          <p className="text-sm font-semibold text-cura-grey dark:text-gray-400">{quote.quantity}</p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-2xl font-black text-cura-dark dark:text-gray-100">₹{quote.price?.toLocaleString()}</p>
        {!isHistory && quote.marketAvg && (
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md mt-1">
            ₹{(quote.marketAvg - quote.price).toLocaleString()} below avg
          </p>
        )}
        {isHistory && quote.rejectedAt && (
          <p className="text-xs font-bold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-md mt-1">
            Rejected: {quote.rejectedAt}
          </p>
        )}
      </div>
    </div>

    <div className="bg-blue-50/50 dark:bg-cura-blue/5 rounded-xl p-4 border border-blue-100 dark:border-cura-blue/20">
      <div className="flex items-center gap-2 mb-3">
        <BrainCircuit size={16} className="text-cura-blue dark:text-blue-400" />
        <span className="text-xs font-bold text-cura-blue dark:text-blue-400 uppercase tracking-wider">AI Reasoning</span>
        <span className={`ml-auto text-xs font-black px-2 py-0.5 rounded-md ${
          quote.score > 85 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
          quote.score > 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
          'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
        }`}>Score: {quote.score}/100</span>
      </div>
      <ul className="space-y-1.5">
        {quote.reasoning?.map((reason, i) => (
          <li key={i} className="text-sm text-cura-dark dark:text-gray-200 flex items-start gap-2">
            <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
            <span className="leading-snug">{reason}</span>
          </li>
        ))}
      </ul>

      {!isHistory && quote.timeline && (
        <div className="mt-4 pt-4 border-t border-blue-100 dark:border-cura-blue/20 flex flex-col gap-2">
          {quote.timeline.map((event, i) => (
            <div key={i} className="flex gap-3 text-xs">
              <span className="text-cura-grey dark:text-gray-500 font-mono flex-shrink-0 w-24">{event.time}</span>
              <span className="text-cura-dark dark:text-gray-300 font-medium">{event.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>

    {!isHistory && (
      <div className="flex gap-3 mt-4">
        <button 
          onClick={() => onApprove(quote.id)}
          className="flex-1 bg-cura-dark dark:bg-cura-blue text-white font-bold py-2.5 rounded-xl hover:bg-black dark:hover:bg-blue-600 transition-colors shadow-sm"
        >
          Approve Quote
        </button>
        <button 
          onClick={() => onReject(quote.id)}
          className="px-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-red-500 font-bold py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800 transition-colors"
        >
          Reject
        </button>
      </div>
    )}
  </div>
);

// --- MAIN COMPONENT ---
const ApprovalQueue = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedIds, setSelectedIds] = useState([]);
  
  const [pendingQuotes, setPendingQuotes] = useState([]);
  const [rejectedHistory, setRejectedHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // AUTO-SEED AND FETCH LOGIC
  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "quotes"));
        
        if (querySnapshot.empty) {
          console.log("No quotes found in Firebase! Auto-seeding database...");
          for (const q of initialPendingQuotes) {
            await addDoc(collection(db, "quotes"), { ...q, status: 'pending' });
          }
          for (const q of initialRejectedHistory) {
            await addDoc(collection(db, "quotes"), { ...q, status: 'rejected' });
          }
          
          const newSnapshot = await getDocs(collection(db, "quotes"));
          parseData(newSnapshot);
        } else {
          parseData(querySnapshot);
        }
      } catch (error) {
        console.error("Error fetching quotes: ", error);
        setLoading(false);
      }
    };

    const parseData = (snapshot) => {
      const pending = [];
      const rejected = [];
      snapshot.docs.forEach(doc => {
        const data = { id: doc.id, ...doc.data() };
        if (data.status === 'pending') pending.push(data);
        if (data.status === 'rejected') rejected.push(data);
      });
      setPendingQuotes(pending);
      setRejectedHistory(rejected);
      setLoading(false);
    };

    fetchQuotes();
  }, []);

  const toggleSelectAll = () => { setSelectedIds(selectedIds.length === pendingQuotes.length ? [] : pendingQuotes.map(q => q.id)); };
  const toggleSelect = (id) => { setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]); };
  
  // --- NEW ACTIONS ---
  const handleApprove = async (id) => {
    try {
      await updateDoc(doc(db, "quotes", id), { status: 'approved' });
      // Optimistically remove from pending UI
      setPendingQuotes(prev => prev.filter(q => q.id !== id));
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    } catch (error) {
      console.error("Error approving quote:", error);
    }
  };

  const handleReject = async (id) => {
    try {
      const rejectedTime = new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      await updateDoc(doc(db, "quotes", id), { status: 'rejected', rejectedAt: rejectedTime });
      
      // Move to history UI optimistically
      const rejectedQuote = pendingQuotes.find(q => q.id === id);
      setPendingQuotes(prev => prev.filter(q => q.id !== id));
      if (rejectedQuote) {
        setRejectedHistory(prev => [{ ...rejectedQuote, status: 'rejected', rejectedAt: rejectedTime }, ...prev]);
      }
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    } catch (error) {
      console.error("Error rejecting quote:", error);
    }
  };

  const handleBulkApprove = async () => {
    try {
      for (const id of selectedIds) {
        await updateDoc(doc(db, "quotes", id), { status: 'approved' });
      }
      // Optimistically clear the UI
      setPendingQuotes(prev => prev.filter(q => !selectedIds.includes(q.id)));
      setSelectedIds([]);
    } catch (error) {
      console.error("Error during bulk approval:", error);
    }
  };

  const activeData = activeTab === 'pending' ? pendingQuotes : rejectedHistory;

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center font-jost">
        <div className="flex flex-col items-center gap-4">
          <BrainCircuit size={40} className="text-cura-blue animate-pulse" />
          <p className="text-cura-dark dark:text-white font-bold text-xl">Loading Approvals Queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-jost pb-12 p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-cura-dark dark:text-gray-100">Manager Approval Queue</h2>
          <p className="text-cura-grey dark:text-gray-400 text-sm font-medium mt-1">Review AI-sourced quotes and resource allocations.</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-3 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'pending' 
            ? 'border-cura-dark dark:border-cura-blue text-cura-dark dark:text-cura-blue' 
            : 'border-transparent text-cura-grey dark:text-gray-500 hover:text-cura-dark dark:hover:text-gray-300'
          }`}
        >
          <ListChecks size={16} /> Pending Actions
          <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] px-2 py-0.5 rounded-full ml-1">
            {pendingQuotes.length}
          </span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'history' 
            ? 'border-cura-dark dark:border-cura-blue text-cura-dark dark:text-cura-blue' 
            : 'border-transparent text-cura-grey dark:text-gray-500 hover:text-cura-dark dark:hover:text-gray-300'
          }`}
        >
          <History size={16} /> Rejected History
        </button>
      </div>

      {activeTab === 'pending' && pendingQuotes.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={toggleSelectAll} className="text-cura-grey dark:text-gray-400 hover:text-cura-blue">
              {selectedIds.length === pendingQuotes.length ? <CheckSquare size={20} className="text-cura-blue" /> : <Square size={20} />}
            </button>
            <span className="text-sm font-bold text-cura-dark dark:text-gray-200">
              {selectedIds.length} Selected
            </span>
          </div>
          {selectedIds.length > 0 && (
            <button 
              onClick={handleBulkApprove}
              className="px-4 py-2 bg-cura-dark dark:bg-cura-blue text-white text-xs font-bold rounded-lg hover:bg-black dark:hover:bg-blue-600 transition-colors shadow-sm"
            >
              Bulk Approve Selected
            </button>
          )}
        </div>
      )}

      <div className="space-y-4">
        {activeData.map(quote => (
          <QuoteCard 
            key={quote.id} 
            quote={quote} 
            isSelected={selectedIds.includes(quote.id)}
            onToggleSelect={toggleSelect}
            isHistory={activeTab === 'history'}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ))}
        {activeData.length === 0 && (
          <div className="text-center py-16 text-cura-grey dark:text-gray-500">
            <CheckCircle2 size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-bold">No items in this queue.</p>
            <p className="text-sm">You are all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalQueue;