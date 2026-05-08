import React from 'react';
import { 
  BarChart, Bar, ResponsiveContainer, YAxis, XAxis, 
  Tooltip, AreaChart, Area, Cell 
} from 'recharts';

// Data for the mini sparklines and main segmented chart
const statData = [
  { value: 40 }, { value: 30 }, { value: 65 }, 
  { value: 45 }, { value: 90 }, { value: 55 }, { value: 80 }
];

const mainChartData = [
  { name: 'Jan', value: 4000 }, { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5000 }, { name: 'Apr', value: 2780 },
  { name: 'May', value: 6890 }, { name: 'Jun', value: 2390 },
  { name: 'Jul', value: 3490 }, { name: 'Aug', value: 9000 },
];

const CuraStatCard = ({ title, value, trend, isMain, chartType }) => (
  <div className={`p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col gap-4 transition-all hover:scale-[1.02] ${
    isMain ? 'bg-cura-blue text-white border-none' : 'bg-white text-cura-dark'
  }`}>
    <div className="flex justify-between items-start">
      <span className={`text-sm font-medium ${isMain ? 'opacity-80' : 'text-cura-grey'}`}>
        {title}
      </span>
      <button className={`text-[10px] font-bold px-3 py-1 rounded-full ${
        isMain ? 'bg-white/20 text-white' : 'bg-gray-50 text-cura-grey'
      }`}>
        View Report
      </button>
    </div>
    <div>
      <h3 className="text-4xl font-bold">{value}</h3>
      <p className={`text-xs font-bold mt-1 ${isMain ? 'text-white/80' : 'text-cura-blue'}`}>
        {trend}
      </p>
    </div>
    
    <div className="mt-4 h-20">
      <ResponsiveContainer width="100%" height="100%">
        {chartType === 'bar' ? (
          <BarChart data={statData}>
            <Bar dataKey="value" radius={[10, 10, 10, 10]}>
              {statData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={isMain ? (index === 6 ? '#FFD60A' : '#ffffff40') : '#17439B20'} 
                />
              ))}
            </Bar>
          </BarChart>
        ) : (
          <AreaChart data={statData}>
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={isMain ? '#fff' : '#17439B'} 
              fill={isMain ? '#ffffff20' : '#17439B10'} 
              strokeWidth={3}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="space-y-8 font-jost">
      {/* Top Row: Visual Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <CuraStatCard 
          title="Total Donations" 
          value="₹42.5k" 
          trend="↓ 10% vs last month" 
          chartType="area" 
        />
        <CuraStatCard 
          title="Active Children" 
          value="156" 
          trend="↑ 40% vs last month" 
          isMain={true} 
          chartType="bar" 
        />
        <CuraStatCard 
          title="Vendor Orders" 
          value="63" 
          trend="↑ 20% vs last month" 
          chartType="bar" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Consumption Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 h-[450px]">
          <div className="flex justify-between items-center mb-8">
            <h4 className="font-bold text-xl text-cura-dark">Resource Allocation</h4>
            <select className="bg-gray-50 text-xs font-bold p-2 rounded-lg border-none text-cura-grey">
              <option>Select Range</option>
            </select>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mainChartData}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 12, fill: '#83868E'}} 
                  dy={10} 
                />
                <YAxis hide />
                <Tooltip cursor={{fill: 'transparent'}} />
                {/* Thick rounded bars replicating the segmented bubble style */}
                <Bar 
                  dataKey="value" 
                  fill="#17439B10" 
                  radius={[20, 20, 20, 20]} 
                  barSize={40} 
                />
                <Bar 
                  dataKey="value" 
                  fill="#17439B" 
                  radius={[20, 20, 20, 20]} 
                  barSize={40} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Agent Activity Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 h-full">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-bold">Next AI Actions</h4>
              <button className="bg-cura-blue text-white px-4 py-2 rounded-xl text-xs font-bold">
                + Automation
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-cura-dark">Verify 80G Receipts</p>
                  <p className="text-[10px] text-cura-grey">10:00 AM - 10:30 AM</p>
                </div>
                <div className="w-8 h-4 bg-cura-blue rounded-full relative">
                  <div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;