/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
import { ShieldAlert, LogIn, UserPlus, X, Lock } from 'lucide-react';

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

  // Live published curriculum from server
  const [liveCurriculum, setLiveCurriculum] = useState<Concept[]>(CURRICULUM_DATA);

  // Fetch live published curriculum from server
  useEffect(() => {
    async function fetchLiveContent() {
      try {
        const res = await fetch('/api/content/curriculum');
        if (res.ok) {
          const data = await res.json();
          if (data.concepts && data.concepts.length > 0) {
            setLiveCurriculum(data.concepts);
          }
        }
      } catch (e) {
        console.log('Using default local curriculum data');
      }
    }
    fetchLiveContent();
  }, [appRoute]);

  // Handle URL history syncing
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

  // Admin mandatory password change prompt
  useEffect(() => {
    if (isAdminAuthenticated && mustChangePassword) {
      setShowPasswordChangeModal(true);
    } else {
      setShowPasswordChangeModal(false);
    }
  }, [isAdminAuthenticated, mustChangePassword]);

  // Navigate to Admin View
  const handleOpenAdmin = () => {
    if (isAdminAuthenticated) {
      setAppRoute('admin-dashboard');
      window.history.pushState({}, '', '/admin/dashboard');
    } else {
      setAppRoute('admin-login');
      window.history.pushState({}, '', '/admin/login');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReturnToAcademy = () => {
    setAppRoute('home');
    setCurrentView('home');
    window.history.pushState({}, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToStudentLogin = (notice?: string, target?: string) => {
    if (notice) setLoginRedirectNotice(notice);
    if (target) setRedirectTarget(target);
    setAppRoute('student-login');
    window.history.pushState({}, '', '/student/login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToStudentRegister = () => {
    setAppRoute('student-register');
    window.history.pushState({}, '', '/student/register');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = () => {
    setLoginRedirectNotice(null);
    setAppRoute('home');

    // If student had a stored redirect target, restore it
    if (redirectTarget === 'lesson') {
      setCurrentView('lesson');
      setSelectedConceptId('c8-math-linear-eq');
      setSelectedSubConceptId('c8-math-linear-sub2');
    } else if (redirectTarget === 'science') {
      setActiveSubject('science');
      setCurrentView('science');
    } else if (redirectTarget === 'mathematics') {
      setActiveSubject('mathematics');
      setCurrentView('mathematics');
    } else if (redirectTarget === 'classes') {
      setCurrentView('classes');
    } else {
      setCurrentView('dashboard');
    }

    setRedirectTarget(null);
    window.history.pushState({}, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to open a specific concept
  const handleOpenConcept = (conceptId: string) => {
    if (!isStudentAuthenticated) {
      navigateToStudentLogin(
        'Please sign in with your student account to access this chapter and its learning path.',
        'classes'
      );
      return;
    }
    setSelectedConceptId(conceptId);
    setCurrentView('concept');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to open a specific sub-concept lesson
  const handleOpenSubConcept = (subConceptId: string) => {
    if (!isStudentAuthenticated) {
      navigateToStudentLogin(
        'Please sign in with your student account to open interactive lessons.',
        'lesson'
      );
      return;
    }
    if (!selectedConceptId) {
      const found = liveCurriculum.find((c) =>
        c.subConcepts.some((sc) => sc.id === subConceptId)
      );
      if (found) setSelectedConceptId(found.id);
    }
    setSelectedSubConceptId(subConceptId);
    setLastActiveSubConcept(subConceptId);
    setCurrentView('lesson');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigation from Topbar
  const handleNavViewChange = (view: NavView) => {
    // If user is not authenticated and tries to visit protected views
    const protectedViews: NavView[] = ['dashboard', 'classes', 'science', 'mathematics'];
    if (!isStudentAuthenticated && protectedViews.includes(view)) {
      // If clicking Explore Classes, Science, or Math while logged out, prompt them
      navigateToStudentLogin(
        `Please sign in as a student to access ${
          view === 'dashboard' ? 'your personalized student dashboard' : `the ${view} curriculum`
        }.`,
        view
      );
      return;
    }

    if (view === 'classes') {
      setCurrentView('classes');
    } else if (view === 'science') {
      setActiveSubject('science');
      setCurrentView('science');
    } else if (view === 'mathematics') {
      setActiveSubject('mathematics');
      setCurrentView('mathematics');
    } else {
      setCurrentView(view);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Start Learning from Hero CTA opens the featured Class 8 Linear Equations Balance Method Demo!
  const handleStartLearning = () => {
    if (!isStudentAuthenticated) {
      navigateToStudentLogin(
        'Please sign in or create a student account to access the interactive Balance Scale simulation.',
        'lesson'
      );
      return;
    }
    setActiveClass(8);
    setActiveSubject('mathematics');
    setSelectedConceptId('c8-math-linear-eq');
    setSelectedSubConceptId('c8-math-linear-sub2');
    setLastActiveSubConcept('c8-math-linear-sub2');
    setCurrentView('lesson');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Selected concept entity
  const activeConcept = liveCurriculum.find((c) => c.id === selectedConceptId);
  const activeSubConcept = activeConcept?.subConcepts.find(
    (sc) => sc.id === selectedSubConceptId
  );

  // ==========================================
  // RENDER ADMIN DASHBOARD (IF LOGGED IN)
  // ==========================================
  if (appRoute === 'admin-dashboard' && isAdminAuthenticated) {
    return (
      <>
        <AdminLayout onReturnToStudent={handleReturnToAcademy} />
        <AdminPasswordModal
          isOpen={showPasswordChangeModal}
          onSuccess={() => setShowPasswordChangeModal(false)}
        />
      </>
    );
  }

  // ==========================================
  // RENDER ADMIN LOGIN
  // ==========================================
  if (appRoute === 'admin-login' || (appRoute === 'admin-dashboard' && !isAdminAuthenticated)) {
    return (
      <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/80">
          <button
            onClick={handleReturnToAcademy}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 cursor-pointer"
          >
            ← Return to BrightMind Learning
          </button>
          <span className="text-xs text-slate-400 font-mono">Secure Administrator Gateway</span>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <AdminLogin
            onLoginSuccess={() => {
              setAppRoute('admin-dashboard');
              window.history.pushState({}, '', '/admin/dashboard');
            }}
            onReturnToStudent={handleReturnToAcademy}
          />
        </main>
      </div>
    );
  }

  // ==========================================
  // RENDER STUDENT AUTH PAGES
  // ==========================================
  if (appRoute === 'student-login') {
    return (
      <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white relative">
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.035] z-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
        <main className="flex-1 flex items-center justify-center p-4 relative z-10">
          <StudentLogin
            onLoginSuccess={handleLoginSuccess}
            onNavigateRegister={() => {
              setAppRoute('student-register');
              window.history.pushState({}, '', '/student/register');
            }}
            onNavigateForgotPassword={() => {
              setAppRoute('student-forgot-password');
              window.history.pushState({}, '', '/student/forgot-password');
            }}
            onReturnToHome={handleReturnToAcademy}
            onOpenAdminLogin={handleOpenAdmin}
            onOpenSupabaseSetup={() => setIsSupabaseSetupOpen(true)}
            redirectNotice={loginRedirectNotice}
          />
        </main>
        <SupabaseSetupModal
          isOpen={isSupabaseSetupOpen}
          onClose={() => setIsSupabaseSetupOpen(false)}
        />
      </div>
    );
  }

  if (appRoute === 'student-register') {
    return (
      <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white relative">
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.035] z-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
        <main className="flex-1 flex items-center justify-center p-4 relative z-10">
          <StudentRegister
            onRegisterSuccess={handleLoginSuccess}
            onNavigateLogin={() => {
              setAppRoute('student-login');
              window.history.pushState({}, '', '/student/login');
            }}
            onReturnToHome={handleReturnToAcademy}
          />
        </main>
      </div>
    );
  }

  if (appRoute === 'student-forgot-password') {
    return (
      <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white relative">
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.035] z-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
        <main className="flex-1 flex items-center justify-center p-4 relative z-10">
          <ForgotPassword
            onNavigateLogin={() => {
              setAppRoute('student-login');
              window.history.pushState({}, '', '/student/login');
            }}
            onReturnToHome={handleReturnToAcademy}
          />
        </main>
      </div>
    );
  }

  if (appRoute === 'student-reset-password') {
    return (
      <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white relative">
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.035] z-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
        <main className="flex-1 flex items-center justify-center p-4 relative z-10">
          <ResetPassword
            onSuccess={() => {
              setAppRoute('home');
              setCurrentView('dashboard');
              window.history.pushState({}, '', '/');
            }}
            onNavigateLogin={() => {
              setAppRoute('student-login');
              window.history.pushState({}, '', '/student/login');
            }}
          />
        </main>
      </div>
    );
  }

  // ==========================================
  // RENDER MAIN SCIMATH ACADEMY APP
  // ==========================================
  return (
    <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white relative">
      {/* Background Texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.035] z-0"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Top Navbar */}
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
        {/* PUBLIC HOMEPAGE */}
        {currentView === 'home' && (
          <LandingPage
            isAuthenticated={isStudentAuthenticated}
            onStartLearning={handleStartLearning}
            onExploreCourses={() => {
              if (isStudentAuthenticated) {
                setCurrentView('classes');
              } else {
                navigateToStudentLogin(
                  'Please sign in as a student to explore all curriculum chapters.',
                  'classes'
                );
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectClass={(c) => {
              setActiveClass(c);
              if (isStudentAuthenticated) {
                setCurrentView('classes');
              } else {
                navigateToStudentLogin(
                  `Please sign in as a student to access Class ${c} lessons.`,
                  'classes'
                );
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectSubject={(s) => {
              setActiveSubject(s);
              if (isStudentAuthenticated) {
                setCurrentView(s);
              } else {
                navigateToStudentLogin(
                  `Please sign in as a student to access the ${s} curriculum.`,
                  s
                );
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateStudentLogin={() => navigateToStudentLogin()}
            onNavigateStudentRegister={navigateToStudentRegister}
            onRequireAuthPrompt={(msg, target) => {
              setAuthPrompt({
                isOpen: true,
                message: msg,
                targetView: target as any
              });
            }}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative text-center">
            <button
              onClick={() => setAuthPrompt({ isOpen: false, message: '' })}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-cyan-400 mx-auto mb-4">
              <Lock className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-extrabold text-white mb-2">
              Student Account Required
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
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
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Student Login</span>
              </button>

              <button
                onClick={() => {
                  setAuthPrompt({ isOpen: false, message: '' });
                  navigateToStudentRegister();
                }}
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-cyan-300 hover:text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
