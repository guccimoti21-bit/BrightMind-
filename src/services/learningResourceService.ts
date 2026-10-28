import { LearningResource, ResourceType, ClassLevel, SubjectId } from '../types/curriculum';
import { getSupabase, isSupabaseLiveConfigured } from '../lib/supabase';
import { safeFetchJson } from '../utils/safeFetch';

export const LEARNING_RESOURCES_CACHE_KEY = 'scimath_learning_resources_v1';
export const LEARNING_RESOURCES_UPDATED_EVENT = 'scimath-learning-resources-updated';

// Supported domain whitelists for security
const GOOGLE_DRIVE_DOMAINS = ['drive.google.com', 'docs.google.com'];
const YOUTUBE_DOMAINS = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'music.youtube.com'];

/**
 * Validate and safely check Google Drive or YouTube URL
 */
export function validateResourceUrl(
  type: ResourceType,
  rawUrl: string
): { valid: boolean; error?: string; normalizedUrl?: string } {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { valid: false, error: 'Resource URL is required.' };
  }

  const trimmed = rawUrl.trim();

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, error: 'Please enter a complete and valid URL (e.g. https://...)' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, error: 'Only secure HTTP/HTTPS URLs are allowed.' };
  }

  const hostname = parsed.hostname.toLowerCase();

  if (type === 'google_drive') {
    const isDriveDomain = GOOGLE_DRIVE_DOMAINS.some(
      (d) => hostname === d || hostname.endsWith(`.${d}`)
    );
    if (!isDriveDomain) {
      return {
        valid: false,
        error: 'Invalid Google Drive link. URL must be from drive.google.com or docs.google.com.'
      };
    }
    return { valid: true, normalizedUrl: trimmed };
  }

  if (type === 'youtube') {
    const isYtDomain = YOUTUBE_DOMAINS.some(
      (d) => hostname === d || hostname.endsWith(`.${d}`)
    );
    if (!isYtDomain) {
      return {
        valid: false,
        error: 'Invalid YouTube link. URL must be from youtube.com, www.youtube.com, or youtu.be.'
      };
    }

    // Verify it contains a video ID, shorts ID, or playlist ID
    const info = parseYouTubeUrl(trimmed);
    if (!info.videoId && !info.playlistId) {
      return {
        valid: false,
        error: 'Could not detect a valid YouTube Video ID, Shorts ID, or Playlist ID from this URL.'
      };
    }

    return { valid: true, normalizedUrl: trimmed };
  }

  return { valid: false, error: 'Unsupported resource type.' };
}

/**
 * Parse Google Drive or Docs link into embed URL and file kind
 */
export function parseGoogleDriveUrl(url: string): {
  embedUrl?: string;
  driveKind: 'document' | 'presentation' | 'spreadsheet' | 'pdf' | 'folder' | 'file';
  fileId?: string;
} {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname;

    // 1. Google Presentation / Slides
    if (pathname.includes('/presentation/d/')) {
      const match = pathname.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
      const id = match ? match[1] : undefined;
      return {
        fileId: id,
        driveKind: 'presentation',
        embedUrl: id ? `https://docs.google.com/presentation/d/${id}/embed?start=false&loop=false&delayms=3000` : undefined
      };
    }

    // 2. Google Docs / Word Document
    if (pathname.includes('/document/d/')) {
      const match = pathname.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
      const id = match ? match[1] : undefined;
      return {
        fileId: id,
        driveKind: 'document',
        embedUrl: id ? `https://docs.google.com/document/d/${id}/preview` : undefined
      };
    }

    // 3. Google Spreadsheets / Sheets
    if (pathname.includes('/spreadsheets/d/')) {
      const match = pathname.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
      const id = match ? match[1] : undefined;
      return {
        fileId: id,
        driveKind: 'spreadsheet',
        embedUrl: id ? `https://docs.google.com/spreadsheets/d/${id}/preview` : undefined
      };
    }

    // 4. Google Drive Folders
    if (pathname.includes('/folders/')) {
      const match = pathname.match(/\/folders\/([a-zA-Z0-9_-]+)/);
      const id = match ? match[1] : undefined;
      return {
        fileId: id,
        driveKind: 'folder',
        embedUrl: id ? `https://drive.google.com/embeddedfolderview?id=${id}#grid` : undefined
      };
    }

    // 5. Standard Google Drive File / PDF / Media
    // Formats: /file/d/{id}/view, /file/d/{id}/preview, or open?id={id}
    let fileId: string | undefined;
    if (pathname.includes('/file/d/')) {
      const match = pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      fileId = match ? match[1] : undefined;
    } else if (parsed.searchParams.has('id')) {
      fileId = parsed.searchParams.get('id') || undefined;
    }

    const isPdf = url.toLowerCase().includes('.pdf') || pathname.toLowerCase().includes('.pdf');
    const driveKind = isPdf ? 'pdf' : 'file';

    return {
      fileId,
      driveKind,
      embedUrl: fileId ? `https://drive.google.com/file/d/${fileId}/preview` : undefined
    };
  } catch {
    return { driveKind: 'file' };
  }
}

