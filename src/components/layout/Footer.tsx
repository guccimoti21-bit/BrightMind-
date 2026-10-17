import React from 'react';
import { Atom } from 'lucide-react';
import { NavView } from './Navbar';

interface FooterProps {
  onNavigate: (view: NavView) => void;
  onOpenAdmin?: () => void;
}

export function Footer({ onNavigate, onOpenAdmin }: FooterProps) {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <Atom className="w-5 h-5 text-cyan-400" />
              <span className="text-base font-bold tracking-tight">BrightMind Learning</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Interactive Science and Mathematics learning platform for Classes 6 to 10 with physics simulations, algebraic balance scales, and mastery evaluations.
            </p>
          </div>

          {/* Curriculum */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Curriculum Classes
            </div>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('classes')} className="hover:text-white transition-colors">
                  Class 6 Foundation
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('classes')} className="hover:text-white transition-colors">
                  Class 7 Exploration
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('classes')} className="hover:text-white transition-colors">
                  Class 8 Mastery (Featured)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('classes')} className="hover:text-white transition-colors">
                  Class 9 Secondary Foundation
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('classes')} className="hover:text-white transition-colors">
                  Class 10 Board Standards
                </button>
              </li>
            </ul>
          </div>

          {/* Subjects */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Core Disciplines
            </div>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('mathematics')} className="hover:text-white transition-colors">
                  Linear Equations &amp; Algebra
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('science')} className="hover:text-white transition-colors">
                  Light &amp; Ray Optics
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('mathematics')} className="hover:text-white transition-colors">
                  Rational Numbers &amp; Arithmetic
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('science')} className="hover:text-white transition-colors">
                  Force, Pressure &amp; Mechanics
                </button>
              </li>
            </ul>
          </div>

          {/* Platform & Standards */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Pedagogical Standards
            </div>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>80% Sequential Unlock Rule</li>
              <li>Interactive Sandboxes &amp; Labs</li>
              <li>Instant Step-by-Step Explanations</li>
              <li>Accessible Design (WCAG AA)</li>
              <li>Curriculum Alignment: NCERT / CBSE</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-300">
          <div>
            © {new Date().getFullYear()} BrightMind Learning. All educational rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-200 cursor-pointer">Privacy Policy</span>
            <span>·</span>
            <span className="hover:text-slate-200 cursor-pointer">Terms of Service</span>
            <span>·</span>
            <span className="hover:text-slate-200 cursor-pointer">Accessibility</span>
            <span>·</span>
            {onOpenAdmin && (
              <>
                <button
                  onClick={onOpenAdmin}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                >
                  Administrator Portal
                </button>
                <span>·</span>
              </>
            )}
            <span className="hover:text-slate-200 cursor-pointer">Help Centre</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
