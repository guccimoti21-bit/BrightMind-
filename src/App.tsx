/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { StudentAuthProvider, useStudentAuth } from './context/StudentAuthContext';
import { ProgressProvider, useProgress } from './context/ProgressContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { Navbar, NavView } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './components/home/LandingPage';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { SyllabusView } from './components/syllabus/SyllabusView';
import { ConceptDetailView } from './components/concept/ConceptDetailView';
import { LessonView } from './components/lesson/LessonView';
import { ProfileModal } from './components/profile/ProfileModal';
import { StudentLogin } from './components/auth/StudentLogin';
import { StudentRegister } from './components/auth/StudentRegister';
import { ForgotPassword } from './components/auth/ForgotPassword';
import { ResetPassword } from './components/auth/ResetPassword';
import { SupabaseSetupModal } from './components/auth/SupabaseSetupModal';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminPasswordModal } from './components/admin/AdminPasswordModal';
import { CURRICULUM_DATA } from './data/curriculumData';
import { ClassLevel, SubjectId, Concept } from './types/curriculum';
import { fetchChapterQuizzes } from './services/quizLinkService';
import { ShieldAlert, LogIn, UserPlus, X, Lock, Atom } from 'lucide-react';

type AppRoute =
  | 'home'
  | 'student-login'
  | 'student-register'
  | 'student-forgot-password'
  | 'student-reset-password'
  | 'admin-login'
  | 'admin-dashboard';

