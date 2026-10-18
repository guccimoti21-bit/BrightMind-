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
      <div className="min-h-screen bg-[#FAFAFA] text-[#333333] flex flex-col font-sans selection:bg-[#2563EB] selection:text-white">
        <header className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white/80 backdrop-blur-sm">
          <button
            onClick={handleReturnToAcademy}
            className="text-xs font-semibold text-[#2563EB] hover:text-blue-700 cursor-pointer"
          >
            ← Return to BrightMind Learning
          </button>
          <span className="text-xs text-gray-500 font-mono">Secure Administrator Gateway</span>
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
      <div className="min-h-screen bg-[#FAFAFA] text-[#333333] flex flex-col font-sans selection:bg-[#2563EB] selection:text-white relative">
        <div
          className="fixed inset-0 pointer-events-none opacity-40 z-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
        <main className="flex-1 flex items-center justify-center p-4 relative z-10">
          <StudentLogin
            onLoginSuccess={handleLoginSuccess}
            onNavigateRegister={() => {
              setAppRoute('student-register');
              window.history.pushState
