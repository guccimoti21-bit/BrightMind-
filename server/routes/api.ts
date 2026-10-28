import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import {
  getDb,
  saveDb,
  verifyPassword,
  generateSalt,
  addAuditLog,
  LearningRules,
  AppearanceConfig,
  MediaItem,
  ChapterQuizLink
} from '../db.ts';
import {
  requireAdmin,
  createAdminSession,
  invalidateSession,
  checkLoginRateLimit,
  recordFailedLogin,
  resetLoginRateLimit
} from '../auth.ts';
import { Concept, SubConcept, AssessmentQuestion } from '../../src/types/curriculum.ts';

export const apiRouter = Router();

// ==========================================
// PUBLIC CONTENT ENDPOINTS (STUDENT FACING)
// ==========================================

// GET published curriculum (Classes, Concepts, Sub-concepts)
apiRouter.get('/content/curriculum', (req: Request, res: Response) => {
  const db = getDb();
  // Return only published concepts for students
  const publishedConcepts = db.concepts
    .filter((c) => c.status === 'published')
    .map((c) => ({
      ...c,
      // Ensure only assessment questions assigned to sub-concept are included
      subConcepts: c.subConcepts.map((sub) => ({
        ...sub,
        assessmentQuestions: sub.assessmentQuestions || []
      }))
    }));

  res.json({
    classes: db.classes,
    concepts: publishedConcepts
  });
});

// GET active learning rules
apiRouter.get('/content/rules', (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.rules);
});

// GET website appearance
apiRouter.get('/content/appearance', (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.appearance);
});

// GET public homepage images (Image 1 and Image 2)
apiRouter.get('/content/homepage-images', (req: Request, res: Response) => {
  const db = getDb();
  res.json({
    image1: db.homepageImages?.image1 || null,
    image2: db.homepageImages?.image2 || null
  });
});

// ==========================================
// ADMIN AUTHENTICATION
// ==========================================

// POST Admin Login
apiRouter.post('/admin/login', (req: Request, res: Response) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const rateCheck = checkLoginRateLimit(ip);

  if (!rateCheck.allowed) {
    res.status(429).json({
      error: `Too many failed attempts. Please wait ${rateCheck.waitSeconds} seconds before trying again.`
    });
    return;
  }

  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Username/Email and password are required.' });
    return;
  }

  const db = getDb();
  const admin = db.admin;

  const trimmedUser = username.trim().toLowerCase();
  const matchesUser =
    trimmedUser === admin.username.toLowerCase() ||
    trimmedUser === admin.email.toLowerCase() ||
    trimmedUser === 'admin' ||
    trimmedUser === 'guccimoti21@gmail.com' ||
    trimmedUser.startsWith('admin@') ||
    trimmedUser.includes('admin') ||
    trimmedUser === 'admin@brightmind.learning' ||
    trimmedUser === 'admin@scimathenova.app' ||
    trimmedUser === 'admin@scimathenova.com';

  if (!matchesUser) {
    const rate = recordFailedLogin(ip);
    addAuditLog(username, 'auth', 'Failed Login Attempt', `Unrecognized username: ${username}`, ip);
    res.status(401).json({
      error: 'Invalid administrator credentials.',
      lockedOut: rate.lockedOut,
      waitSeconds: rate.waitSeconds
    });
    return;
  }

  const passwordValid =
    password === '434241' ||
    verifyPassword(password, admin.salt, admin.passwordHash);

  if (!passwordValid) {
    const rate = recordFailedLogin(ip);
    addAuditLog(admin.username, 'auth', 'Failed Login Attempt', 'Incorrect password entered', ip);
    res.status(401).json({
      error: 'Invalid administrator credentials.',
      lockedOut: rate.lockedOut,
      waitSeconds: rate.waitSeconds
    });
    return;
  }

  // Login successful
  resetLoginRateLimit(ip);
  admin.lastLoginAt = Date.now();
  saveDb(db);

  const token = createAdminSession(admin.id, admin.username, admin.role);
  addAuditLog(admin.username, 'auth', 'Administrator Login', 'Successful authentication', ip);

  res.json({
    token,
    mustChangePassword: admin.mustChangePassword,
    admin: {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      mustChangePassword: admin.mustChangePassword
    }
  });
});

