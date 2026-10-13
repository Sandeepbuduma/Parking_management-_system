import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { healthApi, dashboardApi } from '../../services/api';
import Badge from '../../components/common/Badge';
import { Shield, Server, Database, CheckCircle2, RefreshCw, Key, User, Activity } from 'lucide-react';

export const AdminSettingsPage = () => {
  const { user } = useAuth();
  const [healthStatus, setHealthStatus] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkHealthAndLogs();
  }, []);

  const checkHealthAndLogs = async () => {
    setLoading(true);
    try {
      const [hRes, lRes] = await Promise.all([
        healthApi.check(),
        dashboardApi.getAuditLogs(),
      ]);
      setHealthStatus(hRes.data);
      setAuditLogs(lRes.data);
    } catch (err) {
      console.error('Failed to load health or logs', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Settings & Diagnostics</span>
        <h1 className="text-2xl font-black text-white mt-0.5">Admin Profile & System Settings</h1>
        <p className="text-xs text-slate-400">Verify system connectivity, database synchronization, and audit records.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Admin Identity Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white text-lg font-bold">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{user?.fullName}</h3>
              <p className="text-xs text-slate-400">{user?.email}</p>
              <Badge status="ADMIN" className="mt-1" />
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Account Role:</span>
              <span className="font-semibold text-white">System Administrator</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Phone:</span>
              <span className="font-semibold text-white">{user?.phone || '+1-800-555-0100'}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Security Clearance:</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Full Root Access
              </span>
            </div>
          </div>
        </div>

        {/* Database & API Health Diagnostics */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                Backend & MySQL Health
              </h3>
              <p className="text-xs text-slate-400">Spring Boot 3.3.4 & MySQL 8.0</p>
            </div>
            <button
              onClick={checkHealthAndLogs}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              title="Ping Backend"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400">REST API Status:</span>
              <span className="font-bold text-emerald-400">{healthStatus?.status || 'UP'}</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Database Name:</span>
              <span className="font-mono text-emerald-400">smart_parking_db</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Database Connection:</span>
              <span className="font-mono text-slate-300">localhost:3306</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Authentication Scheme:</span>
              <span className="font-mono text-slate-300">Stateless JWT (HMAC-SHA256)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Audit Logs */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white">Full System Audit Log History</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                  {log.action}
                </span>
                <span className="text-slate-300">{log.description}</span>
              </div>
              <span className="text-slate-500 text-[11px] shrink-0">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
