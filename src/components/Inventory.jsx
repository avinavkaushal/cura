import React, { useState, useMemo } from 'react';

const inventoryData = [
  { id: 1, name: "Basmati Rice", category: "Food & Rations", stock: 120, unit: "kg", consumption: 150, lastRestocked: "2024-04-10" },
  { id: 2, name: "Lentils (Dal)", category: "Food & Rations", stock: 15, unit: "kg", consumption: 80, lastRestocked: "2024-04-05" },
  { id: 3, name: "Paracetamol", category: "Medicines", stock: 450, unit: "tabs", consumption: 200, lastRestocked: "2024-03-28" },
  { id: 4, name: "Milk Powder", category: "Food & Rations", stock: 5, unit: "kg", consumption: 40, lastRestocked: "2024-04-12" },
  { id: 5, name: "Notebooks (A5)", category: "Education", stock: 85, unit: "pcs", consumption: 60, lastRestocked: "2024-02-15" },
  { id: 6, name: "Antiseptic Liquid", category: "Hygiene", stock: 12, unit: "L", consumption: 10, lastRestocked: "2024-04-01" },
  { id: 7, name: "Solar Lanterns", category: "Equipment", stock: 2, unit: "pcs", consumption: 0.5, lastRestocked: "2023-11-20" },
  { id: 8, name: "Amoxicillin", category: "Medicines", stock: 8, unit: "vials", consumption: 25, lastRestocked: "2024-04-14" },
];

