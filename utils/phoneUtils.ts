// utils/phoneUtils.ts
export const formatPhoneNumber = (phoneNumber: string): string | null => {
    // Remove all non-numeric characters
    const cleaned = phoneNumber.replace(/[^0-9]/g, '');
  
    // Check if cleaned number length indicates a US number
    if (cleaned.length === 10) {
      // Assume the country code is +1 for US numbers
      return `+1${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      // Handle US numbers with country code included
      return `+${cleaned}`;
    } else if (cleaned.length >= 10 && cleaned.startsWith('1')) {
      // Handle cases where the number might be longer and include '1' at the start
      return `+${cleaned}`;
    }
    return null; // Return null if the number does not match expected formats
  };
  