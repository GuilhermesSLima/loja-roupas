// ─── Cloudinary Integration Utility ──────────────────────────────────────────

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;

/**
 * Helper to compute SHA-1 hash via Web Crypto API (native browser api)
 */
async function generateSignature(params: Record<string, any>, secret: string): Promise<string> {
  const sortedKeys = Object.keys(params).sort();
  const paramString = sortedKeys
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  const stringToSign = paramString + secret;

  const encoder = new TextEncoder();
  const data = encoder.encode(stringToSign);
  const hashBuffer = await window.crypto.subtle.digest('SHA-1', data);

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Parses and extracts the public_id of an image from a Cloudinary URL
 */
export function getPublicIdFromUrl(url: string): string | null {
  if (!url || !url.includes('cloudinary.com')) return null;

  try {
    const parts = url.split('/image/upload/');
    if (parts.length < 2) return null;

    const pathParts = parts[1].split('/');
    // Remove version part (e.g. v1720367332) if present
    if (pathParts[0].startsWith('v') && /^\d+$/.test(pathParts[0].substring(1))) {
      pathParts.shift();
    }

    const publicIdWithExt = pathParts.join('/');
    const dotIndex = publicIdWithExt.lastIndexOf('.');
    if (dotIndex !== -1) {
      return publicIdWithExt.substring(0, dotIndex);
    }
    return publicIdWithExt;
  } catch (error) {
    console.error('Error parsing public_id from Cloudinary URL:', error);
    return null;
  }
}

/**
 * Uploads a file to Cloudinary using signed upload
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary environment variables are missing.');
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = 'produtos';

  // We sign parameters folder and timestamp
  const paramsToSign = {
    folder,
    timestamp,
  };

  const signature = await generateSignature(paramsToSign, apiSecret);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  formData.append('timestamp', timestamp.toString());
  formData.append('api_key', apiKey);
  formData.append('signature', signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Error uploading to Cloudinary');
  }

  const data = await response.json();
  return data.secure_url;
}

/**
 * Destroys/Deletes an image from Cloudinary using its public_id
 */
export async function deleteFromCloudinary(url: string): Promise<boolean> {
  if (!cloudName || !apiKey || !apiSecret) {
    console.warn('Cloudinary variables missing, skipping deletion.');
    return false;
  }

  const publicId = getPublicIdFromUrl(url);
  if (!publicId) return false;

  try {
    const timestamp = Math.round(new Date().getTime() / 1000);

    const paramsToSign = {
      public_id: publicId,
      timestamp,
    };

    const signature = await generateSignature(paramsToSign, apiSecret);

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', apiKey);
    formData.append('signature', signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary destroy error:', errorData);
      return false;
    }

    const data = await response.json();
    return data.result === 'ok' || data.result === 'not found';
  } catch (error) {
    console.error('Error during Cloudinary destroy:', error);
    return false;
  }
}
