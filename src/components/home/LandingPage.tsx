import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Atom,
  Binary,
  Layers,
  Scale,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Award,
  BookOpen,
  ChevronRight,
  LogIn,
  UserPlus,
  Lock
} from 'lucide-react';
import { CLASS_METADATA } from '../../data/curriculumData';
import { ClassLevel, SubjectId, Concept } from '../../types/curriculum';
import { FrontPageChapterIndex } from './FrontPageChapterIndex';
import heroArtworkImg from '../../assets/images/hero_scimath_academy_1792233656985.jpg';
import scienceBannerImg from '../../assets/images/science_discipline_banner_1792233656005.jpg';
import mathBannerImg from '../../assets/images/math_discipline_banner_1792233657743.jpg';

interface LandingPageProps {
  concepts: Concept[];
  isAuthenticated: boolean;
  onStartLearning: () => void;
  onExploreCourses: () => void;
  onSelectClass: (c: ClassLevel) => void;
  onSelectSubject: (s: SubjectId) => void;
  onSelectConcept: (conceptId: string, subConceptId?: string) => void;
  onNavigateStudentLogin: (message?: string, redirectTarget?: string) => void;
  onNavigateStudentRegister: () => void;
  onRequireAuthPrompt: (message: string, redirectTarget?: string) => void;
  onRefreshCurriculum?: () => Promise<void>;
}

