import { licenseDefinitions, type CalmScene, type SceneCatalog } from './schema';

const sourceChanges =
  'Trimmed, cropped to portrait, transcoded to H.264 with AAC audio, and used to derive a poster frame.';

const scene = (
  id: string,
  title: string,
  location: string,
  description: string,
  soundLabel: string,
  creator: string,
  sourceUrl: string,
  licenseId: CalmScene['attribution']['licenseId'],
  order: number,
): CalmScene => ({
  schemaVersion: 1,
  id,
  title,
  location,
  description,
  soundLabel,
  video: { kind: 'bundled', key: `${id}.video` },
  poster: { kind: 'bundled', key: `${id}.poster` },
  attribution: {
    creator,
    sourceUrl,
    licenseId,
    licenseUrl: licenseDefinitions[licenseId].url,
    changesMade: sourceChanges,
  },
  status: 'published',
  sortOrder: order,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

export const seedCatalog: SceneCatalog = {
  schemaVersion: 1,
  scenes: [
    scene(
      'lake',
      'Lake McDonald',
      'Glacier National Park, Montana',
      'Mist rests above a still lake while the shoreline wakes slowly.',
      'Distant water and morning air',
      'National Park Service and Jacob W. Frank through GlacierNPS',
      'https://commons.wikimedia.org/wiki/File:Misty_Morning_at_Lake_McDonald_(25569241623).webm',
      'public-domain-us-government',
      0,
    ),
    scene(
      'forest',
      'Valla forest',
      'Nature reserve, Sweden',
      'A quiet stand of trees holds a soft layer of wind and leaves.',
      'Forest air and leaves',
      'Fredrik Johansson and Sounds of Changes',
      'https://commons.wikimedia.org/wiki/File:Valla_forest_Nature_reserve_-_A_quiet_place.webm',
      'cc-by-3.0',
      1,
    ),
    scene(
      'field',
      'Wheat field',
      'Open countryside',
      'Golden stems move together as a warm field carries the afternoon.',
      'Wind through wheat',
      'Coup 53',
      'https://commons.wikimedia.org/wiki/File:ASMR_field_of_wheat_-_nature.webm',
      'cc-by-3.0',
      2,
    ),
    scene(
      'brook',
      'Mountain brook',
      'Himalayas',
      'Cold water travels over stone beneath a shaded mountain path.',
      'Water over stone',
      'Poojilsharma07',
      'https://commons.wikimedia.org/wiki/File:Mountain_brook_in_Himalayas.webm',
      'cc-by-sa-4.0',
      3,
    ),
  ],
};

export const seedScenes = seedCatalog.scenes;
