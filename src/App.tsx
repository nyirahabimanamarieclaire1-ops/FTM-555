import React, { useState } from 'react';
import { CustomerTouchscreen } from './components/CustomerTouchscreen.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { TechnicianDashboard } from './components/TechnicianDashboard.tsx';
import { OperatorBar } from './components/OperatorBar.tsx';
import { LoginModal } from './components/LoginModal.tsx';

export default function App() {
  const [view, setView] = useState<'KIOSK' | 'ADMIN' | 'TECH'>('KIOSK');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [intendedRole, setIntendedRole] = useState<'ADMIN' | 'TECHNICIAN'>('ADMIN');
  const [authenticatedRole, setAuthenticatedRole] = useState<'ADMIN' | 'TECHNICIAN' | null>(null);

  const handleOpenLogin = (role: 'ADMIN' | 'TECHNICIAN') => {
    // If already authenticated with that role, switch directly
    if (authenticatedRole === role) {
      setView(role === 'ADMIN' ? 'ADMIN' : 'TECH');
      return;
    }
    setIntendedRole(role);
    setLoginModalOpen(true);
  };

  const handleLoginSuccess = (role: 'ADMIN' | 'TECHNICIAN') => {
    setAuthenticatedRole(role);
    setView(role === 'ADMIN' ? 'ADMIN' : 'TECH');
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Universal Operator Control Bar */}
      <OperatorBar
        currentView={view}
        onSelectView={(v) => {
          if (v === 'ADMIN') {
            handleOpenLogin('ADMIN');
          } else if (v === 'TECH') {
            handleOpenLogin('TECHNICIAN');
          } else {
            setView('KIOSK');
          }
        }}
      />

      {/* Primary Display Surface */}
      <main className="flex-1 flex flex-col">
        {view === 'KIOSK' && (
          <CustomerTouchscreen
            onOpenAdmin={() => handleOpenLogin('ADMIN')}
            onOpenTech={() => handleOpenLogin('TECHNICIAN')}
          />
        )}

        {view === 'ADMIN' && (
          <AdminDashboard
            onBackToKiosk={() => setView('KIOSK')}
            onSwitchToTech={() => handleOpenLogin('TECHNICIAN')}
          />
        )}

        {view === 'TECH' && (
          <TechnicianDashboard
            onBackToKiosk={() => setView('KIOSK')}
            onSwitchToAdmin={() => handleOpenLogin('ADMIN')}
          />
        )}
      </main>

      {/* Secure Role Authentication Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        initialRole={intendedRole}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
