import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell 
} from 'recharts';
import { 
  AlertTriangle, Clock, FileWarning, ArrowRight, 
  ShieldCheck, Tag, Server, Zap, FileText, Plus, Activity
} from 'lucide-react';

// --- MOCK DATA ---
const alertData = [
  { id: 1, type: 'danger', icon: AlertTriangle, title: '3 Low Stock Items', action: 'Review Stock', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10', border: 'border-red-100 dark:border-red-500/20', route: '/inventory' },
  { id: 2, type: 'warning', icon: Clock, title: '2 Pending Approvals', action: 'Approve Now', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-100 dark:border-amber-500/20', route: '/approvals' },
  { id: 3, type: 'info', icon: FileWarning, title: '4 Unverified Receipts', action: 'Verify Receipts', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-100 dark:border-blue-500/20', route: '/ledger' },
];

const statData = [
  { title: 'Total Donations', value: '₹4,50,000', trend: '+12% this month', chart: [30, 45, 20, 60, 40, 80, 50] },
  { title: 'Active Needs', value: '12', trend: '3 high priority', chart: [10, 15, 12, 8, 14, 12, 12] },
  { title: 'Funds Disbursed', value: '₹2,80,000', trend: 'In 42 transactions', chart: [20, 30, 50, 40, 60, 45, 70] },
];

const monthlyAllocationData = [
  { name: 'Jan', value: 4000 }, { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5000 }, { name: 'Apr', value: 2780 },
  { name: 'May', value: 6890 }, { name: 'Jun', value: 2390 },
  { name: 'Jul', value: 3490 }, { name: 'Aug', value: 9000 }, 
];

const activityFeed = [
  { id: 1, agent: 'Finance Agent', task: 'Auto-verified ₹5,000 donation from Aditi Sharma', time: '2 mins ago', icon: ShieldCheck, status: 'success' },
  { id: 2, agent: 'Procurement Agent', task: 'Negotiated Lentils price down to ₹40/kg', time: '15 mins ago', icon: Tag, status: 'success' },
  { id: 3, agent: 'System', task: 'Flagged receipt mismatch for Apollo Med', time: '1 hour ago', icon: Server, status: 'warning' },
  { id: 4, agent: 'Finance Agent', task: 'Mapped ₹12,000 to Education Fund', time: '3 hours ago', icon: ShieldCheck, status: 'success' },
  { id: 5, agent: 'Procurement Agent', task: 'Requested quotes for 100kg Wheat Flour', time: '5 hours ago', icon: Tag, status: 'info' },
];

// --- SUB-COMPONENTS ---
const CuraStatCard = ({ title, value, trend, chartData }) => (
  <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] shadow-sm shadow-gray-100/50 dark:shadow-none border border-gray-100 dark:border-gray-800 flex flex-col gap-2 transition-all hover:scale-[1.02] cursor-pointer">
    <span className="text-[10px] font-bold uppercase tracking-wider text-cura-grey dark:text-gray-400">
      {title}
    </span>
    <h3 className="text-4xl font-bold tracking-tight text-cura-dark dark:text-gray-100">{value}</h3>
    <p className="text-xs font-semibold text-cura-blue dark:text-blue-400">
      {trend}
    </p>
    <div className="mt-4 h-12 w-full opacity-60">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData.map((val, i) => ({ value: val, index: i }))}>
          <Bar dataKey="value" fill="#17439B" radius={[4, 4, 4, 4]} barSize={8} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-lg border border-gray-50 dark:border-gray-700 text-sm font-bold text-cura-dark dark:text-gray-100">
        ₹{payload[0].value.toLocaleString()}
      </div>
    );
  }
  return null;
};