function AppContent() {
  const { state, setActiveClass, setActiveSubject, setLastActiveSubConcept } = useProgress();
  const { isAuthenticated: isAdminAuthenticated, mustChangePassword } = useAdminAuth();
  const { student, isAuthenticated: isStudentAuthenticated, logout: studentLogout } = useStudentAuth();

  // Primary route mode based on URL or state
  const [appRoute, setAppRoute] = useState<AppRoute>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/admin/dashboard')) return 'admin-dashboard';
      if (path.startsWith('/admin')) return 'admin-login';
      if (path.startsWith('/student/login')) return 'student-login';
      if (path.startsWith('/student/register')) return 'student-register';
      if (path.startsWith('/student/forgot-password')) return 'student-forgot-password';
      if (path.startsWith('/student/reset-password')) return 'student-reset-password';
    }
    return 'home';
  });

  // Current view when in main academy area
  const [currentView, setCurrentView] = useState<NavView | 'concept' | 'lesson'>('home');
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);
  const [selectedSubConceptId, setSelectedSubConceptId] = useState<string | null>(null);

  // Modals
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSupabaseSetupOpen, setIsSupabaseSetupOpen] = useState(false);
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);

  // Auth gate prompt modal for unauthenticated visitors clicking protected features
  const [authPrompt, setAuthPrompt] = useState<{
    isOpen: boolean;
    message: string;
    targetView?: NavView | 'concept' | 'lesson';
  }>({
    isOpen: false,
    message: ''
  });

  // Redirect memory for returning to intended lesson/view after login
  const [redirectTarget, setRedirectTarget] = useState<string | null>(null);
  const [loginRedirectNotice, setLoginRedirectNotice] = useState<string | null>(null);

  // Live published curriculum from server (synced with Admin portal)
  const [liveCurriculum, setLiveCurriculum] = useState<Concept[]>(CURRICULUM_DATA);

  // Fetch live published curriculum from server
  const fetchLiveContent = useCallback(async () => {
    try {
      const res = await fetch('/api/content/curriculum');
      if (res.ok) {
        const data = await res.json();
        if (data.concepts && data.concepts.length > 0) {
          setLiveCurriculum(data.concepts);
        }
      }
    } catch (e) {
      console.log('Using local curriculum baseline');
    }

    try {
      await fetchChapterQuizzes();
    } catch (e) {
      // Ignored - fallback handled inside service
    }
  }, []);

  useEffect(() => {
    fetchLiveContent();
  }, [fetchLiveContent]);

  // Synchronize browser history / path
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/admin/dashboard')) {
        setAppRoute('admin-dashboard');
      } else if (path.startsWith('/admin')) {
        setAppRoute('admin-login');
      } else if (path.startsWith('/student/login')) {
        setAppRoute('student-login');
      } else if (path.startsWith('/student/register')) {
        setAppRoute('student-register');
      } else if (path.startsWith('/student/forgot-password')) {
        setAppRoute('student-forgot-password');
      } else if (path.startsWith('/student/reset-password')) {
        setAppRoute('student-reset-password');
      } else {
        setAppRoute('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update URL pathname cleanly
  const updateUrl = (path: string, route: AppRoute) => {
    setAppRoute(route);
    if (typeof window !== 'undefined' && window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
  };

  // Enforce mandatory password change on initial admin login
  useEffect(() => {
    if (isAdminAuthenticated && mustChangePassword) {
      setShowPasswordChangeModal(true);
    } else {
      setShowPasswordChangeModal(false);
    }
  }, [isAdminAuthenticated, mustChangePassword]);

  // Check active concept from live curriculum
  const activeConcept = liveCurriculum.find((c) => c.id === selectedConceptId);
  const activeSubConcept = activeConcept?.subConcepts.find(
    (sc) => sc.id === selectedSubConceptId
  );

  // Navigation handlers
  const handleNavViewChange = (view: NavView) => {
    // PROTECTED STUDENT ROUTES: Redirect to login if user is not authenticated
    if (
      !isStudentAuthenticated &&
      (view === 'dashboard' || view === 'science' || view === 'mathematics' || view === 'classes')
    ) {
      navigateToStudentLogin(
        `Please sign in as a student to access the ${view} portal and record your learning progress.`,
        view
      );
      return;
    }

    setCurrentView(view);
    setSelectedConceptId(null);
    setSelectedSubConceptId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartLearning = () => {
    if (!isStudentAuthenticated) {
      navigateToStudentLogin(
        'Please log in with your student account to access interactive lessons and track your mastery.',
        'classes'
      );
      return;
    }

    if (state.lastActiveSubConceptId) {
      // Find parent concept
      for (const c of liveCurriculum) {
        const sc = c.subConcepts.find((s) => s.id === state.lastActiveSubConceptId);
        if (sc) {
          setSelectedConceptId(c.id);
          setSelectedSubConceptId(sc.id);
          setCurrentView('lesson');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }
    }
    setCurrentView('classes');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenConcept = (conceptId: string) => {
    if (!isStudentAuthenticated) {
      navigateToStudentLogin(
        'Please log in with your student account to launch interactive labs and track learning progress.',
        'classes'
      );
      return;
    }
    setSelectedConceptId(conceptId);
    setSelectedSubConceptId(null);
    setCurrentView('concept');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSubConcept = (subConceptId: string) => {
    if (!isStudentAuthenticated) {
      navigateToStudentLogin(
        'Please log in with your student account to enter the lesson and virtual laboratory.',
        'classes'
      );
      return;
    }
    setSelectedSubConceptId(subConceptId);
    setLastActiveSubConcept(subConceptId);
    setCurrentView('lesson');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAdmin = () => {
    if (isAdminAuthenticated) {
      updateUrl('/admin/dashboard', 'admin-dashboard');
    } else {
      updateUrl('/admin/login', 'admin-login');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Student Authentication Flow Navigators
  const navigateToStudentLogin = (notice?: string, target?: string) => {
    if (notice) setLoginRedirectNotice(notice);
    if (target) setRedirectTarget(target);
    updateUrl('/student/login', 'student-login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToStudentRegister = () => {
    updateUrl('/student/register', 'student-register');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToForgotPassword = () => {
    updateUrl('/student/forgot-password', 'student-forgot-password');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToResetPassword = () => {
    updateUrl('/student/reset-password', 'student-reset-password');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReturnToHome = () => {
    updateUrl('/', 'home');
    setCurrentView('home');
    setLoginRedirectNotice(null);
    setRedirectTarget(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStudentLoginSuccess = () => {
    // If a redirect target was stored, navigate to it
    if (redirectTarget) {
      if (redirectTarget === 'classes') {
        setCurrentView('classes');
      } else if (redirectTarget === 'science') {
        setCurrentView('science');
      } else if (redirectTarget === 'mathematics') {
        setCurrentView('mathematics');
      } else {
        setCurrentView('dashboard');
      }
      setRedirectTarget(null);
    } else {
      setCurrentView('dashboard');
    }
    setLoginRedirectNotice(null);
    updateUrl('/', 'home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ==========================================
  // RENDER DEDICATED ADMIN DASHBOARD
  // ==========================================
  if (appRoute === 'admin-dashboard') {
    if (!isAdminAuthenticated) {
      return (
        <div className="min-h-screen bg-[#F8FAFF] text-[#111827] flex flex-col items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-8 rounded-3xl max-w-md w-full text-center space-y-4 shadow-[0_16px_40px_rgba(37,99,235,0.08)]">
            <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB] mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-[#111827]">Administrator Session Required</h2>
            <p className="text-xs text-[#64748B]">
              You must authenticate with administrator credentials to access the CMS Dashboard.
            </p>
            <button
              onClick={() => updateUrl('/admin/login', 'admin-login')}
              className="btn-primary w-full py-2.5 text-xs font-semibold cursor-pointer"
            >
              Go to Administrator Login
            </button>
            <button
              onClick={handleReturnToHome}
              className="text-xs text-[#64748B] hover:text-[#111827] block mx-auto cursor-pointer"
            >
              Return to Public Website
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        <AdminLayout
          onReturnToStudent={() => {
            fetchLiveContent();
            updateUrl('/', 'home');
          }}
        />
        {showPasswordChangeModal && (
          <AdminPasswordModal
            isOpen={showPasswordChangeModal}
            onSuccess={() => setShowPasswordChangeModal(false)}
            canDismiss={false}
          />
        )}
      </>
    );
  }

  // ==========================================
  // RENDER DEDICATED ADMIN LOGIN
  // ==========================================
  if (appRoute === 'admin-login') {
    return (
      <div className="min-h-screen bg-[#F8FAFF] text-[#111827] flex flex-col">
        <header className="navbar-glass px-6 h-16 flex items-center justify-between">
          <button
            onClick={handleReturnToHome}
            className="flex items-center gap-2 text-left whitespace-nowrap cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#60A5FA] p-0.5 flex items-center justify-center shadow-sm">
              <div className="w-full h-full bg-[#FFFFFF] rounded-[10px] flex items-center justify-center text-[#2563EB]">
                <Atom className="w-4 h-4 animate-spin-slow" />
              </div>
            </div>
            <span className="font-extrabold text-[#111827] text-lg tracking-tight">
              SciMath<span className="text-[#2563EB]">enova</span>
            </span>
          </button>

          <button
            onClick={handleReturnToHome}
            className="btn-secondary px-3.5 py-1.5 text-xs font-semibold cursor-pointer shadow-sm"
          >
            Return to Public Website
          </button>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <AdminLogin
            onLoginSuccess={() => {
              updateUrl('/admin/dashboard', 'admin-dashboard');
            }}
            onReturnToStudent={handleReturnToHome}
          />
        </main>
      </div>
    );
  }

  // ==========================================
  // RENDER STUDENT AUTHENTICATION ROUTES
  // ==========================================
  if (appRoute === 'student-login') {
    return (
      <div className="min-h-screen bg-[#F8FAFF] text-[#111827] flex flex-col">
        <header className="navbar-glass px-6 h-16 flex items-center justify-between">
          <button
            onClick={handleReturnToHome}
            className="flex items-center gap-2 text-left whitespace-nowrap cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#60A5FA] p-0.5 flex items-center justify-center shadow-sm">
              <div className="w-full h-full bg-[#FFFFFF] rounded-[10px] flex items-center justify-center text-[#2563EB]">
                <Atom className="w-4 h-4 animate-spin-slow" />
              </div>
            </div>
            <span className="font-extrabold text-[#111827] text-lg tracking-tight">
              SciMath<span className="text-[#2563EB]">enova</span>
            </span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={navigateToStudentRegister}
              className="btn-primary px-3.5 py-1.5 text-xs font-bold cursor-pointer"
            >
              Create Free Account
            </button>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <StudentLogin
            onLoginSuccess={handleStudentLoginSuccess}
            onNavigateRegister={navigateToStudentRegister}
            onNavigateForgotPassword={navigateToForgotPassword}
            onReturnToHome={handleReturnToHome}
            onOpenAdminLogin={handleOpenAdmin}
            onOpenSupabaseSetup={() => setIsSupabaseSetupOpen(true)}
            redirectNotice={loginRedirectNotice}
          />
        </main>
      </div>
    );
  }

  if (appRoute === 'student-register') {
    return (
      <div className="min-h-screen bg-[#F8FAFF] text-[#111827] flex flex-col">
        <header className="navbar-glass px-6 h-16 flex items-center justify-between">
          <button
            onClick={handleReturnToHome}
            className="flex items-center gap-2 text-left whitespace-nowrap cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#60A5FA] p-0.5 flex items-center justify-center shadow-sm">
              <div className="w-full h-full bg-[#FFFFFF] rounded-[10px] flex items-center justify-center text-[#2563EB]">
                <Atom className="w-4 h-4 animate-spin-slow" />
              </div>
            </div>
            <span className="font-extrabold text-[#111827] text-lg tracking-tight">
              SciMath<span className="text-[#2563EB]">enova</span>
            </span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateToStudentLogin()}
              className="btn-secondary px-3.5 py-1.5 text-xs font-semibold cursor-pointer shadow-sm"
            >
              Sign In
            </button>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <StudentRegister
            onRegisterSuccess={handleStudentLoginSuccess}
            onNavigateLogin={() => navigateToStudentLogin()}
            onReturnToHome={handleReturnToHome}
          />
        </main>
      </div>
    );
  }

  if (appRoute === 'student-forgot-password') {
    return (
      <div className="min-h-screen bg-[#F8FAFF] text-[#111827] flex flex-col">
        <header className="navbar-glass px-6 h-16 flex items-center justify-between">
          <button
            onClick={handleReturnToHome}
            className="flex items-center gap-2 text-left whitespace-nowrap cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#60A5FA] p-0.5 flex items-center justify-center shadow-sm">
              <div className="w-full h-full bg-[#FFFFFF] rounded-[10px] flex items-center justify-center text-[#2563EB]">
                <Atom className="w-4 h-4 animate-spin-slow" />
              </div>
            </div>
            <span className="font-extrabold text-[#111827] text-lg tracking-tight">
              SciMath<span className="text-[#2563EB]">enova</span>
            </span>
          </button>

          <button
            onClick={() => navigateToStudentLogin()}
            className="btn-secondary px-3.5 py-1.5 text-xs font-semibold cursor-pointer shadow-sm"
          >
            Back to Login
          </button>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <ForgotPassword
            onNavigateLogin={() => navigateToStudentLogin()}
            onReturnToHome={handleReturnToHome}
          />
        </main>
      </div>
    );
  }

  if (appRoute === 'student-reset-password') {
    return (
      <div className="min-h-screen bg-[#F8FAFF] text-[#111827] flex flex-col">
        <header className="navbar-glass px-6 h-16 flex items-center justify-between">
          <button
            onClick={handleReturnToHome}
            className="flex items-center gap-2 text-left whitespace-nowrap cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#60A5FA] p-0.5 flex items-center justify-center shadow-sm">
              <div className="w-full h-full bg-[#FFFFFF] rounded-[10px] flex items-center justify-center text-[#2563EB]">
                <Atom className="w-4 h-4 animate-spin-slow" />
              </div>
            </div>
            <span className="font-extrabold text-[#111827] text-lg tracking-tight">
              SciMath<span className="text-[#2563EB]">enova</span>
            </span>
          </button>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <ResetPassword
            onSuccess={() => {
              setLoginRedirectNotice('Password updated successfully! Please sign in with your new password.');
              updateUrl('/student/login', 'student-login');
            }}
            onNavigateLogin={() => navigateToStudentLogin()}
          />
        </main>
      </div>
    );
  }

  // ==========================================
  // RENDER MAIN SCIMATHENOVA APP
  // ==========================================
  return (
    <div className="min-h-screen bg-[#F8FAFF] text-[#111827] flex flex-col font-sans selection:bg-[#2563EB] selection:text-white relative">
      {/* Subtle Background Pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #2563EB 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Top White-Glass Navbar */}
      <Navbar
        currentView={currentView as NavView}
        onNavigate={handleNavViewChange}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        onNavigateStudentLogin={() => navigateToStudentLogin()}
        onNavigateStudentRegister={navigateToStudentRegister}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 relative z-10">
        {/* PUBLIC HOMEPAGE (WITH OPEN-ACCESS CHAPTER INDEX FOR CLASSES 6-10) */}
        {currentView === 'home' && (
          <LandingPage
            concepts={liveCurriculum}
            isAuthenticated={isStudentAuthenticated}
            onStartLearning={handleStartLearning}
            onExploreCourses={() => {
              const el = document.getElementById('chapter-index');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onSelectClass={(c) => {
              setActiveClass(c);
              const el = document.getElementById('chapter-index');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onSelectSubject={(s) => {
              setActiveSubject(s);
              const el = document.getElementById('chapter-index');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onSelectConcept={(conceptId, subId) => {
              if (isStudentAuthenticated) {
                handleOpenConcept(conceptId);
                if (subId) {
                  handleOpenSubConcept(subId);
                }
              } else {
                navigateToStudentLogin(
                  'Please log in with your student account to record progress, launch interactive lab simulations, and unlock subsequent topics with the 80% mastery rule.',
                  'classes'
                );
              }
            }}
            onNavigateStudentLogin={navigateToStudentLogin}
            onNavigateStudentRegister={navigateToStudentRegister}
            onRequireAuthPrompt={(msg, target) => {
              setAuthPrompt({
                isOpen: true,
                message: msg,
                targetView: target as any
              });
            }}
            onRefreshCurriculum={fetchLiveContent}
          />
        )}

        {/* STUDENT DASHBOARD (PROTECTED) */}
        {currentView === 'dashboard' && isStudentAuthenticated && (
          <StudentDashboard
            onContinueLearning={(conceptId, subConceptId) => {
              setSelectedConceptId(conceptId);
              setSelectedSubConceptId(subConceptId);
              setLastActiveSubConcept(subConceptId);
              setCurrentView('lesson');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateSyllabus={(lvl, subj) => {
              setActiveClass(lvl);
              setActiveSubject(subj);
              setCurrentView(subj);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* SYLLABUS / CHAPTERS BROWSER (PROTECTED) */}
        {(currentView === 'classes' ||
          currentView === 'science' ||
          currentView === 'mathematics') &&
          isStudentAuthenticated && (
            <SyllabusView
              currentClass={state.currentClass}
              currentSubject={state.currentSubject}
              concepts={liveCurriculum}
              onSelectClass={(c) => setActiveClass(c)}
              onSelectSubject={(s) => setActiveSubject(s)}
              onSelectConcept={handleOpenConcept}
            />
          )}

        {/* VERTICAL SUB-CONCEPTS LEARNING PATH (PROTECTED) */}
        {currentView === 'concept' && isStudentAuthenticated && activeConcept && (
          <ConceptDetailView
            concept={activeConcept}
            onBack={() => setCurrentView(activeConcept.subjectId)}
            onSelectSubConcept={handleOpenSubConcept}
          />
        )}

        {/* INTERACTIVE LESSON EXPERIENCE (PROTECTED) */}
        {currentView === 'lesson' &&
          isStudentAuthenticated &&
          activeConcept &&
          activeSubConcept && (
            <LessonView
              concept={activeConcept}
              subConcept={activeSubConcept}
              onBackToConcepts={() => setCurrentView('concept')}
              onNavigateSubConcept={(nextId) => {
                setSelectedSubConceptId(nextId);
                setLastActiveSubConcept(nextId);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavViewChange} onOpenAdmin={handleOpenAdmin} />

      {/* Student Profile & Settings Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onOpenSupabaseSetup={() => setIsSupabaseSetupOpen(true)}
        onLogout={async () => {
          await studentLogout();
          setCurrentView('home');
        }}
      />

      {/* Supabase Setup & SQL Schema Modal */}
      <SupabaseSetupModal
        isOpen={isSupabaseSetupOpen}
        onClose={() => setIsSupabaseSetupOpen(false)}
      />

      {/* Auth Gate Required Prompt Modal */}
      {authPrompt.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl w-full max-w-md p-6 shadow-2xl relative text-center">
            <button
              onClick={() => setAuthPrompt({ isOpen: false, message: '' })}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#64748B] hover:text-[#111827] hover:bg-[#F1F5FF] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB] mx-auto mb-4 shadow-sm">
              <Lock className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-extrabold text-[#111827] mb-2">
              Student Account Required
            </h3>
            <p className="text-xs text-[#475569] leading-relaxed mb-6">
              {authPrompt.message ||
                'Please sign in with your student account or create a new one to access interactive lessons, physics manipulatives, and progress tracking.'}
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  const target = authPrompt.targetView;
                  setAuthPrompt({ isOpen: false, message: '' });
                  navigateToStudentLogin(authPrompt.message, target);
                }}
                className="btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Student Login</span>
              </button>

              <button
                onClick={() => {
                  setAuthPrompt({ isOpen: false, message: '' });
                  navigateToStudentRegister();
                }}
                className="btn-secondary w-full py-2.5 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Student Account</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <StudentAuthProvider>
      <ProgressProvider>
        <AdminAuthProvider>
          <AppContent />
        </AdminAuthProvider>
      </ProgressProvider>
    </StudentAuthProvider>
  );
}
