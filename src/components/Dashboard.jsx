import React from 'react';

const StatCard = ({ title, value, trend }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
    <p className="text-cura-grey text-sm font-medium">{title}</p>
    <div className="flex justify-between items-end mt-2">
      <h3 className="text-3xl font-bold">{value}</h3>
      <span className="text-green-500 text-sm font-bold">{trend}</span>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Top Row: Statistics [cite: 193] */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Today's Funds" value="₹42,500" trend="+12%" />
        <StatCard title="Inventory Alerts" value="3" trend="Critical" />
        <StatCard title="Active Donors" value="156" trend="+5" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Prediction Chart Placeholder [cite: 167] */}
        <div className="bg-white p-6 rounded-2xl shadow-sm h-80">
          <h4 className="font-bold mb-4">Stock Consumption Forecast</h4>
          <div className="w-full h-full bg-gray-50 rounded-lg flex items-center justify-center text-cura-grey">
            [Chart Area - Visualizing Daily Consumption Rates]
          </div>
        </div>

        {/* Recent AI Actions [cite: 204] */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h4 className="font-bold mb-4">AI Agent Activity</h4>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-xl">
              <div className="bg-cura-blue w-2 h-2 rounded-full" />
              <p className="text-sm">
                <b>Procurement Agent:</b> Sent RFQ to 3 vendors for 'Wheat' [cite: 206]
              </p>
            </div>
            <div className="flex items-center gap-4 p-3 bg-green-50 rounded-xl">
              <div className="bg-green-500 w-2 h-2 rounded-full" />
              <p className="text-sm">
                <b>Finance Agent:</b> Verified 80G eligibility for 12 new donations [cite: 204]
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;