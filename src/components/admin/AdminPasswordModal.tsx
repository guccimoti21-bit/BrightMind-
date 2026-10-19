import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

interface AdminPasswordModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  canDismiss?: boolean;
  onDismiss?: () => void;
}

export function AdminPasswordModal({
  isOpen,
  onSuccess,
  canDismiss = false,
  onDismiss
}: AdminPasswordModalProps) {
  const { changePassword } = useAdminAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg('Please complete all fields.');
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
      setErrorMsg('New password cannot be identical to the current setup password.');
      return;
    }

    setIsLoading(true);
    const result = await changePassword(currentPassword, newPassword, confirmPassword);
    setIsLoading(false);

    if (result.success) {
      setSuccessMsg('Password successfully changed! Security credentials updated.');
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } else {
      setErrorMsg(result.error || 'Failed to update password.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl w-full max-w-md p-7 shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#D97706] shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#111827]">Security Update Required</h3>
            <p className="text-xs text-[#475569]">
              Please change the initial setup password (<code className="text-[#D97706] font-mono font-bold bg-[#FEF3C7] px-1.5 py-0.5 rounded">434241</code>) to proceed.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider block mb-1.5">
              Current Password (Initial: 434241)
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#93C5FD] rounded-xl text-xs text-[#111827] placeholder-[#94A3B8] focus:outline-none font-mono"
                placeholder="Current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#64748B] hover:text-[#111827]"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider block mb-1.5">
              New Secure Password
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#93C5FD] rounded-xl text-xs text-[#111827] placeholder-[#94A3B8] focus:outline-none font-mono"
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#64748B] hover:text-[#111827]"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider block mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#93C5FD] rounded-xl text-xs text-[#111827] placeholder-[#94A3B8] focus:outline-none font-mono"
              placeholder="Confirm new password"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            {canDismiss && onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="btn-secondary px-4 py-2.5 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying &amp; Encrypting...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Save &amp; Secure Admin Account</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
