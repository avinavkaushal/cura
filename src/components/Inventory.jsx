import React from 'react';

const InventoryItem = ({ name, stock, unit, status }) => (
  <tr className="border-b border-gray-100 last:border-0">
    <td className="py-4 font-medium">{name}</td>
    <td className="py-4">{stock} {unit}</td>
    <td className="py-4">
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
        status === 'Low' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
      }`}>
        {status}
      </span>
    </td>
    <td className="py-4 text-right">
      <button className="text-cura-blue font-bold text-sm hover:underline">
        View History
      </button>
    </td>
  </tr>
);

const Inventory = () => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Predictive Inventory</h2>
        {/* Trigger for the Procurement Agent Agent [cite: 277] */}
        <button className="bg-cura-blue text-white px-6 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-all">
          Trigger AI Sourcing
        </button>
      </div>
      
      <p className="text-cura-grey text-sm mb-6">
        AI is currently tracking consumption rates to prevent stockouts[cite: 167].
      </p>

      <table className="w-full text-left">
        <thead>
          <tr className="text-cura-grey text-xs uppercase tracking-wider">
            <th className="pb-4">Item Name</th>
            <th className="pb-4">Current Stock</th>
            <th className="pb-4">Status</th>
            <th className="pb-4"></th>
          </tr>
        </thead>
        <tbody>
          <InventoryItem name="Basmati Rice" stock="120" unit="kg" status="Healthy" />
          <InventoryItem name="Lentils (Dal)" stock="15" unit="kg" status="Low" />
          <InventoryItem name="Paracetamol 500mg" stock="450" unit="tabs" status="Healthy" />
          <InventoryItem name="Milk Powder" stock="5" unit="kg" status="Low" />
        </tbody>
      </table>
    </div>
  );
};

export default Inventory;