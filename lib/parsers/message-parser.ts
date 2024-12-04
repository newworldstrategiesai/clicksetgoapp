import { extractDate } from './date-parser';
import { extractEventType, type EventType } from './event-type-parser';
import { extractLocation } from './location-parser';
import { extractMusicPreferences, type MusicGenre } from './music-preferences-parser';

export interface ParsedMessage {
  eventType: EventType | null;
  eventDate: string | null;
  location: string | null;
  musicPreferences: MusicGenre[];
}

export function parseMessage(text: string): ParsedMessage {
  return {
    eventType: extractEventType(text),
    eventDate: extractDate(text),
    location: extractLocation(text),
    musicPreferences: extractMusicPreferences(text)
  };
}