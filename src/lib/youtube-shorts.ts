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

/** Build a privacy-friendly embed URL with autoplay enabled. */
export function buildEmbedUrl(videoId: string, autoplay = true): string {
  const params = new URLSearchParams({ rel: '0' });
  if (autoplay) params.set('autoplay', '1');
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

/** Default thumbnail for a video id, used when no custom thumbnail is provided. */
export function buildThumbUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}
