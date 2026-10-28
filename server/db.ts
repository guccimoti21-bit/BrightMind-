import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { CURRICULUM_DATA, CLASS_METADATA } from '../src/data/curriculumData.ts';
import { Concept, SubConcept, AssessmentQuestion } from '../src/types/curriculum.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'scimath_db.json');

export interface AuditLog {
  id: string;
  timestamp: number;
  adminUsername: string;
  action: string;
  category: 'auth' | 'content' | 'rules' | 'media' | 'security' | 'quizzes' | 'resources';
  details: string;
  ip?: string;
}

export interface LearningResourceItem {
  id: string;
  title: string;
  description?: string;
  resourceType: 'google_drive' | 'youtube';
  resourceUrl: string;
  classLevel: number;
  subject: string;
  chapterId: string;
  chapterTitle?: string;
  subConceptId?: string;
  subConceptTitle?: string;
  isActive: boolean;
  sortOrder: number;
  createdBy?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ChapterQuizLink {
  id: string;
  classLevel: number;
  subjectId: string;
  conceptId: string;
  chapterTitle?: string;
  title: string;
  quizUrl: string;
  platformName?: string;
  description?: string;
  timeLimitMinutes?: number;
  questionCount?: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface LearningRules {
  lessonWeight: number; // default 30
  activityWeight: number; // default 20
  practiceWeight: number; // default 20
  assessmentWeight: number; // default 30
  minAssessmentScore: number; // default 80%
  minCompletionScore: number; // default 80%
  allowRevisit: boolean;
  questionsPerAssessment: number;
  maxRetries: number; // 0 = unlimited
}

export interface AppearanceConfig {
  siteTitle: string;
  tagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroBadge: string;
  announcementBanner: {
    enabled: boolean;
    text: string;
    linkText?: string;
  };
  footerNotice: string;
  supportEmail: string;
}

export interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  classLevel?: number;
  subjectId?: string;
  altText: string;
  uploadedAt: number;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  salt: string;
  mustChangePassword: boolean;
  role: 'super_admin' | 'content_manager';
  createdAt: number;
  lastLoginAt?: number;
}

export interface HomepageImageEntry {
  id: 'image1' | 'image2';
  imageUrl: string;
  title?: string;
  altText?: string;
  storagePath?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  updatedAt: number;
}

export interface HomepageImagesData {
  image1: HomepageImageEntry | null;
  image2: HomepageImageEntry | null;
}

export interface DatabaseSchema {
  admin: AdminUser;
  rules: LearningRules;
  appearance: AppearanceConfig;
  classes: typeof CLASS_METADATA;
  concepts: (Concept & { status: 'published' | 'draft' | 'archived'; updatedAt: number })[];
  questions: (AssessmentQuestion & {
    classLevel: number;
    subjectId: string;
    conceptId: string;
    subConceptId: string;
    difficulty: 'easy' | 'medium' | 'hard';
    status: 'published' | 'draft';
  })[];
  media: MediaItem[];
  chapterQuizzes: ChapterQuizLink[];
  homepageImages?: HomepageImagesData;
  learningResources?: LearningResourceItem[];
  auditLogs: AuditLog[];
}

// Initial password: 434241 (hashed securely using scrypt)
function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  const hash = hashPassword(password, salt);
  const hashBuf = Buffer.from(hash, 'hex');
  const storedBuf = Buffer.from(storedHash, 'hex');
  if (hashBuf.length !== storedBuf.length) return false;
  return crypto.timingSafeEqual(hashBuf, storedBuf);
}

export function getDefaultChapterQuizzes(): ChapterQuizLink[] {
  return [];
}