/**
 * Parse YouTube URL into normalized embed, thumbnail, and kind
 */
export function parseYouTubeUrl(url: string): {
  videoId?: string;
  playlistId?: string;
  youtubeKind: 'video' | 'shorts' | 'playlist';
  embedUrl?: string;
  thumbnailUrl?: string;
} {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname;

    let videoId: string | undefined;
    let playlistId: string | undefined = parsed.searchParams.get('list') || undefined;
    let youtubeKind: 'video' | 'shorts' | 'playlist' = 'video';

    // 1. youtu.be shortlinks: https://youtu.be/VIDEO_ID
    if (hostname === 'youtu.be') {
      const cleanPath = pathname.replace(/^\/+/, '');
      if (cleanPath) {
        videoId = cleanPath.split('/')[0].split('?')[0];
      }
    }
    // 2. Shorts: https://www.youtube.com/shorts/VIDEO_ID
    else if (pathname.includes('/shorts/')) {
      const match = pathname.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
      if (match) {
        videoId = match[1];
        youtubeKind = 'shorts';
      }
    }
    // 3. Playlists: https://www.youtube.com/playlist?list=PLAYLIST_ID
    else if (pathname.includes('/playlist') && playlistId) {
      youtubeKind = 'playlist';
    }
    // 4. Standard watch link: https://www.youtube.com/watch?v=VIDEO_ID
    else if (parsed.searchParams.has('v')) {
      videoId = parsed.searchParams.get('v') || undefined;
    }
    // 5. Embedded link: https://www.youtube.com/embed/VIDEO_ID
    else if (pathname.includes('/embed/')) {
      const match = pathname.match(/\/embed\/([a-zA-Z0-9_-]+)/);
      if (match) {
        videoId = match[1];
      }
    }

    // Compute embed URL safely
    let embedUrl: string | undefined;
    if (youtubeKind === 'playlist' && playlistId) {
      embedUrl = `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(playlistId)}&rel=0`;
    } else if (videoId) {
      const playlistParam = playlistId ? `&list=${encodeURIComponent(playlistId)}` : '';
      embedUrl = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?rel=0${playlistParam}`;
    }

    // Compute thumbnail URL
    let thumbnailUrl: string | undefined;
    if (videoId) {
      thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }

    return {
      videoId,
      playlistId,
      youtubeKind,
      embedUrl,
      thumbnailUrl
    };
  } catch {
    return { youtubeKind: 'video' };
  }
}

/**
 * Decorate a LearningResource with dynamic embed URLs, thumbnails, and badges
 */
export function decorateResource(resource: LearningResource): LearningResource {
  if (resource.resourceType === 'google_drive') {
    const driveInfo = parseGoogleDriveUrl(resource.resourceUrl);
    return {
      ...resource,
      driveKind: driveInfo.driveKind,
      embedUrl: driveInfo.embedUrl
    };
  } else if (resource.resourceType === 'youtube') {
    const ytInfo = parseYouTubeUrl(resource.resourceUrl);
    return {
      ...resource,
      youtubeKind: ytInfo.youtubeKind,
      embedUrl: ytInfo.embedUrl,
      thumbnailUrl: ytInfo.thumbnailUrl
    };
  }
  return resource;
}

/**
 * Map Supabase database row (snake_case) to LearningResource (camelCase)
 */
export function mapRowToResource(row: any): LearningResource {
  const item: LearningResource = {
    id: row.id,
    title: row.title || 'Untitled Resource',
    description: row.description || '',
    resourceType: (row.resource_type as ResourceType) || 'google_drive',
    resourceUrl: row.resource_url,
    classLevel: Number(row.class_level) as ClassLevel,
    subject: row.subject as SubjectId,
    chapterId: row.chapter_id,
    chapterTitle: row.chapter_title || undefined,
    subConceptId: row.sub_concept_id || undefined,
    subConceptTitle: row.sub_concept_title || undefined,
    isActive: row.is_active !== false,
    sortOrder: typeof row.sort_order === 'number' ? row.sort_order : 0,
    createdBy: row.created_by || undefined,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now()
  };

  return decorateResource(item);
}

/**
 * Retrieve cached learning resources from localStorage
 */
export function getCachedLearningResources(): LearningResource[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LEARNING_RESOURCES_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => decorateResource(item));
      }
    }
  } catch (err) {
    console.warn('Failed reading cached learning resources:', err);
  }
  return [];
}

/**
 * Save cached learning resources to localStorage and notify listeners
 */
export function setCachedLearningResources(resources: LearningResource[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LEARNING_RESOURCES_CACHE_KEY, JSON.stringify(resources));
    window.dispatchEvent(
      new CustomEvent(LEARNING_RESOURCES_UPDATED_EVENT, { detail: resources })
    );
  } catch (err) {
    console.warn('Failed setting cached learning resources:', err);
  }
}

/**
 * Fetch learning resources from Supabase or Node backend with local cache fallback
 */
export async function fetchLearningResources(
  options?: {
    classLevel?: ClassLevel;
    subject?: SubjectId;
    chapterId?: string;
    subConceptId?: string;
    includeInactive?: boolean;
  },
  token?: string
): Promise<LearningResource[]> {
  let loadedItems: LearningResource[] | null = null;

  // 1. Check Supabase Database
  if (isSupabaseLiveConfigured()) {
    try {
      const supabase = getSupabase();
      let query = supabase.from('learning_resources').select('*');

      if (!options?.includeInactive) {
        query = query.eq('is_active', true);
      }
      if (options?.classLevel) {
        query = query.eq('class_level', options.classLevel);
      }
      if (options?.subject) {
        query = query.eq('subject', options.subject);
      }
      if (options?.chapterId) {
        query = query.eq('chapter_id', options.chapterId);
      }
      if (options?.subConceptId) {
        query = query.eq('sub_concept_id', options.subConceptId);
      }

      query = query.order('sort_order', { ascending: true }).order('created_at', { ascending: true });

      const { data, error } = await query;

      if (!error && Array.isArray(data)) {
        loadedItems = data.map((r: any) => mapRowToResource(r));
      }
    } catch (err) {
      console.warn('Supabase learning_resources fetch error, falling back:', err);
    }
  }

  // 2. Check Node Express API if Supabase didn't provide items or failed
  if (!loadedItems) {
    try {
      const endpoint = options?.includeInactive
        ? '/api/admin/learning-resources'
        : '/api/content/learning-resources';

      const headers: Record<string, string> = {};
      if (token && options?.includeInactive) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const queryParams = new URLSearchParams();
      if (options?.classLevel) queryParams.set('classLevel', String(options.classLevel));
      if (options?.subject) queryParams.set('subject', options.subject);
      if (options?.chapterId) queryParams.set('chapterId', options.chapterId);
      if (options?.subConceptId) queryParams.set('subConceptId', options.subConceptId);

      const url = `${endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const res = await safeFetchJson<LearningResource[]>(url, { headers });

      if (res.ok && Array.isArray(res.data)) {
        loadedItems = res.data.map((r) => decorateResource(r));
      }
    } catch (err) {
      // Offline or static preview fallback
    }
  }

  // 3. Fallback to localStorage cache
  if (!loadedItems) {
    loadedItems = getCachedLearningResources();
    if (!options?.includeInactive) {
      loadedItems = loadedItems.filter((r) => r.isActive);
    }
    if (options?.classLevel) {
      loadedItems = loadedItems.filter((r) => r.classLevel === options.classLevel);
    }
    if (options?.subject) {
      loadedItems = loadedItems.filter((r) => r.subject === options.subject);
    }
    if (options?.chapterId) {
      loadedItems = loadedItems.filter((r) => r.chapterId === options.chapterId);
    }
    if (options?.subConceptId) {
      loadedItems = loadedItems.filter((r) => r.subConceptId === options.subConceptId);
    }
  } else {
    // If fetching all/admin items, sync cache
    if (options?.includeInactive && !options?.classLevel && !options?.chapterId) {
      setCachedLearningResources(loadedItems);
    }
  }

  return (loadedItems || []).sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Save or update a learning resource (Admin only)
 */
export async function saveLearningResource(
  data: Partial<LearningResource>,
  token?: string
): Promise<LearningResource> {
  const resourceType = data.resourceType || 'google_drive';
  const urlCheck = validateResourceUrl(resourceType, data.resourceUrl || '');
  if (!urlCheck.valid) {
    throw new Error(urlCheck.error || 'Invalid resource URL.');
  }

  const normalizedUrl = urlCheck.normalizedUrl || data.resourceUrl!;
  const id = data.id || `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = Date.now();

  const resource: LearningResource = decorateResource({
    id,
    title: (data.title || '').trim(),
    description: (data.description || '').trim(),
    resourceType,
    resourceUrl: normalizedUrl,
    classLevel: data.classLevel || 8,
    subject: data.subject || 'mathematics',
    chapterId: data.chapterId || '',
    chapterTitle: data.chapterTitle || '',
    subConceptId: data.subConceptId || undefined,
    subConceptTitle: data.subConceptTitle || undefined,
    isActive: data.isActive !== false,
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
    createdBy: data.createdBy,
    createdAt: data.createdAt || now,
    updatedAt: now
  });

  // 1. Try Supabase
  if (isSupabaseLiveConfigured()) {
    try {
      const supabase = getSupabase();
      const row = {
        id: resource.id,
        title: resource.title,
        description: resource.description || null,
        resource_type: resource.resourceType,
        resource_url: resource.resourceUrl,
        class_level: resource.classLevel,
        subject: resource.subject,
        chapter_id: resource.chapterId,
        sub_concept_id: resource.subConceptId || null,
        is_active: resource.isActive,
        sort_order: resource.sortOrder,
        updated_at: new Date(resource.updatedAt).toISOString()
      };

      const { data: dbData, error } = await supabase
        .from('learning_resources')
        .upsert(row)
        .select()
        .single();

      if (!error && dbData) {
        const saved = mapRowToResource(dbData);
        // Update local cache
        const cache = getCachedLearningResources();
        const existingIdx = cache.findIndex((c) => c.id === saved.id);
        if (existingIdx >= 0) {
          cache[existingIdx] = saved;
        } else {
          cache.push(saved);
        }
        setCachedLearningResources(cache);
        return saved;
      }
    } catch (err) {
      console.warn('Supabase upsert failed, trying Express server:', err);
    }
  }

  // 2. Try Node Express backend
  try {
    const isEditing = Boolean(data.id);
    const endpoint = isEditing
      ? `/api/admin/learning-resources/${data.id}`
      : '/api/admin/learning-resources';
    const method = isEditing ? 'PUT' : 'POST';

    const res = await safeFetchJson<LearningResource>(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(resource)
    });

    if (res.ok && res.data) {
      const saved = decorateResource(res.data);
      const cache = getCachedLearningResources();
      const existingIdx = cache.findIndex((c) => c.id === saved.id);
      if (existingIdx >= 0) {
        cache[existingIdx] = saved;
      } else {
        cache.push(saved);
      }
      setCachedLearningResources(cache);
      return saved;
    }
  } catch (err) {
    // Offline / static preview fallback
  }

  // 3. Fallback to LocalStorage
  const cache = getCachedLearningResources();
  const existingIdx = cache.findIndex((c) => c.id === resource.id);
  if (existingIdx >= 0) {
    cache[existingIdx] = resource;
  } else {
    cache.push(resource);
  }
  setCachedLearningResources(cache);
  return resource;
}

/**
 * Delete a learning resource (Admin only)
 */
export async function deleteLearningResource(id: string, token?: string): Promise<boolean> {
  // 1. Try Supabase
  if (isSupabaseLiveConfigured()) {
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from('learning_resources').delete().eq('id', id);
      if (!error) {
        const cache = getCachedLearningResources().filter((r) => r.id !== id);
        setCachedLearningResources(cache);
        return true;
      }
    } catch (err) {
      console.warn('Supabase delete error:', err);
    }
  }

  // 2. Try Node Express API
  try {
    const res = await safeFetchJson<{ success: boolean }>(`/api/admin/learning-resources/${id}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    if (res.ok) {
      const cache = getCachedLearningResources().filter((r) => r.id !== id);
      setCachedLearningResources(cache);
      return true;
    }
  } catch (err) {
    // Local fallback
  }

  // 3. Local fallback
  const cache = getCachedLearningResources().filter((r) => r.id !== id);
  setCachedLearningResources(cache);
  return true;
}

