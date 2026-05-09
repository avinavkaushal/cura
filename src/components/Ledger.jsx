import React, { useState, useMemo, useEffect } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend 
} from 'recharts';
import { 
  Search, Filter, Download, FileText, Printer, ChevronDown, 
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, AlertCircle, 
  FileCheck, Calendar, MoreHorizontal, X
} from 'lucide-react';

// --- Hardcoded Data for charts & pools (We will make these dynamic later!) ---
const MOCK_CHART_DATA = [
  { month: 'Jan', inflow: 45000, outflow: 32000 },
  { month: 'Feb', inflow: 52000, outflow: 38000 },
  { month: 'Mar', inflow: 48000, outflow: 41000 },
  { month: 'Apr', inflow: 61000, outflow: 45000 },
  { month: 'May', inflow: 55000, outflow: 49000 },
  { month: 'Jun', inflow: 67000, outflow: 52000 },
];

const MOCK_PENDING_POOLS = [
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

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [filterStatus, setFilterStatus] = useState('All Statuses');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [activeView, setActiveView] = useState('Monthly');
  const [reportFormat, setReportFormat] = useState('pdf');
  const [reportFY, setReportFY] = useState('FY 2023-24');

  // FETCH FROM FIREBASE
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "transactions"));
        const liveData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTransactions(liveData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching transactions: ", error);
        setLoading(false);
      }
    };
    fetchTransactions();
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

  const handleExportCSV = () => { /* Logic omitted for brevity */ };
  const handleDownloadReport = () => { setIsReportModalOpen(false); };

  if (loading) {
    return (
      <div className="w-full min-h-screen p-8 flex items-center justify-center font-jost">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle size={40} className="text-cura-blue animate-bounce" />
          <p className="text-cura-dark dark:text-white font-bold text-xl">Loading Ledger from Database...</p>
        </div>
      </div>
    );
  }

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
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-cura-blue dark:text-blue-400 border-2 border-cura-blue/10 dark:border-blue-500/20 rounded-xl hover:bg-cura-blue/5 dark:hover:bg-blue-500/10 transition-all"
          >
            <Download size={18} /> Export CSV
          </button>
          
          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-cura-dark dark:bg-cura-blue rounded-xl hover:bg-black dark:hover:bg-blue-600 transition-all shadow-md hover:shadow-lg"
          >
            <FileText size={18} /> Generate 80G Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard title="Total Inflow (May)" value={145000} change={12.5} />
        <SummaryCard title="Total Outflow (May)" value={82000} change={-4.2} />
        <SummaryCard title="Pending Allocations" value={25500} change={8.1} isPending />
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
                        <div className="text-[10px] font-mono text-cura-grey dark:text-gray-500">TXN-{tx.id.toString().substring(0,6)}</div>
                      </td>
                      <td className="py-4 px-6 font-bold text-cura-dark dark:text-gray-200">{tx.donor}</td>
                      <td className="py-4 px-6 text-cura-grey dark:text-gray-400 font-medium">{tx.category}</td>
                      <td className={`py-4 px-6 text-right font-bold ${tx.type === 'Inflow' ? 'text-green-600 dark:text-green-400' : 'text-cura-dark dark:text-gray-100'}`}>
                        {tx.type === 'Inflow' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={tx.status} />
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-cura-dark dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-cura-blue dark:hover:border-cura-blue/50 hover:text-cura-blue dark:hover:text-blue-400 transition-all">
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
              <h3 className="font-bold text-lg flex items-center gap-2">
                Pending Allocations
                <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] px-2 py-0.5 rounded-full">Action Needed</span>
              </h3>
            </div>
            <p className="text-xs text-cura-grey dark:text-gray-400 mb-4">Funds received but not yet tied to a specific initiative or purchase order.</p>
            
            <div className="space-y-3">
              {MOCK_PENDING_POOLS.map(pool => (
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
                    <button className="text-xs font-bold text-cura-dark dark:text-gray-200 hover:text-cura-blue dark:hover:text-blue-400 transition-colors">
                      Allocate →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- 80G Report Generation Modal --- */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
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
              <button 
                onClick={() => setIsReportModalOpen(false)}
                className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Financial Year Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-cura-grey dark:text-gray-400">Financial Year</label>
                <div className="relative">
                  <select 
                    value={reportFY}
                    onChange={(e) => setReportFY(e.target.value)}
                    className="w-full appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-cura-dark dark:text-gray-200 text-sm font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cura-blue/30 cursor-pointer"
                  >
                    <option value="FY 2023-24">FY 2023-24 (Current)</option>
                    <option value="FY 2022-23">FY 2022-23</option>
                    <option value="FY 2021-22">FY 2021-22</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Format Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-cura-grey dark:text-gray-400">Export Format</label>
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    onClick={() => setReportFormat('pdf')}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      reportFormat === 'pdf' 
                        ? 'border-cura-blue bg-blue-50/50 dark:border-blue-500 dark:bg-blue-500/10' 
                        : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${reportFormat === 'pdf' ? 'bg-cura-blue text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${reportFormat === 'pdf' ? 'text-cura-blue dark:text-blue-400' : 'text-cura-dark dark:text-gray-300'}`}>PDF File</p>
                      <p className="text-[10px] text-gray-400">Ready to print</p>
                    </div>
                  </div>
                  
                  <div 
                    onClick={() => setReportFormat('csv')}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      reportFormat === 'csv' 
                        ? 'border-cura-blue bg-blue-50/50 dark:border-blue-500 dark:bg-blue-500/10' 
                        : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${reportFormat === 'csv' ? 'bg-cura-blue text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                      <Download size={16} />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${reportFormat === 'csv' ? 'text-cura-blue dark:text-blue-400' : 'text-cura-dark dark:text-gray-300'}`}>CSV Data</p>
                      <p className="text-[10px] text-gray-400">For Excel/Sheets</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 dark:border-gray-800">
              <button 
                onClick={handleDownloadReport}
                className="w-full py-3.5 bg-cura-dark dark:bg-cura-blue text-white font-bold rounded-xl hover:bg-black dark:hover:bg-blue-600 transition-colors shadow-lg flex justify-center items-center gap-2"
              >
                Generate & Download
              </button>
              <p className="text-center text-[10px] text-cura-grey dark:text-gray-500 mt-3 flex items-center justify-center gap-1">
                <CheckCircle2 size={12} className="text-green-500" />
                Certificates are digitally signed by CURA Automations.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}