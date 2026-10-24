import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<File> {
  // Reject files over 5 MB
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size exceeds 5MB limit');
  }

  // Accept only JPG, PNG, WebP
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPG, PNG, and WebP images are allowed.');
  }

  const options = {
    maxSizeMB: 0.08, // ~40-80 KB
    maxWidthOrHeight: 800,
    useWebWorker: true,
    fileType: 'image/webp',
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    return new File([compressedBlob], `${Date.now()}.webp`, {
      type: 'image/webp',
    });
  } catch (error) {
    console.error('Image compression failed:', error);
    throw new Error('Failed to compress image');
  }
}
