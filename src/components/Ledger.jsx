import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend 
} from 'recharts';
import { 
  Search, Filter, Download, FileText, Printer, ChevronDown, 
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, AlertCircle, 
  FileCheck, Calendar, MoreHorizontal, X
} from 'lucide-react';

// --- Mock Data ---
const MOCK_CHART_DATA = [
  { month: 'Jan', inflow: 45000, outflow: 32000 },
  { month: 'Feb', inflow: 52000, outflow: 38000 },
  { month: 'Mar', inflow: 48000, outflow: 41000 },
  { month: 'Apr', inflow: 61000, outflow: 45000 },
  { month: 'May', inflow: 55000, outflow: 49000 },
  { month: 'Jun', inflow: 67000, outflow: 52000 },
];

const MOCK_TRANSACTIONS = [
  { id: 1, date: '12 May 2024', donor: 'Aditi Sharma', amount: 5000, category: 'Education', type: 'Inflow', status: 'Auto-Verified' },
  { id: 2, date: '11 May 2024', donor: 'Global Tech CSR', amount: 25000, category: 'Healthcare', type: 'Inflow', status: 'Verified' },
  { id: 3, date: '10 May 2024', donor: 'Vendor: Fresh Mart', amount: 1200, category: 'Food & Rations', type: 'Disbursement', status: 'Pending Review' },
  { id: 4, date: '08 May 2024', donor: 'Rahul Verma', amount: 2000, category: 'Emergency Relief', type: 'Inflow', status: 'Mismatch' },
  { id: 5, date: '05 May 2024', donor: 'Suresh Iyer', amount: 10000, category: 'Education', type: 'Inflow', status: 'Not Uploaded' },
  { id: 6, date: '02 May 2024', donor: 'Vendor: Apollo Med', amount: 4500, category: 'Healthcare', type: 'Disbursement', status: 'Auto-Verified' },
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [filterStatus, setFilterStatus] = useState('All Statuses');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [activeView, setActiveView] = useState('Monthly');
  const [reportFormat, setReportFormat] = useState('pdf');
  const [reportFY, setReportFY] = useState('FY 2023-24');

  const filteredTransactions = useMemo(() => {
    return MOCK_TRANSACTIONS.filter(tx => {
      const matchesSearch = tx.donor.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            tx.id.toString().includes(searchTerm);
      const matchesCategory = filterCategory === 'All Categories' || tx.category === filterCategory;
      const matchesStatus = filterStatus === 'All Statuses' || tx.status === filterStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchTerm, filterCategory, filterStatus]);

  const handleExportCSV = () => { /* Logic omitted for brevity */ };
  const handleDownloadReport = () => { setIsReportModalOpen(false); };

  return (
    <div className="font-jost max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 text-cura-dark dark:text-gray-100">
      
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
            className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-cura-blue rounded-xl shadow-lg shadow-blue-900/20 dark:shadow-none hover:scale-[1.02] active:scale-95 transition-all"
          >
            <FileText size={18} /> Generate
          </button>
        </div>
      </div>

      {/* 1. Enhanced Balance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard title="Total Inflow" value={284500} change={12} />
        <SummaryCard title="Total Disbursed" value={192300} change={-4} />
        <SummaryCard title="Pending Disbursements" value={92200} change={8} isPending />
      </div>

      {/* 2. Financial Overview Chart */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-bold">Financial Overview</h2>
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            {['Monthly', 'Quarterly', 'Yearly'].map(view => (
              <button 
                key={view}
                onClick={() => setActiveView(view)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeView === view ? 'bg-white dark:bg-gray-700 text-cura-blue dark:text-white shadow-sm' : 'text-cura-grey dark:text-gray-400 hover:text-cura-dark dark:hover:text-gray-200'}`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_CHART_DATA}>
              <defs>
                <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#17439B" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#17439B" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.05} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#83868E', fontSize: 12, fontWeight: 500}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#83868E', fontSize: 12}} tickFormatter={(value) => `₹${value/1000}k`} />
              <Tooltip contentStyle={{borderRadius: '12px', border: 'none', backgroundColor: '#1E2128', color: '#fff'}} />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{paddingBottom: '20px', fontSize: '12px', fontWeight: 600}} />
              <Area name="Inflow (Donations)" type="monotone" dataKey="inflow" stroke="#17439B" strokeWidth={3} fillOpacity={1} fill="url(#colorInflow)" />
              <Area name="Outflow (Spend)" type="monotone" dataKey="outflow" stroke="#17439B" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm dark:shadow-none flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cura-grey dark:text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search donor or transaction ID..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-sm focus:ring-4 focus:ring-cura-blue/10 focus:border-cura-blue outline-none transition-all dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-sm font-medium focus:ring-4 focus:ring-cura-blue/10 outline-none"
          >
            <option value="All Categories">All Categories</option>
            <option value="Education">Education</option>
            <option value="Healthcare">Healthcare</option>
          </select>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-sm font-medium focus:ring-4 focus:ring-cura-blue/10 outline-none"
          >
            <option value="All Statuses">All Statuses</option>
            <option value="Verified">Verified</option>
            <option value="Pending Review">Pending Review</option>
          </select>
          <button className="p-2.5 text-cura-grey dark:text-gray-400 hover:text-cura-dark dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all">
            <Calendar size={20} />
          </button>
          <button 
            onClick={() => { setSearchTerm(''); setFilterCategory('All Categories'); setFilterStatus('All Statuses'); }}
            className="text-xs font-bold text-cura-grey dark:text-gray-400 hover:text-cura-blue dark:hover:text-blue-400 px-2 transition-all"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* 4. Transaction Ledger Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm dark:shadow-none overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
              <th className="px-6 py-4 text-[10px] font-bold text-cura-grey dark:text-gray-400 uppercase tracking-widest">Date</th>
              <th className="px-6 py-4 text-[10px] font-bold text-cura-grey dark:text-gray-400 uppercase tracking-widest">Donor/Vendor</th>
              <th className="px-6 py-4 text-[10px] font-bold text-cura-grey dark:text-gray-400 uppercase tracking-widest">Category</th>
              <th className="px-6 py-4 text-[10px] font-bold text-cura-grey dark:text-gray-400 uppercase tracking-widest">Type</th>
              <th className="px-6 py-4 text-[10px] font-bold text-cura-grey dark:text-gray-400 uppercase tracking-widest">Verification</th>
              <th className="px-6 py-4 text-[10px] font-bold text-cura-grey dark:text-gray-400 uppercase tracking-widest text-right">Amount</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {filteredTransactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors group">
                <td className="px-6 py-4 text-sm font-medium text-cura-grey dark:text-gray-400">{tx.date}</td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-cura-dark dark:text-gray-100 hover:text-cura-blue dark:hover:text-blue-400 cursor-pointer transition-all">
                    {tx.donor}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-cura-grey dark:text-gray-300 text-[10px] font-bold uppercase tracking-tight">
                    {tx.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[11px] font-bold">{tx.type}</span>
                </td>
                <td className="px-6 py-4"><StatusBadge status={tx.status} /></td>
                <td className="px-6 py-4 text-right font-bold text-cura-dark dark:text-gray-100">
                  ₹{tx.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-cura-grey hover:text-cura-blue dark:hover:text-blue-400 hover:bg-cura-blue/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                    <MoreHorizontal size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 6. Pending Disbursements Section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm dark:shadow-none overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Pending Allocations</h2>
            <p className="text-xs text-cura-grey dark:text-gray-400 mt-1">Foundational funds waiting to be mapped to active needs.</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-500">₹92,200</span>
            <p className="text-[10px] font-bold text-cura-grey dark:text-gray-500 uppercase tracking-widest">Total Unallocated</p>
          </div>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {MOCK_PENDING_POOLS.map((pool) => (
            <div key={pool.id} className={`p-4 flex items-center justify-between transition-colors ${pool.days > 30 ? 'bg-red-50/30 dark:bg-red-900/10' : pool.days > 7 ? 'bg-amber-50/30 dark:bg-amber-900/10' : ''}`}>
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-xl ${pool.days > 30 ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' : 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'}`}>
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold">{pool.donor}</p>
                  <p className="text-xs text-cura-grey dark:text-gray-500">Received on {pool.date} • {pool.days} days ago</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-sm font-bold">₹{pool.amount.toLocaleString()}</span>
                <button className="px-4 py-2 text-xs font-bold text-white bg-cura-blue rounded-xl hover:opacity-90 active:scale-95 transition-all">
                  Allocate Funds
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cura-dark/40 dark:bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border dark:border-gray-800">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-bold text-lg dark:text-white">Generate Report</h3>
              <button onClick={() => setIsReportModalOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"><X size={20} className="dark:text-gray-400"/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-cura-grey dark:text-gray-400 uppercase tracking-widest block mb-2">Financial Year</label>
                <select 
                  value={reportFY}
                  onChange={(e) => setReportFY(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent dark:text-white text-sm outline-none focus:ring-2 focus:ring-cura-blue/20"
                >
                  <option value="FY 2023-24">FY 2023-24</option>
                  <option value="FY 2022-23">FY 2022-23</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-cura-grey dark:text-gray-400 uppercase tracking-widest block mb-2">Format</label>
                <div className="flex gap-4">
                  <div 
                    onClick={() => setReportFormat('pdf')}
                    className={`flex-1 p-3 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition-all ${
                      reportFormat === 'pdf' ? 'border-cura-blue bg-blue-50/50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                    }`}
                  >
                    <FileText className={reportFormat === 'pdf' ? 'text-cura-blue dark:text-blue-400' : 'text-cura-grey dark:text-gray-500'} />
                    <span className={`text-xs font-bold ${reportFormat === 'pdf' ? 'text-cura-blue dark:text-blue-400' : 'text-cura-dark dark:text-gray-300'}`}>PDF Report</span>
                  </div>
                  <div 
                    onClick={() => setReportFormat('csv')}
                    className={`flex-1 p-3 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition-all ${
                      reportFormat === 'csv' ? 'border-cura-blue bg-blue-50/50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                    }`}
                  >
                    <Download className={reportFormat === 'csv' ? 'text-cura-blue dark:text-blue-400' : 'text-cura-grey dark:text-gray-500'} />
                    <span className={`text-xs font-bold ${reportFormat === 'csv' ? 'text-cura-blue dark:text-blue-400' : 'text-cura-dark dark:text-gray-300'}`}>Excel/CSV</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 flex gap-3">
              <button 
                onClick={() => setIsReportModalOpen(false)} 
                className="flex-1 py-2.5 text-sm font-bold text-cura-grey dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDownloadReport}
                className="flex-1 py-2.5 text-sm font-bold text-white bg-cura-blue hover:bg-blue-700 rounded-xl transition-colors"
              >
                Download Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}