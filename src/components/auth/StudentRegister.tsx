import React, { useState } from 'react';
import {
  Atom,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  GraduationCap,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { useStudentAuth } from '../../context/StudentAuthContext';
import { ClassLevel } from '../../types/curriculum';

interface StudentRegisterProps {
  onRegisterSuccess: () => void;
  onNavigateLogin: () => void;
  onReturnToHome: () => void;
}

export function StudentRegister({
  onRegisterSuccess,
  onNavigateLogin,
  onReturnToHome
}: StudentRegisterProps) {
  const { register } = useStudentAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [classLevel, setClassLevel] = useState<ClassLevel>(8);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessNotice(null);

    // Form Validations
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid student email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter them carefully.');
      return;
    }
    if (!agreedTerms) {
      setErrorMsg('Please accept the Terms of Service and Privacy Policy to register.');
      return;
    }

    setIsSubmitting(true);
    const result = await register(fullName, email, password, classLevel);
    setIsSubmitting(false);

    if (result.success) {
      if (result.requiresEmailConfirmation) {
        setSuccessNotice(
          'Account created successfully! A verification email has been sent. Please confirm your email address to log in.'
        );
      } else {
        onRegisterSuccess();
      }
    } else {
      setErrorMsg(result.error || 'Failed to create student account.');
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 sm:p-6 animate-fade-in">
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
        </div>

        {/* Logo and Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#60A5FA] p-0.5 mx-auto flex items-center justify-center shadow-md">
            <div className="w-full h-full bg-[#FFFFFF] rounded-[14px] flex items-center justify-center text-[#2563EB]">
              <Atom className="w-6 h-6 animate-spin-slow" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[#111827] tracking-tight">
            Create Student Account
          </h2>
          <p className="text-xs text-[#64748B]">
            Join SciMathenova to track your chapter mastery and explore virtual science &amp; math labs.
          </p>
        </div>

        {/* Success Notice */}
        {successNotice && (
          <div className="mb-5 p-3.5 rounded-xl bg-[#DCFCE7] border border-[#BBF7D0] text-xs text-[#166534] flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{successNotice}</p>
              <button
                type="button"
                onClick={onNavigateLogin}
                className="mt-2 text-xs font-bold text-[#16A34A] underline block cursor-pointer"
              >
                Proceed to Student Login →
              </button>
            </div>
          </div>
        )}

        {/* Error notification */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-xs text-[#DC2626] flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Aarav Sharma"
                required
                className="w-full pl-9 pr-4 py-2.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-xs text-[#111827] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#93C5FD] focus:border-[#2563EB] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@school.edu"
                required
                className="w-full pl-9 pr-4 py-2.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-xs text-[#111827] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#93C5FD] focus:border-[#2563EB] transition-all"
              />
            </div>
          </div>

          {/* Class Level Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">
              Select Your School Class (6 to 10)
            </label>
            <div className="grid grid-cols-5 gap-2">
              {([6, 7, 8, 9, 10] as ClassLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setClassLevel(lvl)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    classLevel === lvl
                      ? 'bg-[#2563EB] border-[#2563EB] text-white shadow-sm'
                      : 'bg-[#F8FAFF] border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5FF]'
                  }`}
                >
                  Class {lvl}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">
              You can change your class anytime from your student profile.
            </p>
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 chars"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-xs text-[#111827] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#93C5FD] focus:border-[#2563EB] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                  className="w-full pl-9 pr-8 py-2.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-xs text-[#111827] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#93C5FD] focus:border-[#2563EB] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-[#94A3B8] hover:text-[#475569] absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#475569]">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#93C5FD] mt-0.5"
              />
              <span>
                I agree to the Terms of Service and Privacy Policy. I understand newly created accounts are registered as <strong className="text-[#111827]">Student</strong>.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <span>Enrolling Student...</span>
            ) : (
              <>
                <span>Create Student Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link to Login */}
        <div className="mt-6 pt-5 border-t border-[#EDF2F7] text-center text-xs text-[#64748B]">
          Already have an account?{' '}
          <button
            onClick={onNavigateLogin}
            className="text-[#2563EB] hover:text-[#1D4ED8] font-semibold cursor-pointer underline underline-offset-2 ml-1"
          >
            Sign in to existing account
          </button>
        </div>
      </div>
    </div>
  );
}
