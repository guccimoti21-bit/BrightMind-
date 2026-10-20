import { ChapterQuizLink, ClassLevel, SubjectId } from '../types/curriculum';
import { getSupabase, isSupabaseLiveConfigured } from '../lib/supabase';

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

// Convert a database snake_case row to frontend camelCase ChapterQuizLink
function mapRowToQuizLink(row: any): ChapterQuizLink {
  return {
    id: row.id,
    classLevel: Number(row.class_level) as ClassLevel,
    subjectId: row.subject_id as SubjectId,
    conceptId: row.concept_id,
    chapterTitle: row.chapter_title,
    title: row.title,
    quizUrl: row.quiz_url,
    platformName: row.platform_name || detectQuizPlatform(row.quiz_url),
    description: row.description || undefined,
    timeLimitMinutes: row.time_limit_minutes ? Number(row.time_limit_minutes) : undefined,
    questionCount: row.question_count ? Number(row.question_count) : undefined,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now()
  };
}

export async function fetchChapterQuizzes(token?: string, includeInactive = false): Promise<ChapterQuizLink[]> {
  // 1. Try Supabase if live connection is configured (GitHub Pages & Cloud path)
  if (isSupabaseLiveConfigured()) {
    try {
      const supabase = getSupabase();
      let query = supabase.from('chapter_quizzes').select('*');
      if (!includeInactive) {
        query = query.eq('is_active', true);
      }
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        const mapped = data.map(mapRowToQuizLink);
        setCachedQuizLinks(mapped);
        return mapped;
      } else if (error) {
        console.warn('Supabase chapter_quizzes query note:', error.message);
      }
    } catch (supErr) {
      console.warn('Supabase chapter_quizzes fetch exception:', supErr);
    }
  }

  // 2. Try Local Express Server backend (Local Dev / AI Studio preview path)
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
    // Expected on static hosts
  }

  // 3. Fallback to cached or defaults
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

  const generatedId = payload.id || `quiz-${Date.now()}`;
  const nowIso = new Date().toISOString();

  // 1. If Supabase is live, persist to Supabase chapter_quizzes table
  if (isSupabaseLiveConfigured()) {
    try {
      const supabase = getSupabase();
      const dbRow = {
        id: generatedId,
        class_level: payload.classLevel,
        subject_id: payload.subjectId,
        concept_id: payload.conceptId,
        chapter_title: payload.chapterTitle || 'Selected Chapter',
        title: payload.title || `${payload.chapterTitle || 'Chapter'} Online Quiz`,
        quiz_url: payload.quizUrl.trim(),
        platform_name: payload.platformName || detectQuizPlatform(payload.quizUrl),
        description: payload.description || null,
        time_limit_minutes: payload.timeLimitMinutes || null,
        question_count: payload.questionCount || null,
        is_active: payload.isActive !== undefined ? payload.isActive : true,
        updated_at: nowIso
      };

      const { data, error } = await supabase
        .from('chapter_quizzes')
        .upsert(dbRow)
        .select()
        .single();

      if (!error && data) {
        const saved = mapRowToQuizLink(data);
        const current = getCachedQuizLinks();
        const existingIdx = current.findIndex((q) => q.conceptId === saved.conceptId || q.id === saved.id);
        if (existingIdx !== -1) {
          current[existingIdx] = saved;
        } else {
          current.unshift(saved);
        }
        setCachedQuizLinks([...current]);
        return saved;
      } else if (error) {
        console.warn('Supabase quiz upsert note:', error.message);
      }
    } catch (supErr: any) {
      console.warn('Supabase quiz save failed, attempting server or local persistence:', supErr);
    }
  }

  // 2. Try Node/Express server API
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
        const current = getCachedQuizLinks();
        const existingIdx = current.findIndex((q) => q.conceptId === saved.conceptId || q.id === saved.id);
        if (existingIdx !== -1) {
          current[existingIdx] = saved;
        } else {
          current.unshift(saved);
        }
        setCachedQuizLinks([...current]);
        return saved;
      }
    } catch (networkErr: any) {
      console.warn('Server save failed, falling back to local persistence:', networkErr);
    }
  }

  // 3. Client-side fallback save
  const current = getCachedQuizLinks();
  const existingIdx = current.findIndex((q) => q.conceptId === payload.conceptId || (payload.id && q.id === payload.id));

  const resolvedQuiz: ChapterQuizLink = {
    id: generatedId,
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
  // 1. Supabase delete
  if (isSupabaseLiveConfigured()) {
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from('chapter_quizzes').delete().eq('id', id);
      if (!error) {
        const current = getCachedQuizLinks().filter((q) => q.id !== id);
        setCachedQuizLinks(current);
        return true;
      }
    } catch (supErr) {
      console.warn('Supabase delete exception:', supErr);
    }
  }

  // 2. Server API delete
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

  // 3. Local fallback delete
  const current = getCachedQuizLinks().filter((q) => q.id !== id);
  setCachedQuizLinks(current);
  return true;
}

export async function toggleChapterQuizActive(id: string, token?: string): Promise<ChapterQuizLink | null> {
  const current = getCachedQuizLinks();
  const target = current.find((q) => q.id === id);
  const nextActive = target ? !target.isActive : true;

  // 1. Supabase toggle
  if (isSupabaseLiveConfigured()) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('chapter_quizzes')
        .update({ is_active: nextActive, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        const updated = mapRowToQuizLink(data);
        const nextList = current.map((q) => (q.id === id ? updated : q));
        setCachedQuizLinks(nextList);
        return updated;
      }
    } catch (supErr) {
      console.warn('Supabase toggle exception:', supErr);
    }
  }

  // 2. Server API toggle
  if (token) {
    try {
      const res = await fetch(`/api/admin/chapter-quizzes/${id}/toggle`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const updated = await res.json();
        const nextList = current.map((q) => (q.id === id ? updated : q));
        setCachedQuizLinks(nextList);
        return updated;
      }
    } catch (e) {
      console.warn('Server toggle failed, applying local toggle:', e);
    }
  }

  // 3. Local fallback toggle
  if (target) {
    target.isActive = nextActive;
    target.updatedAt = Date.now();
    setCachedQuizLinks([...current]);
    return target;
  }
  return null;
}

export function getQuizForChapter(quizzes: ChapterQuizLink[], conceptId: string): ChapterQuizLink | undefined {
  return quizzes.find((q) => q.conceptId === conceptId && q.isActive);
}