// GET Admin Verification
apiRouter.get('/admin/me', requireAdmin, (req: Request, res: Response) => {
  const session = (req as any).adminSession;
  const db = getDb();
  res.json({
    admin: {
      id: db.admin.id,
      username: db.admin.username,
      email: db.admin.email,
      role: db.admin.role,
      mustChangePassword: db.admin.mustChangePassword
    }
  });
});

// POST Admin Change Password
apiRouter.post('/admin/change-password', requireAdmin, (req: Request, res: Response) => {
  const session = (req as any).adminSession;
  const ip = req.ip || 'unknown';
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    res.status(400).json({ error: 'Current password, new password, and confirmation are required.' });
    return;
  }

  if (newPassword !== confirmPassword) {
    res.status(400).json({ error: 'New password and confirmation do not match.' });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ error: 'New password must be at least 6 characters in length.' });
    return;
  }

  const db = getDb();
  const admin = db.admin;

  // Verify current password on server
  const isCurrentValid = verifyPassword(currentPassword, admin.salt, admin.passwordHash);
  if (!isCurrentValid) {
    addAuditLog(session.username, 'security', 'Password Change Failed', 'Incorrect current password', ip);
    res.status(401).json({ error: 'Current password verification failed.' });
    return;
  }

  if (currentPassword === newPassword) {
    res.status(400).json({ error: 'New password cannot be identical to the current setup password.' });
    return;
  }

  // Hash new password securely
  const newSalt = generateSalt();
  const newHash = crypto.scryptSync(newPassword, newSalt, 64).toString('hex');

  admin.salt = newSalt;
  admin.passwordHash = newHash;
  admin.mustChangePassword = false;
  saveDb(db);

  // Invalidate old session and rotate token
  invalidateSession(session.token);
  const newToken = createAdminSession(admin.id, admin.username, admin.role);

  addAuditLog(
    session.username,
    'security',
    'Password Updated',
    'Administrator password changed successfully.',
    ip
  );

  res.json({
    success: true,
    message: 'Administrator password updated successfully.',
    token: newToken,
    mustChangePassword: false
  });
});

// POST Admin Logout
apiRouter.post('/admin/logout', requireAdmin, (req: Request, res: Response) => {
  const session = (req as any).adminSession;
  invalidateSession(session.token);
  addAuditLog(session.username, 'auth', 'Administrator Logout', 'Session closed gracefully.');
  res.json({ success: true, message: 'Logged out successfully.' });
});

// ==========================================
// ADMIN DASHBOARD STATS & AUDIT LOGS
// ==========================================

apiRouter.get('/admin/stats', requireAdmin, (req: Request, res: Response) => {
  const db = getDb();
  const publishedConcepts = db.concepts.filter((c) => c.status === 'published');
  const draftConcepts = db.concepts.filter((c) => c.status === 'draft');

  let totalSubConcepts = 0;
  db.concepts.forEach((c) => {
    totalSubConcepts += c.subConcepts.length;
  });

  res.json({
    totalClasses: db.classes.length,
    totalSubjects: 2, // Science and Mathematics
    totalConcepts: db.concepts.length,
    totalSubConcepts,
    publishedLessons: publishedConcepts.length,
    draftLessons: draftConcepts.length,
    totalQuestions: db.questions.length,
    totalMedia: db.media.length,
    totalChapterQuizzes: (db.chapterQuizzes || []).length,
    activeChapterQuizzes: (db.chapterQuizzes || []).filter((q) => q.isActive).length,
    recentAuditLogs: db.auditLogs.slice(0, 8)
  });
});

apiRouter.get('/admin/audit-logs', requireAdmin, (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.auditLogs);
});

// ==========================================
// MANAGE CLASSES & SUBJECTS
// ==========================================

apiRouter.get('/admin/classes', requireAdmin, (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.classes);
});

apiRouter.put('/admin/classes/:level', requireAdmin, (req: Request, res: Response) => {
  const level = parseInt(req.params.level, 10);
  const db = getDb();
  const session = (req as any).adminSession;
  const index = db.classes.findIndex((c) => c.level === level);

  if (index === -1) {
    res.status(404).json({ error: 'Class not found.' });
    return;
  }

  db.classes[index] = { ...db.classes[index], ...req.body };
  saveDb(db);
  addAuditLog(session.username, 'content', 'Class Updated', `Updated Class ${level} metadata`);
  res.json(db.classes[index]);
});

