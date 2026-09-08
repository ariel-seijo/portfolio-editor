export interface Project {
  id: string;
  title: string;
  description: string;
  category: 'video' | 'image' | 'both';
  tags: string[];
  thumbnail: string;
  media: MediaItem[];
  date: string;
  featured?: boolean;
  client?: string;
  link?: string;
}

export interface MediaItem {
  type: 'image' | 'video';
  publicId: string;
  alt: string;
  width?: number;
  height?: number;
  duration?: number;
}

export interface YouTubeShort {
  title: string;
  youtubeUrl: string;
  thumbnailUrl?: string;
  author?: string;
  category?: string;
  date?: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface SiteConfig {
  title: string;
  description: string;
  author: string;
  social: SocialLink[];
}
