import React, { useState } from 'react';
import { 
  BookOpen, 
  X, 
  Layers, 
  Cpu, 
  CreditCard, 
  Database, 
  ShieldCheck, 
  CheckCircle2, 
  HelpCircle,
  Sparkles,
  Zap,
  Info,
  Users,
  UserPlus
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ReadmeTableModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<'HOW_IT_WORKS' | 'DATABASE' | 'HARDWARE' | 'PAYMENTS' | 'ROLES'>('HOW_IT_WORKS');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 select-none font-sans">
      <div className="bg-slate-900 border-2 border-yellow-400/80 rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header with SKOL Red, Yellow, White theme */}
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-yellow-500 p-6 flex items-center justify-between text-white border-b-4 border-yellow-400">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white text-red-600 flex items-center justify-center shadow-lg font-black text-xl">
              FTM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black tracking-tight text-white font-mono">
                  FTM-1 SYSTEM MANUAL & README
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-black bg-yellow-300 text-red-900 rounded-full">
                  OFFICIAL GUIDE
                </span>
              </div>
              <p className="text-xs text-yellow-100 font-medium">
                Fridge Teller Machine • Rwanda & East Africa Autonomous Beverage Platform
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation tabs */}
        <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex flex-wrap gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveSection('HOW_IT_WORKS')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeSection === 'HOW_IT_WORKS'
                ? 'bg-yellow-400 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            <Zap className="w-4 h-4 text-red-500" /> 1. How It Works (Steps 1–10)
          </button>

          <button
            onClick={() => setActiveSection('DATABASE')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeSection === 'DATABASE'
                ? 'bg-yellow-400 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            <Database className="w-4 h-4 text-red-500" /> 2. Database (14 Tables)
          </button>

          <button
            onClick={() => setActiveSection('HARDWARE')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeSection === 'HARDWARE'
                ? 'bg-yellow-400 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4 text-red-500" /> 3. Hardware & Telemetry
          </button>

          <button
            onClick={() => setActiveSection('PAYMENTS')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeSection === 'PAYMENTS'
                ? 'bg-yellow-400 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            <CreditCard className="w-4 h-4 text-red-500" /> 4. MTN & Airtel MoMo
          </button>

          <button
            onClick={() => setActiveSection('ROLES')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeSection === 'ROLES'
                ? 'bg-yellow-400 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-red-500" /> 5. Admin, Semi-Admin & Technician Registration
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-200 text-xs">
          
          {/* SECTION 1: HOW IT WORKS TABLE */}
          {activeSection === 'HOW_IT_WORKS' && (
            <div>
              <div className="mb-4">
                <h3 className="text-base font-black text-yellow-400 uppercase tracking-wider">
                  Complete Step-by-Step Vending Flow (100% Employee-Free)
                </h3>
                <p className="text-slate-400 text-xs mt-1">
                  The customer interacts entirely through the touch display. No physical door opening is permitted; drinks exit via the lower secured gravity chute.
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-yellow-400 font-bold border-b border-slate-800 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-3">Step #</th>
                      <th className="py-3 px-4">Stage Name</th>
                      <th className="py-3 px-4">Customer Action</th>
                      <th className="py-3 px-4">System / Backend Logic</th>
                      <th className="py-3 px-4">Security & Safety Gate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-sans">
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-mono font-bold text-yellow-400">Step 1</td>
                      <td className="py-3 px-4 font-bold text-white">Welcome Screen</td>
                      <td className="py-3 px-4">Touches the glowing "Touch to Start" button.</td>
                      <td className="py-3 px-4">Loads active cooler inventory and confirms ESP32-S3 online status.</td>
                      <td className="py-3 px-4 text-emerald-400">Chute locked; kiosk ready.</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-mono font-bold text-yellow-400">Step 2</td>
                      <td className="py-3 px-4 font-bold text-white">Age Eligibility Gate</td>
                      <td className="py-3 px-4">Selects "YES, 18+" or "NO, Under 18".</td>
                      <td className="py-3 px-4">If Under 18: dynamically filters product catalogue to non-alcoholic only.</td>
                      <td className="py-3 px-4 text-emerald-400">Rwanda Law strict compliance filter.</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-mono font-bold text-yellow-400">Step 3</td>
                      <td className="py-3 px-4 font-bold text-white">Product Catalogue</td>
                      <td className="py-3 px-4">Browses 6 official drinks (Virunga Waters, SKOL Lager/Malt/Silver, Panache Lemon).</td>
                      <td className="py-3 px-4">Displays prices in RWF, stock badge, and 18+ tags. Sold out items are disabled.</td>
                      <td className="py-3 px-4 text-emerald-400">Prevents ordering unstocked slots.</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-mono font-bold text-yellow-400">Step 4</td>
                      <td className="py-3 px-4 font-bold text-white">Quantity & Total</td>
                      <td className="py-3 px-4">Selects quantity (1–5) and confirms purchase.</td>
                      <td className="py-3 px-4">Calculates total = unit_price * quantity in RWF. Reserves stock temporarily.</td>
                      <td className="py-3 px-4 text-emerald-400">Atomically validates stock availability.</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-mono font-bold text-yellow-400">Step 5</td>
                      <td className="py-3 px-4 font-bold text-white">Phone Number Entry</td>
                      <td className="py-3 px-4">Enters Rwandan mobile number on keypad (07XXXXXXXX or +2507XXXXXXXX).</td>
                      <td className="py-3 px-4">Validates format on backend. Suggests carrier prefix (078/079 MTN, 072/073 Airtel).</td>
                      <td className="py-3 px-4 text-emerald-400">Regex verification prevents invalid pushes.</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-mono font-bold text-yellow-400">Step 6</td>
                      <td className="py-3 px-4 font-bold text-white">Provider Selection</td>
                      <td className="py-3 px-4">Selects exactly MTN Mobile Money or Airtel Money.</td>
                      <td className="py-3 px-4">Initializes internal transaction reference (e.g. INT-TXN-FTM-001).</td>
                      <td className="py-3 px-4 text-emerald-400">Only authorized telecom gateways used.</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-mono font-bold text-yellow-400">Step 7</td>
                      <td className="py-3 px-4 font-bold text-white">Payment Request Sent</td>
                      <td className="py-3 px-4">Customer checks phone for prompt. Kiosk displays 60s countdown.</td>
                      <td className="py-3 px-4">Dispatches USSD Push prompt to customer handset. Logs event in payment_events table.</td>
                      <td className="py-3 px-4 text-amber-400">Unpaid state; motor not authorized.</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-mono font-bold text-yellow-400">Step 8</td>
                      <td className="py-3 px-4 font-bold text-white">Backend Verification</td>
                      <td className="py-3 px-4">Enters PIN on handset.</td>
                      <td className="py-3 px-4">Backend waits for signed telecom confirmation. Verifies amount, order ID, and provider tx ref.</td>
                      <td className="py-3 px-4 text-emerald-400">Zero trust; frontend message never trusted alone.</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-mono font-bold text-yellow-400">Step 9</td>
                      <td className="py-3 px-4 font-bold text-white">Automatic Dispensing</td>
                      <td className="py-3 px-4">Hears actuator motor turn; beverage drops into retrieval bay.</td>
                      <td className="py-3 px-4">Sends unique token to ESP32-S3, rotates slot motor, optical drop sensor detects bottle falling, updates inventory in DB transaction.</td>
                      <td className="py-3 px-4 text-emerald-400">Duplicate command prevention.</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-mono font-bold text-yellow-400">Step 10</td>
                      <td className="py-3 px-4 font-bold text-white">Collection & Return</td>
                      <td className="py-3 px-4">Collects chilled bottle from bottom chute. Kiosk auto-returns to welcome.</td>
                      <td className="py-3 px-4">Marks order COMPLETED, sends SMS receipt, auto-resets in 10s.</td>
                      <td className="py-3 px-4 text-emerald-400">Ready for next customer.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 2: DATABASE TABLE */}
          {activeSection === 'DATABASE' && (
            <div>
              <div className="mb-4">
                <h3 className="text-base font-black text-yellow-400 uppercase tracking-wider">
                  The 14 Relational Database Tables (ACID Compliant)
                </h3>
                <p className="text-slate-400 text-xs mt-1">
                  Every order, payment attempt, sensor reading, and administrative action is preserved permanently in the database.
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-yellow-400 font-bold border-b border-slate-800 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-3">Table #</th>
                      <th className="py-3 px-4">Table Name</th>
                      <th className="py-3 px-4">Key Attributes</th>
                      <th className="py-3 px-4">Foreign Keys & Relations</th>
                      <th className="py-3 px-4">Operational Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-yellow-400">1</td>
                      <td className="py-2.5 px-4 font-bold text-white">customers</td>
                      <td className="py-2.5 px-4 text-slate-300">id, customer_reference, phone_number, account_status</td>
                      <td className="py-2.5 px-4 text-slate-400">—</td>
                      <td className="py-2.5 px-4 text-slate-300 font-sans">Stores customer identity securely with minimal PII.</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-yellow-400">2</td>
                      <td className="py-2.5 px-4 font-bold text-white">products</td>
                      <td className="py-2.5 px-4 text-slate-300">id, product_name, category_id, size, price, is_alcoholic</td>
                      <td className="py-2.5 px-4 text-slate-400">—</td>
                      <td className="py-2.5 px-4 text-slate-300 font-sans">6 official SKOL & Virunga beverage records.</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-yellow-400">3</td>
                      <td className="py-2.5 px-4 font-bold text-white">machines</td>
                      <td className="py-2.5 px-4 text-slate-300">id, machine_name, serial_number, location, device_status</td>
                      <td className="py-2.5 px-4 text-slate-400">—</td>
                      <td className="py-2.5 px-4 text-slate-300 font-sans">Hardware identity, firmware version, and online heartbeat.</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-yellow-400">4</td>
                      <td className="py-2.5 px-4 font-bold text-white">inventory</td>
                      <td className="py-2.5 px-4 text-slate-300">id, product_id, available_quantity, minimum_stock</td>
                      <td className="py-2.5 px-4 text-slate-400">product_id -&gt; products, machine_id -&gt; machines</td>
                      <td className="py-2.5 px-4 text-slate-300 font-sans">Tracks cooler slot capacity; decrements on dispense.</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-yellow-400">5</td>
                      <td className="py-2.5 px-4 font-bold text-white">orders</td>
                      <td className="py-2.5 px-4 text-slate-300">id, order_reference, total_amount, payment_status, dispensing_status</td>
                      <td className="py-2.5 px-4 text-slate-400">customer_id -&gt; customers, machine_id -&gt; machines</td>
                      <td className="py-2.5 px-4 text-slate-300 font-sans">Central purchase record (e.g. FTM-001, FTM-002).</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-yellow-400">6</td>
                      <td className="py-2.5 px-4 font-bold text-white">order_items</td>
                      <td className="py-2.5 px-4 text-slate-300">id, product_name_snapshot, unit_price_snapshot, quantity</td>
                      <td className="py-2.5 px-4 text-slate-400">order_id -&gt; orders, product_id -&gt; products</td>
                      <td className="py-2.5 px-4 text-slate-300 font-sans">Preserves historical price & name snapshot at purchase time.</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-yellow-400">7</td>
                      <td className="py-2.5 px-4 font-bold text-white">payments</td>
                      <td className="py-2.5 px-4 text-slate-300">id, provider (MTN/AIRTEL), amount, internal_transaction_reference</td>
                      <td className="py-2.5 px-4 text-slate-400">order_id -&gt; orders</td>
                      <td className="py-2.5 px-4 text-slate-300 font-sans">Financial reconciliation with telecom provider response.</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-yellow-400">8</td>
                      <td className="py-2.5 px-4 font-bold text-white">payment_events</td>
                      <td className="py-2.5 px-4 text-slate-300">id, event_type, event_reference, event_status, verification_result</td>
                      <td className="py-2.5 px-4 text-slate-400">payment_id -&gt; payments</td>
                      <td className="py-2.5 px-4 text-slate-300 font-sans">Granular audit trail for USSD push, callbacks, timeouts.</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-yellow-400">9</td>
                      <td className="py-2.5 px-4 font-bold text-white">dispensing_transactions</td>
                      <td className="py-2.5 px-4 text-slate-300">id, dispensing_reference, sensor_confirmation, failure_reason</td>
                      <td className="py-2.5 px-4 text-slate-400">order_id -&gt; orders, product_id -&gt; products</td>
                      <td className="py-2.5 px-4 text-slate-300 font-sans">Hardware motor cycle and optical drop sensor log.</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-yellow-400">10</td>
                      <td className="py-2.5 px-4 font-bold text-white">machine_sensors</td>
                      <td className="py-2.5 px-4 text-slate-300">id, sensor_type, sensor_value, unit, sensor_status</td>
                      <td className="py-2.5 px-4 text-slate-400">machine_id -&gt; machines</td>
                      <td className="py-2.5 px-4 text-slate-300 font-sans">Fridge temp (3.8°C), solar 49.6V, battery 94%, compressor current.</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-yellow-400">11</td>
                      <td className="py-2.5 px-4 font-bold text-white">machine_alerts</td>
                      <td className="py-2.5 px-4 text-slate-300">id, alert_type, severity, description, alert_status</td>
                      <td className="py-2.5 px-4 text-slate-400">machine_id -&gt; machines</td>
                      <td className="py-2.5 px-4 text-slate-300 font-sans">Motor jams, temperature spikes, or sensor deviations.</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-yellow-400">12</td>
                      <td className="py-2.5 px-4 font-bold text-white">users</td>
                      <td className="py-2.5 px-4 text-slate-300">id, full_name, email, role (ADMIN/TECHNICIAN/STAFF), phone</td>
                      <td className="py-2.5 px-4 text-slate-400">—</td>
                      <td className="py-2.5 px-4 text-slate-300 font-sans">Admin (Ishimwe Clement) + registered technicians/staff.</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-yellow-400">13</td>
                      <td className="py-2.5 px-4 font-bold text-white">system_settings</td>
                      <td className="py-2.5 px-4 text-slate-300">id, setting_name, setting_value, setting_category</td>
                      <td className="py-2.5 px-4 text-slate-400">—</td>
                      <td className="py-2.5 px-4 text-slate-300 font-sans">MTN/Airtel API keys, theme colors, cooler targets.</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-yellow-400">14</td>
                      <td className="py-2.5 px-4 font-bold text-white">audit_logs</td>
                      <td className="py-2.5 px-4 text-slate-300">id, user_id, action, entity_type, previous_value, new_value</td>
                      <td className="py-2.5 px-4 text-slate-400">—</td>
                      <td className="py-2.5 px-4 text-slate-300 font-sans">Tamper-evident log of all operator changes and tests.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 3: HARDWARE & SENSORS */}
          {activeSection === 'HARDWARE' && (
            <div className="space-y-4">
              <h3 className="text-base font-black text-yellow-400 uppercase tracking-wider">
                Embedded Systems & Solar Microgrid Architecture
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                  <h4 className="font-bold text-white flex items-center gap-2 mb-2">
                    <Cpu className="w-4 h-4 text-yellow-400" /> ESP32-S3 Microcontroller Unit
                  </h4>
                  <ul className="space-y-1.5 text-slate-300 text-[11px]">
                    <li>• Dual-Core Xtensa LX7 @ 240MHz with hardware crypto accelerator.</li>
                    <li>• Manages FreeRTOS task scheduler for dispensing timing & safety interrupts.</li>
                    <li>• RS-485 / Modbus bus connects 9 motor driver H-bridges.</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                  <h4 className="font-bold text-white flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-red-500" /> 48V DC Native Solar Architecture
                  </h4>
                  <ul className="space-y-1.5 text-slate-300 text-[11px]">
                    <li>• 340W MPPT Solar Charger connected to 48V 100Ah LiFePO4 battery pack.</li>
                    <li>• Zero AC inversion loss: Danfoss BD35F variable-speed compressor runs directly on DC.</li>
                    <li>• 18+ hours autonomous runtime during dark/rainy periods.</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                  <h4 className="font-bold text-white flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Dual-Beam Infrared Drop Sensor
                  </h4>
                  <ul className="space-y-1.5 text-slate-300 text-[11px]">
                    <li>• Mounted directly across the lower beverage collection chute.</li>
                    <li>• Triggers interrupt pulse when bottle crosses beam (&lt; 20ms response).</li>
                    <li>• Prevents false completion if an empty slot rotates or bottle is jammed.</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                  <h4 className="font-bold text-white flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-cyan-400" /> Quectel EC25 4G LTE IoT Modem
                  </h4>
                  <ul className="space-y-1.5 text-slate-300 text-[11px]">
                    <li>• Dual SIM fallback: Primary MTN Rwanda, Secondary Airtel Rwanda.</li>
                    <li>• Transmits telemetry heartbeats every 5 seconds to cloud backend.</li>
                    <li>• Receives cryptographically signed dispensing commands from server.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: PAYMENTS */}
          {activeSection === 'PAYMENTS' && (
            <div className="space-y-4">
              <h3 className="text-base font-black text-yellow-400 uppercase tracking-wider">
                Rwandan Mobile Money Payment Architecture
              </h3>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <p className="text-slate-300">
                  FTM-1 does not accept cash, credit cards, or physical coins to prevent vandalism and simplify accounting. 
                  The cooler is 100% cashless, exclusively utilizing approved Rwanda Mobile Money gateways:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-yellow-950/20 border-2 border-yellow-400 rounded-xl">
                    <h5 className="font-black text-yellow-300 text-sm">MTN Mobile Money (MoMo)</h5>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Direct integration with MTN Rwanda MoMo Collection API. Supports numbers starting with 078 and 079. Sends instant USSD pop-up directly to customer phone screen for PIN input.
                    </p>
                  </div>
                  <div className="p-4 bg-red-950/20 border-2 border-red-500 rounded-xl">
                    <h5 className="font-black text-red-300 text-sm">Airtel Money Rwanda</h5>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Integrated with Airtel Money Push API. Supports numbers starting with 072 and 073. Secure webhook confirmation with idempotent transaction deduplication.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: ROLES & REGISTRATION SPECIFICATION TABLE */}
          {activeSection === 'ROLES' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-black text-yellow-400 uppercase tracking-wider flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-yellow-400" />
                  Table 5: Admin, Semi-Admin & Technician Registration Specification
                </h3>
                <p className="text-slate-400 text-xs mt-1">
                  Official hierarchy, registration schemas, operational boundaries, and delegation parameters enforced by Master Administrator Ishimwe Clement.
                </p>
              </div>

              {/* Master Administrator Governance Card */}
              <div className="p-4 bg-gradient-to-r from-red-950/60 via-slate-900 to-yellow-950/30 border-2 border-yellow-400/80 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 text-[10px] font-black rounded-full bg-red-600 text-white">
                      ROOT GOVERNANCE
                    </span>
                    <span className="text-sm font-bold text-white">Master Administrator:</span>
                    <span className="text-base font-black text-yellow-400">Ishimwe Clement</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 max-w-2xl">
                    Holds singular super-admin privilege to register, audit, activate, or deactivate technicians and semi-administrators. Configures telecom merchant API gateways, modifies retail pricing, and reconciles fiscal settlements.
                  </p>
                </div>
                <div className="px-4 py-2 bg-slate-950 border border-yellow-400/50 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Admin Status</span>
                  <span className="text-xs font-black text-emerald-400">AUTHORIZED SOLE ADMIN</span>
                </div>
              </div>

              {/* Registration Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-yellow-300 font-mono text-[11px] uppercase border-b-2 border-yellow-400">
                      <th className="p-3">Role & Level</th>
                      <th className="p-3">Registered Data Fields</th>
                      <th className="p-3">Permitted Capabilities</th>
                      <th className="p-3">Strict System Restrictions</th>
                      <th className="p-3">Registration & Audit Trail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-sans">
                    {/* Semi-Admin Row */}
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 align-top font-bold text-white">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/25 text-purple-300 border border-purple-500/50 block w-fit mb-1">
                          SEMI-ADMIN
                        </span>
                        <span>Operations Supervisor</span>
                        <span className="text-[10px] text-slate-400 block font-normal">Tier 2 Delegated Role</span>
                      </td>
                      <td className="p-3 align-top font-mono text-[11px] text-slate-300 leading-relaxed">
                        • Full Legal Name<br />
                        • Corporate Email<br />
                        • Phone (+2507XXXXXXXX)<br />
                        • Role: <code className="text-yellow-300">SEMI_ADMIN</code><br />
                        • Password Hash (Argon2)<br />
                        • Status: <code className="text-emerald-400">ACTIVE</code>
                      </td>
                      <td className="p-3 align-top text-slate-300 leading-relaxed">
                        • Daily sales & order volume review<br />
                        • Restock verification & batch logs<br />
                        • Real-time stock audit across coils<br />
                        • Review solar & fridge telemetry<br />
                        • Export customer receipt records
                      </td>
                      <td className="p-3 align-top text-red-300 leading-relaxed">
                        ✕ Cannot alter beverage prices<br />
                        ✕ Cannot modify telecom API credentials<br />
                        ✕ Cannot register or delete other staff<br />
                        ✕ Cannot purge audit logs
                      </td>
                      <td className="p-3 align-top text-slate-400 text-[11px] leading-relaxed">
                        Enrolled by Ishimwe Clement in the Admin Portal. Generates <code className="text-slate-200">REGISTER_STAFF</code> audit log with timestamp & operator IP.
                      </td>
                    </tr>

                    {/* Technician Row */}
                    <tr className="hover:bg-slate-800/40 bg-slate-950/30">
                      <td className="p-3 align-top font-bold text-white">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 block w-fit mb-1">
                          TECHNICIAN
                        </span>
                        <span>Field Hardware Specialist</span>
                        <span className="text-[10px] text-slate-400 block font-normal">Tier 3 Hardware Role</span>
                      </td>
                      <td className="p-3 align-top font-mono text-[11px] text-slate-300 leading-relaxed">
                        • Full Legal Name<br />
                        • Technical Email<br />
                        • Phone (+2507XXXXXXXX)<br />
                        • Role: <code className="text-cyan-300">TECHNICIAN</code><br />
                        • Access Credential<br />
                        • Assigned Machine IDs
                      </td>
                      <td className="p-3 align-top text-slate-300 leading-relaxed">
                        • Actuate coil motors (slots 1–9)<br />
                        • Calibrate dual-beam IR sensors<br />
                        • Adjust fridge target temp (2.0–6.0°C)<br />
                        • Inspect compressor current draw<br />
                        • Clear jam & obstruction alerts
                      </td>
                      <td className="p-3 align-top text-red-300 leading-relaxed">
                        ✕ Cannot view financial revenues<br />
                        ✕ Cannot modify product catalog<br />
                        ✕ Cannot alter drink retail prices<br />
                        ✕ Cannot edit user accounts
                      </td>
                      <td className="p-3 align-top text-slate-400 text-[11px] leading-relaxed">
                        Registered exclusively by Ishimwe Clement. Every motor actuation test is timestamped and recorded in the database.
                      </td>
                    </tr>

                    {/* Field Staff Row */}
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 align-top font-bold text-white">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 block w-fit mb-1">
                          FIELD STAFF
                        </span>
                        <span>Inventory Restock Agent</span>
                        <span className="text-[10px] text-slate-400 block font-normal">Tier 4 Logistics Role</span>
                      </td>
                      <td className="p-3 align-top font-mono text-[11px] text-slate-300 leading-relaxed">
                        • Full Legal Name<br />
                        • Staff Email<br />
                        • Phone (+2507XXXXXXXX)<br />
                        • Role: <code className="text-emerald-300">STAFF</code><br />
                        • Access Credential
                      </td>
                      <td className="p-3 align-top text-slate-300 leading-relaxed">
                        • Log crate restocks (+10 / +25 bottles)<br />
                        • Verify current bottle inventory counts<br />
                        • Inspect physical chiller integrity
                      </td>
                      <td className="p-3 align-top text-red-300 leading-relaxed">
                        ✕ Cannot trigger motor dispensers<br />
                        ✕ Cannot view financial margins<br />
                        ✕ Cannot modify system configuration
                      </td>
                      <td className="p-3 align-top text-slate-400 text-[11px] leading-relaxed">
                        Enrolled by Ishimwe Clement. Restock transactions update both the <code className="text-slate-200">inventory</code> and <code className="text-slate-200">audit_logs</code> tables.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Registration Procedure Card */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <h4 className="font-bold text-yellow-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Admin Registration Workflow (How Ishimwe Clement Adds Staff):
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-xs leading-relaxed">
                  <li><strong>Admin Portal Login</strong>: Ishimwe Clement enters master credentials to access the FTM-1 Management Console.</li>
                  <li><strong>Navigate to Registration</strong>: Open the <em>"Register Technicians & Semi-Admin"</em> tab.</li>
                  <li><strong>Form Data Entry</strong>: Provide employee Legal Name, Corporate Email, Rwandan Phone, select Role (<code className="text-yellow-400">SEMI_ADMIN</code> or <code className="text-cyan-400">TECHNICIAN</code>), and set an initial secure password.</li>
                  <li><strong>Cryptographic Commitment</strong>: Clicking <em>"Register User"</em> persists the record to the <code className="text-slate-300">users</code> table with status <code className="text-emerald-400">ACTIVE</code> and generates an audit log entry.</li>
                  <li><strong>Account Lifecycle Management</strong>: Ishimwe Clement can toggle any registered staff account between <code className="text-emerald-400">ACTIVE</code> and <code className="text-red-400">INACTIVE</code> with one tap to immediately grant or revoke vending cooler access.</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            FTM-1 System Version: v2.4.1 • Document Reference: DOC-FTM-2026-MANUAL
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs transition-colors shadow-md"
          >
            CLOSE MANUAL
          </button>
        </div>
      </div>
    </div>
  );
};