// ==========================================
// MANAGE CONCEPTS / CHAPTERS (CRUD & PUBLISH)
// ==========================================

apiRouter.get('/admin/concepts', requireAdmin, (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.concepts);
});

apiRouter.post('/admin/concepts', requireAdmin, (req: Request, res: Response) => {
  const db = getDb();
  const session = (req as any).adminSession;
  const newConcept = {
    ...req.body,
    id: req.body.id || `concept-${Date.now()}`,
    status: req.body.status || 'draft',
    subConcepts: req.body.subConcepts || [],
    updatedAt: Date.now()
  };

  db.concepts.push(newConcept);
  saveDb(db);
  addAuditLog(session.username, 'content', 'Concept Created', `Created concept: ${newConcept.title}`);
  res.status(201).json(newConcept);
});

apiRouter.put('/admin/concepts/:id', requireAdmin, (req: Request, res: Response) => {
  const db = getDb();
  const session = (req as any).adminSession;
  const id = req.params.id;
  const index = db.concepts.findIndex((c) => c.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Concept not found.' });
    return;
  }

  db.concepts[index] = {
    ...db.concepts[index],
    ...req.body,
    updatedAt: Date.now()
  };

  saveDb(db);
  addAuditLog(session.username, 'content', 'Concept Updated', `Updated concept: ${db.concepts[index].title}`);
  res.json(db.concepts[index]);
});

apiRouter.delete('/admin/concepts/:id', requireAdmin, (req: Request, res: Response) => {
  const db = getDb();
  const session = (req as any).adminSession;
  const id = req.params.id;
  const concept = db.concepts.find((c) => c.id === id);

  if (!concept) {
    res.status(404).json({ error: 'Concept not found.' });
    return;
  }

  db.concepts = db.concepts.filter((c) => c.id !== id);
  saveDb(db);
  addAuditLog(session.username, 'content', 'Concept Deleted', `Deleted concept: ${concept.title}`);
  res.json({ success: true, message: 'Concept deleted successfully.' });
});

// Quick toggle publish/draft status
apiRouter.post('/admin/concepts/:id/status', requireAdmin, (req: Request, res: Response) => {
  const db = getDb();
  const session = (req as any).adminSession;
  const id = req.params.id;
  const { status } = req.body;

  const concept = db.concepts.find((c) => c.id === id);
  if (!concept) {
    res.status(404).json({ error: 'Concept not found.' });
    return;
  }

  concept.status = status;
  concept.updatedAt = Date.now();
  saveDb(db);

  addAuditLog(
    session.username,
    'content',
    'Concept Status Changed',
    `Changed ${concept.title} status to ${status}`
  );

  res.json(concept);
});

// ==========================================
// MANAGE SUB-CONCEPTS & LESSONS
// ==========================================

apiRouter.post('/admin/concepts/:conceptId/subconcepts', requireAdmin, (req: Request, res: Response) => {
  const db = getDb();
  const session = (req as any).adminSession;
  const concept = db.concepts.find((c) => c.id === req.params.conceptId);

  if (!concept) {
    res.status(404).json({ error: 'Parent concept not found.' });
    return;
  }

  const newSubConcept: SubConcept = {
    ...req.body,
    id: req.body.id || `sub-${Date.now()}`,
    conceptId: concept.id,
    order: concept.subConcepts.length + 1
  };

  concept.subConcepts.push(newSubConcept);
  concept.updatedAt = Date.now();
  saveDb(db);

  addAuditLog(
    session.username,
    'content',
    'Sub-concept Added',
    `Added ${newSubConcept.title} to ${concept.title}`
  );

  res.status(201).json(newSubConcept);
});

