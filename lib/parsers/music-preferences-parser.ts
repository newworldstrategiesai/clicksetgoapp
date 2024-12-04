export const MUSIC_GENRES = [
  'Pop',
  'Rock',
  'Jazz',
  'Classical',
  'Hip Hop',
  'R&B',
  'Country',
  'Electronic',
  'Latin',
  'Blues',
  'Folk',
  'Reggae',
  'Metal',
  'Funk',
  'Soul',
  'Disco'
] as const;

export type MusicGenre = typeof MUSIC_GENRES[number];

export function extractMusicPreferences(text: string): MusicGenre[] {
  const preferences: MusicGenre[] = [];
  const lowercaseText = text.toLowerCase();

  for (const genre of MUSIC_GENRES) {
    if (lowercaseText.includes(genre.toLowerCase())) {
      preferences.push(genre);
    }
  }

  return preferences;
}