import React from 'react';
import { Atom, Shield, BookOpen, ExternalLink, Heart } from 'lucide-react';
import { NavView } from './Navbar';

interface FooterProps {
  onNavigate: (view: NavView) => void;
  onOpenAdmin?: () => void;
}

export function Footer({ onNavigate, onOpenAdmin }: FooterProps) {
  return (
    <footer className="bg-[#FFFFFF] border-t border-[#E2E8F0] text-[#475569] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#111827]">
              <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center text-white">
                <Atom className="w-4 h-4" />
              </div>
              <span className="text-base font-extrabold tracking-tight">
                SciMath<span className="text-[#2563EB]">enova</span>
              </span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Interactive Science and Mathematics learning platform for Classes 6 to 10 with physics simulations, algebraic balance scales, and mastery evaluations.
            </p>
            <div className="text-[11px] text-[#64748B]">
              Aligned with NCERT &amp; CBSE Standards
            </div>
          </div>

          {/* Curriculum */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[#111827]">
              Curriculum Classes
            </div>
            <ul className="space-y-1.5 text-xs text-[#475569]">
              <li>
                <button
                  onClick={() => onNavigate('classes')}
                  className="hover:text-[#2563EB] transition-colors cursor-pointer text-left"
                >
                  Class 6 Foundation (Fractions &amp; Plants)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('classes')}
                  className="hover:text-[#2563EB] transition-colors cursor-pointer text-left"
                >
                  Class 7 Exploration (Integers &amp; Heat)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('classes')}
                  className="hover:text-[#2563EB] transition-colors cursor-pointer text-left"
                >
                  Class 8 Mastery (Equations &amp; Optics)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('classes')}
                  className="hover:text-[#2563EB] transition-colors cursor-pointer text-left"
                >
                  Class 9 Secondary (Polynomials &amp; Motion)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('classes')}
                  className="hover:text-[#2563EB] transition-colors cursor-pointer text-left"
                >
                  Class 10 Board Standards (Quadratic &amp; Circuits)
                </button>
              </li>
            </ul>
          </div>

          {/* Core Disciplines */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[#111827]">
              Core Disciplines
            </div>
            <ul className="space-y-1.5 text-xs text-[#475569]">
              <li>
                <button
                  onClick={() => onNavigate('mathematics')}
                  className="hover:text-[#2563EB] transition-colors cursor-pointer text-left"
                >
                  Linear Equations &amp; Balance Scale
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('science')}
                  className="hover:text-[#2563EB] transition-colors cursor-pointer text-left"
                >
                  Light, Reflection &amp; Ray Optics
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('mathematics')}
                  className="hover:text-[#2563EB] transition-colors cursor-pointer text-left"
                >
                  Rational Numbers &amp; Arithmetic
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('science')}
                  className="hover:text-[#2563EB] transition-colors cursor-pointer text-left"
                >
                  Force, Pressure &amp; Mechanics
                </button>
              </li>
            </ul>
          </div>

          {/* Pedagogical Rigor & Admin */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[#111827]">
              Platform &amp; Governance
            </div>
            <ul className="space-y-1.5 text-xs text-[#64748B]">
              <li>80% Sequential Unlock Rule</li>
              <li>Interactive Sandboxes &amp; Labs</li>
              <li>Step-by-Step Worked Solutions</li>
              <li>Accessible Design (WCAG AA)</li>
            </ul>

            {onOpenAdmin && (
              <div className="pt-2">
                <button
                  onClick={onOpenAdmin}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] bg-[#F1F5FF] hover:bg-[#DBEAFE] px-3 py-1.5 rounded-lg border border-[#BFDBFE] transition-colors cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Portal Login</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#EDF2F7] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <div>
            © 2026 <strong className="text-[#111827]">SciMathenova</strong>. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                const el = document.getElementById('chapter-index');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-[#2563EB] transition-colors cursor-pointer"
            >
              Public Chapter Index
            </button>
            <span>·</span>
            <span>Classes 6–10 Aligned</span>
            <span>·</span>
            <span>Theme: Elegant Light</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