function getDefaultDatabase(): DatabaseSchema {
  const initialSalt = generateSalt();
  // Hash the initial required setup password 434241
  const initialHash = hashPassword('434241', initialSalt);

  // Flatten questions from curriculum data for question bank
  const initialQuestions: DatabaseSchema['questions'] = [];
  CURRICULUM_DATA.forEach((concept) => {
    concept.subConcepts.forEach((sub) => {
      sub.assessmentQuestions.forEach((q) => {
        initialQuestions.push({
          ...q,
          classLevel: concept.classLevel,
          subjectId: concept.subjectId,
          conceptId: concept.id,
          subConceptId: sub.id,
          difficulty: q.category === 'reasoning' ? 'hard' : q.category === 'application' ? 'medium' : 'easy',
          status: 'published'
        });
      });
    });
  });

  return {
    admin: {
      id: 'admin-primary',
      username: 'admin@scimath.academy',
      email: 'admin@scimath.academy',
      passwordHash: initialHash,
      salt: initialSalt,
      mustChangePassword: true,
      role: 'super_admin',
      createdAt: Date.now()
    },
    rules: {
      lessonWeight: 30,
      activityWeight: 20,
      practiceWeight: 20,
      assessmentWeight: 30,
      minAssessmentScore: 80,
      minCompletionScore: 80,
      allowRevisit: true,
      questionsPerAssessment: 5,
      maxRetries: 0
    },
    appearance: {
      siteTitle: 'BrightMind Learning',
      tagline: 'Interactive Science & Mathematics Learning Platform for Classes 6 to 10',
      heroHeadline: 'Discover Science. Master Mathematics.',
      heroSubheadline: 'Explore concepts, experiment with ideas, solve real-world problems, and learn at your own pace with interactive lessons designed for Classes 6–10.',
      heroBadge: 'Interactive EdTech Platform for Classes 6–10',
      announcementBanner: {
        enabled: true,
        text: 'New: Interactive Physics & Algebra Laboratory modules for Classes 6–10 are now active.',
        linkText: 'Explore Featured Demo'
      },
      footerNotice: '© 2026 BrightMind Learning. Built with NCERT & CBSE pedagogical rigor.',
      supportEmail: 'support@brightmind.learning'
    },
    classes: CLASS_METADATA,
    concepts: CURRICULUM_DATA.map((c) => ({
      ...c,
      status: 'published' as const,
      updatedAt: Date.now()
    })),
    questions: initialQuestions,
    media: [
      {
        id: 'media-hero',
        filename: 'hero_scimath_academy_1792233656985.jpg',
        originalName: 'Hero Academic Illustration',
        url: '/src/assets/images/hero_scimath_academy_1792233656985.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 245000,
        altText: 'BrightMind Learning Hero Artwork with atomic model and equations',
        uploadedAt: Date.now() - 3600000
      },
      {
        id: 'media-sci',
        filename: 'science_discipline_banner_1792233656005.jpg',
        originalName: 'Science Discipline Banner',
        url: '/src/assets/images/science_discipline_banner_1792233656005.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 215000,
        altText: 'Science Exploration illustration with glassware and DNA',
        uploadedAt: Date.now() - 3600000
      },
      {
        id: 'media-math',
        filename: 'math_discipline_banner_1792233657743.jpg',
        originalName: 'Mathematics Discipline Banner',
        url: '/src/assets/images/math_discipline_banner_1792233657743.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 220000,
        altText: 'Mathematics illustration with geometric polyhedra and spiral',
        uploadedAt: Date.now() - 3600000
      },
      {
        id: 'media-balance',
        filename: 'balance_scale_demonstration_1792233657274.jpg',
        originalName: 'Balance Scale Demonstration',
        url: '/src/assets/images/balance_scale_demonstration_1792233657274.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 195000,
        altText: 'Physics & Algebra balance scale diagram',
        uploadedAt: Date.now() - 3600000
      }
    ],
    chapterQuizzes: getDefaultChapterQuizzes(),
    homepageImages: {
      image1: null,
      image2: null
    },
    learningResources: [],
    auditLogs: [
      {
        id: 'audit-init',
        timestamp: Date.now() - 7200000,
        adminUsername: 'system',
        category: 'auth',
        action: 'System Initialized',
        details: 'Initial administrator account and curriculum database seeded securely.'
      }
    ]
  };
}

let inMemoryDb: DatabaseSchema | null = null;

export function getDb(): DatabaseSchema {
  if (inMemoryDb) {
    if (!inMemoryDb.chapterQuizzes) {
      inMemoryDb.chapterQuizzes = getDefaultChapterQuizzes();
    }
    if (!inMemoryDb.homepageImages) {
      inMemoryDb.homepageImages = { image1: null, image2: null };
    }
    if (!inMemoryDb.learningResources) {
      inMemoryDb.learningResources = [];
    }
    return inMemoryDb;
  }

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      inMemoryDb = JSON.parse(content);
      if (!inMemoryDb!.chapterQuizzes) {
        inMemoryDb!.chapterQuizzes = getDefaultChapterQuizzes();
      }
      if (!inMemoryDb!.homepageImages) {
        inMemoryDb!.homepageImages = { image1: null, image2: null };
      }
      if (!inMemoryDb!.learningResources) {
        inMemoryDb!.learningResources = [];
      }
      return inMemoryDb!;
    } catch (err) {
      console.error('Failed reading DB file, recreating default:', err);
    }
  }

  inMemoryDb = getDefaultDatabase();
  saveDb(inMemoryDb);
  return inMemoryDb;
}

export function saveDb(data: DatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  inMemoryDb = data;
  const tempFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}

export function addAuditLog(
  adminUsername: string,
  category: AuditLog['category'],
  action: string,
  details: string,
  ip?: string
): void {
  const db = getDb();
  const log: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    adminUsername,
    category,
    action,
    details,
    ip
  };
  db.auditLogs.unshift(log);
  // Keep last 300 logs
  if (db.auditLogs.length > 300) {
    db.auditLogs = db.auditLogs.slice(0, 300);
  }
  saveDb(db);
}
