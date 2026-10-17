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
    setEmail('student@scimath.academy');
    setPassword('Password123!');
    setErrorMsg(null);
    setIsAdminAttempt(false);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 animate-fade-in">
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Top glowing ambient accent */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />

        {/* Back Link */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onReturnToHome}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to BrightMind Learning</span>
          </button>

          {/* Supabase status badge */}
          <button
            onClick={onOpenSupabaseSetup}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono border bg-slate-950/80 border-slate-800 text-slate-300 hover:border-cyan-500/50 transition-colors cursor-pointer"
            title="View Supabase Authentication & Database Details"
          >
            <Database className="w-3 h-3 text-cyan-400" />
            <span>{configStatus.isConfigured ? 'Supabase Live' : 'Supabase Sim'}</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 mx-auto mb-3 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-cyan-400">
              <Atom className="w-6 h-6 animate-spin-slow" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Student Login
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Sign in to access your classes, interactive simulations, and learning progress.
          </p>
        </div>

        {/* Redirect Notice if user attempted to open protected page */}
        {redirectNotice && (
          <div className="mb-5 p-3 rounded-xl bg-blue-950/70 border border-blue-800/60 text-cyan-300 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{redirectNotice}</span>
          </div>
        )}

        {/* Admin Attempt Banner */}
        {isAdminAttempt && (
          <div className="mb-5 p-3.5 rounded-xl bg-amber-950/80 border border-amber-700/60 text-amber-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-amber-300">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Administrator Account Detected</span>
            </div>
            <p className="text-[11px] text-amber-300/80">
              This login portal is reserved for students. To manage syllabus and site settings, please use the Administrator Portal.
            </p>
            <button
              onClick={onOpenAdminLogin}
              className="w-full mt-1 py-1.5 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Go to Administrator Login (/admin/login)
            </button>
          </div>
        )}

        {/* General Error Message */}
        {errorMsg && !isAdminAttempt && (
          <div className="mb-5 p-3 rounded-xl bg-rose-950/70 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Student Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@scimath.academy"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={onNavigateForgotPassword}
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your student password"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0"
              />
              <span>Remember me on this browser</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Learning Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast-fill Option */}
        <div className="mt-5 pt-5 border-t border-slate-800/80">
          <button
            type="button"
            onClick={handleFillDemoStudent}
            className="w-full py-2 px-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Use Demo Student Credentials (Class 8)</span>
          </button>
        </div>

        {/* Link to Register */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <span>New to BrightMind Learning? </span>
          <button
            onClick={onNavigateRegister}
            className="text-cyan-400 hover:text-cyan-300 font-bold underline transition-colors cursor-pointer"
          >
            Create Student Account
          </button>
        </div>
      </div>
    </div>
  );
}
