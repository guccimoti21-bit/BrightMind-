import React, { useState } from 'react';
import { Atom, Menu, X, User, Flame, Sparkles, LogOut, LogIn, UserPlus } from 'lucide-react';
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
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element brand wordmark */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 text-left text-white whitespace-nowrap shrink-0 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-md group-hover:shadow-cyan-500/20 transition-all flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-cyan-400">
              <Atom className="w-5 h-5 animate-spin-slow" />
            </div>
          </div>
          <span className="text-lg font-extrabold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
            BrightMind <span className="text-cyan-400 font-medium">Learning</span>
          </span>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <button
            onClick={() => handleNavClick('home')}
            className={`transition-colors hover:text-white whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'home' ? 'text-cyan-400 font-bold' : ''
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('classes')}
            className={`transition-colors hover:text-white whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'classes' ? 'text-cyan-400 font-bold' : ''
            }`}
          >
            Classes 6–10
          </button>

          {isAuthenticated ? (
            <>
              <button
                onClick={() => handleNavClick('science')}
                className={`transition-colors hover:text-white whitespace-nowrap shrink-0 cursor-pointer ${
                  currentView === 'science' ? 'text-cyan-400 font-bold' : ''
                }`}
              >
                Science
              </button>
              <button
                onClick={() => handleNavClick('mathematics')}
                className={`transition-colors hover:text-white whitespace-nowrap shrink-0 cursor-pointer ${
                  currentView === 'mathematics' ? 'text-cyan-400 font-bold' : ''
                }`}
              >
                Mathematics
              </button>
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`transition-colors hover:text-white whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  currentView === 'dashboard' ? 'text-cyan-400 font-bold' : ''
                }`}
              >
                <span>My Learning</span>
                {state.streakDays > 0 && (
                  <span className="text-[10px] text-amber-400 font-mono font-bold flex items-center">
                    🔥{state.streakDays}
                  </span>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNavClick('science')}
                className={`transition-colors hover:text-white whitespace-nowrap shrink-0 cursor-pointer ${
                  currentView === 'science' ? 'text-cyan-400 font-bold' : ''
                }`}
              >
                Science Curriculum
              </button>
              <button
                onClick={() => handleNavClick('mathematics')}
                className={`transition-colors hover:text-white whitespace-nowrap shrink-0 cursor-pointer ${
                  currentView === 'mathematics' ? 'text-cyan-400 font-bold' : ''
                }`}
              >
                Math Curriculum
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Actions */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {isAuthenticated && student ? (
            <>
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 hover:text-white border border-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                title="Student Profile & Settings"
              >
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span className="truncate max-w-[110px] font-medium">{student.fullName}</span>
                <span className="text-[10px] bg-blue-950 text-cyan-300 px-1.5 py-0.5 rounded border border-blue-800/60 font-mono">
                  Cl. {student.classLevel}
                </span>
              </button>

              <button
                onClick={() => handleNavClick('dashboard')}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md transition-all whitespace-nowrap shrink-0 cursor-pointer"
              >
                Dashboard
              </button>

              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors cursor-pointer"
                title="Sign Out of Student Account"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onNavigateStudentLogin}
                className="px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                <span>Student Login</span>
              </button>

              <button
                onClick={onNavigateStudentRegister}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md shadow-blue-900/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
            </>
          )}

          {/* Admin Gateway link */}
          <button
            onClick={onOpenAdmin}
            className="px-2.5 py-1.5 text-xs font-semibold text-cyan-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
            title="Administrator Login & CMS"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="text-[11px]">Admin</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 px-4 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-800">
            <button
              onClick={() => handleNavClick('home')}
              className="p-2.5 rounded-lg text-left text-xs font-semibold bg-slate-900 text-slate-200"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('classes')}
              className="p-2.5 rounded-lg text-left text-xs font-semibold bg-slate-900 text-slate-200"
            >
              Classes 6–10
            </button>
            <button
              onClick={() => handleNavClick('science')}
              className="p-2.5 rounded-lg text-left text-xs font-semibold bg-slate-900 text-slate-200"
            >
              Science
            </button>
            <button
              onClick={() => handleNavClick('mathematics')}
              className="p-2.5 rounded-lg text-left text-xs font-semibold bg-slate-900 text-slate-200"
            >
              Mathematics
            </button>
          </div>

          <div className="pt-1">
            {isAuthenticated && student ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      onOpenProfile();
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs text-slate-200 flex items-center gap-2 font-semibold"
                  >
                    <User className="w-4 h-4 text-cyan-400" />
                    <span>{student.fullName} (Class {student.classLevel})</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                  >
                    Sign Out
                  </button>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleNavClick('dashboard')}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold text-center"
                  >
                    Student Dashboard
                  </button>
                  <button
                    onClick={() => {
                      onOpenAdmin();
                      setMobileMenuOpen(false);
                    }}
                    className="px-3 py-2 bg-slate-900 border border-slate-800 text-cyan-300 rounded-lg text-xs font-bold"
                  >
                    Admin
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onNavigateStudentLogin();
                      setMobileMenuOpen(false);
                    }}
                    className="py-2.5 bg-slate-900 border border-slate-800 text-slate-200 rounded-xl text-xs font-bold text-center"
                  >
                    Student Login
                  </button>
                  <button
                    onClick={() => {
                      onNavigateStudentRegister();
                      setMobileMenuOpen(false);
                    }}
                    className="py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold text-center"
                  >
                    Create Account
                  </button>
                </div>
                <button
                  onClick={() => {
                    onOpenAdmin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 bg-slate-900/60 border border-slate-800 text-cyan-300 rounded-lg text-xs font-semibold"
                >
                  Administrator Portal
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
