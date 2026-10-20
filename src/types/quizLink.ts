import { ClassLevel, SubjectId } from './curriculum';

export interface ChapterQuizLink {
  id: string;
  classLevel: ClassLevel;
  subjectId: SubjectId;
  chapterId: string;       // Matches Concept.id
  chapterTitle: string;    // Display title of chapter
  quizUrl: string;         // External quiz website URL
  quizTitle?: string;      // e.g. "Linear Equations Mastery Challenge"
  platform?: string;       // e.g. "Kahoot!", "Quizizz", "Google Forms", "NCERT Official", "Custom"
  description?: string;    // Instructions / notes for students
  openInNewTab?: boolean;  // Default: true
  createdAt: number;
  updatedAt: number;
  clickCount?: number;     // Number of student clicks
}

export type QuizPlatform =
  | 'Kahoot!'
  | 'Quizizz'
  | 'Google Forms'
  | 'NCERT Official'
  | 'Mentimeter'
  | 'Quizlet'
  | 'Testmoz'
  | 'Custom';
