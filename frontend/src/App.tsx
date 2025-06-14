import React from 'react';
import { Dashboard } from './components/layout';
import { ToastProvider } from './components/common';
import { DashboardHome } from './components/dashboard/DashboardHome';
import './index.css';

function App() {
  return (
    <ToastProvider>
      <Dashboard>
        <DashboardHome />
      </Dashboard>
    </ToastProvider>
  );
}

export default App;
