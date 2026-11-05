import React, { useState } from 'react';
import { Shield, Wrench, Lock, ArrowRight, X, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  initialRole?: 'ADMIN' | 'TECHNICIAN';
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (role: 'ADMIN' | 'TECHNICIAN') => void;
}

export const LoginModal: React.FC<Props> = ({ initialRole = 'ADMIN', isOpen, onClose, onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'TECHNICIAN'>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleRoleSelect = (role: 'ADMIN' | 'TECHNICIAN') => {
    setSelectedRole(role);
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: selectedRole })
      });

      const data = await res.json();
      if (data.success) {
        onLoginSuccess(selectedRole);
        onClose();
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err: any) {
      setError('Connection error with authentication service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-6 select-none font-sans">
      <div className="bg-slate-900 border-4 border-yellow-400 rounded-3xl max-w-md w-full p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-red-600 border-2 border-yellow-400 text-yellow-300 flex items-center justify-center shadow-lg">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">INTERNAL MANAGEMENT ACCESS</h3>
          <p className="text-xs text-yellow-300 font-bold mt-1">FTM-1 Autonomous Vending Cooler</p>
        </div>

        {/* Option 1 & Option 2 Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => handleRoleSelect('ADMIN')}
            className={`p-4 rounded-2xl border-4 text-left transition-all cursor-pointer ${
              selectedRole === 'ADMIN'
                ? 'border-yellow-400 bg-red-600 text-white shadow-lg'
                : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Shield className={`w-5 h-5 mb-2 ${selectedRole === 'ADMIN' ? 'text-yellow-300' : 'text-slate-400'}`} />
            <h4 className="font-black text-xs">OPTION 1</h4>
            <p className="text-xs font-black">ADMINISTRATOR</p>
            <span className="text-[10px] block opacity-80 mt-1">Ishimwe Clement</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('TECHNICIAN')}
            className={`p-4 rounded-2xl border-4 text-left transition-all cursor-pointer ${
              selectedRole === 'TECHNICIAN'
                ? 'border-yellow-400 bg-yellow-400 text-slate-950 shadow-lg'
                : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Wrench className={`w-5 h-5 mb-2 ${selectedRole === 'TECHNICIAN' ? 'text-red-600' : 'text-slate-400'}`} />
            <h4 className="font-black text-xs">OPTION 2</h4>
            <p className="text-xs font-black">TECHNICIAN / STAFF</p>
            <span className="text-[10px] block opacity-80 mt-1">Registered Operators</span>
          </button>
        </div>

        {selectedRole === 'ADMIN' && (
          <div className="p-3 bg-yellow-950/40 border border-yellow-400/50 rounded-xl mb-4 text-[11px] text-yellow-300">
            <strong>Authorized Primary Administrator:</strong> Ishimwe Clement (Enter master credentials)
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-yellow-300 mb-1">Email Identifier</label>
            <input
              type="email"
              required
              placeholder="Enter registered email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-yellow-400 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-yellow-300 mb-1">Access Credential (Password)</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-yellow-400 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all bg-yellow-400 hover:bg-yellow-300 text-slate-950 border-2 border-yellow-200 shadow-xl"
            >
              AUTHENTICATE {selectedRole} <ArrowRight className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </form>

        <p className="text-[10px] text-slate-500 text-center mt-4">
          Session is cryptographically signed and logged in the database audit log.
        </p>
      </div>
    </div>
  );
};
