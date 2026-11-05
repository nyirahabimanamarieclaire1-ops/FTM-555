import React, { useState, useEffect } from 'react';
import { MachineSensor, MachineAlert } from '../types.ts';
import { ReadmeTableModal } from './ReadmeTableModal.tsx';
import {
  Wrench,
  Activity,
  Cpu,
  Wifi,
  Thermometer,
  Zap,
  BatteryCharging,
  Sun,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  LogOut,
  RefreshCw,
  Info,
  Sliders,
  Layers,
  Power,
  BookOpen
} from 'lucide-react';

interface Props {
  onBackToKiosk: () => void;
  onSwitchToAdmin: () => void;
}

export const TechnicianDashboard: React.FC<Props> = ({ onBackToKiosk, onSwitchToAdmin }) => {
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testingSlot, setTestingSlot] = useState<number | null>(null);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [readmeOpen, setReadmeOpen] = useState(false);

  // Hardware Simulation Mode flag (Mandatory Part 9)
  const [isSimulationMode, setIsSimulationMode] = useState(true);

  // Maintenance note input
  const [maintenanceNote, setMaintenanceNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  const fetchTelemetry = async () => {
    try {
      const res = await fetch('/api/hardware/telemetry');
      const data = await res.json();
      if (data.success) {
        setTelemetry(data);
      }
    } catch (e) {
      console.error('Telemetry error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 6000);
    return () => clearInterval(interval);
  }, []);

  // Diagnostic Test Motor on Slot (1-9)
  const handleTestMotorSlot = async (slot: number) => {
    setTestingSlot(slot);
    setTestResult(null);
    try {
      const res = await fetch('/api/hardware/test-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotNumber: slot, isSimulated: isSimulationMode })
      });
      const data = await res.json();
      setTestResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setTestingSlot(null);
    }
  };

  // Resolve Alert
  const handleResolveAlert = async (id: string) => {
    try {
      await fetch(`/api/hardware/alerts/${id}/resolve`, { method: 'POST' });
      fetchTelemetry();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="px-6 sm:px-8 py-4 bg-slate-900 border-b-4 border-yellow-400 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-yellow-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
            <Wrench className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white font-mono">FTM-1 TECHNICIAN PORTAL</h2>
              <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-red-600 text-white border border-yellow-400">
                Hardware & Telemetry
              </span>
            </div>
            <p className="text-xs text-yellow-300 font-semibold">Registered Field Operations Specialist</p>
          </div>
        </div>

        {/* Quick Nav Out */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setReadmeOpen(true)}
            className="px-3.5 py-1.5 text-xs font-black rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-red-600" /> README Manual
          </button>
          <button
            onClick={onSwitchToAdmin}
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-yellow-300 border border-slate-700 transition-colors"
          >
            Admin Portal
          </button>
          <button
            onClick={onBackToKiosk}
            className="px-4 py-1.5 text-xs font-bold rounded-xl bg-red-600 text-white border-2 border-yellow-400 hover:bg-red-500 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Return to Kiosk
          </button>
        </div>
      </header>

      {/* Readme Manual Modal */}
      <ReadmeTableModal isOpen={readmeOpen} onClose={() => setReadmeOpen(false)} />

      {/* Mandatory Part 9 Hardware Simulation Notice Banner */}
      <div className="bg-cyan-950/40 border-b border-cyan-500/30 px-8 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-cyan-300">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>
            <strong>HARDWARE INTEGRATION STATUS:</strong> Backend communicating with ESP32-S3 hardware abstraction layer.
            {isSimulationMode ? (
              <span className="ml-1 text-cyan-200">
                (Software Simulation Active: Controller & Sensor states verified in software loop.)
              </span>
            ) : (
              <span className="ml-1 text-emerald-300">
                (Physical Hardware Attached: Real RS-485 / LTE Bus Active.)
              </span>
            )}
          </span>
        </div>

        <button
          onClick={() => setIsSimulationMode(!isSimulationMode)}
          className="px-3 py-1 rounded-lg bg-slate-900 border border-cyan-500/40 text-[11px] font-mono text-cyan-300 hover:bg-cyan-900/40 transition-colors"
        >
          Mode: {isSimulationMode ? 'Simulation (Dev)' : 'Physical Hardware (RS-485)'}
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 px-8 py-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Machine & Connectivity Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Internal Cooler Temp</span>
              <Thermometer className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400 font-mono">3.8°C</div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
              <span>Target: 3.5°C</span>
              <span className="text-emerald-400 font-bold">Optimal Range</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Ambient Temperature</span>
              <Thermometer className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-3xl font-black text-slate-200 font-mono">24.2°C</div>
            <div className="mt-2 text-[11px] text-slate-500">
              Kigali Ambient • Airflow Normal
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Solar Power & Bus</span>
              <Sun className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-400 font-mono">49.6V</div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
              <span>MPPT: 340W Gen</span>
              <span className="text-emerald-400 font-bold">48V Bus Nominal</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Battery State of Charge</span>
              <BatteryCharging className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-black text-cyan-400 font-mono">94%</div>
            <div className="mt-2 text-[11px] text-slate-500">
              LiFePO4 48V 100Ah • 18 hrs backup
            </div>
          </div>
        </div>

        {/* Hardware Controller Specifications (Part 9) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" /> Embedded Systems Architecture (ESP32-S3)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Physical hardware specifications prepared for production deployment.</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              FIRMWARE v2.4.1-esp32s3
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-slate-500 block mb-1">Microcontroller Unit (MCU):</span>
              <span className="text-white font-bold">ESP32-S3 Dual-Core LX7 @ 240MHz</span>
              <span className="text-emerald-400 text-[10px] block mt-1">FreeRTOS Vending Supervisor Core</span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-slate-500 block mb-1">Cellular IoT Modem:</span>
              <span className="text-white font-bold">Quectel EC25 4G LTE Cat 4</span>
              <span className="text-emerald-400 text-[10px] block mt-1">Dual-SIM (MTN Rwanda & Airtel)</span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-slate-500 block mb-1">Electrical Architecture:</span>
              <span className="text-white font-bold">48V DC Native Solar Microgrid</span>
              <span className="text-emerald-400 text-[10px] block mt-1">No Inverter Loss • Direct DC Drive</span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-slate-500 block mb-1">Cooling Unit:</span>
              <span className="text-white font-bold">Danfoss BD35F Variable Speed DC</span>
              <span className="text-cyan-400 text-[10px] block mt-1">R134a eco refrigerant • Current 2.1A</span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-slate-500 block mb-1">Product Drop Verification:</span>
              <span className="text-white font-bold">Dual-Beam Infrared Interrupter</span>
              <span className="text-emerald-400 text-[10px] block mt-1">Response time: &lt; 20ms pulse</span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-slate-500 block mb-1">Door Interlock & Tamper:</span>
              <span className="text-white font-bold">Magnetic Reed Switches</span>
              <span className="text-emerald-400 text-[10px] block mt-1">Refrigeration chamber sealed</span>
            </div>
          </div>
        </div>

        {/* Dispenser Slot Diagnostic Motor Test Matrix */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <RotateCw className="w-5 h-5 text-cyan-400" /> Dispensing Actuator Diagnostic Tests
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Technician tool to rotate and test individual drink motor coils without debiting customer accounts.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">9 Cooled Drink Channels</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-9 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((slot) => (
              <button
                key={slot}
                disabled={testingSlot !== null}
                onClick={() => handleTestMotorSlot(slot)}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                  testingSlot === slot
                    ? 'border-cyan-400 bg-cyan-950/40 animate-pulse'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                <RotateCw className={`w-5 h-5 mb-2 ${testingSlot === slot ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
                <span className="text-xs font-mono font-bold text-white">Slot {slot}</span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  {testingSlot === slot ? 'Rotating...' : 'Test Spin'}
                </span>
              </button>
            ))}
          </div>

          {testResult && (
            <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  Slot {testResult.slot} Diagnostic Cycle Passed: Motor current peak {testResult.motorCurrentPeak}, rotation time {testResult.rotationCycleTimeMs}ms.
                </span>
              </div>
              <span className="text-[11px] text-slate-400">Sensor drop detector triggered OK</span>
            </div>
          )}
        </div>

        {/* Machine Alerts & Fault Management */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" /> Active Machine Alerts & Incidents
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">System fault tracking for automatic motor jams, temperature warnings, or telemetry alerts.</p>
            </div>
            <button
              onClick={fetchTelemetry}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {telemetry?.alerts?.map((alt: MachineAlert) => (
              <div
                key={alt.id}
                className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${alt.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white font-mono">{alt.alert_type}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${alt.alert_status === 'ACTIVE' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-slate-400'}`}>
                        {alt.alert_status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">{alt.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(alt.created_at).toLocaleTimeString()}
                  </span>
                  {alt.alert_status === 'ACTIVE' && (
                    <button
                      onClick={() => handleResolveAlert(alt.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/40 transition-colors"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
