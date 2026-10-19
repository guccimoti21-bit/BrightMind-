import React, { useState } from 'react';
import { Atom, Menu, X, User, Flame, LogOut, LogIn, UserPlus, Shield, BookOpen, Layers } from 'lucide-react';
import { useProgress } from '../../context/ProgressContext';
import { useStudentAuth } from '../../context/StudentAuthContext';

export type NavView = 'home' | 'classes' | 'science' | 'mathematics' | 'learning' | 'dashboard';

interface NavbarProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  onOpenProfile: () => void;
  onOpenAdmin: () => void;
  onNavigateStudentLogin: () => void;
  onNavigateStudentRegister: () => void;
}

export function Navbar({
  currentView,
  onNavigate,
  onOpenProfile,
  onOpenAdmin,
  onNavigateStudentLogin,
  onNavigateStudentRegister
}: NavbarProps) {
  const { state } = useProgress();
  const { student, isAuthenticated, logout } = useStudentAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view: NavView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    onNavigate('home');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 navbar-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element brand wordmark */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#60A5FA] p-0.5 shadow-sm group-hover:shadow-[0_4px_12px_rgba(37,99,235,0.25)] transition-all flex items-center justify-center">
            <div className="w-full h-full bg-[#FFFFFF] rounded-[10px] flex items-center justify-center text-[#2563EB]">
              <Atom className="w-5 h-5 animate-spin-slow" />
            </div>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-[#111827] group-hover:text-[#2563EB] transition-colors">
            SciMath<span className="text-[#2563EB]">enova</span>
          </span>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-[#475569]">
          <button
            onClick={() => handleNavClick('home')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'home'
                ? 'text-[#2563EB] bg-[#EFF6FF] font-bold'
                : 'hover:text-[#111827] hover:bg-[#F1F5FF]'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => {
              handleNavClick('home');
              setTimeout(() => {
                const el = document.getElementById('chapter-index');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="px-3 py-1.5 rounded-lg text-[#2563EB] bg-[#EFF6FF] hover:bg-[#DBEAFE] font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Chapter Index (6–10)</span>
          </button>

          <button
            onClick={() => handleNavClick('classes')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'classes'
                ? 'text-[#2563EB] bg-[#EFF6FF] font-bold'
                : 'hover:text-[#111827] hover:bg-[#F1F5FF]'
            }`}
          >
            All Classes
          </button>

          <button
            onClick={() => handleNavClick('science')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'science'
                ? 'text-[#2563EB] bg-[#EFF6FF] font-bold'
                : 'hover:text-[#111827] hover:bg-[#F1F5FF]'
            }`}
          >
            Science
          </button>

          <button
            onClick={() => handleNavClick('mathematics')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'mathematics'
                ? 'text-[#2563EB] bg-[#EFF6FF] font-bold'
                : 'hover:text-[#111827] hover:bg-[#F1F5FF]'
            }`}
          >
            Mathematics
          </button>

          {isAuthenticated && (
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                currentView === 'dashboard'
                  ? 'text-[#2563EB] bg-[#EFF6FF] font-bold'
                  : 'hover:text-[#111827] hover:bg-[#F1F5FF]'
              }`}
            >
              <span>My Progress</span>
              {state.streakDays > 0 && (
                <span className="text-[10px] text-[#D97706] font-mono font-bold flex items-center">
                  🔥{state.streakDays}
                </span>
              )}
            </button>
          )}
        </nav>

        {/* Zone 3: Actions */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          {isAuthenticated && student ? (
            <>
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F1F5FF] text-xs text-[#111827] border border-[#E2E8F0] transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
                title="Student Profile & Settings"
              >
                <User className="w-3.5 h-3.5 text-[#2563EB]" />
                <span className="truncate max-w-[110px] font-medium">{student.fullName}</span>
                <span className="text-[10px] bg-[#EFF6FF] text-[#2563EB] px-1.5 py-0.5 rounded border border-[#BFDBFE] font-mono font-bold">
                  Cl. {student.classLevel}
                </span>
              </button>

              <button
                onClick={() => handleNavClick('dashboard')}
                className="btn-primary px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
              >
                Dashboard
              </button>

              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEE2E2] border border-transparent hover:border-[#FECACA] transition-colors cursor-pointer"
                title="Sign Out of Student Account"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onNavigateStudentLogin}
                className="btn-secondary px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Student Login</span>
              </button>

              <button
                onClick={onNavigateStudentRegister}
                className="btn-primary px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
            </>
          )}

          {/* Admin Gateway link */}
          <button
            onClick={onOpenAdmin}
            className="px-2.5 py-1.5 text-xs font-semibold text-[#475569] hover:text-[#2563EB] bg-[#FFFFFF] hover:bg-[#F1F5FF] border border-[#E2E8F0] hover:border-[#BFDBFE] rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 shadow-sm"
            title="Administrator Login & CMS"
          >
            <Shield className="w-3.5 h-3.5 text-[#2563EB]" />
            <span className="text-[11px] font-medium">Admin</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#475569] hover:text-[#111827] hover:bg-[#F1F5FF]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E2E8F0] bg-[#FFFFFF] px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <div className="space-y-1">
            <button
              onClick={() => handleNavClick('home')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${
                currentView === 'home' ? 'bg-[#EFF6FF] text-[#2563EB]' : 'text-[#475569]'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => {
                handleNavClick('home');
                setTimeout(() => {
                  const el = document.getElementById('chapter-index');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-[#2563EB] bg-[#EFF6FF] flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Chapter Index (Classes 6–10)</span>
            </button>
            <button
              onClick={() => handleNavClick('classes')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${
                currentView === 'classes' ? 'bg-[#EFF6FF] text-[#2563EB]' : 'text-[#475569]'
              }`}
            >
              Classes 6–10
            </button>
            <button
              onClick={() => handleNavClick('science')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${
                currentView === 'science' ? 'bg-[#EFF6FF] text-[#2563EB]' : 'text-[#475569]'
              }`}
            >
              Science
            </button>
            <button
              onClick={() => handleNavClick('mathematics')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${
                currentView === 'mathematics' ? 'bg-[#EFF6FF] text-[#2563EB]' : 'text-[#475569]'
              }`}
            >
              Mathematics
            </button>

            {isAuthenticated && (
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${
                  currentView === 'dashboard' ? 'bg-[#EFF6FF] text-[#2563EB]' : 'text-[#475569]'
                }`}
              >
                Student Dashboard
              </button>
            )}
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
            {isAuthenticated ? (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onOpenProfile();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#F8FAFF] border border-[#E2E8F0] text-xs font-semibold text-[#111827] flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#2563EB]" />
                    <span>{student?.fullName || 'Student Profile'}</span>
                  </div>
                  <span className="text-[10px] bg-[#EFF6FF] text-[#2563EB] px-2 py-0.5 rounded font-mono font-bold">
                    Class {student?.classLevel}
                  </span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-[#DC2626] bg-[#FEE2E2] hover:bg-[#FECACA] flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onNavigateStudentLogin();
                    setMobileMenuOpen(false);
                  }}
                  className="btn-secondary py-2.5 text-xs font-bold text-center"
                >
                  Student Login
                </button>
                <button
                  onClick={() => {
                    onNavigateStudentRegister();
                    setMobileMenuOpen(false);
                  }}
                  className="btn-primary py-2.5 text-xs font-bold text-center"
                >
                  Create Account
                </button>
              </div>
            )}

            <button
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 text-xs font-medium text-[#475569] hover:text-[#2563EB] flex items-center justify-center gap-1.5 bg-[#F8FAFF] border border-[#E2E8F0] rounded-lg mt-2"
            >
              <Shield className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Administrator Portal</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
