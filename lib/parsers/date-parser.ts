import { parse, isValid } from 'date-fns';

export function extractDate(text: string): string | null {
  // Common date formats
  const datePatterns = [
    // Full date patterns (e.g., "June 5th, 2024", "June 5 2024")
    /(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}/gi,
    // Short date patterns (e.g., "06/05/2024", "2024-06-05")
    /\d{1,2}[-/]\d{1,2}[-/]\d{4}/g,
    // ISO date pattern
    /\d{4}-\d{2}-\d{2}/g
  ];

  for (const pattern of datePatterns) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        // Try parsing the date
        const cleanDate = match.replace(/(?:st|nd|rd|th),?/g, '');
        const parsedDate = parse(cleanDate, 'MMMM d yyyy', new Date());
        
        if (isValid(parsedDate)) {
          return parsedDate.toISOString().split('T')[0];
        }
      }
    }
  }

  return null;
}