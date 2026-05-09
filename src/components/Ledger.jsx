import React, { useState, useMemo, useEffect } from 'react';
import { collection, onSnapshot, addDoc } from "firebase/firestore";
import { db } from "../firebase";

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend 
} from 'recharts';
import { 
  Search, Filter, Download, FileText, Printer, ChevronDown, 
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, AlertCircle, 
  FileCheck, Calendar, MoreHorizontal, X, Plus, ExternalLink
} from 'lucide-react';

// --- Hardcoded Data for charts (We will make these dynamic later!) ---
const MOCK_CHART_DATA = [
  { month: 'Jan', inflow: 45000, outflow: 32000 },
  { month: 'Feb', inflow: 52000, outflow: 38000 },
  { month: 'Mar', inflow: 48000, outflow: 41000 },
  { month: 'Apr', inflow: 61000, outflow: 45000 },
  { month: 'May', inflow: 55000, outflow: 49000 },
  { month: 'Jun', inflow: 67000, outflow: 52000 },
];

const INITIAL_PENDING_POOLS = [
  { id: 'p1', donor: 'Meera Kapoor', amount: 15000, date: '2024-04-10', days: 32 },
  { id: 'p2', donor: 'Ankit Das', amount: 2500, date: '2024-05-01', days: 11 },
  { id: 'p3', donor: 'Sneha Reddy', amount: 8000, date: '2024-05-08', days: 4 },
];

// --- Sub-components ---
const StatusBadge = ({ status }) => {
  return (
    <span className="px-3 py-1 rounded-full text-[11px] font-semibold border bg-gray-100 dark:bg-gray-800 text-cura-dark dark:text-gray-200 border-gray-200 dark:border-gray-700 flex items-center gap-1.5 w-fit">
      {status}
    </span>
  );
};

const SummaryCard = ({ title, value, change, isPending }) => (
  <div className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 p-6 rounded-2xl border shadow-sm dark:shadow-none transition-all hover:shadow-md">
    <p className="text-cura-grey dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">{title}</p>
    <div className="flex items-end justify-between">
      <h3 className="text-3xl font-bold text-cura-dark dark:text-gray-100 tracking-tight">₹{value.toLocaleString()}</h3>
      <span className="flex items-center text-xs font-bold px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-cura-dark dark:text-gray-200">
        {change > 0 ? <ArrowUpRight size={14} className="text-green-500" /> : <ArrowDownRight size={14} className="text-red-500" />}
        {Math.abs(change)}%
      </span>
    </div>
  </div>
);

// --- Main Ledger Component ---
export default function Ledger() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingPools, setPendingPools] = useState(INITIAL_PENDING_POOLS);
  const [donors, setDonors] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [filterStatus, setFilterStatus] = useState('All Statuses');
  
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState(null); 
  const [selectedTransaction, setSelectedTransaction] = useState(null); 

  const [reportFormat, setReportFormat] = useState('pdf');
  const [reportFY, setReportFY] = useState('FY 2023-24');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    donor: '',
    amount: '',
    category: 'Education',
    type: 'Inflow'
  });

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newTx = {
        date: formData.date,
        donor: formData.donor,
        amount: Number(formData.amount),
        category: formData.category,
        type: formData.type,
        status: 'Verified'
      };
      const docRef = await addDoc(collection(db, "transactions"), newTx);
      setTransactions([{ id: docRef.id, ...newTx }, ...transactions]);
      
      setFormData({ ...formData, donor: '', amount: '' });
      setIsAddModalOpen(false);
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error adding transaction:", error);
      setIsSubmitting(false);
    }
  };

const handleAllocateFunds = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  try {
    await addDoc(collection(db, "transactions"), {
      donor: selectedAllocation.donor,
      amount: Number(selectedAllocation.amount),
      category: "Allocated Donation", 
      type: "Inflow",
      date: new Date().toLocaleDateString('en-GB'),
      status: 'Allocated'
    });

    // 2. Delete the temporary entry from the pending pool
    await deleteDoc(doc(db, "pendingPools", selectedAllocation.id));
    
    setSelectedAllocation(null);
    setIsSubmitting(false);
  } catch (err) {
    console.error("Allocation failed:", err);
    setIsSubmitting(false);
  }
};

