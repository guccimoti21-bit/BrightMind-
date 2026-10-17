import React, { useState } from 'react';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, ShieldAlert, KeyRound } from 'lucide-react';
import { useStudentAuth } from '../../context/StudentAuthContext';

interface ForgotPasswordProps {
  onNavigateLogin: () => void;
  onReturnToHome: () => void;
}

export function ForgotPassword({ onNavigateLogin, onReturnToHome }: ForgotPasswordProps) {
  const { forgotPassword } = useStudentAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email.trim()) return;

    setIsSubmitting(true);
    const result = await forgotPassword(email);
    setIsSubmitting(false);

    if (result.success) {
      setIsSent(true);
    } else {
      setErrorMsg(result.error || 'Failed to send password reset link.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 animate-fade-in">
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
        <button
          onClick={onNavigateLogin}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Student Login</span>
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Reset Password
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Enter your registered student email address and we'll send a password recovery link.
          </p>
        </div>

        {isSent ? (
          <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-200 text-xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Reset Email Sent</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              If a student account is registered with <strong className="text-white">{email}</strong>, you will receive password reset instructions shortly.
            </p>
            <button
              onClick={onNavigateLogin}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

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
                  placeholder="student@example.com"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
