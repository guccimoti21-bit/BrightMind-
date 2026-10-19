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
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-[0_16px_40px_rgba(37,99,235,0.08)] relative">
        <button
          onClick={onNavigateLogin}
          className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#2563EB] transition-colors cursor-pointer mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Student Login</span>
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB] mx-auto mb-3 shadow-sm">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#111827] tracking-tight">
            Reset Password
          </h2>
          <p className="text-xs text-[#64748B] mt-1 max-w-xs mx-auto">
            Enter your registered student email address and we'll send a password recovery link.
          </p>
        </div>

        {isSent ? (
          <div className="p-4 rounded-xl bg-[#DCFCE7] border border-[#BBF7D0] text-[#166534] text-xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-[#166534]">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Reset Email Sent</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              If a student account is registered with <strong className="text-[#111827]">{email}</strong>, you will receive password reset instructions shortly.
            </p>
            <button
              onClick={onNavigateLogin}
              className="btn-primary w-full py-2 text-xs font-bold cursor-pointer"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-xs text-[#DC2626] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                Registered Student Email
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <span>Sending Recovery Link...</span>
              ) : (
                <>
                  <span>Send Recovery Email</span>
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
