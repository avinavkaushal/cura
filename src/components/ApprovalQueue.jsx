import React, { useState } from 'react';
import { 
  CheckSquare, Square, Clock, BrainCircuit, 
  CheckCircle2, XCircle, History, ListChecks, 
  ChevronRight, ArrowRight, X
} from 'lucide-react';

// --- MOCK DATA ---
const initialPendingQuotes = [
  {
    id: 'Q-8829',
    vendor: "Global Wholesale Traders",
    item: "Wheat Flour (Aashirvaad)",
    quantity: "100kg",
    price: 4200,
    marketAvg: 4800,
    score: 98,
    reasoning: [
      "Price is 12.5% below current local market average.",
      "Vendor has a 4.8/5 on-time delivery rating across 40 orders.",
      "Volume discount of 5% successfully negotiated by AI."
    ],
    timeline: [
      { time: "09:00 AM", text: "Low stock detected, AI initiated sourcing." },
      { time: "09:15 AM", text: "WhatsApp RFQ sent to 4 vendors." },
      { time: "10:30 AM", text: "AI negotiated final price down from ₹4,400." }
    ]
  },
  {
    id: 'Q-8830',
    vendor: "Local Mandi Services",
    item: "Organic Lentils",
    quantity: "25kg",
    price: 2850,
    marketAvg: 2900,
    score: 82,
    reasoning: [
      "Price is slightly below market average.",
      "Vendor delivery times fluctuate (historically 1-3 days).",
      "Only vendor currently holding required organic stock."
    ],
    timeline: [
      { time: "Yesterday, 4:00 PM", text: "Manual sourcing triggered by manager." },
      { time: "Today, 08:30 AM", text: "Quote received and parsed by AI." }
    ]
  }
];

const initialRejectedHistory = [
  {
    id: 'Q-8710',
    vendor: "Standard Supplies Co.",
    item: "Paracetamol (500mg)",
    quantity: "1000 tabs",
    price: 1500,
    score: 45,
    rejectedAt: "10 May 2024, 2:15 PM",
    reasoning: ["Price was 20% above wholesale.", "Vendor lacks medical distribution certification."],
  }
];

// --- SUB-COMPONENTS ---