/**
 * Toggle active / hidden status of a learning resource (Admin only)
 */
export async function toggleLearningResourceActive(
  id: string,
  token?: string
): Promise<LearningResource | null> {
  const cache = getCachedLearningResources();
  const item = cache.find((r) => r.id === id);
  if (!item) return null;

  const nextActive = !item.isActive;

  // 1. Try Supabase
  if (isSupabaseLiveConfigured()) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('learning_resources')
        .update({ is_active: nextActive, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        const updated = mapRowToResource(data);
        const nextCache = cache.map((r) => (r.id === id ? updated : r));
        setCachedLearningResources(nextCache);
        return updated;
      }
    } catch (err) {
      console.warn('Supabase toggle error:', err);
    }
  }

  // 2. Try Node Express API
  try {
    const res = await safeFetchJson<LearningResource>(
      `/api/admin/learning-resources/${id}/toggle`,
      {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      }
    );
    if (res.ok && res.data) {
      const updated = decorateResource(res.data);
      const nextCache = cache.map((r) => (r.id === id ? updated : r));
      setCachedLearningResources(nextCache);
      return updated;
    }
  } catch (err) {
    // Local fallback
  }

  // 3. Local fallback
  const updated: LearningResource = { ...item, isActive: nextActive, updatedAt: Date.now() };
  const nextCache = cache.map((r) => (r.id === id ? updated : r));
  setCachedLearningResources(nextCache);
  return updated;
}

