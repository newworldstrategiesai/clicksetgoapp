export const EVENT_TYPES = [
  'Wedding',
  'Corporate',
  'Birthday',
  'Party',
  'Concert',
  'Festival',
  'Graduation',
  'Anniversary'
] as const;

export type EventType = typeof EVENT_TYPES[number];

export function extractEventType(text: string): EventType | null {
  const lowercaseText = text.toLowerCase();
  
  for (const type of EVENT_TYPES) {
    if (lowercaseText.includes(type.toLowerCase())) {
      return type as EventType;
    }
  }

  return null;
}