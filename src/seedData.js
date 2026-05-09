import { db } from "./firebase";
import { collection, addDoc, getDocs, writeBatch, doc, serverTimestamp } from "firebase/firestore";

export const initializeRobustDatabase = async () => {
  console.log("🛠️ Initializing Robust Database Schema...");

  // 1. Create a Master Donor (CRM)
  const donorRef = await addDoc(collection(db, "donors"), {
    name: "Aditi Sharma",
    email: "aditi.s@gmail.com",
    phone: "+91 98765 43210",
    pan_number: "BPXPS1234K",
    total_donated: 25000,
    last_donation: serverTimestamp()
  });

  // 2. Create a Master Vendor
  const vendorRef = await addDoc(collection(db, "vendors"), {
    name: "Local Mandi Services",
    whatsapp_number: "+91 91234 56789",
    categories: ["Food", "Rations"],
    trust_score: 4.9,
    active_contracts: 2
  });

  // 3. Setup Initial Activity Logs (For the Dashboard)
  const logs = [
    { agent: "Finance Agent", action: "Matched ₹15,000 donation to Meera Kapoor", status: "success", timestamp: serverTimestamp() },
    { agent: "Procurement Agent", action: "Triggered RFQ for 100kg Wheat Flour", status: "info", timestamp: serverTimestamp() },
    { agent: "System", action: "Low stock alert: Paracetamol (5 days left)", status: "warning", timestamp: serverTimestamp() }
  ];
  
  for (const log of logs) {
    await addDoc(collection(db, "activity_logs"), log);
  }

  // 4. Update Inventory with thresholds
  const invSnapshot = await getDocs(collection(db, "inventory"));
  const batch = writeBatch(db);
  invSnapshot.docs.forEach((d) => {
    batch.update(d.ref, {
      reorder_threshold: 20, // AI triggers sourcing when stock < 20
      last_updated: serverTimestamp()
    });
  });
  await batch.commit();

  console.log("✅ Database Schema initialized and linked!");
};