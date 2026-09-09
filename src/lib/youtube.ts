export interface YouTubeChannel {
  id: string;
  handle: string;
  title: string;
  thumbnailUrl: string;
  channelUrl: string;
}

const API_KEY: string | undefined = import.meta.env.YOUTUBE_API_KEY;

const stripAt = (handle: string): string =>
  handle.startsWith('@') ? handle.slice(1) : handle;

async function fetchChannelByHandle(
  handle: string
): Promise<YouTubeChannel | null> {
  if (!API_KEY) {
    return null;
  }

  const url = new URL('https://www.googleapis.com/youtube/v3/channels');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('forHandle', stripAt(handle));
  url.searchParams.set('key', API_KEY);

  try {
    const res = await fetch(url);

    if (!res.ok) {
      return null;
    }

    const data = (await res.json()) as {
      items?: Array<{
        id: string;
        snippet: {
          title: string;
          thumbnails: {
            high?: { url: string };
            medium?: { url: string };
            default?: { url: string };
          };
        };
      }>;
    };

    const item = data.items?.[0];

    if (!item) {
      return null;
    }

    const { snippet } = item;

    return {
      id: item.id,
      handle: stripAt(handle),
      title: snippet.title,
      thumbnailUrl:
        snippet.thumbnails?.high?.url ??
        snippet.thumbnails?.medium?.url ??
        snippet.thumbnails?.default?.url,
      channelUrl: `https://www.youtube.com/@${stripAt(handle)}`,
    };
  } catch {
    return null;
  }
}

/**
 * Fetch channel data for a list of handles. Returns an array aligned with the
 * input order; entries that fail resolve to `null`.
 */
export function fetchChannels(
  handles: string[]
): Promise<Array<YouTubeChannel | null>> {
  return Promise.all(handles.map((handle) => fetchChannelByHandle(handle)));
}