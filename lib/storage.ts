import { createClient } from '@/lib/supabase/client';

export const BUCKET_NAME = 'shop-images';

export async function uploadShopImage(
  shopId: string,
  file: File,
  oldPath?: string | null
): Promise<string> {
  const supabase = createClient();
  const fileExt = 'webp';
  const fileName = `${shopId}/${crypto.randomUUID()}.${fileExt}`;

  // Delete old file if provided
  if (oldPath) {
    try {
      await supabase.storage.from(BUCKET_NAME).remove([oldPath]);
    } catch (err) {
      console.warn('Failed to delete old image:', err);
    }
  }

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      contentType: 'image/webp',
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }

  return data.path;
}

export function getPublicImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const supabase = createClient();
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  return data.publicUrl;
}
