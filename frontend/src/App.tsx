import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './components/layout';
import { ToastProvider } from './components/common';
import { DashboardPage, DevicesPage } from './pages';
import './index.css';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Dashboard>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/devices" element={<DevicesPage />} />
            <Route path="/analytics" element={<div className="text-white">Analytics Page - Coming Soon</div>} />
            <Route path="/devices/add" element={<div className="text-white">Add Device Page - Coming Soon</div>} />
            <Route path="/settings" element={<div className="text-white">Settings Page - Coming Soon</div>} />
          </Routes>
        </Dashboard>
      </Router>
    </ToastProvider>
  );
}

export default App;