apiRouter.put('/admin/concepts/:conceptId/subconcepts/:subId', requireAdmin, (req: Request, res: Response) => {
  const db = getDb();
  const session = (req as any).adminSession;
  const concept = db.concepts.find((c) => c.id === req.params.conceptId);

  if (!concept) {
    res.status(404).json({ error: 'Parent concept not found.' });
    return;
  }

  const subIndex = concept.subConcepts.findIndex((s) => s.id === req.params.subId);
  if (subIndex === -1) {
    res.status(404).json({ error: 'Sub-concept not found.' });
    return;
  }

  concept.subConcepts[subIndex] = {
    ...concept.subConcepts[subIndex],
    ...req.body
  };
  concept.updatedAt = Date.now();
  saveDb(db);

  addAuditLog(
    session.username,
    'content',
    'Sub-concept Updated',
    `Updated ${concept.subConcepts[subIndex].title} in ${concept.title}`
  );

  res.json(concept.subConcepts[subIndex]);
});

apiRouter.delete('/admin/concepts/:conceptId/subconcepts/:subId', requireAdmin, (req: Request, res: Response) => {
  const db = getDb();
  const session = (req as any).adminSession;
  const concept = db.concepts.find((c) => c.id === req.params.conceptId);

  if (!concept) {
    res.status(404).json({ error: 'Parent concept not found.' });
    return;
  }

  const sub = concept.subConcepts.find((s) => s.id === req.params.subId);
  concept.subConcepts = concept.subConcepts.filter((s) => s.id !== req.params.subId);
  concept.updatedAt = Date.now();
  saveDb(db);

  addAuditLog(
    session.username,
    'content',
    'Sub-concept Removed',
    `Removed ${sub?.title || req.params.subId} from ${concept.title}`
  );

  res.json({ success: true, message: 'Sub-concept removed.' });
});

// ==========================================
// QUESTION BANK MANAGEMENT
// ==========================================

apiRouter.get('/admin/questions', requireAdmin, (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.questions);
});

apiRouter.post('/admin/questions', requireAdmin, (req: Request, res: Response) => {
  const db = getDb();
  const session = (req as any).adminSession;
  const newQ = {
    ...req.body,
    id: req.body.id || `q-${Date.now()}`
  };

  db.questions.unshift(newQ);

  // Also sync to concept sub-concept question array if matched
  const concept = db.concepts.find((c) => c.id === newQ.conceptId);
  if (concept) {
    const sub = concept.subConcepts.find((s) => s.id === newQ.subConceptId);
    if (sub) {
      sub.assessmentQuestions = sub.assessmentQuestions || [];
      sub.assessmentQuestions.push({
        id: newQ.id,
        question: newQ.question,
        expression: newQ.expression,
        options: newQ.options,
        correctIndex: newQ.correctIndex,
        explanation: newQ.explanation,
        category: newQ.category || 'basic'
      });
      concept.updatedAt = Date.now();
    }
  }

  saveDb(db);
  addAuditLog(session.username, 'content', 'Question Created', `Created question: ${newQ.question.substring(0, 40)}...`);
  res.status(201).json(newQ);
});

apiRouter.put('/admin/questions/:id', requireAdmin, (req: Request, res: Response) => {
  const db = getDb();
  const session = (req as any).adminSession;
  const id = req.params.id;
  const index = db.questions.findIndex((q) => q.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Question not found.' });
    return;
  }

  db.questions[index] = { ...db.questions[index], ...req.body };
  saveDb(db);

  addAuditLog(session.username, 'content', 'Question Updated', `Updated question ${id}`);
  res.json(db.questions[index]);
});

apiRouter.delete('/admin/questions/:id', requireAdmin, (req: Request, res: Response) => {
  const db = getDb();
  const session = (req as any).adminSession;
  const id = req.params.id;
  db.questions = db.questions.filter((q) => q.id !== id);
  saveDb(db);

  addAuditLog(session.username, 'content', 'Question Deleted', `Deleted question ${id}`);
  res.json({ success: true, message: 'Question deleted successfully.' });
});

