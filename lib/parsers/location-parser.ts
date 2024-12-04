export function extractLocation(text: string): string | null {
  // Common location indicators
  const locationIndicators = [
    'at',
    'in',
    'location:',
    'venue:',
    'place:'
  ];

  const lowercaseText = text.toLowerCase();
  
  for (const indicator of locationIndicators) {
    const index = lowercaseText.indexOf(indicator + ' ');
    if (index !== -1) {
      // Extract text after the indicator until the next punctuation or newline
      const locationText = text.slice(index + indicator.length).match(/([^.,!?\n]+)/);
      if (locationText) {
        return locationText[0].trim();
      }
    }
  }

  return null;
}