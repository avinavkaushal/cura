import { useState } from 'react'
import './App.css'
// Keep your Firebase connection ready for use later
import { db } from './firebase'; 
import { ref, set, push } from "firebase/database"; 

function App() {
  return (
    <div className="dashboard-container">
      <header>
        <h1>Cura OS Dashboard</h1>
        <p>Orphanage Management & Student Tracking</p>
      </header>

      <main>
        {/* This is where your real project components will go */}
        <div className="stats-grid">
          <div className="card">Total Students: 0</div>
          <div className="card">New Scholarships: 0</div>
        </div>
      </main>
    </div>
  )
}

export default App