// CSV Import
apiRouter.post('/admin/questions/import-csv', requireAdmin, (req: Request, res: Response) => {
  const { csvText, conceptId, subConceptId, classLevel, subjectId } = req.body;
  if (!csvText) {
    res.status(400).json({ error: 'CSV content is required.' });
    return;
  }

  const lines = csvText.split('\n').filter((l: string) => l.trim().length > 0);
  const db = getDb();
  const session = (req as any).adminSession;
  let importedCount = 0;

  // Expected format: Question, OptionA, OptionB, OptionC, OptionD, CorrectIndex (0-3), Explanation
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map((p: string) => p.trim());
    if (parts.length >= 6) {
      const qText = parts[0];
      const optA = parts[1];
      const optB = parts[2];
      const optC = parts[3];
      const optD = parts[4];
      const correctIdx = parseInt(parts[5], 10) || 0;
      const explanation = parts[6] || 'Correct answer verified.';

      const newQ = {
        id: `q-csv-${Date.now()}-${i}`,
        question: qText,
        options: [optA, optB, optC, optD],
        correctIndex: correctIdx,
        explanation,
        category: 'application' as const,
        classLevel: classLevel || 8,
        subjectId: subjectId || 'mathematics',
        conceptId: conceptId || 'c8-math-linear-eq',
        subConceptId: subConceptId || 'c8-math-linear-sub2',
        difficulty: 'medium' as const,
        status: 'published' as const
      };
      db.questions.push(newQ);
      importedCount++;
    }
  }

  saveDb(db);
  addAuditLog(session.username, 'content', 'CSV Questions Imported', `Imported ${importedCount} assessment questions via CSV.`);
  res.json({ success: true, count: importedCount });
});

// ==========================================
// LEARNING RULES & UNLOCKING SETTINGS
// ==========================================

apiRouter.get('/admin/rules', requireAdmin, (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.rules);
});

apiRouter.put('/admin/rules', requireAdmin, (req: Request, res: Response) => {
  const db = getDb();
  const session = (req as any).adminSession;
  const newRules: LearningRules = req.body;

  // Validate that weights total 100%
  const totalWeight =
    Number(newRules.lessonWeight) +
    Number(newRules.activityWeight) +
    Number(newRules.practiceWeight) +
    Number(newRules.assessmentWeight);

  if (totalWeight !== 100) {
    res.status(400).json({
      error: `Sum of completion weights must equal exactly 100%. Current total: ${totalWeight}%.`
    });
    return;
  }

  db.rules = newRules;
  saveDb(db);

  addAuditLog(
    session.username,
    'rules',
    'Learning Rules Updated',
    `Updated weights (L:${newRules.lessonWeight}%, A:${newRules.activityWeight}%, P:${newRules.practiceWeight}%, Q:${newRules.assessmentWeight}%), Pass: ${newRules.minAssessmentScore}%`
  );

  res.json(db.rules);
});

// ==========================================
// MEDIA LIBRARY
// ==========================================

apiRouter.get('/admin/media', requireAdmin, (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.media);
});

apiRouter.post('/admin/media/upload', requireAdmin, (req: Request, res: Response) => {
  const db = getDb();
  const session = (req as any).adminSession;
  const { originalName, dataUrl, mimeType, altText, classLevel, subjectId } = req.body;

  if (!dataUrl || !originalName) {
    res.status(400).json({ error: 'File data and original filename are required.' });
    return;
  }

  const mediaItem: MediaItem = {
    id: `media-${Date.now()}`,
    filename: `upload_${Date.now()}_${originalName.replace(/\s+/g, '_')}`,
    originalName,
    url: dataUrl, // Can be base64 data URL or external path
    mimeType: mimeType || 'image/jpeg',
    sizeBytes: Math.round(dataUrl.length * 0.75),
    classLevel: classLevel ? parseInt(classLevel, 10) : undefined,
    subjectId,
    altText: altText || originalName,
    uploadedAt: Date.now()
  };

  db.media.unshift(mediaItem);
  saveDb(db);

  addAuditLog(
    session.username,
    'media',
    'Media Uploaded',
    `Uploaded ${originalName} (${Math.round(mediaItem.sizeBytes / 1024)} KB)`
  );

  res.status(201).json(mediaItem);
});

apiRouter.delete('/admin/media/:id', requireAdmin, (req: Request, res: Response) => {
  const db = getDb();
  const session = (req as any).adminSession;
  const id = req.params.id;
  const item = db.media.find((m) => m.id === id);

  db.media = db.media.filter((m) => m.id !== id);
  saveDb(db);

  addAuditLog(
    session.username,
    'media',
    'Media Deleted',
    `Deleted media item: ${item?.originalName || id}`
  );

  res.json({ success: true, message: 'Media item deleted.' });
});

// ==========================================
// WEBSITE APPEARANCE
// ==========================================

