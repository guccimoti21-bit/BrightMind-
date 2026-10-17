import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import {
  ClassLevel,
  SubjectId,
  SubConceptProgress,
  StudentProgressState,
  COMPLETION_WEIGHTS,
  PASSING_ASSESSMENT_SCORE,
  UNLOCK_REQUIRED_COMPLETION
} from '../types/curriculum';
import { CURRICULUM_DATA } from '../data/curriculumData';
import { useStudentAuth } from './StudentAuthContext';
import { getSupabase } from '../lib/supabase';

interface ProgressContextType {
  state: StudentProgressState;
  calculateSubConceptCompletion: (progress?: SubConceptProgress) => number;
  isSubConceptUnlocked: (conceptId: string, subConceptId: string) => boolean;
  markLessonComplete: (subConceptId: string) => void;
  markActivityComplete: (subConceptId: string) => void;
  markPracticeComplete: (subConceptId: string) => void;
  recordAssessmentAttempt: (subConceptId: string, scorePercentage: number) => { passed: boolean; unlockedNext: boolean };
  setActiveClass: (classLevel: ClassLevel) => void;
  setActiveSubject: (subjectId: SubjectId) => void;
  setLastActiveSubConcept: (subConceptId: string) => void;
  setStudentName: (name: string) => void;
  resetAllProgress: () => void;
  getConceptProgressPercentage: (conceptId: string) => number;
  getSubjectProgressPercentage: (classLevel: ClassLevel, subjectId: SubjectId) => number;
  getOverallStats: () => {
    totalSubConcepts: number;
    completedSubConcepts: number;
    overallPercentage: number;
    mathPercentage: number;
    sciencePercentage: number;
    passedAssessmentsCount: number;
  };
}

const DEFAULT_DEMO_STATE: StudentProgressState = {
  studentName: 'Aarav Sharma',
  currentClass: 8,
  currentSubject: 'mathematics',
  lastActiveSubConceptId: 'c8-math-linear-sub2', // Default to the featured Balance Scale demo!
  streakDays: 4,
  studyMinutes: 145,
  progressBySubConcept: {
    // Sub-concept 1 (Meaning of Variable) is already completed for Aarav to demonstrate unlock flow
    'c8-math-linear-sub1': {
      subConceptId: 'c8-math-linear-sub1',
      lessonCompleted: true,
      activityCompleted: true,
      practiceCompleted: true,
      assessmentPassed: true,
      assessmentBestScore: 100,
      assessmentAttempts: [{ timestamp: Date.now() - 86400000, score: 100, passed: true }],
      overallCompletion: 100,
      isUnlocked: true,
      isCompleted: true,
      lastVisitedAt: Date.now() - 86400000
    },
    // Sub-concept 2 (Balance Method) is In Progress (unlocked because sub1 was 100%)
    'c8-math-linear-sub2': {
      subConceptId: 'c8-math-linear-sub2',
      lessonCompleted: true,
      activityCompleted: false,
      practiceCompleted: false,
      assessmentPassed: false,
      assessmentBestScore: 0,
      assessmentAttempts: [],
      overallCompletion: 30, // 30% from lessonCompleted
      isUnlocked: true,
      isCompleted: false,
      lastVisitedAt: Date.now()
    }
  }
};