const vendorQuotes = [
  { id: 'v1', name: "Global Wholesale", price: "₹42/unit", delivery: "2 days", score: 4.8, recommended: true },
  { id: 'v2', name: "Local Mandi Services", price: "₹45/unit", delivery: "1 day", score: 4.2, recommended: false },
  { id: 'v3', name: "Standard Supplies Co.", price: "₹40/unit", delivery: "5 days", score: 3.9, recommended: false },
];

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [autoDecide, setAutoDecide] = useState(false);

  const categories = ['All', 'Food & Rations', 'Medicines', 'Education', 'Hygiene', 'Equipment'];

  // Data processing
  const processedData = useMemo(() => {
    return inventoryData.map(item => {
      const daysUntilStockout = item.consumption > 0 ? Math.floor((item.stock / item.consumption) * 30) : 999;
      let status = "Healthy";
      if (daysUntilStockout < 7) status = "Critical";
      else if (daysUntilStockout <= 14) status = "Low";
      
      return { ...item, daysUntilStockout, status };
    })
    .filter(item => activeTab === 'All' || item.category === activeTab)
    .sort((a, b) => a.daysUntilStockout - b.daysUntilStockout);
  }, [activeTab]);

  const stats = {
    total: inventoryData.length,
    needsReorder: inventoryData.filter(i => (i.stock / i.consumption) * 30 <= 14).length,
    estSpend: "₹12,400"
  };

  return (
    <div className="font-jost text-cura-dark space-y-6">
      {/* 1. Category Tab Bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map(cat => {
          const count = cat === 'All' ? inventoryData.length : inventoryData.filter(i => i.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === cat ? 'bg-cura-blue text-white shadow-lg shadow-blue-900/20' : 'bg-gray-100 text-cura-grey hover:bg-gray-200'
              }`}
            >
              {cat}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === cat ? 'bg-white/20' : 'bg-gray-200'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Stats Bar */}
      <div className="flex flex-wrap gap-6 items-center px-2 py-1">
        <div className="flex items-center gap-2">
          <span className="text-cura-grey text-xs font-bold uppercase tracking-widest">Total SKUs:</span>
          <span className="text-sm font-bold">{stats.total}</span>
        </div>
        <div className="w-px h-4 bg-gray-200" />
        <div className="flex items-center gap-2">
          <span className="text-cura-grey text-xs font-bold uppercase tracking-widest">Needs Reorder:</span>
          <span className="text-sm font-bold text-red-500">{stats.needsReorder}</span>
        </div>
        <div className="w-px h-4 bg-gray-200" />
        <div className="flex items-center gap-2">
          <span className="text-cura-grey text-xs font-bold uppercase tracking-widest">Est. Spend:</span>
          <span className="text-sm font-bold text-cura-blue">{stats.estSpend}</span>
        </div>
      </div>

      {/* 3. AI Insights Banner */}
      {!bannerDismissed && processedData.some(i => i.status !== 'Healthy') && (
        <div className="bg-white border-l-4 border-cura-blue rounded-2xl shadow-sm p-5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">💡</span>
            <div>
              <p className="text-sm font-medium">
                <span className="font-bold">{processedData.filter(i => i.status !== 'Healthy').length} items</span> in {activeTab} are predicted to stock out soon. AI sourcing agents have pre-fetched local quotes.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none bg-cura-blue text-white px-6 py-2 rounded-xl text-xs font-bold shadow-md hover:opacity-90">
              Review & Approve
            </button>
            <button onClick={() => setBannerDismissed(true)} className="text-cura-grey hover:text-cura-dark p-1">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 4. Inventory Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-cura-grey text-[10px] font-bold uppercase tracking-widest">
                <th className="px-6 py-4">Item Name</th>
                <th className="px-6 py-4">Current Stock</th>
                <th className="px-6 py-4">Consumption/Mo</th>
                <th className="px-6 py-4">Est. Exhaustion</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Restock</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {processedData.map((item) => (
                <React.Fragment key={item.id}>
                  <tr className={`transition-colors ${expandedRow === item.id ? 'bg-blue-50/30' : 'hover:bg-gray-50/50'}`}>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{item.name}</span>
                        <span className="text-[10px] text-cura-grey uppercase tracking-tighter">{item.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium">{item.stock} {item.unit}</td>
                    <td className="px-6 py-5 text-sm text-cura-grey">{item.consumption} {item.unit}</td>
                    <td className="px-6 py-5">
                      <span className={`text-xs font-bold ${
                        item.daysUntilStockout < 7 ? 'text-red-500' : item.daysUntilStockout <= 14 ? 'text-amber-500' : 'text-green-600'
                      }`}>
                        {item.daysUntilStockout} days
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        item.status === 'Critical' ? 'bg-red-100 text-red-600' : 
                        item.status === 'Low' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-xs text-cura-grey">{item.lastRestocked}</td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
                        className={`text-xs font-bold transition-all px-4 py-2 rounded-lg cursor-pointer ${
                          item.status === 'Healthy' 
                          ? 'text-cura-grey hover:bg-gray-100' 
                          : 'bg-cura-blue text-white shadow-sm hover:shadow-md'
                        }`}
                      >
                        {item.status === 'Healthy' ? 'View History' : 'AI Source Now'}
                      </button>
                    </td>
                  </tr>

                  {/* 5. Sourcing Drawer (Inline Accordion) */}
                  {expandedRow === item.id && (
                    <tr>
                      <td colSpan="7" className="px-6 pb-6 bg-blue-50/30">
                        <div className="bg-white rounded-xl border border-blue-100 p-6 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="flex justify-between items-center mb-6">
                            <div>
                              <h4 className="text-sm font-bold flex items-center gap-2">
                                <span className="p-1 bg-blue-100 rounded text-xs">🤖</span>
                                AI Negotiated Quotes for {item.name}
                              </h4>
                              <p className="text-xs text-cura-grey mt-1">Based on ONDC & local vendor network.</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <label className="text-[10px] font-bold uppercase text-cura-grey flex items-center gap-2">
                                Let AI Decide
                                <div 
                                  onClick={() => setAutoDecide(!autoDecide)}
                                  className={`w-8 h-4 rounded-full relative transition-colors duration-200 cursor-pointer ${autoDecide ? 'bg-cura-blue' : 'bg-gray-200'}`}
                                >
                                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${autoDecide ? 'left-4.5' : 'left-0.5'}`} />
                                </div>
                              </label>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {vendorQuotes.map(quote => (
                              <div 
                                key={quote.id} 
                                className={`p-4 rounded-xl border-2 transition-all flex flex-col justify-between ${
                                  quote.recommended ? 'border-cura-blue ring-4 ring-blue-100' : 'border-gray-100 hover:border-gray-200'
                                }`}
                              >
                                <div>
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold truncate max-w-[120px]">{quote.name}</span>
                                    {quote.recommended && (
                                      <span className="text-[8px] bg-cura-blue text-white px-2 py-0.5 rounded-full font-bold uppercase">Best Value</span>
                                    )}
                                  </div>
                                  <div className="flex items-end gap-2 mb-3">
                                    <span className="text-lg font-bold text-cura-blue">{quote.price}</span>
                                    <span className="text-[10px] text-cura-grey mb-1">/ unit</span>
                                  </div>
                                  <div className="space-y-1 text-[10px] text-cura-grey">
                                    <div className="flex justify-between">
                                      <span>Delivery:</span>
                                      <span className="font-bold text-cura-dark">{quote.delivery}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Trust Score:</span>
                                      <span className="font-bold text-cura-dark">⭐ {quote.score}/5</span>
                                    </div>
                                  </div>
                                </div>
                                <button className={`w-full mt-4 py-2 rounded-lg text-[10px] font-bold transition-all ${
                                  quote.recommended ? 'bg-cura-blue text-white' : 'bg-gray-50 text-cura-grey hover:bg-gray-100'
                                }`}>
                                  Approve Quote
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;