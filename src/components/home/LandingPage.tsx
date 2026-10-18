import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  Atom,
  Binary,
  Layers,
  Scale,
  Sun,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Award,
  BookOpen,
  ChevronRight,
  Compass,
  Cpu,
  LogIn,
  UserPlus,
  Lock
} from 'lucide-react';
import { CLASS_METADATA } from '../../data/curriculumData';
import { ClassLevel, SubjectId } from '../../types/curriculum';

interface LandingPageProps {
  isAuthenticated: boolean;
  onStartLearning: () => void;
  onExploreCourses: () => void;
  onSelectClass: (c: ClassLevel) => void;
  onSelectSubject: (s: SubjectId) => void;
  onNavigateStudentLogin: () => void;
  onNavigateStudentRegister: () => void;
  onRequireAuthPrompt: (message: string, redirectTarget?: string) => void;
}

export function LandingPage({
  isAuthenticated,
  onStartLearning,
  onExploreCourses,
  onSelectClass,
  onSelectSubject,
  onNavigateStudentLogin,
  onNavigateStudentRegister,
  onRequireAuthPrompt
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
      <section className="relative pt-6 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & Actions (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Interactive EdTech Platform for Classes 6–10</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1] text-balance">
              Discover Science. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600">
                Master Mathematics.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl">
              Explore concepts, experiment with ideas, solve real-world problems, and learn at your own pace with interactive lessons designed for Classes 6–10.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={onStartLearning}
                    className="px-8 py-4 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <span>Resume Learning</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={onExploreCourses}
                    className="px-7 py-4 bg-white hover:bg-gray-50 text-gray-800 font-semibold text-sm rounded-xl border border-gray-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span>Explore Classes 6–10</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onNavigateStudentLogin}
                    className="px-8 py-4 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Student Login</span>
                  </button>

                  <button
                    onClick={onNavigateStudentRegister}
                    className="px-7 py-4 bg-white hover:bg-gray-50 text-[#2563EB] font-semibold text-sm rounded-xl border border-blue-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <UserPlus className="w-4 h-4 text-[#2563EB]" />
                    <span>Create Student Account</span>
                  </button>
                </>
              )}
            </div>

            {/* Curriculum pill tags */}
            <div className="pt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span className="font-semibold text-gray-700">Curriculum Aligned:</span>
              <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200 text-gray-700">NCERT</span>
              <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200 text-gray-700">CBSE</span>
              <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200 text-gray-700">Interactive Simulations</span>
              <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200 text-gray-700">80% Mastery Rule</span>
            </div>
          </div>

          {/* Right Column: High-Fidelity Artwork (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-gray-200 shadow-2xl bg-white group">
              <img
                src="/src/assets/images/hero_scimath_academy_1792233656985.jpg"
                alt="BrightMind Learning Hero Artwork showing glowing atom model, orbital celestial rings, and coordinate geometry"
                className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent pointer-events-none" />

              {/* Floating Glassmorphic Badge */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-white/95 border border-gray-200 shadow-lg backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">Featured Demo: Class 8</div>
                    <div className="text-[11px] text-blue-600 font-medium">The Balance Method in Action</div>
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
                  className="px-3 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1 cursor-pointer"
                >
                  {!isAuthenticated && <Lock className="w-3 h-3" />}
                  <span>Launch Demo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: CHOOSE YOUR CLASS */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">
              Structured Curriculum
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Choose Your Class
            </h2>
            <p className="text-sm text-gray-600 mt-1 max-w-xl">
              Targeted Science and Mathematics content calibrated specifically for your school grade.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {CLASS_METADATA.map((cm) => (
            <div
              key={cm.level}
              onClick={() =>
                handleProtectedAction(
                  () => onSelectClass(cm.level),
                  `Please sign in as a student to explore the full Class ${cm.level} curriculum and interactive chapters.`,
                  'classes'
                )
              }
              className="bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between group shadow-sm relative"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black font-mono text-blue-600">
                    0{cm.level}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-blue-600 transition-colors">
                    {isAuthenticated ? <BookOpen className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {cm.title}
                </h3>
                <p className="text-xs text-gray-600 mt-2 line-clamp-3 leading-relaxed">
                  {cm.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                <span>{isAuthenticated ? `Explore Class ${cm.level}` : `Class ${cm.level} Syllabus`}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: EXPLORE SUBJECTS */}
      <section className="space-y-6">
        <div>
          <div className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">
            Core Disciplines
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Explore Subjects
          </h2>
          <p className="text-sm text-gray-600 mt-1 max-w-xl">
            Deep-dive into rigorous, visual lessons across fundamental sciences and pure mathematics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Science Card */}
          <div
            onClick={() =>
              handleProtectedAction(
                () => onSelectSubject('science'),
                'Please log in with your student account to access the Science laboratory and interactive optics experiments.',
                'science'
              )
            }
            className="bg-white border border-gray-200 hover:border-gray-300 rounded-3xl overflow-hidden cursor-pointer group transition-all shadow-sm hover:shadow-md flex flex-col"
          >
            <div className="h-56 relative overflow-hidden bg-gray-100">
              <img
                src="/src/assets/images/science_discipline_banner_1792233656005.jpg"
                alt="Science Exploration banner with microscope, chemical flask, and DNA double helix"
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
              <div className="absolute top-4 left-4 bg-white/90 border border-gray-200 px-3 py-1 rounded-lg text-blue-700 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <Atom className="w-3.5 h-3.5" />
                <span>Integrated Science</span>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Science
                </h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  Physics, Chemistry, and Biology combined through virtual laboratory experiments, optics ray tracing, force calculations, and cellular inspections.
                </p>

                <div className="flex flex-wrap gap-2 mt-4">
                  {['Ray Optics', 'Force & Pressure', 'Sound Waves', 'Cell Anatomy', "Ohm's Law"].map(
                    (tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 text-xs border border-gray-200"
                      >
                        {tag}
                      </span>
                    )
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                <span>Browse All Science Chapters</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Mathematics Card */}
          <div
            onClick={() =>
              handleProtectedAction(
                () => onSelectSubject('mathematics'),
                'Please log in with your student account to access Mathematics worked examples, equation balance scales, and assessments.',
                'mathematics'
              )
            }
            className="bg-white border border-gray-200 hover:border-gray-300 rounded-3xl overflow-hidden cursor-pointer group transition-all shadow-sm hover:shadow-md flex flex-col"
          >
            <div className="h-56 relative overflow-hidden bg-gray-100">
              <img
                src="/src/assets/images/math_discipline_banner_1792233657743.jpg"
                alt="Mathematics Concept banner with polyhedra, golden ratio spiral, and balance scale"
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
              <div className="absolute top-4 left-4 bg-white/90 border border-gray-200 px-3 py-1 rounded-lg text-blue-700 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <Binary className="w-3.5 h-3.5" />
                <span>Pure &amp; Applied Mathematics</span>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Mathematics
                </h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  Arithmetic, Algebra, Geometry, and Coordinate Systems unlocked through the physical Balance Method, geometric proofs, and real-time fraction partitioning.
                </p>

                <div className="flex flex-wrap gap-2 mt-4">
                  {['Linear Equations', 'Rational Numbers', 'Quadrilaterals', 'Trigonometry', 'Coordinate Geometry'].map(
                    (tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 text-xs border border-gray-200"
                      >
                        {tag}
                      </span>
                    )
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs font-semibold text-blue-600 group-hover:text-blue-700">
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
          <div className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">
            Proven Learning Model
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            How Every Concept is Mastered
          </h2>
          <p className="text-sm text-gray-600 mt-1">
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
              className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2 relative"
            >
              <div className="text-blue-200 font-mono font-black text-xl">{item.step}</div>
              <h4 className="text-sm font-bold text-gray-900">{item.title}</h4>
              <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: THE 80% COMPLETION & UNLOCKING SYSTEM */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-white border border-blue-100 rounded-3xl p-8 sm:p-12 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="text-xs text-blue-600 font-bold uppercase tracking-wider">
              Enforced Mastery
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              The 80% Unlocking Rule
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Unlike platforms that allow passive scrolling, BrightMind Learning calculates actual student readiness using a rigorous 4-part weighted model:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-sm text-center">
                <div className="text-blue-600 font-mono font-bold text-lg">30%</div>
                <div className="text-[11px] text-gray-500 mt-1">Lesson Study</div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-sm text-center">
                <div className="text-blue-600 font-mono font-bold text-lg">20%</div>
                <div className="text-[11px] text-gray-500 mt-1">Activity Lab</div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-sm text-center">
                <div className="text-blue-600 font-mono font-bold text-lg">20%</div>
                <div className="text-[11px] text-gray-500 mt-1">Guided Practice</div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-sm text-center">
                <div className="text-green-600 font-mono font-bold text-lg">30%</div>
                <div className="text-[11px] text-gray-500 mt-1">Quiz (≥80%)</div>
              </div>
            </div>

            <p className="text-xs text-gray-500 pt-2">
              * Crucial rule: A student must achieve both overall completion ≥ 80% AND score at least 80% on the final assessment to unlock the next sub-concept.
            </p>
          </div>

          <div className="lg:col-span-5 bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 border-2 border-green-200 mx-auto flex items-center justify-center text-green-600">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Genuine Competence First</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              If an assessment falls below 80%, personalized revision points are presented immediately so students can retry and master the topic.
            </p>
            <button
              onClick={() =>
                handleProtectedAction(
                  onStartLearning,
                  'Please sign in to test the interactive unlocking and evaluation workflow.',
                  'lesson'
                )
              }
              className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-md transition-colors cursor-pointer"
            >
              {isAuthenticated ? 'Resume Featured Demo' : 'Sign In to Try Unlocking Flow'}
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 5: WHY SCIMATH ACADEMY */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <div className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">
            Built for Real Understanding
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Why BrightMind Learning
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Interactive Manipulatives</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              No static diagrams. Interact directly with dual-pan algebraic scales, light ray reflections, and dynamic coordinate geometry.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Bite-Sized Sub-Concepts</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Heavy chapters are divided into focused 20-minute learning units with immediate worked examples and guided practice.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Measurable Growth</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Every score, attempt, and completed lesson persists seamlessly. Track streaks, revision recommendations, and unlock achievements.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
