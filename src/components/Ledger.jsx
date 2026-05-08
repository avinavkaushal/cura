import React from 'react';

const ImpactFeedItem = ({ donor, amount, need, status, date }) => (
  <div className="flex items-start gap-4 p-4 border-l-4 border-cura-blue bg-gray-50 rounded-r-xl">
    <div className="flex-1">
      <div className="flex justify-between mb-1">
        <span className="font-bold text-sm">{donor}</span>
        <span className="text-cura-grey text-xs">{date}</span>
      </div>
      <p className="text-sm text-gray-700">
        Funded <span className="font-bold">₹{amount}</span> for <span className="text-cura-blue italic">"{need}"</span>
      </p>
      <div className="mt-2 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500"></div>
        <span className="text-[10px] uppercase font-bold text-green-600">{status}</span>
      </div>
    </div>
  </div>
);

const Ledger = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-jost">
      {/* Financial Summary */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-cura-dark text-white p-6 rounded-2xl">
          <p className="text-cura-grey text-xs uppercase">Total Available Balance</p>
          <h2 className="text-4xl font-bold mt-2">₹1,85,200</h2>
          <div className="mt-6 pt-6 border-t border-gray-700">
            <button className="w-full bg-white text-cura-dark py-3 rounded-xl font-bold text-sm">
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Impact Feed  */}
      <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6">Donor Impact Feed</h2>
        <div className="space-y-4">
          <ImpactFeedItem 
            donor="Rahul Sharma" 
            amount="5,000" 
            need="Sunday Special Meal" 
            status="AI Disbursed to Vendor" 
            date="2 hours ago"
          />
          <ImpactFeedItem 
            donor="Sneha Foundation" 
            amount="25,000" 
            need="Education Kits (Term 1)" 
            status="Receipt Verified" 
            date="Yesterday"
          />
        </div>
      </div>
    </div>
  );
};

export default Ledger;