// --- MAIN COMPONENT ---
const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-transparent p-8 font-jost text-cura-dark dark:text-gray-100 flex flex-col gap-8">
      
      {/* 1. TOP ROW: Needs Attention Center */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {alertData.map((alert) => (
          <div key={alert.id} className={`${alert.bg} ${alert.border} border p-5 rounded-2xl flex items-center justify-between transition-all hover:scale-[1.02] shadow-sm dark:shadow-none`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-none ${alert.color}`}>
                <alert.icon size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">{alert.title}</h4>
                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 mt-1">Needs Attention</p>
              </div>
            </div>
            <button 
              onClick={() => navigate(alert.route)}
              className={`flex items-center gap-1 text-xs font-bold ${alert.color} hover:opacity-70 transition-opacity`}
            >
              {alert.action} <ArrowRight size={14} strokeWidth={3} />
            </button>
          </div>
        ))}
      </section>

      {/* TWO COLUMN GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* 2. MAIN CONTENT (Left & Center) */}
        <div className="lg:col-span-2 space-y-8 flex flex-col h-full">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statData.map((stat, idx) => (
              <CuraStatCard key={idx} title={stat.title} value={stat.value} trend={stat.trend} chartData={stat.chart} />
            ))}
          </div>

          {/* Large Resource Allocation Chart */}
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm shadow-gray-100/50 dark:shadow-none border border-gray-100 dark:border-gray-800 flex-1 min-h-[400px] flex flex-col transition-all hover:scale-[1.02]">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h3 className="font-bold text-xl tracking-tight text-cura-dark dark:text-gray-100">Monthly Resource Allocation</h3>
                <p className="text-cura-grey dark:text-gray-400 text-xs mt-1 font-medium">Funds converting to impact across all needs</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cura-grey dark:text-gray-400">Total YTD</span>
                <p className="text-2xl font-bold tracking-tight text-cura-blue dark:text-blue-400">₹36,550</p>
              </div>
            </div>
            
            <div className="flex-1 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyAllocationData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#83868E', fontWeight: 600 }} 
                    dy={10} 
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'currentColor', opacity: 0.05, radius: [20, 20, 20, 20] }} />
                  <Bar dataKey="value" radius={[20, 20, 20, 20]} barSize={48}>
                    {monthlyAllocationData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === monthlyAllocationData.length - 1 ? '#17439B' : '#17439B20'} 
                        className="transition-all duration-300 hover:opacity-80"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 3 & 4. RIGHT SIDEBAR */}
        <div className="lg:col-span-1 space-y-8 flex flex-col h-full">
          
          {/* Live AI Activity Feed */}
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm shadow-gray-100/50 dark:shadow-none border border-gray-100 dark:border-gray-800 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2 text-cura-dark dark:text-gray-100">
                <Activity size={18} className="text-cura-blue dark:text-blue-400" />
                Live Agent Activity
              </h3>
              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-full">
                <div className="w-2 h-2 rounded-full bg-cura-blue dark:bg-blue-400 animate-pulse"></div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cura-blue dark:text-blue-400">Online</span>
              </div>
            </div>
            
            {/* Scrolling Feed Container */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-5 custom-scrollbar">
              {activityFeed.map((activity) => (
                <div key={activity.id} className="relative pl-6 before:absolute before:left-[11px] before:top-8 before:bottom-[-20px] before:w-[2px] before:bg-gray-100 dark:before:bg-gray-800 last:before:hidden">
                  {/* Status Node */}
                  <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-sm dark:shadow-none ${
                    activity.status === 'success' ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' :
                    activity.status === 'warning' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-500' :
                      activity.status === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                  </div>
                  
                  {/* Content */}
                  <div className="bg-gray-50/50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cura-grey dark:text-gray-400 flex items-center gap-1">
                        <activity.icon size={12} /> {activity.agent}
                      </span>
                      <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">{activity.time}</span>
                    </div>
                    <p className="text-sm font-medium text-cura-dark dark:text-gray-200 leading-snug">
                      {activity.task}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions (Manual Overrides) */}
          <div className="bg-cura-dark dark:bg-gray-900 text-white p-8 rounded-[2.5rem] shadow-lg border border-transparent dark:border-gray-800">
            <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
              <Zap size={18} className="text-yellow-400" /> Quick Actions
            </h3>
            <p className="text-xs text-gray-400 mb-6 font-medium">Manual system overrides</p>
            
            <div className="space-y-3">
              <button onClick={() => navigate('/inventory')} className="w-full bg-white/10 dark:bg-gray-800 hover:bg-white/20 dark:hover:bg-gray-700 transition-all text-white font-semibold py-3 px-4 rounded-2xl flex items-center justify-between group border border-transparent dark:border-gray-700">
                <span className="flex items-center gap-3 text-sm">
                  <Tag size={16} /> Trigger AI Sourcing
                </span>
                <ArrowRight size={16} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
              
              <button onClick={() => navigate('/ledger')} className="w-full bg-white/10 dark:bg-gray-800 hover:bg-white/20 dark:hover:bg-gray-700 transition-all text-white font-semibold py-3 px-4 rounded-2xl flex items-center justify-between group border border-transparent dark:border-gray-700">
                <span className="flex items-center gap-3 text-sm">
                  <FileText size={16} /> Generate Report
                </span>
                <ArrowRight size={16} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
              
              <button className="w-full border border-white/20 dark:border-gray-700 hover:bg-white/10 dark:hover:bg-gray-800 transition-all text-white font-semibold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 mt-2">
                <Plus size={16} /> Add Manual Entry
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;