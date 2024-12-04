import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

// Utility function for handling class names with Tailwind CSS
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to format a date or string into a readable format
export function formatDate(date: Date | string | null | undefined): string {
  // Handle case where date is null, undefined or empty
  if (!date) {
    console.log("Invalid date value:", date); // Debugging log
    return "Invalid date"; // Return a default string for invalid or null/undefined dates
  }

  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Check if the date object is valid
  if (isNaN(dateObj.getTime())) {
    console.log("Invalid date object:", dateObj); // Debugging log
    return "Invalid date"; // Return a default string for invalid dates
  }

  // Format the date in "MMM d, yyyy" format (e.g., "Jan 1, 2021")
  return format(dateObj, "MMM d, yyyy");
}
