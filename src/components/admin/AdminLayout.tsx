import React, { useState } from 'react';
import {
  LayoutDashboard,
  Layers,
  BookOpen,
  FileText,
  HelpCircle,
  ShieldCheck,
  Palette,
  Key,
  Clock,
  LogOut,
  Users,
  ImageIcon,
  ChevronRight,
  ExternalLink,
  Menu,
  X,
  Atom,
  Scale
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { AdminOverviewView } from './views/AdminOverviewView';
import { AdminClassesView } from './views/AdminClassesView';
import { AdminConceptsView } from './views/AdminConceptsView';
import { AdminLessonEditorView } from './views/AdminLessonEditorView';
import { AdminQuestionsView } from './views/AdminQuestionsView';
import { AdminRulesView } from './views/AdminRulesView';
import { AdminMediaView } from './views/AdminMediaView';
import { AdminStudentsView } from './views/AdminStudentsView';
import { AdminAppearanceView } from './views/AdminAppearanceView';
import { AdminSecurityView } from './views/AdminSecurityView';
import { AdminAuditLogsView } from './views/AdminAuditLogsView';
import { AdminChapterQuizzesView } from './views/AdminChapterQuizzesView';
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
  | 'chapter-quizzes'
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
    { id: 'chapter-quizzes', label: 'External Quiz Links', icon: ExternalLink, category: 'Curriculum' },
    { id: 'curriculum', label: 'Curriculum Paths', icon: Layers, category: 'Curriculum' },
    { id: 'lesson-editor', label: 'Lesson Editor', icon: FileText, category: 'Content' },
    { id: 'activities', label: 'Activities & Labs', icon: Scale, category: 'Content' },
    { id: 'questions', label: 'MCQ Question Bank', icon: HelpCircle, category: 'Content' },
    { id: 'media', label: 'Media Library', icon: ImageIcon, category: 'Content' },
    { id: 'rules', label: '80% Unlocking Rules', icon: ShieldCheck, category: 'Configuration' },
    { id: 'students', label: 'Student Management', icon: Users, category: 'Configuration' },
    { id: 'appearance', label: 'Website Appearance & SEO', icon: Palette, category: 'Configuration' },
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
    <div className="min-h-screen bg-[#F8FAFF] text-[#111827] flex flex-col font-sans">
      {/* Admin Top Navigation Bar */}
      <header className="sticky top-0 z-40 navbar-glass">
        <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-[#475569] hover:text-[#111827] rounded-lg hover:bg-[#F1F5FF]"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#60A5FA] p-0.5 flex items-center justify-center shadow-sm">
                <div className="w-full h-full bg-[#FFFFFF] rounded-[10px] flex items-center justify-center text-[#2563EB]">
                  <Atom className="w-4 h-4 animate-spin-slow" />
                </div>
              </div>
              <div>
                <span className="font-extrabold text-[#111827] text-base tracking-tight">
                  SciMath<span className="text-[#2563EB]">enova</span>
                </span>
                <span className="ml-2 text-[10px] font-mono font-bold bg-[#EFF6FF] text-[#2563EB] px-1.5 py-0.5 rounded border border-[#BFDBFE] uppercase">
                  CMS Portal
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onReturnToStudent}
              className="btn-secondary px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>Student View</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#2563EB]" />
            </button>

            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[#E2E8F0] text-xs">
              <span className="text-[#64748B]">Admin:</span>
              <span className="text-[#2563EB] font-mono font-semibold max-w-[150px] truncate">
                {admin?.username}
              </span>
            </div>

            <button
              onClick={logout}
              className="p-2 text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg transition-colors cursor-pointer"
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
          className={`fixed lg:sticky top-16 z-30 w-64 bg-[#FFFFFF] lg:bg-transparent border-r border-[#E2E8F0] p-4 shrink-0 transition-transform lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } h-[calc(100vh-4rem)] overflow-y-auto space-y-6 shadow-sm lg:shadow-none`}
        >
          {['Curriculum', 'Content', 'Configuration', 'System'].map((cat) => {
            const items = menuItems.filter((m) =>
              cat === 'Curriculum' ? !m.category || m.category === cat : m.category === cat
            );

            return (
              <div key={cat} className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] px-3 pb-1">
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
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'btn-primary'
                          : isLogout
                          ? 'text-[#DC2626] hover:bg-[#FEE2E2]'
                          : 'text-[#475569] hover:text-[#111827] hover:bg-[#F1F5FF]'
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

          {currentSection === 'chapter-quizzes' && <AdminChapterQuizzesView />}

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
              <div className="pb-4 border-b border-[#EDF2F7]">
                <h2 className="text-xl font-bold text-[#111827]">Interactive Simulations &amp; Activities</h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Test and verify live educational manipulatives rendered in lessons.
                </p>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-bold text-[#2563EB] uppercase tracking-wider mb-3">
                    Active Lab 1: Physical Dual-Pan Balance Scale (Class 8 Algebra)
                  </h3>
                  <BalanceScaleActivity />
                </div>

                <div className="pt-6 border-t border-[#EDF2F7]">
                  <h3 className="text-sm font-bold text-[#2563EB] uppercase tracking-wider mb-3">
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
