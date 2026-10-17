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
        // Instant login
        onRegisterSuccess();
      }
    } else {
      setErrorMsg(result.error || 'Failed to create student account.');
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 sm:p-6 animate-fade-in">
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

          <span className="text-[10px] uppercase font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-full">
            Student Enrollment
          </span>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 mx-auto mb-3 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-cyan-400">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Create Student Account
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Join BrightMind Learning to unlock structured Science &amp; Mathematics learning paths for Classes 6–10.
          </p>
        </div>

        {/* Success Notice */}
        {successNotice && (
          <div className="mb-5 p-4 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Registration Successful</span>
            </div>
            <p className="text-[11px] leading-relaxed">{successNotice}</p>
            <button
              onClick={onNavigateLogin}
              className="mt-2 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Go to Student Login
            </button>
          </div>
        )}

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-rose-950/70 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        {!successNotice && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

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

            {/* Class Level Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Select Your School Grade / Class
              </label>
              <div className="grid grid-cols-5 gap-2">
                {([6, 7, 8, 9, 10] as ClassLevel[]).map((level) => {
                  const isSelected = classLevel === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setClassLevel(level)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-900/30'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      Class {level}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Create Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
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

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Agreement Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 text-xs text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0 shrink-0"
                />
                <span>
                  I agree to the{' '}
                  <span className="text-cyan-400 hover:underline">BrightMind Learning Terms of Service</span> and{' '}
                  <span className="text-cyan-400 hover:underline">Privacy Policy</span>.
                </span>
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
                  <span>Create Student Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Link to Login */}
        <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-800/80 pt-5">
          <span>Already have a student account? </span>
          <button
            onClick={onNavigateLogin}
            className="text-cyan-400 hover:text-cyan-300 font-bold underline transition-colors cursor-pointer"
          >
            Sign In Here
          </button>
        </div>
      </div>
    </div>
  );
}
