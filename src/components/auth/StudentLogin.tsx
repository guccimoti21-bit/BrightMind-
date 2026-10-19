import React, { useState } from 'react';
import {
  Atom,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Database,
  ArrowLeft
} from 'lucide-react';
import { useStudentAuth } from '../../context/StudentAuthContext';

interface StudentLoginProps {
  onLoginSuccess: () => void;
  onNavigateRegister: () => void;
  onNavigateForgotPassword: () => void;
  onReturnToHome: () => void;
  onOpenAdminLogin: () => void;
  onOpenSupabaseSetup: () => void;
  redirectNotice?: string | null;
}

export function StudentLogin({
  onLoginSuccess,
  onNavigateRegister,
  onNavigateForgotPassword,
  onReturnToHome,
  onOpenAdminLogin,
  onOpenSupabaseSetup,
  redirectNotice
}: StudentLoginProps) {
  const { login, configStatus } = useStudentAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAdminAttempt, setIsAdminAttempt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsAdminAttempt(false);

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your student email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      onLoginSuccess();
    } else {
      setErrorMsg(result.error || 'Failed to authenticate.');
      if (result.isAdminAttempt) {
        setIsAdminAttempt(true);
      }
    }
  };

  const handleFillDemoStudent = () => {
    setEmail('student@scimathenova.academy');
    setPassword('Password123!');
    setErrorMsg(null);
    setIsAdminAttempt(false);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 animate-fade-in">
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-[0_16px_40px_rgba(37,99,235,0.08)] relative overflow-hidden">
        {/* Top glowing ambient accent */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-[#2563EB] to-transparent opacity-80" />

        {/* Back Link */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onReturnToHome}
            className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#2563EB] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to SciMathenova</span>
          </button>

          {/* Supabase status badge */}
          <button
            onClick={onOpenSupabaseSetup}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono border bg-[#F8FAFF] border-[#E2E8F0] text-[#475569] hover:border-[#BFDBFE] transition-colors cursor-pointer"
            title="View Supabase Authentication & Database Details"
          >
            <Database className="w-3 h-3 text-[#2563EB]" />
            <span>{configStatus.isConfigured ? 'Supabase Live' : 'Supabase Sim'}</span>
          </button>
        </div>

        {/* Logo and Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#60A5FA] p-0.5 mx-auto flex items-center justify-center shadow-md">
            <div className="w-full h-full bg-[#FFFFFF] rounded-[14px] flex items-center justify-center text-[#2563EB]">
              <Atom className="w-6 h-6 animate-spin-slow" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[#111827] tracking-tight">
            Student Sign In
          </h2>
          <p className="text-xs text-[#64748B]">
            Access your personalized learning progress, interactive labs, and assessments.
          </p>
        </div>

        {/* Redirect Intent Notice */}
        {redirectNotice && (
          <div className="mb-5 p-3 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-xs text-[#2563EB] flex items-start gap-2 leading-relaxed">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-[#2563EB]" />
            <span>{redirectNotice}</span>
          </div>
        )}

        {/* Fast-fill Demo Student Account */}
        <div className="mb-5 p-3 rounded-xl bg-[#F8FAFF] border border-[#E2E8F0] flex items-center justify-between">
          <div className="text-[11px] text-[#475569]">
            <span className="font-semibold text-[#111827]">Demo Student Account</span>
            <div className="text-[10px] text-[#64748B]">Class 8 · Pre-populated progress</div>
          </div>
          <button
            type="button"
            onClick={handleFillDemoStudent}
            className="px-2.5 py-1 rounded-md bg-[#FFFFFF] hover:bg-[#EFF6FF] text-[#2563EB] text-[11px] font-semibold border border-[#BFDBFE] transition-colors cursor-pointer"
          >
            Fast Fill Demo
          </button>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-xs text-[#DC2626] flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p>{errorMsg}</p>
              {isAdminAttempt && (
                <div className="mt-2 pt-2 border-t border-[#FECACA]">
                  <button
                    type="button"
                    onClick={onOpenAdminLogin}
                    className="font-bold underline text-[#DC2626] hover:text-[#991B1B] cursor-pointer"
                  >
                    Click here to open the Administrator Portal →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">
              Student Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@scimathenova.academy"
                required
                className="w-full pl-9 pr-4 py-2.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-xs text-[#111827] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#93C5FD] focus:border-[#2563EB] transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#475569]">Password</label>
              <button
                type="button"
                onClick={onNavigateForgotPassword}
                className="text-xs text-[#2563EB] hover:text-[#1D4ED8] transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-9 pr-10 py-2.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-xs text-[#111827] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#93C5FD] focus:border-[#2563EB] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1.5 text-[#94A3B8] hover:text-[#475569] absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me toggle */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#475569]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#93C5FD]"
              />
              <span>Remember this session</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Learning Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link to Register */}
        <div className="mt-6 pt-5 border-t border-[#EDF2F7] text-center text-xs text-[#64748B]">
          New student?{' '}
          <button
            onClick={onNavigateRegister}
            className="text-[#2563EB] hover:text-[#1D4ED8] font-semibold cursor-pointer underline underline-offset-2 ml-1"
          >
            Create a Student Account
          </button>
        </div>

        {/* Public browse without account notice */}
        <div className="mt-4 text-center">
          <button
            onClick={onReturnToHome}
            className="text-[11px] text-[#64748B] hover:text-[#2563EB] transition-colors cursor-pointer"
          >
            Want to see chapters first? Browse front page chapter index without logging in →
          </button>
        </div>
      </div>
    </div>
  );
}
