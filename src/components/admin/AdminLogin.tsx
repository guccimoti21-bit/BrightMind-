import React, { useState } from 'react';
import {
  Atom,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Info,
  ArrowLeft,
  Database,
  ExternalLink,
  HelpCircle,
  CheckCircle2,
  Settings
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { SupabaseSetupModal } from '../auth/SupabaseSetupModal';
import { isSupabaseLiveConfigured, getStoredSupabaseConfig } from '../../lib/supabase';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onReturnToStudent: () => void;
}

export function AdminLogin({ onLoginSuccess, onReturnToStudent }: AdminLoginProps) {
  const { login, isSupabaseConnected } = useAdminAuth();
  const [username, setUsername] = useState('admin@scimath.academy');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  const supabaseConfig = getStoredSupabaseConfig();
  const isLive = isSupabaseLiveConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setErrorStatus(null);

    if (!username.trim() || !password) {
      setErrorMessage('Please enter both administrator ID/email and password.');
      return;
    }

    setIsLoading(true);
    const result = await login(username.trim(), password);
    setIsLoading(false);

    if (result.success) {
      onLoginSuccess();
    } else {
      const err = result.error || 'Invalid administrator credentials.';
      setErrorMessage(err);
      // Extract HTTP status code if present (e.g. [HTTP 404 Not Found])
      const match = err.match(/\[HTTP\s+(\d+)[^\]]*\]/i);
      if (match) {
        setErrorStatus(match[0]);
      }
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Lockup */}
        <div className="text-center">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#60A5FA] p-0.5 shadow-md mb-4">
            <div className="w-full h-full bg-[#FFFFFF] rounded-[14px] flex items-center justify-center text-[#2563EB]">
              <Atom className="w-8 h-8 animate-spin-slow" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            Administrator Portal
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            SciMathenova Educational Content Management System
          </p>
        </div>

        {/* Backend Auth Mode Status Indicator */}
        <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm text-xs">
          <div className="flex items-center gap-2">
            {isLive ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-[#111827]">Supabase Cloud Auth</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-mono border border-emerald-200">
                  Active
                </span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="font-semibold text-[#111827]">Server / Static Mode</span>
                <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-mono border border-amber-200">
                  Fallback
                </span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowSetupModal(true)}
            className="flex items-center gap-1.5 text-xs text-[#2563EB] hover:text-[#1D4ED8] font-semibold cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{isLive ? 'Edit Supabase' : 'Connect Supabase'}</span>
          </button>
        </div>

        {/* Main Login Box */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-7 shadow-[0_16px_40px_rgba(37,99,235,0.08)] space-y-6 relative overflow-hidden">
          {/* Static Host / GitHub Pages Context Notice */}
          {!isLive && (
            <div className="p-3.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-xs text-[#1E3A8A] flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-[#111827] block">GitHub Pages Deployment</span>
                <p className="text-[11px] text-[#3B82F6] leading-relaxed">
                  Static hosting (GitHub Pages) runs entirely in the browser without a Node backend. To log in securely on GitHub Pages, connect your <strong>Supabase project</strong>.
                </p>
                <div className="pt-1 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSetupModal(true)}
                    className="text-[11px] font-bold text-[#2563EB] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Database className="w-3 h-3" />
                    <span>Configure Supabase Project</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGuideModal(true)}
                    className="text-[11px] text-[#64748B] hover:text-[#111827] cursor-pointer flex items-center gap-1"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>Setup Guide</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error Banner with safe readable message and HTTP status */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-xs space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  {errorStatus && (
                    <span className="inline-block px-1.5 py-0.5 rounded bg-[#FEE2E2] text-[#B91C1C] font-mono text-[10px] font-bold border border-[#FCA5A5] mr-1.5">
                      {errorStatus}
                    </span>
                  )}
                  <span className="font-medium text-[#111827] block">{errorMessage}</span>
                </div>
              </div>

              {errorMessage.includes('404') && (
                <div className="mt-2 pt-2 border-t border-[#FCA5A5]/40 text-[11px] text-[#7F1D1D] flex items-center justify-between">
                  <span>Need cloud authentication for GitHub Pages?</span>
                  <button
                    type="button"
                    onClick={() => setShowSetupModal(true)}
                    className="font-bold text-[#DC2626] hover:underline cursor-pointer"
                  >
                    Connect Supabase Now
                  </button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider block mb-1.5">
                Administrator Email or Username
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
                <span>Authenticating with Server...</span>
              ) : (
                <>
                  <span>Sign In as Administrator</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-[#EDF2F7] flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              className="text-xs text-[#2563EB] hover:text-[#1D4ED8] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>How to setup Supabase Admin Account</span>
            </button>

            <button
              onClick={onReturnToStudent}
              className="text-xs text-[#64748B] hover:text-[#2563EB] transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-1"
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
            <span>Server-Verified Authentication</span>
          </div>
          <p className="text-[11px]">
            Zero credentials are stored in frontend code. Access is cryptographically verified against Supabase Auth or secure server sessions.
          </p>
        </div>
      </div>

      {/* Supabase Setup Modal */}
      <SupabaseSetupModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
      />

      {/* Password Recovery Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl w-full max-w-sm p-6 shadow-2xl relative space-y-4">
            <h3 className="text-base font-bold text-[#111827]">Administrator Password Recovery</h3>
            <p className="text-xs text-[#475569] leading-relaxed">
              Administrator credentials are securely managed server-side:
            </p>
            <ul className="text-xs text-[#475569] list-disc pl-4 space-y-1.5 leading-relaxed">
              <li>
                <strong>Cloud / GitHub Pages (Supabase Auth):</strong> Go to your{' '}
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#2563EB] underline"
                >
                  Supabase Dashboard
                </a>{' '}
                &gt; <strong>Authentication</strong> &gt; <strong>Users</strong>. Select your administrator user, click &quot;Send Password Recovery&quot; or update the password directly.
              </li>
              <li>
                <strong>Local Server / Express:</strong> Use the administrator password configured in your server database environment.
              </li>
            </ul>
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

      {/* Supabase Admin Setup Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#111827]">GitHub Pages &amp; Supabase Auth Guide</h3>
                  <p className="text-[11px] text-[#64748B]">Configuring administrator authentication for published sites</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="text-[#94A3B8] hover:text-[#111827] text-lg font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 text-xs text-[#334155] leading-relaxed">
              <div className="p-3 bg-[#F8FAFF] border border-[#BFDBFE] rounded-xl space-y-1">
                <span className="font-bold text-[#1E3A8A] block">Why does this error happen on GitHub Pages?</span>
                <p className="text-[11px] text-[#475569]">
                  GitHub Pages is static file hosting and cannot run an Express/Node backend. Calling <code>/api/admin/login</code> on GitHub Pages returns a <strong>404 HTML document</strong> (&quot;The page cannot be found&quot;), which caused the invalid JSON parse error.
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-[#111827] block">3 Steps to Enable Admin Login on GitHub Pages:</span>
                
                <div className="p-3 border border-[#E2E8F0] rounded-xl space-y-1 bg-[#FFFFFF]">
                  <strong className="text-[#2563EB] block">1. Connect Supabase Project</strong>
                  <p className="text-[11px]">
                    Click &quot;Connect Supabase&quot; and enter your Project URL and public Anon Key from your Supabase Dashboard (Settings &gt; API).
                  </p>
                </div>

                <div className="p-3 border border-[#E2E8F0] rounded-xl space-y-1 bg-[#FFFFFF]">
                  <strong className="text-[#2563EB] block">2. Run SQL Migration</strong>
                  <p className="text-[11px]">
                    In Supabase Dashboard &gt; <strong>SQL Editor</strong>, execute the script in <code className="text-[#2563EB]">/supabase-schema.sql</code> to create the <code>profiles</code> table with Role-Based Access Control.
                  </p>
                </div>

                <div className="p-3 border border-[#E2E8F0] rounded-xl space-y-2 bg-[#FFFFFF]">
                  <strong className="text-[#2563EB] block">3. Create Administrator User &amp; Assign Role</strong>
                  <p className="text-[11px]">
                    Create a user in Supabase Authentication &gt; Users (e.g. <code>admin@scimath.academy</code>), then in SQL Editor run:
                  </p>
                  <pre className="p-2.5 bg-[#0F172A] text-[#E2E8F0] rounded-lg font-mono text-[10px] overflow-x-auto">
{`UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@scimath.academy';`}
                  </pre>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => {
                  setShowGuideModal(false);
                  setShowSetupModal(true);
                }}
                className="btn-primary px-4 py-2 text-xs font-semibold cursor-pointer"
              >
                Configure Supabase Now
              </button>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="btn-secondary px-4 py-2 text-xs font-semibold cursor-pointer"
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