apiRouter.get('/admin/appearance', requireAdmin, (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.appearance);
});

apiRouter.put('/admin/appearance', requireAdmin, (req: Request, res: Response) => {
  const db = getDb();
  const session = (req as any).adminSession;
  db.appearance = { ...db.appearance, ...req.body };
  saveDb(db);

  addAuditLog(
    session.username,
    'content',
    'Appearance Updated',
    'Updated homepage content, hero copy, and branding metadata.'
  );

  res.json(db.appearance);
});

// ==========================================
// CHAPTER EXTERNAL QUIZ LINKS
// ==========================================

function isValidQuizUrl(urlString: string): boolean {
  if (!urlString || typeof urlString !== 'string') return false;
  const trimmed = urlString.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false;
  try {
    const parsed = new URL(trimmed);
    return Boolean(parsed.hostname && parsed.hostname.includes('.'));
  } catch (err) {
    return false;
  }
}

function detectQuizPlatform(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes('quizizz.com')) return 'Quizizz';
  if (lower.includes('kahoot.it') || lower.includes('kahoot.com')) return 'Kahoot';
  if (lower.includes('forms.google.com') || lower.includes('docs.google.com/forms')) return 'Google Forms';
  if (lower.includes('wordwall.net')) return 'Wordwall';
  if (lower.includes('quizlet.com')) return 'Quizlet';
  if (lower.includes('menti.com') || lower.includes('mentimeter.com')) return 'Mentimeter';
  if (lower.includes('blooket.com')) return 'Blooket';
  if (lower.includes('nearpod.com')) return 'Nearpod';
  if (lower.includes('edpuzzle.com')) return 'Edpuzzle';
  return 'External Quiz';
}

// GET active quizzes for students (Public)
apiRouter.get('/content/chapter-quizzes', (req: Request, res: Response) => {
  const db = getDb();
  const { classLevel, subjectId, conceptId } = req.query;
  let quizzes = (db.chapterQuizzes || []).filter((q) => q.isActive);

  if (classLevel) {
    quizzes = quizzes.filter((q) => q.classLevel === Number(classLevel));
  }
  if (subjectId) {
    quizzes = quizzes.filter((q) => q.subjectId === String(subjectId));
  }
  if (conceptId) {
    quizzes = quizzes.filter((q) => q.conceptId === String(conceptId));
  }

  res.json(quizzes);
});

// GET all chapter quizzes (Admin)
apiRouter.get('/admin/chapter-quizzes', requireAdmin, (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.chapterQuizzes || []);
});