/**
 * Reorder resources by updating sort_order (Admin only)
 */
export async function reorderLearningResources(
  orderedIds: string[],
  token?: string
): Promise<boolean> {
  // 1. Try Node Express API
  try {
    const res = await safeFetchJson<{ success: boolean }>(
      '/api/admin/learning-resources/reorder',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ orderedIds })
      }
    );
    if (res.ok) {
      const cache = getCachedLearningResources();
      const nextCache = cache.map((r) => {
        const idx = orderedIds.indexOf(r.id);
        return idx >= 0 ? { ...r, sortOrder: idx } : r;
      });
      setCachedLearningResources(nextCache);
      return true;
    }
  } catch (err) {
    // Local fallback
  }

  // Local fallback
  const cache = getCachedLearningResources();
  const nextCache = cache.map((r) => {
    const idx = orderedIds.indexOf(r.id);
    return idx >= 0 ? { ...r, sortOrder: idx } : r;
  });
  setCachedLearningResources(nextCache);
  return true;
}

/**
 * Filter learning resources belonging to a specific chapter and optionally sub-concept
 */
export function getResourcesForChapter(
  resources: LearningResource[],
  chapterId: string,
  subConceptId?: string
): LearningResource[] {
  return resources
    .filter((r) => {
      if (!r.isActive) return false;
      if (r.chapterId !== chapterId) return false;
      if (subConceptId && r.subConceptId) {
        return r.subConceptId === subConceptId;
      }
      return true;
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
