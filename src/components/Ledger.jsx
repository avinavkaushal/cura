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
    <span className="px-3 py-1 rounded-full text-[11px] font-semibold border bg-gray-100 text-cura-dark border-gray-200 flex items-center gap-1.5 w-fit">
      {status}
    </span>
  );
};

const SummaryCard = ({ title, value, change, isPending }) => (
  <div className="bg-white border-gray-100 p-6 rounded-2xl border shadow-sm transition-all hover:shadow-md">
    <p className="text-cura-grey text-[10px] font-bold uppercase tracking-widest mb-2">{title}</p>
    <div className="flex items-end justify-between">
      <h3 className="text-3xl font-bold text-cura-dark tracking-tight">₹{value.toLocaleString()}</h3>
      <span className="flex items-center text-xs font-bold px-2 py-1 rounded-lg bg-gray-100 text-cura-dark">
        {change > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
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
  
  // --- ADDED: State for the Modal ---
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

  const handleExportCSV = () => {
    const headers = ['Date', 'Donor/Vendor', 'Category', 'Type', 'Verification Status', 'Amount (INR)'];
    const csvRows = filteredTransactions.map(tx => 
      `"${tx.date}","${tx.donor}","${tx.category}","${tx.type}","${tx.status}",${tx.amount}`
    );
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'cura_ledger_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- ADDED: Handler for the modal's download button ---
  const handleDownloadReport = () => {
    if (reportFormat === 'csv') {
      handleExportCSV(); // Reuse the real CSV download!
    } else {
      // Mock PDF behavior (since we don't have a backend to render PDFs yet)
      alert(`Generating PDF Report for ${reportFY}...\n\n(In production, this would download a formatted PDF file)`);
    }
    // Close the modal after downloading
    setIsReportModalOpen(false);
  };

  return (
    <div className="font-jost max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-cura-dark">Financial Ledger</h1>
          <p className="text-cura-grey text-sm">Track donations, monitor disbursements, and manage tax compliance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-cura-blue border-2 border-cura-blue/10 rounded-xl hover:bg-cura-blue/5 transition-all"
          >
            <Printer size={18} /> Print
          </button>
          
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-cura-blue border-2 border-cura-blue/10 rounded-xl hover:bg-cura-blue/5 transition-all"
          >
            <Download size={18} /> Export CSV
          </button>
          
          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-cura-blue rounded-xl shadow-lg shadow-blue-900/20 hover:scale-[1.02] active:scale-95 transition-all"
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
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-bold text-cura-dark">Financial Overview</h2>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {['Monthly', 'Quarterly', 'Yearly'].map(view => (
              <button 
                key={view}
                onClick={() => setActiveView(view)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeView === view ? 'bg-white text-cura-blue shadow-sm' : 'text-cura-grey hover:text-cura-dark'}`}
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
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#83868E', fontSize: 12, fontWeight: 500}} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#83868E', fontSize: 12}}
                tickFormatter={(value) => `₹${value/1000}k`}
              />
              <Tooltip 
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
              />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{paddingBottom: '20px', fontSize: '12px', fontWeight: 600}} />
              <Area 
                name="Inflow (Donations)"
                type="monotone" 
                dataKey="inflow" 
                stroke="#17439B" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorInflow)" 
              />
              <Area 
                name="Outflow (Spend)"
                type="monotone" 
                dataKey="outflow" 
                stroke="#17439B" 
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="transparent"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cura-grey" size={18} />
          <input 
            type="text" 
            placeholder="Search donor or transaction ID..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-4 focus:ring-cura-blue/10 focus:border-cura-blue outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:ring-4 focus:ring-cura-blue/10 outline-none"
          >
            <option value="All Categories">All Categories</option>
            <option value="Education">Education</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Food & Rations">Food & Rations</option>
            <option value="Emergency Relief">Emergency Relief</option>
          </select>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:ring-4 focus:ring-cura-blue/10 outline-none"
          >
            <option value="All Statuses">All Statuses</option>
            <option value="Verified">Verified</option>
            <option value="Auto-Verified">Auto-Verified</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Mismatch">Mismatch</option>
            <option value="Not Uploaded">Not Uploaded</option>
          </select>
          <button className="p-2.5 text-cura-grey hover:text-cura-dark hover:bg-gray-100 rounded-xl transition-all">
            <Calendar size={20} />
          </button>
          <button 
            onClick={() => {
              setSearchTerm('');
              setFilterCategory('All Categories');
              setFilterStatus('All Statuses');
            }}
            className="text-xs font-bold text-cura-grey hover:text-cura-blue px-2 transition-all"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* 4. Transaction Ledger Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-4 text-[10px] font-bold text-cura-grey uppercase tracking-widest">Date</th>
              <th className="px-6 py-4 text-[10px] font-bold text-cura-grey uppercase tracking-widest">Donor/Vendor</th>
              <th className="px-6 py-4 text-[10px] font-bold text-cura-grey uppercase tracking-widest">Category</th>
              <th className="px-6 py-4 text-[10px] font-bold text-cura-grey uppercase tracking-widest">Type</th>
              <th className="px-6 py-4 text-[10px] font-bold text-cura-grey uppercase tracking-widest">Verification</th>
              <th className="px-6 py-4 text-[10px] font-bold text-cura-grey uppercase tracking-widest text-right">Amount</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-4 text-sm font-medium text-cura-grey">{tx.date}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-cura-dark hover:text-cura-blue cursor-pointer underline decoration-transparent hover:decoration-cura-blue transition-all">
                      {tx.donor}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-cura-grey text-[10px] font-bold uppercase tracking-tight">
                      {tx.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[11px] font-bold text-cura-dark">
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={tx.status} />
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-cura-dark">
                    ₹{tx.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-cura-grey hover:text-cura-blue hover:bg-cura-blue/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-cura-grey font-medium text-sm">
                  No transactions match your current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-cura-grey font-medium">Showing {filteredTransactions.length} transactions</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs font-bold border border-gray-200 rounded-lg hover:bg-gray-50">Prev</button>
            <button className="px-3 py-1 text-xs font-bold bg-cura-blue text-white rounded-lg">1</button>
            <button className="px-3 py-1 text-xs font-bold border border-gray-200 rounded-lg hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>

      {/* 6. Pending Disbursements Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-cura-dark">Pending Allocations</h2>
            <p className="text-xs text-cura-grey mt-1">Foundational funds waiting to be mapped to active needs.</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-amber-600">₹92,200</span>
            <p className="text-[10px] font-bold text-cura-grey uppercase tracking-widest">Total Unallocated</p>
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {MOCK_PENDING_POOLS.map((pool) => (
            <div key={pool.id} className={`p-4 flex items-center justify-between transition-colors ${pool.days > 30 ? 'bg-red-50/30' : pool.days > 7 ? 'bg-amber-50/30' : ''}`}>
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-xl ${pool.days > 30 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-cura-dark">{pool.donor}</p>
                  <p className="text-xs text-cura-grey">Received on {pool.date} • {pool.days} days ago</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-sm font-bold text-cura-dark">₹{pool.amount.toLocaleString()}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cura-dark/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-lg">Generate Report</h3>
              <button onClick={() => setIsReportModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-cura-grey uppercase tracking-widest block mb-2">Financial Year</label>
                <select 
                  value={reportFY}
                  onChange={(e) => setReportFY(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-cura-blue/20"
                >
                  <option value="FY 2023-24">FY 2023-24</option>
                  <option value="FY 2022-23">FY 2022-23</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-cura-grey uppercase tracking-widest block mb-2">Format</label>
                <div className="flex gap-4">
                  {/* ADDED: Dynamic styling and onClick handlers for format selection */}
                  <div 
                    onClick={() => setReportFormat('pdf')}
                    className={`flex-1 p-3 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition-all ${
                      reportFormat === 'pdf' ? 'border-cura-blue bg-blue-50/50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FileText className={reportFormat === 'pdf' ? 'text-cura-blue' : 'text-cura-grey'} />
                    <span className={`text-xs font-bold ${reportFormat === 'pdf' ? 'text-cura-blue' : 'text-cura-dark'}`}>PDF Report</span>
                  </div>
                  
                  <div 
                    onClick={() => setReportFormat('csv')}
                    className={`flex-1 p-3 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition-all ${
                      reportFormat === 'csv' ? 'border-cura-blue bg-blue-50/50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Download className={reportFormat === 'csv' ? 'text-cura-blue' : 'text-cura-grey'} />
                    <span className={`text-xs font-bold ${reportFormat === 'csv' ? 'text-cura-blue' : 'text-cura-dark'}`}>Excel/CSV</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50 flex gap-3">
              <button 
                onClick={() => setIsReportModalOpen(false)} 
                className="flex-1 py-2.5 text-sm font-bold text-cura-grey hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              {/* ADDED: onClick handler to trigger the download logic */}
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