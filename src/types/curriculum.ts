export type ClassLevel = 6 | 7 | 8 | 9 | 10;

export type SubjectId = 'science' | 'mathematics';

export interface LearningObjective {
  id: string;
  text: string;
}

export interface Definition {
  term: string;
  definition: string;
  formula?: string;
}

export interface StepBreakdown {
  title: string;
  content: string;
  callout?: string;
  formula?: string;
}

export interface RuleMistake {
  rule: string;
  commonMistake: string;
  whyItMatters: string;
}

export interface ConceptExplanation {
  introduction: string;
  keyDefinitions: Definition[];
  breakdownSteps: StepBreakdown[];
  rulesAndMistakes: RuleMistake[];
  keyTakeaway: string;
  diagramNote?: string;
}

export interface ActivityConfig {
  id: string;
  type: 'balance-scale' | 'ray-optics' | 'number-line' | 'cell-explorer' | 'fraction-strip';
  title: string;
  instructions: string;
  goal: string;
  defaultData?: Record<string, any>;
}

export interface WorkedStep {
  stepNumber: number;
  title: string;
  math: string;
  explanation: string;
}

export interface WorkedExample {
  id: string;
  problem: string;
  context?: string;
  steps: WorkedStep[];
  realWorldApplication?: string;
}

export interface GuidedPracticeQuestion {
  id: string;
  question: string;
  expression?: string;
  options: string[];
  correctIndex: number;
  hint: string;
  explanation: string;
}

export interface FormulaItem {
  name: string;
  expression: string;
}

export interface RevisionSummary {
  title: string;
  points: string[];
  formulas?: FormulaItem[];
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  expression?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: 'basic' | 'application' | 'reasoning';
}

export interface SubConcept {
  id: string;
  conceptId: string;
  order: number;
  title: string;
  shortDescription: string;
  estimatedMinutes: number;
  learningObjectives: string[];
  explanation: ConceptExplanation;
  activity: ActivityConfig;
  workedExamples: WorkedExample[];
  guidedPractice: GuidedPracticeQuestion[];
  revisionSummary: RevisionSummary;
  assessmentQuestions: AssessmentQuestion[];
}

export interface Concept {
  id: string;
  classLevel: ClassLevel;
  subjectId: SubjectId;
  title: string;
  description: string;
  category: string; // e.g., 'Algebra', 'Physics', 'Biology', etc.
  estimatedHours: number;
  iconName: string;
  subConcepts: SubConcept[];
}

export interface SubConceptProgress {
  subConceptId: string;
  lessonCompleted: boolean;     // 30% weight
  activityCompleted: boolean;   // 20% weight
  practiceCompleted: boolean;   // 20% weight
  assessmentPassed: boolean;    // 30% weight (requires score >= 80%)
  assessmentBestScore: number;  // 0 - 100%
  assessmentAttempts: {
    timestamp: number;
    score: number;
    passed: boolean;
  }[];
  overallCompletion: number;    // calculated 0 - 100%
  isUnlocked: boolean;
  isCompleted: boolean;
  lastVisitedAt: number;
}

export interface StudentProgressState {
  studentName: string;
  currentClass: ClassLevel;
  currentSubject: SubjectId;
  lastActiveSubConceptId: string;
  streakDays: number;
  studyMinutes: number;
  progressBySubConcept: Record<string, SubConceptProgress>;
}

export const COMPLETION_WEIGHTS = {
  lesson: 30,
  activity: 20,
  practice: 20,
  assessment: 30,
};

export const PASSING_ASSESSMENT_SCORE = 80;
export const UNLOCK_REQUIRED_COMPLETION = 80;