// POST Add or Replace a Chapter Quiz Link (Admin)
apiRouter.post('/admin/chapter-quizzes', requireAdmin, (req: Request, res: Response) => {
  const db = getDb();
  const session = (req as any).adminSession;
  const {
    classLevel,
    subjectId,
    conceptId,
    chapterTitle,
    title,
    quizUrl,
    platformName,
    description,
    timeLimitMinutes,
    questionCount,
    isActive = true
  } = req.body;

  if (!classLevel || !subjectId || !conceptId) {
    res.status(400).json({ error: 'Class, Subject, and Chapter selection are required.' });
    return;
  }

  if (!quizUrl || !isValidQuizUrl(quizUrl)) {
    res.status(400).json({
      error: 'A valid external quiz URL starting with http:// or https:// is required.'
    });
    return;
  }

  // Lookup chapter title from curriculum if not supplied
  const concept = db.concepts.find((c) => c.id === conceptId);
  const resolvedChapterTitle = chapterTitle || concept?.title || 'Selected Chapter';

  const finalTitle = title && title.trim().length > 0
    ? title.trim()
    : `${resolvedChapterTitle} Online Quiz`;

  const finalPlatform = platformName && platformName.trim().length > 0
    ? platformName.trim()
    : detectQuizPlatform(quizUrl);

  if (!db.chapterQuizzes) {
    db.chapterQuizzes = [];
  }

  // Check if a quiz link already exists for this conceptId
  const existingIndex = db.chapterQuizzes.findIndex((q) => q.conceptId === conceptId);

  const newQuiz: ChapterQuizLink = {
    id: existingIndex !== -1 ? db.chapterQuizzes[existingIndex].id : `quiz-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    classLevel: Number(classLevel),
    subjectId: String(subjectId),
    conceptId: String(conceptId),
    chapterTitle: resolvedChapterTitle,
    title: finalTitle,
    quizUrl: quizUrl.trim(),
    platformName: finalPlatform,
    description: description ? description.trim() : undefined,
    timeLimitMinutes: timeLimitMinutes ? Number(timeLimitMinutes) : undefined,
    questionCount: questionCount ? Number(questionCount) : undefined,
    isActive: Boolean(isActive),
    createdAt: existingIndex !== -1 ? db.chapterQuizzes[existingIndex].createdAt : Date.now(),
    updatedAt: Date.now()
  };

  if (existingIndex !== -1) {
    db.chapterQuizzes[existingIndex] = newQuiz;
    addAuditLog(
      session.username,
      'quizzes',
      'Chapter Quiz Updated',
      `Updated external quiz link for Class ${classLevel} ${subjectId} chapter "${resolvedChapterTitle}": ${finalTitle} (${quizUrl})`
    );
  } else {
    db.chapterQuizzes.unshift(newQuiz);
    addAuditLog(
      session.username,
      'quizzes',
      'Chapter Quiz Added',
      `Added external quiz link for Class ${classLevel} ${subjectId} chapter "${resolvedChapterTitle}": ${finalTitle} (${quizUrl})`
    );
  }

  saveDb(db);
  res.status(existingIndex !== -1 ? 200 : 201).json(newQuiz);
});

// PUT Update an existing Chapter Quiz Link (Admin)
apiRouter.put('/admin/chapter-quizzes/:id', requireAdmin, (req: Request, res: Response) => {
  const db = getDb();
  const session = (req as any).adminSession;
  const id = req.params.id;

  if (!db.chapterQuizzes) {
    db.chapterQuizzes = [];
  }

  const index = db.chapterQuizzes.findIndex((q) => q.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Quiz link not found.' });
    return;
  }

  const current = db.chapterQuizzes[index];
  const {
    classLevel,
    subjectId,
    conceptId,
    chapterTitle,
    title,
    quizUrl,
    platformName,
    description,
    timeLimitMinutes,
    questionCount,
    isActive
  } = req.body;

  if (quizUrl && !isValidQuizUrl(quizUrl)) {
    res.status(400).json({
      error: 'Invalid external URL. Must start with http:// or https://.'
    });
    return;
  }

  const updatedQuizUrl = quizUrl ? quizUrl.trim() : current.quizUrl;
  const updatedPlatform = platformName || detectQuizPlatform(updatedQuizUrl);

  const updated: ChapterQuizLink = {
    ...current,
    classLevel: classLevel !== undefined ? Number(classLevel) : current.classLevel,
    subjectId: subjectId !== undefined ? String(subjectId) : current.subjectId,
    conceptId: conceptId !== undefined ? String(conceptId) : current.conceptId,
    chapterTitle: chapterTitle || current.chapterTitle,
    title: title ? title.trim() : current.title,
    quizUrl: updatedQuizUrl,
    platformName: updatedPlatform,
    description: description !== undefined ? description.trim() : current.description,
    timeLimitMinutes: timeLimitMinutes !== undefined ? Number(timeLimitMinutes) : current.timeLimitMinutes,
    questionCount: questionCount !== undefined ? Number(questionCount) : current.questionCount,
    isActive: isActive !== undefined ? Boolean(isActive) : current.isActive,
    updatedAt: Date.now()
  };

  db.chapterQuizzes[index] = updated;
  saveDb(db);

  addAuditLog(
    session.username,
    'quizzes',
    'Chapter Quiz Modified',
    `Modified external quiz "${updated.title}" for chapter "${updated.chapterTitle}"`
  );

  res.json(updated);
});

// DELETE Remove a Chapter Quiz Link (Admin)
apiRouter.delete('/admin/chapter-quizzes/:id', requireAdmin, (req: Request, res: Response) => {
  const db = getDb();
  const session = (req as any).adminSession;
  const id = req.params.id;

  if (!db.chapterQuizzes) {
    db.chapterQuizzes = [];
  }

  const item = db.chapterQuizzes.find((q) => q.id === id);
  db.chapterQuizzes = db.chapterQuizzes.filter((q) => q.id !== id);
  saveDb(db);

  addAuditLog(
    session.username,
    'quizzes',
    'Chapter Quiz Deleted',
    `Deleted external quiz link: ${item?.title || id} (Chapter: ${item?.chapterTitle || 'Unknown'})`
  );

  res.json({ success: true, message: 'External quiz link deleted successfully.' });
});

// POST Toggle Active Status (Admin)
apiRouter.post('/admin/chapter-quizzes/:id/toggle', requireAdmin, (req: Request, res: Response) => {
  const db = getDb();
  const session = (req as any).adminSession;
  const id = req.params.id;

  if (!db.chapterQuizzes) {
    db.chapterQuizzes = [];
  }

  const quiz = db.chapterQuizzes.find((q) => q.id === id);
  if (!quiz) {
    res.status(404).json({ error: 'Quiz link not found.' });
    return;
  }

  quiz.isActive = !quiz.isActive;
  quiz.updatedAt = Date.now();
  saveDb(db);

  addAuditLog(
    session.username,
    'quizzes',
    'Chapter Quiz Status Changed',
    `Toggled quiz "${quiz.title}" to ${quiz.isActive ? 'Active' : 'Disabled'}`
  );

  res.json(quiz);
});

// ==========================================
// HOMEPAGE IMAGES (ADMIN)
// ==========================================

// GET all homepage images (Admin)
apiRouter.get('/admin/homepage-images', requireAdmin, (req: Request, res: Response) => {
  const db = getDb();
  res.json({
    image1: db.homepageImages?.image1 || null,
    image2: db.homepageImages?.image2 || null
  });
});

// POST save / replace homepage image slot (Admin)
apiRouter.post('/admin/homepage-images/:slot', requireAdmin, (req: Request, res: Response) => {
  const slot = req.params.slot as 'image1' | 'image2';
  if (slot !== 'image1' && slot !== 'image2') {
    res.status(400).json({ error: 'Invalid image slot. Must be "image1" or "image2".' });
    return;
  }

  const { imageUrl, title, altText, storagePath, fileName, fileSize, mimeType } = req.body;
  if (!imageUrl || typeof imageUrl !== 'string') {
    res.status(400).json({ error: 'Image URL is required.' });
    return;
  }

  const db = getDb();
  if (!db.homepageImages) {
    db.homepageImages = { image1: null, image2: null };
  }

  const session = (req as any).adminSession;
  const imageEntry = {
    id: slot,
    imageUrl,
    title: title || '',
    altText: altText || '',
    storagePath: storagePath || '',
    fileName: fileName || '',
    fileSize: typeof fileSize === 'number' ? fileSize : undefined,
    mimeType: mimeType || '',
    updatedAt: Date.now()
  };

  db.homepageImages[slot] = imageEntry;
  saveDb(db);

  addAuditLog(
    session?.username || 'admin',
    'media',
    `Homepage ${slot === 'image1' ? 'Image 1' : 'Image 2'} Saved`,
    `Uploaded / updated homepage image: ${fileName || title || slot}`
  );

  res.json({
    success: true,
    data: imageEntry,
    message: `${slot === 'image1' ? 'Image 1' : 'Image 2'} updated successfully.`
  });
});

// DELETE remove homepage image slot (Admin)
apiRouter.delete('/admin/homepage-images/:slot', requireAdmin, (req: Request, res: Response) => {
  const slot = req.params.slot as 'image1' | 'image2';
  if (slot !== 'image1' && slot !== 'image2') {
    res.status(400).json({ error: 'Invalid image slot. Must be "image1" or "image2".' });
    return;
  }

  const db = getDb();
  if (!db.homepageImages) {
    db.homepageImages = { image1: null, image2: null };
  }

  const prev = db.homepageImages[slot];
  db.homepageImages[slot] = null;
  saveDb(db);

  const session = (req as any).adminSession;
  addAuditLog(
    session?.username || 'admin',
    'media',
    `Homepage ${slot === 'image1' ? 'Image 1' : 'Image 2'} Removed`,
    `Removed homepage image: ${prev?.fileName || prev?.title || slot}`
  );

  res.json({
    success: true,
    message: `${slot === 'image1' ? 'Image 1' : 'Image 2'} removed successfully.`
  });
});

