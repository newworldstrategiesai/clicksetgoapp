// components/ui/ThemeToggle.tsx

'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Toggle } from '@radix-ui/react-toggle'; // Replace with ShadCN's Toggle if available
import { cn } from '@/lib/utils'; // Utility for conditional classNames

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure the component is mounted to prevent hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Determine the current theme
  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDark = currentTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <Toggle
      pressed={isDark}
      onPressedChange={toggleTheme}
      className={cn(
        'relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
        isDark ? 'bg-indigo-600' : 'bg-gray-200'
      )}
      aria-label="Toggle Dark Mode"
    >
      <span className="sr-only">Toggle Dark Mode</span>
      <span
        className={cn(
          'absolute left-1 top-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full h-4 w-4 transform transition-transform duration-300',
          isDark ? 'translate-x-5' : 'translate-x-0'
        )}
      />
      {/* Sun Icon */}
      <Sun
        className={cn(
          'absolute left-1.5 h-2.5 w-3 text-yellow-500 transition-opacity duration-300',
          isDark ? 'opacity-0' : 'opacity-100'
        )}
      />
      {/* Moon Icon */}
      <Moon
        className={cn(
          'absolute right-1.5 h-2.5 w-3 text-gray-200 transition-opacity duration-300',
          isDark ? 'opacity-100' : 'opacity-0'
        )}
      />
    </Toggle>
  );
}
