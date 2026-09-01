import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: import.meta.env.CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.CLOUDINARY_API_KEY,
  api_secret: import.meta.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  blurHash?: string;
}

/**
 * Generate a Cloudinary URL with transformations
 */
export function getCloudinaryUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    quality?: string | number;
    format?: 'auto' | 'webp' | 'avif' | 'png' | 'jpg';
    crop?: 'fill' | 'fit' | 'limit' | 'pad';
    gravity?: 'auto' | 'center' | 'face' | 'faces';
  }
): string {
  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto',
  } = options ?? {};

  const transformations: string[] = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (gravity) transformations.push(`g_${gravity}`);
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);

  return `https://res.cloudinary.com/${import.meta.env.CLOUDINARY_CLOUD_NAME}/image/upload/${transformations.join(',')}/${publicId}`;
}

/**
 * Get optimized image for project thumbnail
 */
export function getProjectThumbnail(publicId: string): CloudinaryImage {
  return {
    src: getCloudinaryUrl(publicId, { width: 800, height: 600, crop: 'fill' }),
    alt: '',
    width: 800,
    height: 600,
  };
}

/**
 * Get optimized image for project detail
 */
export function getProjectDetail(publicId: string): CloudinaryImage {
  return {
    src: getCloudinaryUrl(publicId, { width: 1200, height: 800, crop: 'fit' }),
    alt: '',
    width: 1200,
    height: 800,
  };
}

/**
 * Get video thumbnail from Cloudinary
 */
export function getVideoThumbnail(publicId: string): CloudinaryImage {
  return {
    src: getCloudinaryUrl(publicId, {
      width: 800,
      height: 450,
      crop: 'fill',
      format: 'jpg',
    }),
    alt: '',
    width: 800,
    height: 450,
  };
}

export default cloudinary;