useEffect(() => {
  // 1. Live listener for the main Ledger
  const unsubTx = onSnapshot(collection(db, "transactions"), (snap) => {
    setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });

  // 2. Live listener for the Pending Pool
  const unsubPools = onSnapshot(collection(db, "pendingPools"), (snap) => {
    setPendingPools(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });

  const unsubDonors = onSnapshot(collection(db, "donors"), (snap) => {
    setDonors(snap.docs.map(d => ({ id: d.id, ...d.data() }))); 
    setLoading(false);
  });

  return () => { unsubTx(); unsubPools(); unsubDonors(); };
}, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = tx.donor?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            tx.id?.toString().includes(searchTerm);
      const matchesCategory = filterCategory === 'All Categories' || tx.category === filterCategory;
      const matchesStatus = filterStatus === 'All Statuses' || tx.status === filterStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [transactions, searchTerm, filterCategory, filterStatus]);

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] p-8 flex items-center justify-center font-jost">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle size={40} className="text-cura-blue animate-bounce" />
          <p className="text-cura-dark dark:text-white font-bold text-xl">Loading Ledger from Database...</p>
        </div>
      </div>
    );
  }

  const donorInfo = selectedTransaction ? donors.find(d => d.name === selectedTransaction.donor) : null;

  const totalInflow = transactions.filter(t => t.type === 'Inflow').reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalOutflow = transactions.filter(t => t.type === 'Disbursement').reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalPending = pendingPools.reduce((s, p) => s + Number(p.amount || 0), 0);

  return (
    <div className="font-jost max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 text-cura-dark dark:text-gray-100 p-8">
      
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Financial Ledger</h1>
          <p className="text-cura-grey dark:text-gray-400 text-sm">Track donations, monitor disbursements, and manage tax compliance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-cura-blue dark:text-blue-400 border-2 border-cura-blue/10 dark:border-blue-500/20 rounded-xl hover:bg-cura-blue/5 dark:hover:bg-blue-500/10 transition-all"
          >
            <Printer size={18} /> Print
          </button>
          
          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-cura-dark dark:bg-cura-blue rounded-xl hover:bg-black dark:hover:bg-blue-600 transition-all shadow-md hover:shadow-lg"
          >
            <FileText size={18} /> Generate 80G
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 dark:bg-emerald-500 rounded-xl hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all shadow-md hover:shadow-lg"
          >
            <Plus size={18} /> Log Transaction
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard title="Total Inflow (May)" value={totalInflow} change={12.5} />
        <SummaryCard title="Total Outflow (May)" value={totalOutflow} change={-4.2} />
        <SummaryCard title="Pending Allocations" value={totalPending} change={8.1} isPending />
        <SummaryCard title="Verifications Required" value={14} change={-2.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Main Ledger Table */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search transactions, donors, or IDs..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cura-blue/20 transition-all text-cura-dark dark:text-gray-100"
              />
            </div>
            
            <div className="relative w-full sm:w-56">
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-cura-blue/20 cursor-pointer text-cura-dark dark:text-gray-100"
              >
                <option>All Categories</option>
                <option>Education</option>
                <option>Healthcare</option>
                <option>Emergency Relief</option>
                <option>Food & Rations</option>
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-[10px] uppercase tracking-wider text-cura-grey dark:text-gray-400 font-bold border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="py-4 px-6">Date & ID</th>
                    <th className="py-4 px-6">Entity</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6 text-right">Amount</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-cura-dark dark:text-gray-100">{tx.date}</div>
                        <div className="text-[10px] font-mono text-cura-grey dark:text-gray-500">TXN-{tx.id?.toString().substring(0,6)}</div>
                      </td>
                      <td className="py-4 px-6 font-bold text-cura-dark dark:text-gray-200">{tx.donor}</td>
                      <td className="py-4 px-6 text-cura-grey dark:text-gray-400 font-medium">{tx.category}</td>
                      <td className={`py-4 px-6 text-right font-bold ${tx.type === 'Inflow' ? 'text-green-600 dark:text-green-400' : 'text-cura-dark dark:text-gray-100'}`}>
                        {tx.type === 'Inflow' ? '+' : '-'}₹{Number(tx.amount).toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={tx.status} />
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button 
                          onClick={() => setSelectedTransaction(tx)}
                          className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-cura-dark dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-cura-blue dark:hover:border-cura-blue/50 hover:text-cura-blue dark:hover:text-blue-400 transition-all"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-cura-grey dark:text-gray-500 font-medium">
                        No transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Insights & Tasks */}
        <div className="space-y-6">
          
          {/* Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Financial Overview</h3>
              <select className="text-xs bg-gray-50 dark:bg-gray-800 border-none rounded-lg px-2 py-1 font-semibold outline-none cursor-pointer">
                <option>Monthly</option>
                <option>Quarterly</option>
              </select>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_CHART_DATA}>
                  <defs>
                    <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#888'}} dy={10} />
                  <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Area type="monotone" dataKey="inflow" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorInflow)" />
                  <Area type="monotone" dataKey="outflow" stroke="#17439B" strokeWidth={2} strokeDasharray="4 4" fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pending Allocation Pool */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">Pending Allocations</h3>
            </div>
            <p className="text-xs text-cura-grey dark:text-gray-400 mb-4">Funds received but not yet tied to a specific initiative or purchase order.</p>
            
            <div className="space-y-3">
              {pendingPools.map(pool => (
                <div key={pool.id} className={`p-4 rounded-2xl border ${pool.days > 30 ? 'border-red-100 bg-red-50/50 dark:border-red-900/30 dark:bg-red-900/10' : 'border-gray-100 dark:border-gray-800'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-cura-dark dark:text-gray-100 text-sm">{pool.donor}</p>
                      <p className="text-[10px] font-bold text-cura-grey dark:text-gray-500 uppercase tracking-wider">{pool.date}</p>
                    </div>
                    <span className="font-bold text-cura-blue dark:text-blue-400">₹{pool.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className={`text-xs font-bold flex items-center gap-1 ${pool.days > 30 ? 'text-red-500' : 'text-amber-500'}`}>
                      <Clock size={12} /> {pool.days} days unallocated
                    </span>
                    <button 
                      onClick={() => setSelectedAllocation(pool)}
                      className="text-xs font-bold text-cura-dark dark:text-gray-200 hover:text-cura-blue dark:hover:text-blue-400 transition-colors"
                    >
                      Allocate →
                    </button>
                  </div>
                </div>
              ))}
              {pendingPools.length === 0 && (
                <div className="text-center py-6 text-cura-grey dark:text-gray-500 font-bold text-sm">
                  All funds allocated!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- ALLOCATE FUNDS MODAL --- */}
      {selectedAllocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
              <div>
                <h3 className="font-bold text-lg text-cura-dark dark:text-gray-100">Allocate Funds</h3>
                <p className="text-xs text-cura-grey dark:text-gray-400 font-medium">Route donation to a specific need.</p>
              </div>
              <button onClick={() => setSelectedAllocation(null)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAllocateFunds} className="p-6 space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 mb-4">
                <p className="text-xs font-bold uppercase text-cura-grey dark:text-gray-400 mb-1">Available to Allocate</p>
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-black text-cura-blue dark:text-blue-400">₹{selectedAllocation.amount.toLocaleString()}</span>
                  <span className="text-sm font-bold text-cura-dark dark:text-gray-300">from {selectedAllocation.donor}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-cura-grey dark:text-gray-400">Target Category</label>
                <select className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-cura-dark dark:text-gray-200 text-sm font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cura-blue/30 cursor-pointer">
                  <option>Education & School Fees</option>
                  <option>Medical Supplies</option>
                  <option>Food & Daily Rations</option>
                  <option>Infrastructure</option>
                </select>
              </div>
              <button type="submit" className="w-full mt-4 py-3.5 bg-cura-dark dark:bg-cura-blue text-white font-bold rounded-xl hover:bg-black dark:hover:bg-blue-600 transition-colors shadow-lg">
                Confirm Allocation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- TRANSACTION DETAILS MODAL --- */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-bold text-lg text-cura-dark dark:text-gray-100">Receipt Details</h3>
              <button onClick={() => setSelectedTransaction(null)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="text-center">
                <p className="text-xs font-bold text-cura-grey dark:text-gray-400 uppercase tracking-widest mb-1">{selectedTransaction.type}</p>
                <h2 className={`text-4xl font-black ${selectedTransaction.type === 'Inflow' ? 'text-green-500' : 'text-cura-dark dark:text-white'}`}>
                  {selectedTransaction.type === 'Inflow' ? '+' : '-'}₹{Number(selectedTransaction.amount).toLocaleString()}
                </h2>
              </div>
              
              <div className="space-y-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 text-sm">
                <div className="flex justify-between">
                  <span className="text-cura-grey dark:text-gray-400 font-semibold">Date</span>
                  <span className="font-bold dark:text-gray-200">{selectedTransaction.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cura-grey dark:text-gray-400 font-semibold">Txn ID</span>
                  <span className="font-mono font-bold dark:text-gray-200">{selectedTransaction.id?.substring(0,8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cura-grey dark:text-gray-400 font-semibold">Entity</span>
                  <span className="font-bold dark:text-gray-200">{selectedTransaction.donor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cura-grey dark:text-gray-400 font-semibold">PAN Card</span>
                  <span className="font-mono font-bold dark:text-gray-200">{donorInfo ? donorInfo.pan_number : "PAN not found in CRM"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cura-grey dark:text-gray-400 font-semibold">Email</span>
                  <span className="font-bold dark:text-gray-200">{donorInfo ? donorInfo.email : "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cura-grey dark:text-gray-400 font-semibold">Category</span>
                  <span className="font-bold dark:text-gray-200">{selectedTransaction.category}</span>
                </div>
              </div>

              <button className="w-full py-3 flex items-center justify-center gap-2 text-cura-blue dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                <ExternalLink size={16} /> View Original Bank Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD TRANSACTION MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
              <div>
                <h3 className="font-bold text-lg text-cura-dark dark:text-gray-100">Log Transaction</h3>
                <p className="text-xs text-cura-grey dark:text-gray-400 font-medium">Record an inflow or outflow of funds.</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddTransaction} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-cura-grey dark:text-gray-400">Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-cura-dark dark:text-gray-200 text-sm font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cura-blue/30">
                    <option value="Inflow">Inflow (Donation)</option>
                    <option value="Disbursement">Outflow (Expense)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-cura-grey dark:text-gray-400">Amount (₹)</label>
                  <input required type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-cura-dark dark:text-gray-200 text-sm font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cura-blue/30" placeholder="e.g., 5000" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-cura-grey dark:text-gray-400">Entity (Donor or Vendor)</label>
                <input required type="text" value={formData.donor} onChange={e => setFormData({...formData, donor: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-cura-dark dark:text-gray-200 text-sm font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cura-blue/30" placeholder="e.g., Aditi Sharma" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-cura-grey dark:text-gray-400">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-cura-dark dark:text-gray-200 text-sm font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cura-blue/30">
                    <option>Education</option>
                    <option>Healthcare</option>
                    <option>Emergency Relief</option>
                    <option>Food & Rations</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-cura-grey dark:text-gray-400">Date</label>
                  <input required type="text" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-cura-dark dark:text-gray-200 text-sm font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cura-blue/30" />
                </div>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full mt-4 py-3.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg disabled:opacity-50">
                {isSubmitting ? 'Saving...' : 'Save Transaction'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- 80G Modal (kept exactly as you had it previously) --- */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-cura-blue dark:text-blue-400">
                  <FileCheck size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-cura-dark dark:text-gray-100">80G Tax Report</h3>
                  <p className="text-xs text-cura-grey dark:text-gray-400 font-medium">Batch generate donor certificates</p>
                </div>
              </div>
              <button onClick={() => setIsReportModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-cura-grey dark:text-gray-400">Financial Year</label>
                <div className="relative">
                  <select value={reportFY} onChange={(e) => setReportFY(e.target.value)} className="w-full appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-cura-dark dark:text-gray-200 text-sm font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cura-blue/30 cursor-pointer">
                    <option value="FY 2023-24">FY 2023-24 (Current)</option>
                    <option value="FY 2022-23">FY 2022-23</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-cura-grey dark:text-gray-400">Export Format</label>
                <div className="grid grid-cols-2 gap-3">
                  <div onClick={() => setReportFormat('pdf')} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${reportFormat === 'pdf' ? 'border-cura-blue bg-blue-50/50 dark:border-blue-500 dark:bg-blue-500/10' : 'border-gray-100 dark:border-gray-800'}`}>
                    <div className={`p-2 rounded-lg ${reportFormat === 'pdf' ? 'bg-cura-blue text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${reportFormat === 'pdf' ? 'text-cura-blue dark:text-blue-400' : 'text-cura-dark dark:text-gray-300'}`}>PDF File</p>
                    </div>
                  </div>
                  <div onClick={() => setReportFormat('csv')} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${reportFormat === 'csv' ? 'border-cura-blue bg-blue-50/50 dark:border-blue-500 dark:bg-blue-500/10' : 'border-gray-100 dark:border-gray-800'}`}>
                    <div className={`p-2 rounded-lg ${reportFormat === 'csv' ? 'bg-cura-blue text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                      <Download size={16} />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${reportFormat === 'csv' ? 'text-cura-blue dark:text-blue-400' : 'text-cura-dark dark:text-gray-300'}`}>CSV Data</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => setIsReportModalOpen(false)} className="w-full py-3.5 bg-cura-dark dark:bg-cura-blue text-white font-bold rounded-xl hover:bg-black dark:hover:bg-blue-600 transition-colors shadow-lg flex justify-center items-center gap-2">
                Generate & Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}