import React, { useState, useEffect } from 'react';
import { Clock, Shield, Filter, Search, RefreshCw, FileText } from 'lucide-react';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { AuditLog } from '../../../../server/db';

export function AdminAuditLogsView() {
  const { token } = useAdminAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');

  const loadLogs = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/audit-logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (e) {
      console.error('Error fetching audit logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [token]);

  const filtered = logs.filter((log) => {
    if (categoryFilter !== 'all' && log.category !== categoryFilter) return false;
    if (search.trim()) {
      const term = search.toLowerCase();
      return (
        log.action.toLowerCase().includes(term) ||
        log.details.toLowerCase().includes(term) ||
        log.adminUsername.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white">Security &amp; Audit Logs</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable chronological record of administrator logins, content publications, and security events.
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search audit records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All Categories</option>
            <option value="auth">Authentication</option>
            <option value="content">Content &amp; Lessons</option>
            <option value="rules">Learning Rules</option>
            <option value="media">Media Library</option>
            <option value="security">Security</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono text-cyan-300 whitespace-nowrap">
                    {log.adminUsername}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                        log.category === 'auth' || log.category === 'security'
                          ? 'bg-purple-950 text-purple-300 border border-purple-800/60'
                          : log.category === 'rules'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                          : 'bg-blue-950 text-blue-300 border border-blue-800/60'
                      }`}
                    >
                      {log.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 text-slate-300 text-[11px] max-w-md">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