export function LandingPage({
  concepts,
  isAuthenticated,
  onStartLearning,
  onExploreCourses,
  onSelectClass,
  onSelectSubject,
  onSelectConcept,
  onNavigateStudentLogin,
  onNavigateStudentRegister,
  onRequireAuthPrompt,
  onRefreshCurriculum
}: LandingPageProps) {
  const handleProtectedAction = (
    action: () => void,
    reason: string,
    redirectTarget: string = 'dashboard'
  ) => {
    if (isAuthenticated) {
      action();
    } else {
      onRequireAuthPrompt(reason, redirectTarget);
    }
  };

  return (
    <div className="space-y-24 pb-20">
      {/* HERO SECTION */}
      <section className="relative pt-6 sm:pt-10 pb-6 rounded-3xl" style={{ background: 'var(--gradient-hero)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center px-4 sm:px-8">
          {/* Left Column: Headlines & Actions (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Interactive Science &amp; Mathematics Platform for Classes 6–10</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#111827] tracking-tight leading-[1.12] text-balance">
              Discover Science. <br />
              <span className="text-[#2563EB]">
                Master Mathematics.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#475569] leading-relaxed max-w-xl">
              Explore concepts, experiment with virtual manipulatives, solve real-world problems, and master topics with an 80% progression rule designed for Classes 6–10.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={onStartLearning}
                    className="btn-primary px-8 py-3.5 font-bold text-sm flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <span>Resume Learning</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => {
                      const el = document.getElementById('chapter-index');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="btn-secondary px-7 py-3.5 font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>View Chapters Index</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onNavigateStudentLogin()}
                    className="btn-primary px-8 py-3.5 font-bold text-sm flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Student Login</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={onNavigateStudentRegister}
                    className="btn-secondary px-7 py-3.5 font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <UserPlus className="w-4 h-4 text-[#2563EB]" />
                    <span>Create Free Account</span>
                  </button>
                </>
              )}
            </div>

            {/* Curriculum Pill Tags */}
            <div className="pt-3 flex flex-wrap items-center gap-2.5 text-xs text-[#64748B]">
              <span className="font-semibold text-[#111827]">Curriculum Standard:</span>
              <span className="bg-[#FFFFFF] px-2.5 py-1 rounded-md border border-[#E2E8F0] shadow-2xs font-medium">NCERT</span>
              <span className="bg-[#FFFFFF] px-2.5 py-1 rounded-md border border-[#E2E8F0] shadow-2xs font-medium">CBSE</span>
              <span className="bg-[#FFFFFF] px-2.5 py-1 rounded-md border border-[#E2E8F0] shadow-2xs font-medium">Virtual Physics &amp; Algebra Labs</span>
              <span className="bg-[#FFFFFF] px-2.5 py-1 rounded-md border border-[#E2E8F0] shadow-2xs font-medium text-[#16A34A] font-semibold">80% Mastery Rule</span>
            </div>
          </div>

          {/* Right Column: Hero Artwork */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-[#E2E8F0] shadow-[0_16px_40px_rgba(37,99,235,0.12)] bg-[#FFFFFF] group min-h-[340px] aspect-[16/11] flex items-center justify-center">
              <img
                src={heroArtworkImg}
                alt="SciMathenova Hero Artwork showing atom model, celestial orbits, and geometric mathematics"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('hero_scimath_academy.jpg')) {
                    target.src = '/images/hero_scimath_academy.jpg';
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/60 via-transparent to-transparent pointer-events-none" />

              {/* Floating Glassmorphic Badge */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/95 border border-[#BFDBFE] backdrop-blur-md flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-sm">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#111827]">Featured Lab: Class 8</div>
                    <div className="text-[11px] text-[#2563EB] font-medium">Equation Balance Scale Method</div>
                  </div>
                </div>
                <button
                  onClick={() =>
                    handleProtectedAction(
                      onStartLearning,
                      'Please log in with your student account to launch the interactive Balance Scale simulation.',
                      'lesson'
                    )
                  }
                  className="btn-primary px-3 py-1.5 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {!isAuthenticated && <Lock className="w-3 h-3 text-blue-200" />}
                  <span>Launch Lab</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE REQUIREMENT: CHAPTER INDEX FOR CLASSES 6-10 ON FRONT PAGE (OPEN ACCESS) */}
      <FrontPageChapterIndex
        concepts={concepts}
        isAuthenticated={isAuthenticated}
        onSelectConcept={onSelectConcept}
        onNavigateLogin={onNavigateStudentLogin}
        onNavigateRegister={onNavigateStudentRegister}
        onRefreshCurriculum={onRefreshCurriculum}
      />

      {/* SECTION 1: CHOOSE YOUR CLASS */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs text-[#2563EB] font-bold uppercase tracking-wider mb-1">
              Curriculum Levels
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
              Select Your Class
            </h2>
            <p className="text-sm text-[#475569] mt-1 max-w-xl">
              Targeted Science and Mathematics content calibrated specifically for your school grade.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {CLASS_METADATA.map((cm) => (
            <div
              key={cm.level}
              onClick={() => onSelectClass(cm.level)}
              className="bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#BFDBFE] hover:shadow-[0_16px_40px_rgba(37,99,235,0.08)] rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between group shadow-sm relative"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black font-mono text-[#2563EB]">
                    0{cm.level}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#F1F5FF] text-[#2563EB] flex items-center justify-center group-hover:bg-[#DBEAFE] transition-colors">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-[#111827] group-hover:text-[#2563EB] transition-colors">
                  {cm.title}
                </h3>
                <p className="text-xs text-[#475569] mt-2 line-clamp-3 leading-relaxed">
                  {cm.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#EDF2F7] flex items-center justify-between text-xs font-semibold text-[#2563EB]">
                <span>Class {cm.level} Syllabus</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: EXPLORE SUBJECTS */}
      <section className="space-y-6">
        <div>
          <div className="text-xs text-[#2563EB] font-bold uppercase tracking-wider mb-1">
            Core Disciplines
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            Explore Subjects
          </h2>
          <p className="text-sm text-[#475569] mt-1 max-w-xl">
            Deep-dive into rigorous, visual lessons across fundamental sciences and pure mathematics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Science Card */}
          <div
            onClick={() => onSelectSubject('science')}
            className="bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#BFDBFE] hover:shadow-[0_16px_40px_rgba(37,99,235,0.08)] rounded-3xl overflow-hidden cursor-pointer group transition-all shadow-sm flex flex-col"
          >
            <div className="h-56 relative overflow-hidden bg-[#F1F5FF]">
              <img
                src={scienceBannerImg}
                alt="Science Exploration banner with microscope, chemical flask, and DNA double helix"
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('science_discipline_banner.jpg')) {
                    target.src = '/images/science_discipline_banner.jpg';
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/70 via-transparent to-transparent" />
              <div className="absolute top-4 left-4 bg-white/95 border border-[#BFDBFE] px-3 py-1 rounded-lg text-[#0284C7] text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <Atom className="w-3.5 h-3.5" />
                <span>Integrated Science</span>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-[#111827] group-hover:text-[#2563EB] transition-colors">
                  Science
                </h3>
                <p className="text-sm text-[#475569] mt-2 leading-relaxed">
                  Physics, Chemistry, and Biology combined through virtual laboratory experiments, optics ray tracing, force calculations, and plant cellular inspections.
                </p>

                <div className="flex flex-wrap gap-2 mt-4">
                  {['Ray Optics', 'Force & Pressure', 'Sound Waves', 'Plant Anatomy', "Electricity & Circuits"].map(
                    (tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-md bg-[#F1F5FF] text-[#2563EB] text-xs font-medium border border-[#BFDBFE]"
                      >
                        {tag}
                      </span>
                    )
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#EDF2F7] text-xs font-semibold text-[#2563EB]">
                <span>Browse All Science Chapters</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Mathematics Card */}
          <div
            onClick={() => onSelectSubject('mathematics')}
            className="bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#BFDBFE] hover:shadow-[0_16px_40px_rgba(37,99,235,0.08)] rounded-3xl overflow-hidden cursor-pointer group transition-all shadow-sm flex flex-col"
          >
            <div className="h-56 relative overflow-hidden bg-[#F1F5FF]">
              <img
                src={mathBannerImg}
                alt="Mathematics Concept banner with polyhedra, golden ratio spiral, and balance scale"
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('math_discipline_banner.jpg')) {
                    target.src = '/images/math_discipline_banner.jpg';
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/70 via-transparent to-transparent" />
              <div className="absolute top-4 left-4 bg-white/95 border border-[#BFDBFE] px-3 py-1 rounded-lg text-[#2563EB] text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <Binary className="w-3.5 h-3.5" />
                <span>Pure &amp; Applied Mathematics</span>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-[#111827] group-hover:text-[#2563EB] transition-colors">
                  Mathematics
                </h3>
                <p className="text-sm text-[#475569] mt-2 leading-relaxed">
                  Arithmetic, Algebra, Geometry, and Quadratic Equations unlocked through the physical Balance Method, geometric proofs, and real-time fraction partitioning.
                </p>

                <div className="flex flex-wrap gap-2 mt-4">
                  {['Linear Equations', 'Rational Numbers', 'Fractions & Decimals', 'Integers', 'Quadratic Equations'].map(
                    (tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-md bg-[#F1F5FF] text-[#2563EB] text-xs font-medium border border-[#BFDBFE]"
                      >
                        {tag}
                      </span>
                    )
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#EDF2F7] text-xs font-semibold text-[#2563EB]">
                <span>Browse All Mathematics Chapters</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: 5-STEP PEDAGOGICAL WORKFLOW */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs text-[#2563EB] font-bold uppercase tracking-wider mb-1">
            Proven Learning Model
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            How Every Concept is Mastered
          </h2>
          <p className="text-sm text-[#475569] mt-1">
            A research-backed 5-step learning workflow engineered for deep conceptual understanding.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              step: '01',
              title: 'Understand',
              desc: 'Core definitions, intuitive real-world analogies, and interactive variables.'
            },
            {
              step: '02',
              title: 'Interact',
              desc: 'Hands-on virtual manipulatives like our physical dual-pan balance scale.'
            },
            {
              step: '03',
              title: 'Learn Solved',
              desc: 'Step-by-step worked solutions with highlighted arithmetic checks.'
            },
            {
              step: '04',
              title: 'Guided Practice',
              desc: 'Real-time hints and feedback without giving away the final answer.'
            },
            {
              step: '05',
              title: 'Evaluate',
              desc: 'Mastery assessment requiring ≥80% score to unlock subsequent topics.'
            }
          ].map((item) => (
            <div
              key={item.step}
              className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] space-y-2 relative shadow-sm hover:border-[#BFDBFE] transition-colors"
            >
              <div className="text-[#2563EB] font-mono font-black text-xl">{item.step}</div>
              <h4 className="text-sm font-bold text-[#111827]">{item.title}</h4>
              <p className="text-xs text-[#475569] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: THE 80% COMPLETION & UNLOCKING SYSTEM */}
      <section className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-3xl p-8 sm:p-12 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="text-xs text-[#2563EB] font-bold uppercase tracking-wider">
              Enforced Mastery
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
              The 80% Unlocking Rule
            </h2>
            <p className="text-sm text-[#475569] leading-relaxed">
              Unlike platforms that allow passive scrolling, SciMathenova calculates actual student readiness using a rigorous 4-part weighted model:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#BFDBFE] text-center shadow-2xs">
                <div className="text-[#2563EB] font-mono font-bold text-lg">30%</div>
                <div className="text-[11px] text-[#475569] mt-1 font-medium">Lesson Study</div>
              </div>
              <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#BFDBFE] text-center shadow-2xs">
                <div className="text-[#2563EB] font-mono font-bold text-lg">20%</div>
                <div className="text-[11px] text-[#475569] mt-1 font-medium">Activity Lab</div>
              </div>
              <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#BFDBFE] text-center shadow-2xs">
                <div className="text-[#2563EB] font-mono font-bold text-lg">20%</div>
                <div className="text-[11px] text-[#475569] mt-1 font-medium">Guided Practice</div>
              </div>
              <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#BFDBFE] text-center shadow-2xs">
                <div className="text-[#16A34A] font-mono font-bold text-lg">30%</div>
                <div className="text-[11px] text-[#475569] mt-1 font-medium">Quiz (≥80%)</div>
              </div>
            </div>

            <p className="text-xs text-[#64748B] pt-2">
              * Crucial rule: A student must achieve both overall completion ≥ 80% AND score at least 80% on the final assessment to unlock the next sub-concept.
            </p>
          </div>

          <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#BFDBFE] rounded-2xl p-6 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#EFF6FF] border-2 border-[#2563EB] mx-auto flex items-center justify-center text-[#2563EB]">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div>
              <div className="text-sm font-bold text-[#111827]">Strict Prerequisite Progression</div>
              <p className="text-xs text-[#475569] mt-1 leading-relaxed">
                Concepts build sequentially from fundamentals to complex problem-solving. This guarantees true conceptual retention.
              </p>
            </div>

            <button
              onClick={() => {
                const el = document.getElementById('chapter-index');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-primary w-full py-2.5 text-xs font-semibold cursor-pointer"
            >
              Explore Chapter Index Below
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
