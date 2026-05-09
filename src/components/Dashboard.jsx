import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, where, orderBy, limit } from "firebase/firestore"; 
import { db } from "../firebase";

import { 
  BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell 
} from 'recharts';
import { 
  AlertTriangle, Clock, FileWarning, ArrowRight, 
  ShieldCheck, Tag, Server, Zap, FileText, Plus, Activity, AlertCircle, Bot
} from 'lucide-react';

// Helper to map DB agents to your existing Lucide icons
const getAgentIcon = (agent) => {
  if (agent === 'Finance Agent') return ShieldCheck;
  if (agent === 'Procurement Agent') return Tag;
  if (agent === 'System') return AlertCircle;
  return Activity;
};

// --- SUB-COMPONENTS ---
const CuraStatCard = ({ title, value, trend, chartData }) => (
  <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] shadow-sm shadow-gray-100/50 dark:shadow-none border border-gray-100 dark:border-gray-800 flex flex-col gap-2 transition-all hover:scale-[1.02] cursor-pointer">
    <span className="text-[10px] font-bold uppercase tracking-wider text-cura-grey dark:text-gray-400">
      {title}
    </span>
    <h3 className="text-4xl font-black text-cura-dark dark:text-gray-100 tracking-tight">{value}</h3>
    <div className="flex items-center justify-between mt-1">
      <span className="text-xs font-bold text-cura-blue dark:text-blue-400">{trend}</span>
      <div className="h-6 w-16 flex items-end gap-1">
        {chartData.map((val, i) => (
          <div key={i} className="flex-1 bg-cura-blue/20 dark:bg-blue-500/20 rounded-sm" style={{ height: `${val}%` }}></div>
        ))}
      </div>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-cura-dark dark:bg-black text-white px-4 py-2 rounded-xl text-sm font-bold shadow-xl border border-white/10">
        ₹{payload[0].value.toLocaleString()}
      </div>
    );
  }
  return null;
};

