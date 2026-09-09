const VIDEO_ID_RE = /^[A-Za-z0-9_-]{11}$/;

function extractPathId(path: string): string | null {
  const match = path.match(/(?:shorts|embed)\/([A-Za-z0-9_-]{11})/);
  return match?.[1] ?? null;
}

function extractWatchId(search: URLSearchParams): string | null {
  const v = search.get('v');
  return v && VIDEO_ID_RE.test(v) ? v : null;
}

/**
 * Extract a YouTube video id from a URL in any supported format:
 * `/shorts/{id}`, `watch?v={id}`, `youtu.be/{id}` or `/embed/{id}`.
 * Returns `null` for invalid or unsupported URLs. Never throws.
 */
export function extractYouTubeId(rawUrl: string): string | null {
  if (typeof rawUrl !== 'string' || rawUrl.trim() === '') return null;

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return null;
  }

  const host = parsed.hostname.toLowerCase();
  if (host !== 'youtube.com' && host !== 'www.youtube.com' && host !== 'youtu.be') {
    return null;
  }

  const pathId = extractPathId(parsed.pathname);
  if (pathId) return pathId;

  if (host !== 'youtu.be') {
    const watchId = extractWatchId(parsed.searchParams);
    if (watchId) return watchId;
  }

  const barePath = parsed.pathname.replace(/^\//, '').replace(/\/$/, '');
  if (host === 'youtu.be' && VIDEO_ID_RE.test(barePath)) return barePath;

  return null;
}

/** Local placeholder shown when a remote thumbnail fails to load (404 etc.). */
export const FALLBACK_THUMB = '/shorts-placeholder.svg';

const EMBED_BASE = 'https://www.youtube-nocookie.com/embed';

interface EmbedOptions {
  autoplay?: boolean;
  mute?: boolean;
}

/**
 * Build a privacy-friendly embed URL on youtube-nocookie.com (no cross-site
 * cookies, no SameSite warnings in the console). Autoplay only when muted so
 * the browser never blocks it.
 */
export function buildEmbedUrl(videoId: string, options: EmbedOptions = {}): string {
  const params = new URLSearchParams({ rel: '0', playsinline: '1' });
  if (options.autoplay) {
    params.set('autoplay', '1');
    if (options.mute) params.set('mute', '1');
  }
  return `${EMBED_BASE}/${videoId}?${params.toString()}`;
}

/** Default thumbnail for a video id, used when no custom thumbnail is provided. */
export function buildThumbUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}
