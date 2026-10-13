import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Shield, Activity, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Car className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white">Smart<span className="text-emerald-400">Park</span></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated parking space discovery, seamless slot reservation, contactless check-in/out, and real-time IoT monitoring system.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/" className="hover:text-emerald-400 transition">Home</Link></li>
              <li><Link to="/locations" className="hover:text-emerald-400 transition">Parking Locations</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-400 transition">Help Center & FAQ</Link></li>
              <li><Link to="/login" className="hover:text-emerald-400 transition">User Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">System Features</h4>
            <ul className="space-y-2 text-xs">
              <li>Real-time Slot Availability</li>
              <li>Multi-Vehicle Support (Cars, Bikes, EVs)</li>
              <li>Dynamic Hourly Billing & Checkout</li>
              <li>Simulated IoT Sensor Grid</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Security & Compliance</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Role-based authorization, JWT-authenticated API endpoints, and BCrypt encrypted security credentials.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Enterprise Grade Security</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Smart Parking Management System. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for Project Demonstration & Evaluation
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
