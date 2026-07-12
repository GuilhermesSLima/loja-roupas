import { supabase } from './supabase';

const BUCKET_NAME = 'product-images';

/**
 * Uploads a file to Supabase Storage in the 'loja-imagens' bucket
 * and returns the public URL.
 */
export async function uploadToStorage(file: File): Promise<string> {
  // Generate a unique filename using timestamp and a random string
  const fileExt = file.name.split('.').pop() || 'jpg';
  const randomStr = Math.random().toString(36).substring(2, 10);
  const fileName = `produtos/${Date.now()}-${randomStr}.${fileExt}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw error;
  }

  // Get the public URL for the uploaded file
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

  return publicUrl;
}

/**
 * Deletes a file from Supabase Storage using its public URL.
 */
export async function deleteFromStorage(url: string): Promise<boolean> {
  if (!url) return false;

  try {
    // Extract file path from public URL
    // Public URL format: https://[project-id].supabase.co/storage/v1/object/public/[bucket-name]/[filePath]
    const searchStr = `/storage/v1/object/public/${BUCKET_NAME}/`;
    const parts = url.split(searchStr);
    if (parts.length < 2) {
      console.warn('URL format is not recognized as Supabase Storage:', url);
      return false;
    }

    const filePath = parts[1];

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file from Supabase Storage:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Failed to delete file from Supabase Storage:', err);
    return false;
  }
}
