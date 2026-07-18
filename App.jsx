import React, { useState } from 'react';
import AdminDashboard from './AdminDashboard';
import GardaKioskApp from './GardaKioskApp';

function App() {
  const [isAdmin, setIsAdmin] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Quick-Switch Bar for Demonstration */}
      <div className="bg-slate-900 text-white p-2 flex justify-between items-center text-sm">
        <span>GardaWorld Clone MVP</span>
        <button
          onClick={() => setIsAdmin(!isAdmin)}
          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded font-medium"
        >
          {isAdmin ? 'Passer à la Vue Garde (Mobile)' : 'Passer à la Vue Admin (Boss)'}
        </button>
      </div>

      {/* Conditional Rendering */}
      {isAdmin ? <AdminDashboard /> : <GardaKioskApp />}
    </div>
  );
}

export default App;
