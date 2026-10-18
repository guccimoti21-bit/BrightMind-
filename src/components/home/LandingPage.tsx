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