// --- MAIN DASHBOARD COMPONENT ---
const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // LIVE FIREBASE STATES
  const [totalDonations, setTotalDonations] = useState(0);
  const [fundsDisbursed, setFundsDisbursed] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [unverifiedCount, setUnverifiedCount] = useState(0);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0); 
  const [activityFeed, setActivityFeed] = useState([]);

  // FETCH & CALCULATE LIVE DATA USING onSnapshot
  useEffect(() => {
    // 1. LIVE Inventory Stats
    const unsubInv = onSnapshot(collection(db, "inventory"), (snapshot) => {
      let lowStock = 0;
      snapshot.docs.forEach(doc => {
        const item = doc.data();
        const daysLeft = Math.floor((item.stock || 0) / (item.consumption || 1));
        if (item.status === 'critical' || daysLeft < 7) lowStock++;
      });
      setLowStockCount(lowStock);
    });

    // 2. LIVE Transaction Stats
    const unsubTx = onSnapshot(collection(db, "transactions"), (snapshot) => {
      let totalInflow = 0;
      let totalOutflow = 0;
      let unverified = 0;
      snapshot.docs.forEach(doc => {
        const tx = doc.data();
        if (tx.type === 'Inflow') totalInflow += Number(tx.amount || 0);
        else totalOutflow += Number(tx.amount || 0);
        if (['Pending Review', 'Not Uploaded', 'Mismatch'].includes(tx.status)) unverified++;
      });
      setTotalDonations(totalInflow);
      setFundsDisbursed(totalOutflow);
      setUnverifiedCount(unverified);
    });

    // 3. LIVE Pending Approvals
    const qQuotes = query(collection(db, "quotes"), where("status", "==", "pending"));
    const unsubQuotes = onSnapshot(qQuotes, (snapshot) => {
      setPendingApprovalsCount(snapshot.size);
    });

    // 4. LIVE Activity Logs (ordered by newest first)
    const qLogs = query(collection(db, "activity_logs"), orderBy("timestamp", "desc"), limit(5));
    const unsubLogs = onSnapshot(qLogs, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setActivityFeed(logs);
      setLoading(false);
    });

    return () => { unsubInv(); unsubTx(); unsubQuotes(); unsubLogs(); };
  }, []);

  const alertData = [
    { id: 1, type: 'danger', icon: AlertTriangle, title: `${lowStockCount} Low Stock Items`, action: 'Review Stock', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/10', border: 'border-red-100 dark:border-red-900/20', route: '/inventory' },
    { id: 2, type: 'warning', icon: Clock, title: `${pendingApprovalsCount} Pending Approvals`, action: 'Approve Now', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/10', border: 'border-amber-100 dark:border-amber-900/20', route: '/approvals' },
    { id: 3, type: 'info', icon: FileWarning, title: `${unverifiedCount} Unverified Receipts`, action: 'Verify Receipts', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/10', border: 'border-blue-100 dark:border-blue-900/20', route: '/ledger' },
  ];

  const statData = [
    { title: 'Total Donations', value: `₹${totalDonations.toLocaleString()}`, trend: 'Live', chart: [30, 45, 20, 60, 40, 80, 50] },
    { title: 'Active Needs', value: lowStockCount.toString(), trend: 'High priority items', chart: [10, 15, 12, 8, 14, 12, 12] },
    { title: 'Funds Disbursed', value: `₹${fundsDisbursed.toLocaleString()}`, trend: 'Live', chart: [20, 30, 50, 40, 60, 45, 70] },
  ];

  if (loading) {
    return (
      <div className="w-full min-h-screen p-8 flex items-center justify-center font-jost">
        <div className="flex flex-col items-center gap-4">
          <Activity size={40} className="text-cura-blue animate-bounce" />
          <p className="text-cura-dark dark:text-white font-bold text-xl">Calculating Live Stats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-transparent p-8 font-jost text-cura-dark dark:text-gray-100 flex flex-col gap-8">
      
      {/* Needs Attention Center */}
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
            <button onClick={() => navigate(alert.route)} className={`flex items-center gap-1 text-xs font-bold ${alert.color} hover:opacity-70 transition-opacity`}>
              {alert.action} <ArrowRight size={14} strokeWidth={3} />
            </button>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* MAIN CONTENT */}
        <div className="lg:col-span-2 space-y-8 flex flex-col h-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statData.map((stat, idx) => (
              <CuraStatCard key={idx} title={stat.title} value={stat.value} trend={stat.trend} chartData={stat.chart} />
            ))}
          </div>

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
                <BarChart data={[ { name: 'Jan', value: 4000 }, { name: 'Feb', value: 3000 }, { name: 'Mar', value: 5000 }, { name: 'Apr', value: 2780 }, { name: 'May', value: 6890 } ]} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#83868E', fontWeight: 600 }} dy={10} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'currentColor', opacity: 0.05, radius: [20, 20, 20, 20] }} />
                  <Bar dataKey="value" radius={[20, 20, 20, 20]} barSize={48}>
                    {[1,2,3,4,5].map((_, index) => (
                      <Cell key={index} fill={index === 4 ? '#17439B' : '#17439B20'} className="transition-all duration-300 hover:opacity-80" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR (Live Feed) */}
        <div className="lg:col-span-1 space-y-8 flex flex-col h-full">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm shadow-gray-100/50 dark:shadow-none border border-gray-100 dark:border-gray-800 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2 text-cura-dark dark:text-gray-100">
                <Activity size={18} className="text-cura-blue dark:text-blue-400" />
                Live AI Activity
              </h3>
            </div>
            
            <div className="relative pl-3 space-y-6 flex-1">
              <div className="absolute left-[19px] top-4 bottom-4 w-px bg-gray-100 dark:bg-gray-800"></div>
              {activityFeed.map((activity) => {
                const Icon = getAgentIcon(activity.agent);
                return (
                  <div key={activity.id} className="relative flex gap-4 group cursor-pointer">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 border-white dark:border-gray-900 transition-transform group-hover:scale-110 ${
                      activity.status === 'success' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                      activity.status === 'warning' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400' :
                      'bg-blue-100 dark:bg-blue-500/20 text-cura-blue dark:text-blue-400'
                    }`}>
                      <Icon size={14} strokeWidth={2.5} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-cura-dark dark:text-gray-100">{activity.agent}</p>
                        <span className="text-[10px] font-bold text-cura-grey dark:text-gray-500">Live</span>
                      </div>
                      <p className="text-sm text-cura-grey dark:text-gray-400 mt-0.5 leading-snug">{activity.action}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="w-full mt-6 py-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 text-cura-grey dark:text-gray-400 text-xs font-bold hover:border-cura-blue hover:text-cura-blue dark:hover:border-blue-500/50 dark:hover:text-blue-400 transition-colors flex justify-center items-center gap-2">
              <FileText size={14} /> View Full Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;