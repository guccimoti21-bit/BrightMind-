import { ChapterQuizLink, ClassLevel, SubjectId } from '../types/curriculum';

const LOCAL_STORAGE_KEY = 'scimath_chapter_quizzes_v3';
export const QUIZ_LINKS_UPDATED_EVENT = 'scimath-chapter-quizzes-updated';

// Starts empty: Quizzes are added exclusively via the admin portal
export const DEFAULT_CHAPTER_QUIZZES: ChapterQuizLink[] = [];

export function validateQuizUrl(url: string): { valid: boolean; error?: string } {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'Quiz URL cannot be empty.' };
  }
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return { valid: false, error: 'URL must start with http:// or https://' };
  }
  try {
    const parsed = new URL(trimmed);
    if (!parsed.hostname || !parsed.hostname.includes('.')) {
      return { valid: false, error: 'URL must contain a valid domain name.' };
    }
    return { valid: true };
  } catch (err) {
    return { valid: false, error: 'Please enter a well-formed website URL.' };
  }
}

export function detectQuizPlatform(url: string): string {
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

export function getCachedQuizLinks(): ChapterQuizLink[] {
  if (typeof window === 'undefined') return [];
  try {
    // Clear legacy mock caches if present
    localStorage.removeItem('scimath_chapter_quizzes_cache');
    localStorage.removeItem('scimath_chapter_quizzes_v2');

    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed reading quiz cache from localStorage:', e);
  }
  return [];
}

export function setCachedQuizLinks(quizzes: ChapterQuizLink[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(quizzes));
    window.dispatchEvent(new CustomEvent(QUIZ_LINKS_UPDATED_EVENT, { detail: quizzes }));
  } catch (e) {
    console.warn('Failed saving quiz cache to localStorage:', e);
  }
}

export async function fetchChapterQuizzes(token?: string, includeInactive = false): Promise<ChapterQuizLink[]> {
  try {
    const endpoint = token && includeInactive ? '/api/admin/chapter-quizzes' : '/api/content/chapter-quizzes';
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(endpoint, { headers });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        setCachedQuizLinks(data);
        return data;
      }
    }
  } catch (err) {
    console.log('Using local quiz links fallback:', err);
  }

  // Fallback to cached or defaults
  const cached = getCachedQuizLinks();
  return includeInactive ? cached : cached.filter((q) => q.isActive);
}

export async function saveChapterQuiz(
  payload: Partial<ChapterQuizLink> & {
    classLevel: ClassLevel;
    subjectId: SubjectId;
    conceptId: string;
    quizUrl: string;
  },
  token?: string
): Promise<ChapterQuizLink> {
  const urlValidation = validateQuizUrl(payload.quizUrl);
  if (!urlValidation.valid) {
    throw new Error(urlValidation.error || 'Invalid URL');
  }

  if (token) {
    try {
      const isUpdate = Boolean(payload.id);
      const url = isUpdate ? `/api/admin/chapter-quizzes/${payload.id}` : '/api/admin/chapter-quizzes';
      const method = isUpdate ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const saved = await res.json();
        // Update local cache
        const current = getCachedQuizLinks();
        const existingIdx = current.findIndex((q) => q.conceptId === saved.conceptId || q.id === saved.id);
        if (existingIdx !== -1) {
          current[existingIdx] = saved;
        } else {
          current.unshift(saved);
        }
        setCachedQuizLinks([...current]);
        return saved;
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save quiz link on server.');
      }
    } catch (networkErr: any) {
      console.warn('Server save failed, falling back to local persistence:', networkErr);
    }
  }

  // Client-side fallback save
  const current = getCachedQuizLinks();
  const existingIdx = current.findIndex((q) => q.conceptId === payload.conceptId || (payload.id && q.id === payload.id));

  const resolvedQuiz: ChapterQuizLink = {
    id: payload.id || (existingIdx !== -1 ? current[existingIdx].id : `quiz-${Date.now()}`),
    classLevel: payload.classLevel,
    subjectId: payload.subjectId,
    conceptId: payload.conceptId,
    chapterTitle: payload.chapterTitle || 'Selected Chapter',
    title: payload.title || `${payload.chapterTitle || 'Chapter'} Online Quiz`,
    quizUrl: payload.quizUrl.trim(),
    platformName: payload.platformName || detectQuizPlatform(payload.quizUrl),
    description: payload.description,
    timeLimitMinutes: payload.timeLimitMinutes,
    questionCount: payload.questionCount,
    isActive: payload.isActive !== undefined ? payload.isActive : true,
    createdAt: existingIdx !== -1 ? current[existingIdx].createdAt : Date.now(),
    updatedAt: Date.now()
  };

  if (existingIdx !== -1) {
    current[existingIdx] = resolvedQuiz;
  } else {
    current.unshift(resolvedQuiz);
  }

  setCachedQuizLinks([...current]);
  return resolvedQuiz;
}

export async function deleteChapterQuiz(id: string, token?: string): Promise<boolean> {
  if (token) {
    try {
      const res = await fetch(`/api/admin/chapter-quizzes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const current = getCachedQuizLinks().filter((q) => q.id !== id);
        setCachedQuizLinks(current);
        return true;
      }
    } catch (e) {
      console.warn('Server delete failed, applying local delete:', e);
    }
  }

  const current = getCachedQuizLinks().filter((q) => q.id !== id);
  setCachedQuizLinks(current);
  return true;
}

export async function toggleChapterQuizActive(id: string, token?: string): Promise<ChapterQuizLink | null> {
  if (token) {
    try {
      const res = await fetch(`/api/admin/chapter-quizzes/${id}/toggle`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const updated = await res.json();
        const current = getCachedQuizLinks().map((q) => (q.id === id ? updated : q));
        setCachedQuizLinks(current);
        return updated;
      }
    } catch (e) {
      console.warn('Server toggle failed, applying local toggle:', e);
    }
  }

  const current = getCachedQuizLinks();
  const target = current.find((q) => q.id === id);
  if (target) {
    target.isActive = !target.isActive;
    target.updatedAt = Date.now();
    setCachedQuizLinks([...current]);
    return target;
  }
  return null;
}

export function getQuizForChapter(quizzes: ChapterQuizLink[], conceptId: string): ChapterQuizLink | undefined {
  return quizzes.find((q) => q.conceptId === conceptId && q.isActive);
}
