import React, { useState } from 'react';
import {
  Atom,
  LayoutDashboard,
  Layers,
  BookOpen,
  FileText,
  HelpCircle,
  Scale,
  Palette,
  Key,
  Clock,
  Users,
  Image as ImageIcon,
  LogOut,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { AdminOverviewView } from './views/AdminOverviewView';
import { AdminClassesView } from './views/AdminClassesView';
import { AdminConceptsView } from './views/AdminConceptsView';
import { AdminLessonEditorView } from './views/AdminLessonEditorView';
import { AdminQuestionsView } from './views/AdminQuestionsView';
import { AdminRulesView } from './views/AdminRulesView';
import { AdminMediaView } from './views/AdminMediaView';
import { AdminAppearanceView } from './views/AdminAppearanceView';
import { AdminSecurityView } from './views/AdminSecurityView';
import { AdminAuditLogsView } from './views/AdminAuditLogsView';
import { AdminStudentsView } from './views/AdminStudentsView';
import { BalanceScaleActivity } from '../activities/BalanceScaleActivity';
import { RayOpticsActivity } from '../activities/RayOpticsActivity';

interface AdminLayoutProps {
  onReturnToStudent: () => void;
}

export type AdminSection =
  | 'dashboard'
  | 'classes'
  | 'subjects'
  | 'concepts'
  | 'subconcepts'
  | 'lesson-editor'
  | 'activities'
  | 'questions'
  | 'curriculum'
  | 'rules'
  | 'media'
  | 'students'
  | 'appearance'
  | 'security'
  | 'audit-logs'
  | 'logout';

export function AdminLayout({ onReturnToStudent }: AdminLayoutProps) {
  const { admin, logout } = useAdminAuth();
  const [currentSection, setCurrentSection] = useState<AdminSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editorConceptId, setEditorConceptId] = useState<string | undefined>();
  const [editorSubId, setEditorSubId] = useState<string | undefined>();

  const menuItems: { id: AdminSection; label: string; icon: any; category?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'classes', label: 'Manage Classes', icon: Layers, category: 'Curriculum' },
    { id: 'subjects', label: 'Manage Subjects', icon: BookOpen, category: 'Curriculum' },
    { id: 'concepts', label: 'Manage Chapters', icon: FileText, category: 'Curriculum' },
    { id: 'subconcepts', label: 'Manage Sub-concepts', icon: ChevronRight, category: 'Curriculum' },
    { id: 'curriculum', label: 'Curriculum Paths', icon: Layers, category: 'Curriculum' },
    { id: 'lesson-editor', label: 'Lesson Editor', icon: FileText, category: 'Content' },
    { id: 'activities', label: 'Activities & Labs', icon: Scale, category: 'Content' },
    { id: 'questions', label: 'MCQ Question Bank', icon: HelpCircle, category: 'Content' },
    { id: 'media', label: 'Media Library', icon: ImageIcon, category: 'Content' },
    { id: 'rules', label: '80% Unlocking Rules', icon: ShieldCheck, category: 'Configuration' },
    { id: 'students', label: 'Student Management', icon: Users, category: 'Configuration' },
    { id: 'appearance', label: 'Website Appearance', icon: Palette, category: 'Configuration' },
    { id: 'security', label: 'Admin Security', icon: Key, category: 'System' },
    { id: 'audit-logs', label: 'Security & Audit Logs', icon: Clock, category: 'System' },
    { id: 'logout', label: 'Sign Out', icon: LogOut, category: 'System' }
  ];

  const handleMenuClick = (id: AdminSection) => {
    if (id === 'logout') {
      logout();
      return;
    }
    setCurrentSection(id);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchEditorForConcept = (conceptId: string, subId?: string) => {
    setEditorConceptId(conceptId);
    setEditorSubId(subId);
    setCurrentSection('lesson-editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col font-sans">
      {/* Admin Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/95 border-b border-slate-800 backdrop-blur-md">
        <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-cyan-400">
                  <Atom className="w-4 h-4 animate-spin-slow" />
                </div>
              </div>
              <div>
                <span className="font-extrabold text-white text-base tracking-tight">
                  BrightMind <span className="text-cyan-400 font-medium">Learning</span>
                </span>
                <span className="ml-2 text-[10px] font-mono font-bold bg-blue-950 text-cyan-300 px-1.5 py-0.5 rounded border border-blue-800/60 uppercase">
                  CMS Portal
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onReturnToStudent}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 hover:text-white border border-slate-800 transition-colors flex items-center gap-1.5"
            >
              <span>Student View</span>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            </button>

            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-800 text-xs">
              <span className="text-slate-400">Signed in as:</span>
              <span className="text-cyan-300 font-mono font-semibold max-w-[150px] truncate">
                {admin?.username}
              </span>
            </div>

            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid: Collapsible Sidebar + Content View */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-16 z-30 w-64 bg-slate-950/90 lg:bg-transparent border-r border-slate-800/80 p-4 shrink-0 transition-transform lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } h-[calc(100vh-4rem)] overflow-y-auto space-y-6`}
        >
          {['Curriculum', 'Content', 'Configuration', 'System'].map((cat) => {
            const items = menuItems.filter((m) =>
              cat === 'Curriculum' ? !m.category || m.category === cat : m.category === cat
            );

            return (
              <div key={cat} className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">
                  {cat}
                </div>
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentSection === item.id;
                  const isLogout = item.id === 'logout';

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMenuClick(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : isLogout
                          ? 'text-rose-400 hover:bg-rose-950/40 hover:text-rose-300'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </aside>

        {/* Content View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden min-h-[calc(100vh-4rem)]">
          {currentSection === 'dashboard' && (
            <AdminOverviewView onNavigateSection={(sec) => setCurrentSection(sec as AdminSection)} />
          )}

          {currentSection === 'classes' && <AdminClassesView />}

          {currentSection === 'subjects' && <AdminClassesView />}

          {currentSection === 'concepts' && (
            <AdminConceptsView onEditLesson={handleLaunchEditorForConcept} />
          )}

          {currentSection === 'subconcepts' && (
            <AdminConceptsView onEditLesson={handleLaunchEditorForConcept} />
          )}

          {currentSection === 'curriculum' && (
            <AdminConceptsView onEditLesson={handleLaunchEditorForConcept} />
          )}

          {currentSection === 'lesson-editor' && (
            <AdminLessonEditorView
              initialConceptId={editorConceptId}
              initialSubConceptId={editorSubId}
              onBackToConcepts={() => setCurrentSection('concepts')}
            />
          )}

          {currentSection === 'activities' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-800">
                <h2 className="text-xl font-bold text-white">Interactive Simulations &amp; Activities</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Test and verify live educational manipulatives rendered in lessons.
                </p>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider mb-3">
                    Active Lab 1: Physical Dual-Pan Balance Scale (Class 8 Algebra)
                  </h3>
                  <BalanceScaleActivity />
                </div>

                <div className="pt-6 border-t border-slate-800">
                  <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider mb-3">
                    Active Lab 2: Ray Optics Reflection Laboratory (Class 8 Physics)
                  </h3>
                  <RayOpticsActivity />
                </div>
              </div>
            </div>
          )}

          {currentSection === 'questions' && <AdminQuestionsView />}

          {currentSection === 'rules' && <AdminRulesView />}

          {currentSection === 'media' && <AdminMediaView />}

          {currentSection === 'students' && <AdminStudentsView />}

          {currentSection === 'appearance' && <AdminAppearanceView />}

          {currentSection === 'security' && <AdminSecurityView />}

          {currentSection === 'audit-logs' && <AdminAuditLogsView />}
        </main>
      </div>
    </div>
  );
}