const QuoteCard = ({ quote, isSelected, onToggleSelect, isHistory }) => (
  <div className={`bg-white p-6 rounded-2xl border transition-all ${
    isSelected ? 'border-cura-blue shadow-md ring-1 ring-cura-blue/20' : 'border-gray-100 shadow-sm hover:border-gray-300'
  }`}>
    
    {/* Header & Selection */}
    <div className="flex justify-between items-start mb-6">
      <div className="flex items-start gap-4">
        {!isHistory && (
          <button onClick={() => onToggleSelect(quote.id)} className="mt-1 text-cura-grey hover:text-cura-blue transition-colors">
            {isSelected ? <CheckSquare size={20} className="text-cura-blue" /> : <Square size={20} />}
          </button>
        )}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cura-blue bg-blue-50 px-2 py-0.5 rounded-md">
              {quote.id}
            </span>
            {isHistory && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <XCircle size={10} /> Rejected
              </span>
            )}
          </div>
          <h4 className="font-bold text-lg text-cura-dark">{quote.vendor}</h4>
          <p className="text-cura-grey text-sm font-medium">{quote.item} • {quote.quantity}</p>
        </div>
      </div>
      
      <div className="text-right">
        <p className="text-2xl font-bold tracking-tight text-cura-dark">₹{quote.price.toLocaleString()}</p>
        {!isHistory && (
          <div className="inline-flex items-center gap-1 mt-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-md">
            <BrainCircuit size={12} />
            <span className="text-[10px] font-bold">AI Score: {quote.score}%</span>
          </div>
        )}
      </div>
    </div>

    {/* Body Grid: Reasoning & Timeline */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 bg-gray-50/50 p-4 rounded-xl border border-gray-50">
      
      {/* AI Reasoning */}
      <div>
        <h5 className="text-xs font-bold uppercase tracking-wider text-cura-grey flex items-center gap-1.5 mb-3">
          <BrainCircuit size={14} /> Agent Reasoning
        </h5>
        <ul className="space-y-2">
          {quote.reasoning.map((point, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-cura-dark">
              <CheckCircle2 size={14} className="text-cura-blue mt-0.5 shrink-0 opacity-80" />
              <span className="leading-tight">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Audit Timeline (Hidden in History tab for brevity) */}
      {!isHistory && (
        <div>
          <h5 className="text-xs font-bold uppercase tracking-wider text-cura-grey flex items-center gap-1.5 mb-3">
            <Clock size={14} /> Audit Trail
          </h5>
          <div className="space-y-3 relative before:absolute before:inset-y-0 before:left-[5px] before:w-[2px] before:bg-gray-200">
            {quote.timeline.map((event, idx) => (
              <div key={idx} className="relative pl-5 text-sm">
                <div className="absolute left-0 top-1.5 w-3 h-3 bg-white border-2 border-cura-blue rounded-full" />
                <span className="text-[10px] font-bold text-cura-grey block mb-0.5">{event.time}</span>
                <span className="text-cura-dark leading-tight block">{event.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    
    {/* Action Buttons */}
    {!isHistory && (
      <div className="grid grid-cols-2 gap-3">
        <button className="bg-white border border-gray-200 text-cura-dark py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
          <X size={16} className="text-red-500" /> Reject Quote
        </button>
        <button className="bg-cura-blue text-white py-2.5 rounded-xl text-sm font-bold shadow-md shadow-blue-200 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
          <CheckCircle2 size={16} /> Approve & Process
        </button>
      </div>
    )}
  </div>
);

// --- MAIN COMPONENT ---

const ApprovalQueue = () => {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'history'
  const [selectedIds, setSelectedIds] = useState([]);
  
  // In a real app, these would come from an API/Global State
  const [pendingQuotes] = useState(initialPendingQuotes);
  const [rejectedHistory] = useState(initialRejectedHistory);

  const toggleSelectAll = () => {
    if (selectedIds.length === pendingQuotes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingQuotes.map(q => q.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const activeData = activeTab === 'pending' ? pendingQuotes : rejectedHistory;

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-jost pb-12">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-cura-dark">Manager Approval Queue</h2>
          <p className="text-cura-grey text-sm font-medium mt-1">
            Review and govern AI procurement decisions
          </p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'pending' ? 'bg-white text-cura-blue shadow-sm' : 'text-cura-grey hover:text-cura-dark'
            }`}
          >
            <ListChecks size={16} /> Needs Approval
            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingQuotes.length}</span>
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'history' ? 'bg-white text-cura-dark shadow-sm' : 'text-cura-grey hover:text-cura-dark'
            }`}
          >
            <History size={16} /> Rejected History
          </button>
        </div>
      </div>

      {/* Floating Batch Action Bar (Only shows when items are selected in pending tab) */}
      {activeTab === 'pending' && selectedIds.length > 0 && (
        <div className="sticky top-4 z-10 bg-cura-dark text-white px-6 py-4 rounded-2xl shadow-xl flex items-center justify-between animate-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <span className="bg-white/20 px-3 py-1 rounded-lg text-sm font-bold">
              {selectedIds.length} Selected
            </span>
            <span className="text-sm font-medium text-gray-300">Ready for batch processing</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSelectedIds([])}
              className="text-gray-400 hover:text-white text-sm font-bold px-3 transition-colors"
            >
              Cancel
            </button>
            <button className="bg-white text-cura-dark px-5 py-2 rounded-xl text-sm font-bold hover:scale-105 transition-transform flex items-center gap-2">
              Approve All ({selectedIds.length}) <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* List Header (Select All) */}
      {activeTab === 'pending' && pendingQuotes.length > 0 && (
        <div className="flex items-center gap-3 px-2 pb-2">
          <button onClick={toggleSelectAll} className="text-cura-grey hover:text-cura-blue transition-colors">
            {selectedIds.length === pendingQuotes.length ? (
              <CheckSquare size={20} className="text-cura-blue" />
            ) : (
              <Square size={20} />
            )}
          </button>
          <span className="text-sm font-bold text-cura-grey">Select All Quotes</span>
        </div>
      )}

      {/* Quote List */}
      <div className="space-y-5">
        {activeData.map(quote => (
          <QuoteCard 
            key={quote.id} 
            quote={quote} 
            isSelected={selectedIds.includes(quote.id)}
            onToggleSelect={toggleSelect}
            isHistory={activeTab === 'history'}
          />
        ))}
        
        {activeData.length === 0 && (
          <div className="text-center py-16 bg-white rounded-[2.5rem] border border-gray-100 border-dashed">
            <CheckCircle2 size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-cura-dark mb-1">All caught up!</h3>
            <p className="text-cura-grey text-sm">No quotes waiting for your approval right now.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default ApprovalQueue;