const BLANK_STATE: StudentProgressState = {
  studentName: '',
  currentClass: 8,
  currentSubject: 'mathematics',
  lastActiveSubConceptId: 'c8-math-linear-sub2',
  streakDays: 1,
  studyMinutes: 0,
  progressBySubConcept: {}
};

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { student, isAuthenticated } = useStudentAuth();
  const studentIdRef = useRef<string | null>(null);

  const [state, setState] = useState<StudentProgressState>(() => {
    return BLANK_STATE;
  });

  // Load progress when student changes (or login/logout occurs)
  useEffect(() => {
    studentIdRef.current = student?.id || null;

    if (!student || !isAuthenticated) {
      setState(BLANK_STATE);
      return;
    }

    const storageKey = `scimath_student_progress_${student.id}`;
    let loadedState: StudentProgressState | null = null;

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        loadedState = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load local student progress', e);
    }

    // If new user and demo user, provide demo starter data
    if (!loadedState) {
      if (student.email === 'student@scimath.academy') {
        loadedState = {
          ...DEFAULT_DEMO_STATE,
          studentName: student.fullName,
          currentClass: student.classLevel
        };
      } else {
        loadedState = {
          studentName: student.fullName,
          currentClass: student.classLevel,
          currentSubject: 'mathematics',
          lastActiveSubConceptId: 'c8-math-linear-sub2',
          streakDays: 1,
          studyMinutes: 15,
          progressBySubConcept: {}
        };
      }
    } else {
      // Ensure name and class reflect current profile
      loadedState.studentName = student.fullName;
      loadedState.currentClass = student.classLevel;
    }

    setState(loadedState);

    const activeStudentId = student.id;

    // Asynchronously fetch progress from Supabase database
    async function fetchSupabaseProgress() {
      try {
        const supabase = getSupabase();
        const { data: progressRows } = await supabase
          .from('student_progress')
          .select('*')
          .eq('user_id', activeStudentId);

        const { data: statsRow } = await supabase
          .from('student_stats')
          .select('*')
          .eq('user_id', activeStudentId)
          .maybeSingle();

        if (progressRows && progressRows.length > 0) {
          setState((prev) => {
            const mergedProgress = { ...prev.progressBySubConcept };
            progressRows.forEach((row: any) => {
              mergedProgress[row.sub_concept_id] = {
                subConceptId: row.sub_concept_id,
                lessonCompleted: Boolean(row.lesson_completed),
                activityCompleted: Boolean(row.activity_completed),
                practiceCompleted: Boolean(row.practice_completed),
                assessmentPassed: Boolean(row.assessment_passed),
                assessmentBestScore: row.assessment_best_score || 0,
                assessmentAttempts: row.assessment_attempts || [],
                overallCompletion: row.overall_completion || 0,
                isUnlocked: Boolean(row.is_unlocked),
                isCompleted: Boolean(row.is_completed),
                lastVisitedAt: row.last_visited_at ? new Date(row.last_visited_at).getTime() : Date.now()
              };
            });

            return {
              ...prev,
              streakDays: statsRow?.streak_days || prev.streakDays,
              studyMinutes: statsRow?.study_minutes || prev.studyMinutes,
              lastActiveSubConceptId: statsRow?.last_active_sub_concept_id || prev.lastActiveSubConceptId,
              progressBySubConcept: mergedProgress
            };
          });
        }
      } catch (err) {
        console.log('Supabase progress sync notice:', err);
      }
    }

    fetchSupabaseProgress();
  }, [student, isAuthenticated]);

  // Persist state to localStorage and Supabase on change
  useEffect(() => {
    if (!student || !isAuthenticated) return;

    const activeStudentId = student.id;
    const storageKey = `scimath_student_progress_${activeStudentId}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save progress to localStorage', e);
    }

    // Debounced persist to Supabase
    const timer = setTimeout(async () => {
      try {
        const supabase = getSupabase();

        // Persist stats
        await supabase.from('student_stats').upsert({
          user_id: activeStudentId,
          streak_days: state.streakDays,
          study_minutes: state.studyMinutes,
          last_active_sub_concept_id: state.lastActiveSubConceptId,
          last_active_date: new Date().toISOString().split('T')[0]
        });

        // Persist any active sub-concepts
        if (state.lastActiveSubConceptId && state.progressBySubConcept[state.lastActiveSubConceptId]) {
          const p = state.progressBySubConcept[state.lastActiveSubConceptId];
          await supabase.from('student_progress').upsert({
            user_id: activeStudentId,
            sub_concept_id: p.subConceptId,
            lesson_completed: p.lessonCompleted,
            activity_completed: p.activityCompleted,
            practice_completed: p.practiceCompleted,
            assessment_passed: p.assessmentPassed,
            assessment_best_score: p.assessmentBestScore,
            assessment_attempts: p.assessmentAttempts,
            overall_completion: p.overallCompletion,
            is_unlocked: p.isUnlocked,
            is_completed: p.isCompleted,
            last_visited_at: new Date(p.lastVisitedAt || Date.now()).toISOString()
          });
        }
      } catch (err) {
        // Silently catch background sync errors
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [state, student, isAuthenticated]);

  const calculateSubConceptCompletion = (progress?: SubConceptProgress): number => {
    if (!progress) return 0;
    let score = 0;
    if (progress.lessonCompleted) score += COMPLETION_WEIGHTS.lesson;
    if (progress.activityCompleted) score += COMPLETION_WEIGHTS.activity;
    if (progress.practiceCompleted) score += COMPLETION_WEIGHTS.practice;
    if (progress.assessmentPassed) score += COMPLETION_WEIGHTS.assessment;
    return score;
  };

  const isSubConceptUnlocked = (conceptId: string, subConceptId: string): boolean => {
    const concept = CURRICULUM_DATA.find((c) => c.id === conceptId);
    if (!concept) return false;

    const subIndex = concept.subConcepts.findIndex((sc) => sc.id === subConceptId);
    if (subIndex === -1) return false;

    // First sub-concept of any concept is always unlocked
    if (subIndex === 0) return true;

    // Subsequent sub-concepts require the immediate predecessor to reach >= 80% completion AND assessment passed (>= 80%)
    const prevSubConcept = concept.subConcepts[subIndex - 1];
    const prevProgress = state.progressBySubConcept[prevSubConcept.id];
    if (!prevProgress) return false;

    const completion = calculateSubConceptCompletion(prevProgress);
    const passed = prevProgress.assessmentPassed && prevProgress.assessmentBestScore >= PASSING_ASSESSMENT_SCORE;

    return completion >= UNLOCK_REQUIRED_COMPLETION && passed;
  };

  const updateSubConceptProgress = (
    subConceptId: string,
    updater: (prev: SubConceptProgress) => Partial<SubConceptProgress>
  ) => {
    setState((prevState) => {
      const existing: SubConceptProgress = prevState.progressBySubConcept[subConceptId] || {
        subConceptId,
        lessonCompleted: false,
        activityCompleted: false,
        practiceCompleted: false,
        assessmentPassed: false,
        assessmentBestScore: 0,
        assessmentAttempts: [],
        overallCompletion: 0,
        isUnlocked: true,
        isCompleted: false,
        lastVisitedAt: Date.now()
      };

      const partial = updater(existing);
      const merged: SubConceptProgress = {
        ...existing,
        ...partial,
        lastVisitedAt: Date.now()
      };

      // Recalculate completion
      const overall = calculateSubConceptCompletion(merged);
      merged.overallCompletion = overall;
      merged.isCompleted = overall >= UNLOCK_REQUIRED_COMPLETION && merged.assessmentPassed;

      return {
        ...prevState,
        lastActiveSubConceptId: subConceptId,
        progressBySubConcept: {
          ...prevState.progressBySubConcept,
          [subConceptId]: merged
        }
      };
    });
  };

  const markLessonComplete = (subConceptId: string) => {
    updateSubConceptProgress(subConceptId, () => ({ lessonCompleted: true }));
  };

  const markActivityComplete = (subConceptId: string) => {
    updateSubConceptProgress(subConceptId, () => ({ activityCompleted: true }));
  };

  const markPracticeComplete = (subConceptId: string) => {
    updateSubConceptProgress(subConceptId, () => ({ practiceCompleted: true }));
  };

  const recordAssessmentAttempt = (
    subConceptId: string,
    scorePercentage: number
  ): { passed: boolean; unlockedNext: boolean } => {
    const passed = scorePercentage >= PASSING_ASSESSMENT_SCORE;

    updateSubConceptProgress(subConceptId, (existing) => {
      const attempts = [
        ...existing.assessmentAttempts,
        { timestamp: Date.now(), score: scorePercentage, passed }
      ];
      const bestScore = Math.max(existing.assessmentBestScore, scorePercentage);

      return {
        assessmentAttempts: attempts,
        assessmentBestScore: bestScore,
        assessmentPassed: existing.assessmentPassed || passed
      };
    });

    return {
      passed,
      unlockedNext: passed
    };
  };

  const setActiveClass = (classLevel: ClassLevel) => {
    setState((prev) => ({ ...prev, currentClass: classLevel }));
  };

  const setActiveSubject = (subjectId: SubjectId) => {
    setState((prev) => ({ ...prev, currentSubject: subjectId }));
  };

  const setLastActiveSubConcept = (subConceptId: string) => {
    setState((prev) => ({ ...prev, lastActiveSubConceptId: subConceptId }));
  };

  const setStudentName = (name: string) => {
    setState((prev) => ({ ...prev, studentName: name }));
  };

  const resetAllProgress = () => {
    if (student) {
      const reset = {
        studentName: student.fullName,
        currentClass: student.classLevel,
        currentSubject: 'mathematics' as SubjectId,
        lastActiveSubConceptId: 'c8-math-linear-sub2',
        streakDays: 1,
        studyMinutes: 0,
        progressBySubConcept: {}
      };
      setState(reset);
      try {
        localStorage.removeItem(`scimath_student_progress_${student.id}`);
      } catch (e) {
        // ignore
      }
    } else {
      setState(BLANK_STATE);
    }
  };

  const getConceptProgressPercentage = (conceptId: string): number => {
    const concept = CURRICULUM_DATA.find((c) => c.id === conceptId);
    if (!concept || concept.subConcepts.length === 0) return 0;

    let totalScore = 0;
    concept.subConcepts.forEach((sc) => {
      const p = state.progressBySubConcept[sc.id];
      totalScore += calculateSubConceptCompletion(p);
    });

    return Math.round(totalScore / concept.subConcepts.length);
  };

  const getSubjectProgressPercentage = (classLevel: ClassLevel, subjectId: SubjectId): number => {
    const concepts = CURRICULUM_DATA.filter((c) => c.classLevel === classLevel && c.subjectId === subjectId);
    if (concepts.length === 0) return 0;

    let totalPercentage = 0;
    concepts.forEach((c) => {
      totalPercentage += getConceptProgressPercentage(c.id);
    });

    return Math.round(totalPercentage / concepts.length);
  };

  const getOverallStats = () => {
    let totalSubConcepts = 0;
    let completedSubConcepts = 0;
    let passedAssessmentsCount = 0;

    CURRICULUM_DATA.forEach((concept) => {
      totalSubConcepts += concept.subConcepts.length;
      concept.subConcepts.forEach((sc) => {
        const p = state.progressBySubConcept[sc.id];
        if (p?.isCompleted) {
          completedSubConcepts++;
        }
        if (p?.assessmentPassed) {
          passedAssessmentsCount++;
        }
      });
    });

    const mathConcepts = CURRICULUM_DATA.filter((c) => c.subjectId === 'mathematics');
    const scienceConcepts = CURRICULUM_DATA.filter((c) => c.subjectId === 'science');

    const mathScore = mathConcepts.reduce((acc, c) => acc + getConceptProgressPercentage(c.id), 0) / (mathConcepts.length || 1);
    const scienceScore = scienceConcepts.reduce((acc, c) => acc + getConceptProgressPercentage(c.id), 0) / (scienceConcepts.length || 1);

    const overallPercentage = Math.round((mathScore + scienceScore) / 2);

    return {
      totalSubConcepts,
      completedSubConcepts,
      overallPercentage,
      mathPercentage: Math.round(mathScore),
      sciencePercentage: Math.round(scienceScore),
      passedAssessmentsCount
    };
  };

  return (
    <ProgressContext.Provider
      value={{
        state,
        calculateSubConceptCompletion,
        isSubConceptUnlocked,
        markLessonComplete,
        markActivityComplete,
        markPracticeComplete,
        recordAssessmentAttempt,
        setActiveClass,
        setActiveSubject,
        setLastActiveSubConcept,
        setStudentName,
        resetAllProgress,
        getConceptProgressPercentage,
        getSubjectProgressPercentage,
        getOverallStats
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
