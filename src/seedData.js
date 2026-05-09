// src/seedData.js
import { collection, addDoc } from "firebase/firestore"; 
import { db } from "./firebase"; 

// 1. Inventory Mock Data
const inventoryData = [
  { name: "Basmati Rice", category: "Food", stock: 120, unit: "kg", consumption: 15, status: 'healthy', trend: [{day: 'Mon', val: 140}, {day: 'Tue', val: 135}, {day: 'Wed', val: 130}, {day: 'Thu', val: 125}, {day: 'Fri', val: 120}] },
  { name: "Lentils (Dal)", category: "Food", stock: 15, unit: "kg", consumption: 8, status: 'critical', trend: [{day: 'Mon', val: 40}, {day: 'Tue', val: 32}, {day: 'Wed', val: 24}, {day: 'Thu', val: 18}, {day: 'Fri', val: 15}] },
  { name: "Paracetamol", category: "Medical", stock: 450, unit: "tabs", consumption: 20, status: 'healthy', trend: [{day: 'Mon', val: 500}, {day: 'Tue', val: 480}, {day: 'Wed', val: 470}, {day: 'Thu', val: 460}, {day: 'Fri', val: 450}] },
  { name: "Antiseptic Liquid", category: "Hygiene", stock: 12, unit: "L", consumption: 2, status: 'warning', trend: [{day: 'Mon', val: 18}, {day: 'Tue', val: 16}, {day: 'Wed', val: 15}, {day: 'Thu', val: 13}, {day: 'Fri', val: 12}] }
];

// 2. Ledger/Transaction Mock Data
const transactionData = [
  { date: '12 May 2024', donor: 'Aditi Sharma', amount: 5000, category: 'Education', type: 'Inflow', status: 'Auto-Verified' },
  { date: '11 May 2024', donor: 'Global Tech CSR', amount: 25000, category: 'Healthcare', type: 'Inflow', status: 'Verified' },
  { date: '10 May 2024', donor: 'Vendor: Fresh Mart', amount: 1200, category: 'Food & Rations', type: 'Disbursement', status: 'Pending Review' },
  { date: '08 May 2024', donor: 'Rahul Verma', amount: 2000, category: 'Emergency Relief', type: 'Inflow', status: 'Mismatch' },
  { date: '05 May 2024', donor: 'Suresh Iyer', amount: 10000, category: 'Education', type: 'Inflow', status: 'Not Uploaded' },
  { date: '02 May 2024', donor: 'Vendor: Apollo Med', amount: 4500, category: 'Healthcare', type: 'Disbursement', status: 'Auto-Verified' }
];

export const seedDatabase = async () => {
  try {
    console.log("Seeding Inventory...");
    for (const item of inventoryData) {
      await addDoc(collection(db, "inventory"), item);
    }

    console.log("Seeding Transactions...");
    for (const txn of transactionData) {
      await addDoc(collection(db, "transactions"), txn);
    }

    alert("Database Seeded Successfully! You can delete this button now.");
  } catch (error) {
    console.error("Error seeding database: ", error);
    alert("Error seeding data. Check your browser console.");
  }
};