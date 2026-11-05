import React, { useState, useEffect } from 'react';
import { Product, Order, DashboardStats, SystemSetting, AuditLog } from '../types.ts';
import { ReadmeTableModal } from './ReadmeTableModal.tsx';
import {
  DollarSign,
  TrendingUp,
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Download,
  Plus,
  Edit2,
  Trash2,
  Search,
  Eye,
  Settings,
  Shield,
  FileText,
  Activity,
  LogOut,
  RefreshCw,
  X,
  Server,
  Layers,
  Phone,
  UserCheck,
  UserPlus,
  Users,
  BookOpen
} from 'lucide-react';

interface Props {
  onBackToKiosk: () => void;
  onSwitchToTech: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ onBackToKiosk, onSwitchToTech }) => {
  const [activeTab, setActiveTab] = useState<'TRANSACTIONS' | 'PRODUCTS' | 'INVENTORY' | 'STAFF' | 'SETTINGS' | 'AUDIT'>('TRANSACTIONS');

  // Stats
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Transactions & Filters (Part 5)
  const [transactions, setTransactions] = useState<Order[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [filterPayment, setFilterPayment] = useState<string>('ALL');
  const [filterDispensing, setFilterDispensing] = useState<string>('ALL');
  const [filterProvider, setFilterProvider] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Transaction for Event History Drawer
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [selectedTxEvents, setSelectedTxEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Products
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProductModal, setNewProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState(500);
  const [newProdSize, setNewProdSize] = useState('330ml');
  const [newProdCategory, setNewProdCategory] = useState('STILL_WATER');
  const [newProdAlcoholic, setNewProdAlcoholic] = useState(false);
  const [newProdImage, setNewProdImage] = useState('');

  // Inventory
  const [inventory, setInventory] = useState<any[]>([]);

  // Settings
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaveSuccess, setSettingsSaveSuccess] = useState(false);

  // Audit logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Staff & Technician Registration state
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<'SEMI_ADMIN' | 'TECHNICIAN' | 'STAFF'>('SEMI_ADMIN');
  const [regPassword, setRegPassword] = useState('');
  const [regMsg, setRegMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Readme Modal
  const [readmeOpen, setReadmeOpen] = useState(false);

  // Load stats
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (e) {
      console.error('Stats error:', e);
    }
  };

  // Load transactions
  const fetchTransactions = async () => {
    setLoadingTx(true);
    try {
      const params = new URLSearchParams();
      if (filterPayment !== 'ALL') params.append('paymentStatus', filterPayment);
      if (filterDispensing !== 'ALL') params.append('dispensingStatus', filterDispensing);
      if (filterProvider !== 'ALL') params.append('provider', filterProvider);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/transactions?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions);
      }
    } catch (e) {
      console.error('Tx error:', e);
    } finally {
      setLoadingTx(false);
    }
  };

  // Load products
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) setProducts(data.products);
    } catch (e) {
      console.error('Prod error:', e);
    }
  };

  // Load inventory
  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      if (data.success) setInventory(data.inventory);
    } catch (e) {
      console.error('Inv error:', e);
    }
  };

  // Load staff & technicians
  const fetchStaff = async () => {
    setLoadingStaff(true);
    try {
      const res = await fetch('/api/admin/staff');
      const data = await res.json();
      if (data.success) setStaffList(data.staff);
    } catch (e) {
      console.error('Staff error:', e);
    } finally {
      setLoadingStaff(false);
    }
  };

  // Load settings
  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success) setSettings(data.settings);
    } catch (e) {
      console.error('Settings error:', e);
    }
  };

  // Load audit logs
  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/audit-logs');
      const data = await res.json();
      if (data.success) setAuditLogs(data.logs);
    } catch (e) {
      console.error('Audit error:', e);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchTransactions();
    fetchProducts();
    fetchInventory();
    fetchStaff();
    fetchSettings();
    fetchAuditLogs();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [filterPayment, filterDispensing, filterProvider]);

  // Open transaction details
  const handleOpenTx = async (tx: Order) => {
    setSelectedTx(tx);
    setLoadingEvents(true);
    try {
      const res = await fetch(`/api/transactions/${tx.order_id || tx.id}/events`);
      const data = await res.json();
      if (data.success) {
        setSelectedTxEvents(data.paymentEvents || []);
      }
    } catch (e) {
      console.error('Event error:', e);
    } finally {
      setLoadingEvents(false);
    }
  };

  // Reset to 6 official SKOL & Virunga products
  const handleResetSixProducts = async () => {
    try {
      const res = await fetch('/api/products/reset-six', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
        fetchInventory();
        fetchStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Register technician or staff
  const handleRegisterStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegMsg(null);

    try {
      const res = await fetch('/api/admin/staff/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: regFullName,
          email: regEmail,
          role: regRole,
          phone: regPhone,
          password: regPassword,
          adminEmail: 'ishimweclement537@gmail.com'
        })
      });

      const data = await res.json();
      if (data.success) {
        setRegMsg({ text: `Success: ${regFullName} registered as ${regRole}!`, isError: false });
        setRegFullName('');
        setRegEmail('');
        setRegPhone('');
        fetchStaff();
        fetchAuditLogs();
      } else {
        setRegMsg({ text: data.error || 'Registration failed', isError: true });
      }
    } catch (e: any) {
      setRegMsg({ text: 'Error connecting to server', isError: true });
    }
  };

  // Toggle staff status
  const handleToggleStaffStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await fetch(`/api/admin/staff/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchStaff();
      fetchAuditLogs();
    } catch (e) {
      console.error(e);
    }
  };

  // Update Inventory Stock
  const handleUpdateStock = async (invId: string, currentAvailable: number, delta: number) => {
    try {
      const newQty = Math.max(0, currentAvailable + delta);
      await fetch(`/api/inventory/${invId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available_quantity: newQty })
      });
      fetchInventory();
      fetchProducts();
      fetchStats();
    } catch (e) {
      console.error(e);
    }
  };

  // Save Settings
  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setSettingsSaveSuccess(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings, user: 'ishimweclement537@gmail.com' })
      });
      const data = await res.json();
      if (data.success) {
        setSettingsSaveSuccess(true);
        setTimeout(() => setSettingsSaveSuccess(false), 3000);
        fetchAuditLogs();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingSettings(false);
    }
  };

  // Export CSV of transactions
  const exportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['Order Reference', 'Phone Number', 'Product', 'Quantity', 'Amount RWF', 'Provider', 'Payment Status', 'Dispensing Status', 'Created At'];
    const rows = transactions.map(t => [
      t.order_reference,
      t.phone_number || '',
      t.product_name || '',
      t.quantity || 1,
      t.total_amount,
      t.provider || '',
      t.payment_status,
      t.dispensing_status,
      t.created_at
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FTM1_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Admin Navigation Header (Styled with Yellow, Red & White) */}
      <header className="px-6 sm:px-8 py-4 bg-slate-900 border-b-4 border-yellow-400 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-yellow-400 to-red-600 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Shield className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white font-mono">FTM-1 ADMINISTRATOR</h2>
              <span className="px-2.5 py-0.5 text-[10px] font-black rounded-full bg-red-600 text-white border border-yellow-300">
                Primary Authority
              </span>
            </div>
            <p className="text-xs text-yellow-300 font-bold">
              Ishimwe Clement • <span className="font-mono text-emerald-400 font-bold">Authorized Primary Administrator</span>
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center flex-wrap gap-1 bg-slate-950 p-1.5 rounded-2xl border-2 border-slate-800">
          <button
            onClick={() => setActiveTab('TRANSACTIONS')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'TRANSACTIONS' ? 'bg-yellow-400 text-slate-950 font-black shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 text-red-500" /> Transactions
          </button>

          <button
            onClick={() => setActiveTab('PRODUCTS')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'PRODUCTS' ? 'bg-yellow-400 text-slate-950 font-black shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4 text-red-500" /> 6 Categories
          </button>

          <button
            onClick={() => setActiveTab('INVENTORY')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'INVENTORY' ? 'bg-yellow-400 text-slate-950 font-black shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 text-red-500" /> Stock ({stats?.totalUnitsInStock || 0})
          </button>

          <button
            onClick={() => setActiveTab('STAFF')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'STAFF' ? 'bg-red-600 text-white font-black shadow-md border border-yellow-400' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-yellow-400" /> Register Technicians & Semi-Admin
          </button>

          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'SETTINGS' ? 'bg-yellow-400 text-slate-950 font-black shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4 text-red-500" /> Settings
          </button>

          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'AUDIT' ? 'bg-yellow-400 text-slate-950 font-black shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4 text-red-500" /> Audit Logs
          </button>
        </div>

        {/* Quick Nav Out & README Guide */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setReadmeOpen(true)}
            className="px-3.5 py-1.5 text-xs font-black rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-red-600" /> README Manual
          </button>

          <button
            onClick={onSwitchToTech}
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-yellow-300 border border-slate-700 transition-colors"
          >
            Tech Diagnostics
          </button>
          <button
            onClick={onBackToKiosk}
            className="px-4 py-1.5 text-xs font-bold rounded-xl bg-red-600 text-white border-2 border-yellow-400 hover:bg-red-500 transition-colors flex items-center gap-1.5 shadow-md"
          >
            <LogOut className="w-3.5 h-3.5" /> Return to Kiosk
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 px-6 sm:px-8 py-6 max-w-7xl mx-auto w-full space-y-6">
        {/* KPI Summary Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-slate-900 border-2 border-yellow-400/60 p-4 rounded-2xl shadow-md">
              <span className="text-xs text-yellow-300 font-bold">Total Sales</span>
              <p className="text-2xl font-black text-white font-mono mt-1">
                {stats.totalRevenueRwf.toLocaleString()} RWF
              </p>
              <span className="text-[10px] text-emerald-400 font-semibold mt-0.5 block">Verified MoMo</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
              <span className="text-xs text-slate-400 font-medium">Orders Placed</span>
              <p className="text-2xl font-black text-white font-mono mt-1">
                {stats.totalOrders}
              </p>
              <span className="text-[10px] text-emerald-400 mt-0.5 block">{stats.paidOrders} Paid</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
              <span className="text-xs text-slate-400 font-medium">Unpaid / Expired</span>
              <p className="text-2xl font-black text-amber-400 font-mono mt-1">
                {stats.unpaidOrders}
              </p>
              <span className="text-[10px] text-slate-500 mt-0.5 block">PIN prompt abandoned</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
              <span className="text-xs text-slate-400 font-medium">Dispensed Drinks</span>
              <p className="text-2xl font-black text-yellow-400 font-mono mt-1">
                {stats.dispensedCount}
              </p>
              <span className="text-[10px] text-emerald-400 mt-0.5 block">100% Sensor verified</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
              <span className="text-xs text-slate-400 font-medium">Cooler Stock</span>
              <p className="text-2xl font-black text-white font-mono mt-1">
                {stats.totalUnitsInStock} <span className="text-xs font-normal text-slate-400">bottles</span>
              </p>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                {stats.lowStockAlerts > 0 ? (
                  <span className="text-red-400 font-bold">{stats.lowStockAlerts} Low Stock</span>
                ) : (
                  'Optimal Stock'
                )}
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
              <span className="text-xs text-slate-400 font-medium">Solar Telemetry</span>
              <p className="text-2xl font-black text-emerald-400 font-mono mt-1">
                ONLINE
              </p>
              <span className="text-[10px] text-yellow-300 font-bold mt-0.5 block">48V DC • 3.8°C</span>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 1: TRANSACTIONS MANAGEMENT TABLE */}
        {/* ============================================================ */}
        {activeTab === 'TRANSACTIONS' && (
          <div className="bg-slate-900 border-2 border-yellow-400/60 rounded-3xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                  TRANSACTION MANAGEMENT DATABASE (PART 5)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Live relational records linking Orders, Customers, MTN/Airtel Payments, and Dispensing Telemetry.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchTransactions}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={exportCSV}
                  className="px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs flex items-center gap-2 shadow-md transition-all border border-yellow-200"
                >
                  <Download className="w-4 h-4 text-red-600" /> Export CSV Report
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <div>
                <label className="block text-[11px] font-bold text-yellow-300 mb-1">PAYMENT STATUS</label>
                <select
                  value={filterPayment}
                  onChange={(e) => setFilterPayment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
                >
                  <option value="ALL">All Payments</option>
                  <option value="PAID">PAID</option>
                  <option value="UNPAID">UNPAID</option>
                  <option value="PENDING">PENDING</option>
                  <option value="FAILED">FAILED</option>
                  <option value="EXPIRED">EXPIRED</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-yellow-300 mb-1">DISPENSING STATUS</label>
                <select
                  value={filterDispensing}
                  onChange={(e) => setFilterDispensing(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
                >
                  <option value="ALL">All Dispensing</option>
                  <option value="DISPENSED">DISPENSED</option>
                  <option value="NOT_DISPENSED">NOT DISPENSED</option>
                  <option value="DISPENSING_FAILED">FAILED DISPENSING</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-yellow-300 mb-1">PROVIDER</label>
                <select
                  value={filterProvider}
                  onChange={(e) => setFilterProvider(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
                >
                  <option value="ALL">All Providers</option>
                  <option value="MTN">MTN Mobile Money</option>
                  <option value="AIRTEL">Airtel Money</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-yellow-300 mb-1">SEARCH REF / PHONE / DRINK</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchTransactions()}
                    placeholder="Search..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* PART 5 MANDATORY TABLE */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-yellow-300 uppercase tracking-wider font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Order Reference</th>
                    <th className="py-3 px-4">Phone Number</th>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Provider</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Dispensing</th>
                    <th className="py-3 px-4">Date / Time</th>
                    <th className="py-3 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {transactions.map((tx) => {
                    const isPaid = tx.payment_status === 'PAID';
                    const isDispensed = tx.dispensing_status === 'DISPENSED';
                    const isFailedPay = tx.payment_status === 'FAILED';
                    const isExpired = tx.payment_status === 'EXPIRED';

                    return (
                      <tr 
                        key={tx.order_id || tx.order_reference}
                        onClick={() => handleOpenTx(tx)}
                        className="hover:bg-slate-800/50 transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 px-4 font-bold text-white">
                          {tx.order_reference}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {tx.phone_number || '078XXXXXXX'}
                        </td>
                        <td className="py-3.5 px-4 font-sans font-medium text-slate-200">
                          {tx.product_name || 'Beverage'} {tx.quantity && tx.quantity > 1 ? `(${tx.quantity}x)` : ''}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-yellow-400">
                          {tx.total_amount?.toLocaleString()} RWF
                        </td>
                        <td className="py-3.5 px-4 font-sans">
                          {tx.provider === 'MTN' ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-yellow-400 text-slate-950">
                              MTN
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-red-600 text-white">
                              Airtel
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {isPaid ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-max">
                              <CheckCircle2 className="w-3 h-3" /> PAID
                            </span>
                          ) : isFailedPay ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-600/20 text-red-400 border border-red-500/40 flex items-center gap-1 w-max">
                              <XCircle className="w-3 h-3" /> FAILED
                            </span>
                          ) : isExpired ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 w-max">
                              <Clock className="w-3 h-3" /> EXPIRED
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1 w-max">
                              UNPAID
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {isDispensed ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-400 text-slate-950 flex items-center gap-1 w-max">
                              <CheckCircle2 className="w-3 h-3 text-red-600" /> DISPENSED
                            </span>
                          ) : tx.dispensing_status === 'DISPENSING_FAILED' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-600/30 text-red-300 border border-red-500 flex items-center gap-1 w-max">
                              <AlertTriangle className="w-3 h-3" /> FAILED
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700 w-max">
                              NOT DISPENSED
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-sans text-[11px]">
                          {new Date(tx.created_at).toLocaleString('en-RW', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenTx(tx);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {transactions.length === 0 && !loadingTx && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No transaction records matched the selected criteria.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: 6 OFFICIAL CATEGORIES & PRODUCTS */}
        {/* ============================================================ */}
        {activeTab === 'PRODUCTS' && (
          <div className="bg-slate-900 border-2 border-yellow-400/60 rounded-3xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-black text-white">
                  Official 6 Beverage Categories (SKOL & Virunga)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  The active cooler lineup featuring user-uploaded product bottles and official categories.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleResetSixProducts}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 border border-yellow-400"
                >
                  <RefreshCw className="w-4 h-4" /> Re-Apply 6 Official Products
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <div key={p.id} className="bg-slate-950 border-2 border-slate-800 hover:border-yellow-400 rounded-2xl p-4 flex flex-col justify-between">
                  <div className="flex gap-4">
                    <div className="w-20 h-28 bg-white rounded-xl p-1.5 flex items-center justify-center border border-slate-700 flex-shrink-0">
                      <img src={p.image_url} alt={p.product_name} className="max-h-full object-contain" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {p.category_id}
                        </span>
                        {p.is_alcoholic === 1 && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-600 text-white">
                            18+
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-white text-sm mt-1">{p.product_name}</h4>
                      <p className="text-yellow-400 font-black text-base mt-0.5 font-mono">{p.price.toLocaleString()} RWF</p>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{p.description}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Stock: <strong className="text-white">{p.available_quantity || 0}</strong></span>
                    <button
                      onClick={() => setEditingProduct(p)}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit Price
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: INVENTORY */}
        {/* ============================================================ */}
        {activeTab === 'INVENTORY' && (
          <div className="bg-slate-900 border-2 border-yellow-400/60 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-black text-white">Cooler Stock & Capacity</h3>
                <p className="text-xs text-slate-400 mt-0.5">Physical cooler stock across the 6 official drink slots.</p>
              </div>
              <button
                onClick={fetchInventory}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-yellow-300 uppercase font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Beverage</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price RWF</th>
                    <th className="py-3 px-4">Stock Level</th>
                    <th className="py-3 px-4">Min. Threshold</th>
                    <th className="py-3 px-4 text-right">Restock Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {inventory.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-sans font-bold text-white flex items-center gap-3">
                        <div className="w-8 h-10 bg-white rounded p-0.5 flex items-center justify-center">
                          <img src={row.image_url} alt="" className="max-h-full object-contain" />
                        </div>
                        {row.product_name}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{row.category_id}</td>
                      <td className="py-3 px-4 text-yellow-400 font-bold">{row.price.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${row.available_quantity <= row.minimum_stock ? 'bg-red-600/30 text-red-300 border border-red-500' : 'bg-emerald-500/20 text-emerald-300'}`}>
                          {row.available_quantity} bottles
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{row.minimum_stock} units</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleUpdateStock(row.id, row.available_quantity, 10)}
                          className="px-2.5 py-1 bg-yellow-400 text-slate-950 font-black rounded-lg text-xs hover:bg-yellow-300"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => handleUpdateStock(row.id, row.available_quantity, 25)}
                          className="px-2.5 py-1 bg-red-600 text-white font-black rounded-lg text-xs hover:bg-red-500"
                        >
                          +25 Crate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: REGISTER TECHNICIANS & STAFF (ADMIN ISHIMWE CLEMENT ONLY) */}
        {/* ============================================================ */}
        {activeTab === 'STAFF' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border-2 border-yellow-400/80 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-6">
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-yellow-400" />
                    REGISTER NEW TECHNICIAN OR SEMI-ADMINISTRATOR
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Authorized exclusively to <strong className="text-yellow-400">Ishimwe Clement</strong> (Master Administrator).
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-red-600 text-white border border-yellow-400">
                  ADMIN AUTHORITY
                </span>
              </div>

              {regMsg && (
                <div className={`p-4 rounded-2xl mb-6 text-xs font-bold flex items-center gap-2 ${
                  regMsg.isError ? 'bg-red-950/80 border border-red-500 text-red-200' : 'bg-emerald-950/80 border border-emerald-500 text-emerald-200'
                }`}>
                  {regMsg.isError ? <AlertTriangle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
                  {regMsg.text}
                </div>
              )}

              {/* Registration Form */}
              <form onSubmit={handleRegisterStaff} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-yellow-300 font-bold mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jean Pierre Mugisha"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-yellow-400 rounded-xl px-3 py-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-yellow-300 font-bold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. j.mugisha@ftm1.rw"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-yellow-400 rounded-xl px-3 py-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-yellow-300 font-bold mb-1">Rwandan Phone Number</label>
                  <input
                    type="text"
                    placeholder="078XXXXXXX"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-yellow-400 rounded-xl px-3 py-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-yellow-300 font-bold mb-1">Assigned Operational Role</label>
                  <select
                    value={regRole}
                    onChange={(e: any) => setRegRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-yellow-400 rounded-xl px-3 py-2.5 text-white font-bold"
                  >
                    <option value="SEMI_ADMIN">SEMI-ADMIN (Audits, Operations, Daily Reports)</option>
                    <option value="TECHNICIAN">TECHNICIAN (Hardware, Telemetry, Actuators)</option>
                    <option value="STAFF">FIELD STAFF (Restocking, Routine Inspection)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-yellow-300 font-bold mb-1">Initial Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Create secure access credential"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-yellow-400 rounded-xl px-3 py-2.5 text-white font-mono"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 border border-yellow-200"
                  >
                    <UserPlus className="w-4 h-4 text-red-600" /> REGISTER USER
                  </button>
                </div>
              </form>
            </div>

            {/* List of Registered Staff & Technicians */}
            <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
                <h4 className="font-black text-white text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-yellow-400" /> Registered Technicians, Semi-Admins & Staff ({staffList.length})
                </h4>
                <button
                  onClick={fetchStaff}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 text-yellow-300 font-bold border-b border-slate-800 uppercase">
                    <tr>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Registered Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {staffList.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-sans font-bold text-white">{user.full_name}</td>
                        <td className="py-3 px-4 text-slate-300">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            user.role === 'SEMI_ADMIN'
                              ? 'bg-purple-500/25 text-purple-300 border border-purple-500/50'
                              : user.role === 'TECHNICIAN'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}>
                            {user.role === 'SEMI_ADMIN' ? 'SEMI-ADMIN' : user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400">{user.phone || '—'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${user.account_status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-600/20 text-red-300'}`}>
                            {user.account_status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[11px]">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleToggleStaffStatus(user.id, user.account_status)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                              user.account_status === 'ACTIVE'
                                ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                                : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                            }`}
                          >
                            {user.account_status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: SYSTEM SETTINGS */}
        {/* ============================================================ */}
        {activeTab === 'SETTINGS' && (
          <div className="bg-slate-900 border-2 border-yellow-400/60 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-black text-white">System & Gateway Settings (Part 7)</h3>
                <p className="text-xs text-slate-400 mt-0.5">Stored in database with full audit logging.</p>
              </div>
              <button
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="px-6 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                {savingSettings ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-red-600" />} Save Settings
              </button>
            </div>

            {settingsSaveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Settings updated by Ishimwe Clement in database.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {settings.map((s, idx) => (
                <div key={s.id || s.setting_name} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white font-mono">{s.setting_name}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-yellow-300">
                      {s.setting_category}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={s.setting_value}
                    onChange={(e) => {
                      const updated = [...settings];
                      updated[idx].setting_value = e.target.value;
                      setSettings(updated);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-yellow-400 font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Updated by {s.updated_by} at {new Date(s.updated_at).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 6: AUDIT LOGS */}
        {/* ============================================================ */}
        {activeTab === 'AUDIT' && (
          <div className="bg-slate-900 border-2 border-yellow-400/60 rounded-3xl p-6 shadow-xl">
            <h3 className="text-xl font-black text-white mb-1">Administrative & Security Audit Logs</h3>
            <p className="text-xs text-slate-400 mb-6">Tamper-evident record of actions executed by Ishimwe Clement and staff.</p>

            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-yellow-400 font-bold mr-2">[{log.action}]</span>
                    <span className="text-slate-200">{log.entity_type} {log.entity_id}</span>
                    {log.new_value && (
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xl">
                        Data: {log.new_value}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-[11px] text-slate-500">
                    <div>{log.user_id}</div>
                    <div>{new Date(log.timestamp).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Transaction Details Event Drawer */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full p-8 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <div>
                  <h3 className="text-xl font-black text-white font-mono">
                    {selectedTx.order_reference}
                  </h3>
                  <p className="text-xs text-yellow-300">Complete Event Audit Trail</p>
                </div>
                <button
                  onClick={() => setSelectedTx(null)}
                  className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Order metadata summary */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-6 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer Handset:</span>
                  <span className="text-white font-mono font-bold">{selectedTx.phone_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Beverage Selected:</span>
                  <span className="text-white font-bold">{selectedTx.product_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Billed:</span>
                  <span className="text-yellow-400 font-bold font-mono">{selectedTx.total_amount} RWF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Status:</span>
                  <span className="font-bold font-mono text-white">{selectedTx.payment_status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Dispensing Status:</span>
                  <span className="font-bold font-mono text-yellow-400">{selectedTx.dispensing_status}</span>
                </div>
              </div>

              {/* Payment Events Timeline */}
              <h4 className="text-xs font-bold text-yellow-300 uppercase tracking-wider mb-3">
                Lifecycle Events ({selectedTxEvents.length})
              </h4>

              <div className="space-y-3">
                {selectedTxEvents.map((ev, i) => (
                  <div key={ev.id || i} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-yellow-400 font-bold">{ev.event_type}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{ev.event_status}</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">{ev.verification_result}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{new Date(ev.event_timestamp).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 mt-6">
              <button
                onClick={() => setSelectedTx(null)}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs"
              >
                CLOSE DRAWER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-slate-900 border-2 border-yellow-400 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Edit Product Price (RWF)</h3>
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Product</label>
                <input
                  type="text"
                  readOnly
                  value={editingProduct.product_name}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-300"
                />
              </div>

              <div>
                <label className="block text-yellow-300 font-bold mb-1">Price in Rwandan Francs (RWF)</label>
                <input
                  type="number"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: parseInt(e.target.value, 10) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-yellow-400 font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setEditingProduct(null)}
                className="py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await fetch(`/api/products/${editingProduct.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(editingProduct)
                  });
                  setEditingProduct(null);
                  fetchProducts();
                }}
                className="py-2.5 rounded-xl bg-yellow-400 text-slate-950 font-black text-xs"
              >
                Save Price
              </button>
            </div>
          </div>
        </div>
      )}

      {/* README Manual Modal */}
      <ReadmeTableModal isOpen={readmeOpen} onClose={() => setReadmeOpen(false)} />
    </div>
  );
};
