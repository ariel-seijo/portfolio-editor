import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public', 'clients');

const CLIENT_HANDLES = [
  'cesaroxx3561',
  'deadlymark5740',
  'hilyra',
  'CharlyScoTT',
  'foxyadc',
  'Wanderingnovagaming',
  'HazukyTV',
  'neorodriguezmx9',
  'DUXTERTV',
  'ZAXrevengeance',
];

const stripAt = (handle) => (handle.startsWith('@') ? handle.slice(1) : handle);

const envPath = join(ROOT, '.env');
if (existsSync(envPath)) {
  try {
    process.loadEnvFile(envPath);
  } catch {
    // .env con formato inválido: se ignora y se usa el entorno real
  }
}

const API_KEY = process.env.YOUTUBE_API_KEY;

async function fetchChannel(handle) {
  const url = new URL('https://www.googleapis.com/youtube/v3/channels');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('forHandle', stripAt(handle));
  url.searchParams.set('key', API_KEY);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const item = data.items?.[0];
  if (!item?.snippet) throw new Error('canal no encontrado');

  const thumb =
    item.snippet.thumbnails?.high?.url ??
    item.snippet.thumbnails?.medium?.url ??
    item.snippet.thumbnails?.default?.url;

  return { title: item.snippet.title, thumbnailUrl: thumb };
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) return false;
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  return true;
}

async function main() {
  if (!API_KEY) {
    console.log(
      '[fetch-avatars] Sin YOUTUBE_API_KEY: se omiten fotos de clientes. Agregala en .env o en las env vars de Vercel.'
    );
    return;
  }

  mkdirSync(OUT_DIR, { recursive: true });

  const cached = [];
  let ok = 0;
  let failed = 0;

  for (const handle of CLIENT_HANDLES) {
    const slug = stripAt(handle).toLowerCase();
    const file = `${slug}.jpg`;
    try {
      const channel = await fetchChannel(handle);
      if (!channel.thumbnailUrl) throw new Error('sin thumbnail');

      const dest = join(OUT_DIR, file);
      if (!(await download(channel.thumbnailUrl, dest))) throw new Error('descarga falló');

      cached.push({
        handle: slug,
        title: channel.title,
        channelUrl: `https://www.youtube.com/@${slug}`,
        file,
      });
      ok++;
      console.log(`[fetch-avatars] ✓ @${slug}`);
    } catch (err) {
      failed++;
      console.log(`[fetch-avatars] ✗ @${slug}: ${err.message}`);
    }
  }

  if (cached.length > 0) {
    writeFileSync(join(OUT_DIR, '_data.json'), JSON.stringify(cached, null, 2));
    console.log(`[fetch-avatars] ${ok} OK, ${failed} fallaron. Caché actualizada.`);
  }
}

main().catch((err) => {
  console.error('[fetch-avatars] Error fatal:', err);
  process.exit(1);
});