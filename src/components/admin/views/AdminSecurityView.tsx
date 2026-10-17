import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Key, Clock, ShieldAlert } from 'lucide-react';
import { useAdminAuth } from '../../../context/AdminAuthContext';

export function AdminSecurityView() {
  const { admin, changePassword } = useAdminAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg('All password fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('The new password and confirmation do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must contain at least 6 characters.');
      return;
    }

    if (newPassword === currentPassword) {
      setErrorMsg('New password cannot be identical to the current password.');
      return;
    }

    setIsLoading(true);
    const result = await changePassword(currentPassword, newPassword, confirmPassword);
    setIsLoading(false);

    if (result.success) {
      setSuccessMsg('Administrator password changed successfully. Hash updated via scrypt.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setErrorMsg(result.error || 'Failed to update password.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-4 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white">Admin Account &amp; Security</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage master administrator credentials, scrypt password hashing, and session authentication.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Change Password Form (7 cols) */}
        <div className="md:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2.5 text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <Key className="w-4 h-4" />
            <span>Update Master Password</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-400"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                New Password (minimum 6 characters)
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-400"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-400"
                placeholder="Confirm new password"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                {isLoading ? 'Verifying & Encrypting...' : 'Save New Password'}
              </button>
            </div>
          </form>
        </div>

        {/* Security Profile & Standards (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
            <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Active Security Profile</span>
            </span>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Admin Username:</span>
                <span className="text-white font-mono font-bold">{admin?.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned Role:</span>
                <span className="text-cyan-300 font-mono capitalize">{admin?.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hash Algorithm:</span>
                <span className="text-emerald-400 font-mono">scrypt (Node.js crypto)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Password Policy:</span>
                <span className="text-slate-300">Min 6 characters, salt per user</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-950/40 border border-blue-900/60 rounded-2xl p-4 text-xs text-slate-300 space-y-2">
            <span className="font-bold text-cyan-300 block">Security Best Practices</span>
            <ul className="space-y-1 list-disc list-inside text-[11px] text-slate-400">
              <li>Passphrase changes take effect across all endpoints immediately.</li>
              <li>Tokens expire after 8 hours of inactivity.</li>
              <li>Rate limiting throttles brute force attempts to 5 failures per 5 minutes.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
