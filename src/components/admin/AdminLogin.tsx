import React, { useState } from 'react';
import { Atom, Lock, Eye, EyeOff, User, ArrowRight, ShieldCheck, AlertCircle, Info, ArrowLeft } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onReturnToStudent: () => void;
}

export function AdminLogin({ onLoginSuccess, onReturnToStudent }: AdminLoginProps) {
  const { login } = useAdminAuth();
  const [username, setUsername] = useState('admin@scimath.academy');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password) {
      setErrorMessage('Please enter both administrator ID and password.');
      return;
    }

    setIsLoading(true);
    const result = await login(username.trim(), password);
    setIsLoading(false);

    if (result.success) {
      onLoginSuccess();
    } else {
      setErrorMessage(result.error || 'Invalid credentials.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Lockup */}
        <div className="text-center">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#60A5FA] p-0.5 shadow-md mb-4">
            <div className="w-full h-full bg-[#FFFFFF] rounded-[14px] flex items-center justify-center text-[#2563EB]">
              <Atom className="w-8 h-8 animate-spin-slow" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            Administrator Login
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            SciMathenova Content Management System &amp; Portal
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-7 shadow-[0_16px_40px_rgba(37,99,235,0.08)] space-y-6 relative overflow-hidden">
          {/* Initial Setup Notification */}
          <div className="p-3.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-xs text-[#475569] flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-[#111827] block">Initial Setup Credentials</span>
              <p className="text-[11px] text-[#475569] leading-relaxed">
                Administrator ID: <strong className="text-[#2563EB] font-mono">admin@scimath.academy</strong><br />
                Initial Setup Password: <strong className="text-[#2563EB] font-mono">434241</strong>
              </p>
              <p className="text-[10px] text-[#64748B] italic">
                * You will be prompted to update this password upon first successful login.
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider block mb-1.5">
                Administrator Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-xs text-[#111827] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#93C5FD] focus:border-[#2563EB] transition-all font-mono"
                  placeholder="admin@scimath.academy"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-[#2563EB] hover:text-[#1D4ED8] transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-xs text-[#111827] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#93C5FD] focus:border-[#2563EB] transition-all font-mono"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#94A3B8] hover:text-[#475569] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In as Administrator</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-[#EDF2F7] text-center">
            <button
              onClick={onReturnToStudent}
              className="text-xs text-[#64748B] hover:text-[#2563EB] transition-colors flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Student Website</span>
            </button>
          </div>
        </div>

        {/* Security Assurance Notice */}
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] text-center text-xs text-[#64748B] space-y-1 shadow-sm">
          <div className="flex items-center justify-center gap-1.5 text-[#16A34A] font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure Role-Based Access Control</span>
          </div>
          <p className="text-[11px]">
            Server-side authentication enforced. Failed attempts are rate-limited and logged.
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl w-full max-w-sm p-6 shadow-2xl relative space-y-4">
            <h3 className="text-base font-bold text-[#111827]">Administrator Password Recovery</h3>
            <p className="text-xs text-[#475569] leading-relaxed">
              If you have lost access to the administrator account, you can reset the password via the server environment or use the initial setup password <strong className="text-[#111827] font-mono">434241</strong> with username <strong className="text-[#111827] font-mono">admin@scimath.academy</strong>.
            </p>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowForgotModal(false)}
                className="btn-primary px-4 py-2 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
