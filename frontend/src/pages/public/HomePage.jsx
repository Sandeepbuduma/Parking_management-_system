import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { locationsApi, slotsApi } from '../../services/api';
import {
  Car,
  ShieldCheck,
  Zap,
  Clock,
  MapPin,
  CheckCircle,
  ArrowRight,
  Radio,
  Sliders,
  DollarSign,
  Activity,
  Layers,
  ChevronRight,
} from 'lucide-react';
import Badge from '../../components/common/Badge';

export const HomePage = () => {
  const { isAuthenticated, isAdmin, login } = useAuth();
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickLoginLoading, setQuickLoginLoading] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await locationsApi.getActive();
      setLocations(res.data);
    } catch (err) {
      console.error('Failed to load locations', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (email, password) => {
    setQuickLoginLoading(true);
    try {
      const userData = await login(email, password);
      if (userData.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      console.error('Quick login failed', err);
    } finally {
      setQuickLoginLoading(false);
    }
  };

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold backdrop-blur-md">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Next-Gen Smart Parking System • Real-Time MySQL & IoT</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Seamless Parking, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Reserved in Seconds.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Eliminate parking stress with automated spot discovery, live floor vacancy grids, instant vehicle check-in, and fair hourly billing.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/locations"
              className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 transition flex items-center gap-2 group"
            >
              <span>Explore Parking Slots</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>
            {!isAuthenticated && (
              <Link
                to="/register"
                className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm transition"
              >
                Create Free Account
              </Link>
            )}
          </div>

          {/* Demo Credentials Fast-Access Card */}
          <div className="max-w-3xl mx-auto mt-10 p-5 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-left">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Evaluation Demo Accounts</span>
              </div>
              <span className="text-[11px] text-slate-400">Click to auto-authenticate</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3.5 text-left">
              {/* Admin Button */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">
                    Administrator
                  </span>
                  <p className="text-xs font-semibold text-white mt-1.5">admin@parking.com</p>
                  <p className="text-[11px] text-slate-400">Password: <code className="text-emerald-400">Admin@123</code></p>
                </div>
                <button
                  type="button"
                  disabled={quickLoginLoading}
                  onClick={() => handleQuickDemoLogin('admin@parking.com', 'Admin@123')}
                  className="px-3 py-1.5 text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition shrink-0"
                >
                  Admin Login
                </button>
              </div>

              {/* Customer Button */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    Customer
                  </span>
                  <p className="text-xs font-semibold text-white mt-1.5">customer@parking.com</p>
                  <p className="text-[11px] text-slate-400">Password: <code className="text-emerald-400">Customer@123</code></p>
                </div>
                <button
                  type="button"
                  disabled={quickLoginLoading}
                  onClick={() => handleQuickDemoLogin('customer@parking.com', 'Customer@123')}
                  className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition shrink-0"
                >
                  Customer Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Locations Preview Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Live Facilities</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Available Parking Decks</h2>
          </div>
          <Link
            to="/locations"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>View All Facilities</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-44 rounded-xl bg-slate-800/40 animate-pulse" />
            <div className="h-44 rounded-xl bg-slate-800/40 animate-pulse" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {locations.map((loc) => (
              <div
                key={loc.id}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-xl space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">{loc.name}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      {loc.address}
                    </p>
                  </div>
                  <Badge status="AVAILABLE">Active Hub</Badge>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {loc.description}
                </p>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
                  <div className="p-2 rounded-lg bg-slate-950/60">
                    <p className="text-[10px] text-slate-400">Floors</p>
                    <p className="text-sm font-bold text-white">{loc.totalFloors}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60">
                    <p className="text-[10px] text-slate-400">Total Bays</p>
                    <p className="text-sm font-bold text-white">{loc.totalSlots}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60">
                    <p className="text-[10px] text-emerald-400">Available</p>
                    <p className="text-sm font-bold text-emerald-400">{loc.availableSlots}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to={`/locations`}
                    className="w-full py-2.5 px-4 bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    <span>View Interactive Slot Map</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How it Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Streamlined Process</span>
          <h2 className="text-3xl font-extrabold text-white">How SmartPark Works</h2>
          <p className="text-sm text-slate-400">Four easy steps to a guaranteed parking space.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Discover & Filter',
              desc: 'Browse locations by floor, vehicle type (Car, Bike, EV), and live green vacancy badges.',
              icon: MapPin,
            },
            {
              step: '02',
              title: 'Book Parking Slot',
              desc: 'Select your vehicle and booking window. Our system prevents double booking with transactional locks.',
              icon: Clock,
            },
            {
              step: '03',
              title: 'Check In On Arrival',
              desc: 'Start your active parking session with 1 click. Spot turns occupied in real time.',
              icon: Car,
            },
            {
              step: '04',
              title: 'Checkout & Receipt',
              desc: 'Checkout when leaving. The system computes exact duration and bills according to hourly rates.',
              icon: DollarSign,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="relative p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <span className="text-2xl font-black text-slate-700">{item.step}</span>
                <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Key Feature Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">College Demo Highlights</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Designed for Reliability, Concurrency & Security
              </h2>
              <ul className="space-y-3.5 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Zero Overlap Booking Engine:</strong> Database-level isolation prevents multiple drivers from securing the same bay.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Smart Rounding Billing:</strong> Fair hourly pricing rules with automated check-in/out duration tracking.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>IoT Sensor Simulator:</strong> Live demonstration tool to simulate hardware ultrasonic/magnetic vehicle sensors.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Comprehensive Role-Based Access:</strong> Spring Security JWT architecture protecting admin APIs.</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-white">System Architecture</span>
                <span className="text-[10px] text-emerald-400 font-mono">v1.0.0</span>
              </div>
              <div className="space-y-2 text-xs font-mono text-slate-400">
                <div className="flex justify-between p-2 rounded bg-slate-900">
                  <span>Backend:</span>
                  <span className="text-emerald-400">Spring Boot 3.3.4 (Java 17)</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-900">
                  <span>Frontend:</span>
                  <span className="text-emerald-400">React 18 + Vite + Tailwind CSS</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-900">
                  <span>Database:</span>
                  <span className="text-emerald-400">MySQL 8.0 (smart_parking_db)</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-900">
                  <span>Security:</span>
                  <span className="text-emerald-400">Spring Security + JJWT 0.12.5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
