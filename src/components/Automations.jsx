import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Plus, X, ShieldAlert, Bot } from 'lucide-react';

const defaultAutomations = [
  {
    title: 'Vendor Negotiation',
    agent: 'Procurement Agent',
    description: 'AI autonomously messages vendors on WhatsApp, parses quotes, and selects the best price.',
    status: 'approval'
  },
  {
    title: 'Donation Allocation',
    agent: 'Finance Agent',
    description: 'AI automatically maps incoming funds to high-priority orphanage needs (food, medicine, education).',
    status: 'autonomous'
  },
  {
    title: 'Impact Reporting',
    agent: 'Communication Agent',
    description: 'AI sends real-time WhatsApp updates to donors when their funds are spent, including receipts.',
    status: 'autonomous'
  },
  {
    title: 'Receipt Generation',
    agent: 'Compliance Agent',
    description: 'AI generates and verifies tax-exemption receipts for Indian donors automatically.',
    status: 'approval'
  }
];

const AutomationCard = ({ id, title, description, agent, status, onToggle }) => (
  <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-800 flex flex-col gap-4 transition-all hover:border-gray-300 dark:hover:border-gray-700">
    <div className="flex justify-between items-start">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-cura-blue dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md mb-2 inline-block">
          {agent}
        </span>
        <h3 className="text-lg font-bold text-cura-dark dark:text-gray-100">{title}</h3>
      </div>
      <div 
        onClick={() => onToggle(id, status)}
        className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ${
          status === 'autonomous' ? 'bg-cura-blue' : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${
          status === 'autonomous' ? 'left-7' : 'left-1'
        }`} />
      </div>
    </div>
    <p className="text-sm text-cura-grey dark:text-gray-400 leading-relaxed">
      {description}
    </p>
    <div className="flex items-center gap-2 mt-2">
      <div className={`w-2 h-2 rounded-full ${status === 'autonomous' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
      <span className="text-[10px] font-bold uppercase text-cura-grey dark:text-gray-500">
        Mode: {status === 'autonomous' ? 'Full Autonomy' : 'Human Approval Required'}
      </span>
    </div>
  </div>
);

const Automations = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '', agent: 'Custom Agent', description: '', status: 'approval'
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "automations"), async (snapshot) => {
      if (snapshot.empty) {
          console.log("No automations found. Seeding default rules...");
          let newConfigs = [];
          for (const rule of defaultAutomations) {
            const docRef = await addDoc(collection(db, "automations"), rule);
            newConfigs.push({ id: docRef.id, ...rule });
          }
          setConfigs(newConfigs);
        } else {
      setConfigs(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
      }
    setLoading(false);
  });
   return () => unsub();
}, []);

  // Update Firebase on Toggle
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'autonomous' ? 'approval' : 'autonomous';
    
    // Optimistic UI Update
    setConfigs(configs.map(c => c.id === id ? { ...c, status: newStatus } : c));

    try {
      const docRef = doc(db, "automations", id);
      await updateDoc(docRef, { status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
      setConfigs(configs.map(c => c.id === id ? { ...c, status: currentStatus } : c));
    }
  };
  const handleAddRule = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newRule = { ...formData };
      const docRef = await addDoc(collection(db, "automations"), newRule);
      
      setConfigs([...configs, { id: docRef.id, ...newRule }]);
      setFormData({ title: '', agent: 'Custom Agent', description: '', status: 'approval' });
      setIsAddModalOpen(false);
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error adding custom rule:", error);
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center font-jost">
        <div className="flex flex-col items-center gap-4">
          <ShieldAlert size={40} className="text-cura-blue animate-pulse" />
          <p className="text-cura-dark dark:text-white font-bold text-xl">Loading AI Rules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-jost p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-cura-dark dark:text-gray-100">AI Governance & Automations</h2>
          <p className="text-cura-grey dark:text-gray-400 text-sm mt-2">
            Configure the "Human-in-the-Loop" guardrails for CURA's autonomous agents. 
            Tasks set to <b className="dark:text-gray-200">Approval</b> will route to the Approvals tab.
          </p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-cura-dark dark:bg-cura-blue rounded-xl hover:bg-black dark:hover:bg-blue-600 transition-all shadow-md shrink-0 w-max"
        >
          <Plus size={18} /> Create Custom Rule
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {configs.map(config => (
          <AutomationCard 
            key={config.id} 
            {...config} 
            onToggle={handleToggleStatus} 
          />
        ))}
      </div>

      {/* ADD CUSTOM RULE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-cura-blue dark:text-blue-400">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-cura-dark dark:text-gray-100">Create Custom Rule</h3>
                  <p className="text-xs text-cura-grey dark:text-gray-400 font-medium">Define a new AI boundary.</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddRule} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-cura-grey dark:text-gray-400">Rule Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-cura-dark dark:text-gray-200 text-sm font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cura-blue/30" placeholder="e.g., Auto-Approve < ₹5000" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-cura-grey dark:text-gray-400">Target Agent</label>
                <input required type="text" value={formData.agent} onChange={e => setFormData({...formData, agent: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-cura-dark dark:text-gray-200 text-sm font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cura-blue/30" placeholder="e.g., Procurement Agent" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-cura-grey dark:text-gray-400">Rule Description</label>
                <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-cura-dark dark:text-gray-200 text-sm font-medium rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cura-blue/30 resize-none" placeholder="Describe what the AI is allowed to do under this rule..." />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-cura-grey dark:text-gray-400">Initial State</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-cura-dark dark:text-gray-200 text-sm font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cura-blue/30 cursor-pointer">
                  <option value="approval">Human Approval Required</option>
                  <option value="autonomous">Full Autonomy</option>
                </select>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full mt-4 py-3.5 bg-cura-dark dark:bg-cura-blue text-white font-bold rounded-xl hover:bg-black dark:hover:bg-blue-600 transition-colors shadow-lg disabled:opacity-50">
                {isSubmitting ? 'Saving to Database...' : 'Save Custom Rule'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Automations;