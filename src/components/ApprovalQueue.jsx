import React from 'react';

const QuoteCard = ({ vendor, item, quantity, price, score }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-cura-blue transition-all">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h4 className="font-bold text-lg">{vendor}</h4>
        <p className="text-cura-grey text-sm">{item} • {quantity}</p>
      </div>
      <div className="text-right">
        <p className="text-xl font-bold text-cura-blue">₹{price}</p>
        <span className="text-[10px] bg-blue-50 text-cura-blue px-2 py-1 rounded-md font-bold">
          AI Score: {score}%
        </span>
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-3">
      <button className="bg-gray-100 text-cura-dark py-3 rounded-xl text-sm font-bold">
        Reject
      </button>
      <button className="bg-cura-blue text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-200">
        Approve & Pay
      </button>
    </div>
  </div>
);

const ApprovalQueue = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6 font-jost">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Manager Approval Queue</h2>
        <p className="text-cura-grey text-sm">
          Quotes negotiated by the Agent
        </p>
      </div>

      <QuoteCard 
        vendor="Global Wholesale Traders" 
        item="Wheat Flour (Aashirvaad)" 
        quantity="100kg" 
        price="4,200" 
        score="98"
      />

      <QuoteCard 
        vendor="Local Mandi Services" 
        item="Organic Lentils" 
        quantity="25kg" 
        price="2,850" 
        score="82"
      />
    </div>
  );
};

export default ApprovalQueue;