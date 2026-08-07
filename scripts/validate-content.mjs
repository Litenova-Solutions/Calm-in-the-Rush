import { access, readFile, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const scenes = ['lake', 'forest', 'field', 'brook'];
const expected = {
  lake: {
    videoBytes: 2396873,
    posterBytes: 61027,
    creator: 'National Park Service and Jacob W. Frank through GlacierNPS',
    license: 'public-domain-us-government',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Misty_Morning_at_Lake_McDonald_(25569241623).webm',
  },
  forest: {
    videoBytes: 11971484,
    posterBytes: 157334,
    creator: 'Fredrik Johansson and Sounds of Changes',
    license: 'cc-by-3.0',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Valla_forest_Nature_reserve_-_A_quiet_place.webm',
  },
  field: {
    videoBytes: 6837669,
    posterBytes: 122698,
    creator: 'Coup 53',
    license: 'cc-by-3.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:ASMR_field_of_wheat_-_nature.webm',
  },
  brook: {
    videoBytes: 15881356,
    posterBytes: 346816,
    creator: 'Poojilsharma07',
    license: 'cc-by-sa-4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Mountain_brook_in_Himalayas.webm',
  },
};

const seedSource = await readFile(resolve(root, 'packages/content/src/seed.ts'), 'utf8');
const validLicenses = new Set([
  'public-domain-us-government',
  'cc0-1.0',
  'cc-by-3.0',
  'cc-by-4.0',
  'cc-by-sa-4.0',
  'creator-owned',
]);

function probe(path, entries) {
  try {
    return JSON.parse(
      execFileSync('ffprobe', ['-v', 'error', '-show_entries', entries, '-of', 'json', path], {
        encoding: 'utf8',
      }),
    );
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

let ffprobeAvailable = true;

for (const id of scenes) {
  const video = resolve(root, 'packages/content/assets/scenes', id, 'scene.mp4');
  const poster = resolve(root, 'packages/content/assets/scenes', id, 'poster.jpg');
  await access(video);
  await access(poster);
  const videoStats = await stat(video);
  const posterStats = await stat(poster);
  if (
    videoStats.size !== expected[id].videoBytes ||
    posterStats.size !== expected[id].posterBytes
  ) {
    throw new Error(`Unexpected byte size for ${id}`);
  }
  if (!validLicenses.has(expected[id].license)) throw new Error(`Unknown license for ${id}`);
  if (!seedSource.includes(expected[id].creator) || !seedSource.includes(expected[id].sourceUrl))
    throw new Error(`Seed attribution does not match the provenance record for ${id}`);
  const posterHeader = (await readFile(poster)).subarray(0, 3);
  if (posterHeader[0] !== 0xff || posterHeader[1] !== 0xd8 || posterHeader[2] !== 0xff)
    throw new Error(`Poster is not a JPEG file for ${id}`);
  const licenseFile = resolve(root, 'packages/content/assets/scenes', id, 'scene.mp4.license');
  await access(licenseFile);

  const videoInfo = probe(
    video,
    'format=format_name,duration:stream=codec_type,codec_name,width,height',
  );
  const posterInfo = probe(poster, 'stream=codec_name,width,height');
  if (!videoInfo || !posterInfo) {
    ffprobeAvailable = false;
    continue;
  }
  const format = videoInfo.format ?? {};
  const streams = videoInfo.streams ?? [];
  const videoStream = streams.find((stream) => stream.codec_type === 'video');
  const audioStream = streams.find((stream) => stream.codec_type === 'audio');
  const duration = Number(format.duration);
  if (
    !videoStream ||
    videoStream.codec_name !== 'h264' ||
    Number(videoStream.width) >= Number(videoStream.height) ||
    !audioStream ||
    audioStream.codec_name !== 'aac' ||
    !Number.isFinite(duration) ||
    duration < 5 ||
    duration > 120
  )
    throw new Error(`Video codec, portrait dimensions, audio, or duration is invalid for ${id}`);
  const posterStream = posterInfo.streams?.[0];
  if (!posterStream || posterStream.codec_name !== 'mjpeg' || Number(posterStream.width) <= 0)
    throw new Error(`Poster metadata is invalid for ${id}`);
}

if (!ffprobeAvailable) console.warn('ffprobe is not installed; static media checks still passed');

console.log(`Validated ${scenes.length} seed scenes, media files, and license records.`);
