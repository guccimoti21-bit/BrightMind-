import { getSupabase, isSupabaseLiveConfigured } from '../lib/supabase';
import { safeFetchJson } from '../utils/safeFetch';

export interface HomepageImage {
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

export interface HomepageImagesConfig {
  image1: HomepageImage | null;
  image2: HomepageImage | null;
}

export const HOMEPAGE_IMAGES_CACHE_KEY = 'scimath_homepage_images_v1';
export const HOMEPAGE_IMAGES_UPDATED_EVENT = 'scimath-homepage-images-updated';

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/gif'
];

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'Please select a valid image file.' };
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file type (${file.type || 'unknown'}). Please upload a JPG, PNG, WebP, SVG, or GIF image.`
    };
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${sizeMb} MB) exceeds the maximum allowed limit of 5 MB.`
    };
  }
  return { valid: true };
}

export function getCachedHomepageImages(): HomepageImagesConfig {
  if (typeof window === 'undefined') {
    return { image1: null, image2: null };
  }
  try {
    const raw = localStorage.getItem(HOMEPAGE_IMAGES_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        image1: parsed.image1 || null,
        image2: parsed.image2 || null
      };
    }
  } catch (e) {
    console.warn('Failed reading homepage images cache from localStorage:', e);
  }
  return { image1: null, image2: null };
}

export function setCachedHomepageImages(config: HomepageImagesConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(HOMEPAGE_IMAGES_CACHE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent(HOMEPAGE_IMAGES_UPDATED_EVENT, { detail: config }));
  } catch (e) {
    console.warn('Failed saving homepage images to localStorage:', e);
  }
}

// Convert a database row to HomepageImage
function mapRowToHomepageImage(row: any): HomepageImage {
  return {
    id: row.id as 'image1' | 'image2',
    imageUrl: row.image_url,
    title: row.title || undefined,
    altText: row.alt_text || undefined,
    storagePath: row.storage_path || undefined,
    fileName: row.file_name || undefined,
    fileSize: row.file_size ? Number(row.file_size) : undefined,
    mimeType: row.mime_type || undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now()
  };
}

export async function fetchHomepageImages(): Promise<HomepageImagesConfig> {
  let result: HomepageImagesConfig = getCachedHomepageImages();

  // 1. Try Supabase Database table if live
  if (isSupabaseLiveConfigured()) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('homepage_images')
        .select('*');

      if (!error && Array.isArray(data)) {
        const img1Row = data.find((r: any) => r.id === 'image1');
        const img2Row = data.find((r: any) => r.id === 'image2');

        result = {
          image1: img1Row ? mapRowToHomepageImage(img1Row) : null,
          image2: img2Row ? mapRowToHomepageImage(img2Row) : null
        };
        setCachedHomepageImages(result);
        return result;
      }
    } catch (err) {
      console.warn('Supabase homepage_images fetch notice:', err);
    }
  }

  // 2. Try Node/Express server endpoint
  try {
    const res = await safeFetchJson<HomepageImagesConfig>('/api/content/homepage-images');
    if (res.ok && res.data) {
      result = {
        image1: res.data.image1 || null,
        image2: res.data.image2 || null
      };
      setCachedHomepageImages(result);
      return result;
    }
  } catch (e) {
    // Expected on static hosts
  }

  return result;
}

// Convert File to base64 data URL
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function saveHomepageImage(
  slot: 'image1' | 'image2',
  file: File,
  meta?: { title?: string; altText?: string },
  token?: string
): Promise<HomepageImage> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid image file.');
  }

  let finalImageUrl: string = '';
  let storagePath: string | undefined = undefined;

  // 1. Try uploading to Supabase Storage if configured
  if (isSupabaseLiveConfigured()) {
    try {
      const supabase = getSupabase();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uploadPath = `${slot}/${Date.now()}_${safeFileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('homepage-images')
        .upload(uploadPath, file, {
          upsert: true,
          contentType: file.type
        });

      if (!uploadError && uploadData) {
        storagePath = uploadPath;
        const { data: publicData } = supabase.storage
          .from('homepage-images')
          .getPublicUrl(uploadPath);

        if (publicData?.publicUrl) {
          finalImageUrl = publicData.publicUrl;
        }
      } else if (uploadError) {
        console.warn('Supabase storage upload notice (using direct persistence fallback):', uploadError.message);
      }
    } catch (supStorageErr) {
      console.warn('Supabase storage upload exception:', supStorageErr);
    }
  }

  // If Supabase Storage was not accessible or returned an error (e.g. bucket not yet initialized),
  // convert file to high-fidelity Data URL so the image displays permanently without disruption
  if (!finalImageUrl) {
    finalImageUrl = await readFileAsDataUrl(file);
  }

  const nowIso = new Date().toISOString();
  const newImageRecord: HomepageImage = {
    id: slot,
    imageUrl: finalImageUrl,
    title: meta?.title?.trim() || undefined,
    altText: meta?.altText?.trim() || file.name.split('.')[0] || 'SciMathenova Homepage Feature',
    storagePath,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    updatedAt: Date.now()
  };

  // 2. Persist record to Supabase table if available
  if (isSupabaseLiveConfigured()) {
    try {
      const supabase = getSupabase();
      const dbRow = {
        id: slot,
        image_url: finalImageUrl,
        title: newImageRecord.title || null,
        alt_text: newImageRecord.altText || null,
        storage_path: storagePath || null,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        updated_at: nowIso
      };

      await supabase
        .from('homepage_images')
        .upsert(dbRow);
    } catch (dbErr) {
      console.warn('Supabase database upsert notice:', dbErr);
    }
  }

  // 3. Persist to Node/Express server if backend is active
  if (token) {
    try {
      await fetch(`/api/admin/homepage-images/${slot}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newImageRecord)
      });
    } catch (serverErr) {
      // Ignore static host failures
    }
  }

  // 4. Update local cache and notify listeners
  const current = getCachedHomepageImages();
  const nextConfig: HomepageImagesConfig = {
    ...current,
    [slot]: newImageRecord
  };
  setCachedHomepageImages(nextConfig);

  return newImageRecord;
}

export async function removeHomepageImage(
  slot: 'image1' | 'image2',
  token?: string
): Promise<void> {
  const current = getCachedHomepageImages();
  const existing = current[slot];

  // 1. Delete from Supabase Storage & Database if live
  if (isSupabaseLiveConfigured()) {
    try {
      const supabase = getSupabase();
      if (existing?.storagePath) {
        await supabase.storage.from('homepage-images').remove([existing.storagePath]);
      }
      await supabase.from('homepage_images').delete().eq('id', slot);
    } catch (e) {
      console.warn('Supabase remove notice:', e);
    }
  }

  // 2. Delete from Node/Express server if token present
  if (token) {
    try {
      await fetch(`/api/admin/homepage-images/${slot}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      // Ignore static host failures
    }
  }

  // 3. Update local cache and notify listeners
  const nextConfig: HomepageImagesConfig = {
    ...current,
    [slot]: null
  };
  setCachedHomepageImages(nextConfig);
}
