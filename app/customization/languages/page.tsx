'use client';

import { useState } from 'react';

// CustomSwitch Component
function CustomSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div
      onClick={onChange}
      className={`relative inline-flex items-center h-6 rounded-full w-11 cursor-pointer ${
        checked ? 'bg-blue-600' : 'bg-gray-400'
      }`}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </div>
  );
}

// LanguagesPage Component
export default function LanguagesPage() {
  const languages = [
    { name: 'Albanian', native: 'Shqipja' },
    { name: 'Arabic', native: 'اَلْعَرَبِيَّةُ' },
    { name: 'Belarusian', native: 'Беларуская' },
    { name: 'Bosnian', native: 'Bosanski' },
    { name: 'Bulgarian', native: 'български' },
    { name: 'Burmese', native: 'မြန်မာဘာသာ' },
    { name: 'Catalan', native: 'Català' },
    { name: 'Croatian', native: 'Hrvatski' },
    { name: 'Chinese (Simplified)', native: '简体中文' },
    { name: 'Chinese (Traditional)', native: '繁體中文' },
    { name: 'Czech', native: 'čeština' },
    { name: 'Danish', native: 'Dansk' },
    { name: 'Dutch', native: 'Nederlands' },
    { name: 'English', native: 'English' },
    { name: 'Estonian', native: 'eesti keel' },
    { name: 'Finnish', native: 'Suomi' },
    { name: 'French', native: 'Français' },
    { name: 'German', native: 'Deutsch' },
    { name: 'Greek', native: 'Ελληνικά' },
    { name: 'Haitian Creole', native: 'kreyòl ayisyen' },
    { name: 'Hebrew', native: 'עִברִית' },
    { name: 'Hindi', native: 'हिन्दी' },
    { name: 'Hungarian', native: 'Magyar' },
    { name: 'Icelandic', native: 'Íslenska' },
    { name: 'Indonesian', native: 'Bahasa Indonesia' },
    { name: 'Italian', native: 'Italiano' },
    { name: 'Japanese', native: '日本語' },
    { name: 'Kazakh', native: 'қазақ' },
    { name: 'Khmer', native: 'ភាសាខ្មែរ' },
    { name: 'Korean', native: '한국어' },
    { name: 'Latvian', native: 'Latvietis' },
    { name: 'Lithuanian', native: 'Lietuvis' },
    { name: 'Malay', native: 'Bahasa Melayu' },
    { name: 'Norwegian', native: 'Norsk' },
    { name: 'Polish', native: 'Polski' },
    { name: 'Portuguese', native: 'Português' },
    { name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    { name: 'Romanian', native: 'Română' },
    { name: 'Russian', native: 'Русский язык' },
    { name: 'Serbian', native: 'српски језик' },
    { name: 'Slovak', native: 'Slovák' },
    { name: 'Slovenian', native: 'Slovenščina' },
    { name: 'Spanish', native: 'Español' },
    { name: 'Swedish', native: 'Svenska' },
    { name: 'Filipino (Tagalog)', native: 'Pilipino' },
    { name: 'Tamil', native: 'தமிழ்' },
    { name: 'Thai', native: 'ภาษาไทย' },
    { name: 'Turkish', native: 'Türkçe' },
    { name: 'Ukrainian', native: 'Українська' },
    { name: 'Vietnamese', native: 'tiếng Việt' },
  ];

  const [enabledLanguages, setEnabledLanguages] = useState(new Set<string>());

  const toggleLanguage = (language: string) => {
    setEnabledLanguages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(language)) {
        newSet.delete(language);
      } else {
        newSet.add(language);
      }
      return newSet;
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-6 dark:bg-black dark:text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-2">Languages</h1>
      <p className="text-gray-400 mb-6">
        Customize the languages your AI Agent speaks. Your AI Agent will use English knowledge articles to generate responses in all enabled languages.{" "}
        <a href="#" className="text-blue-400 underline">
          Learn more
        </a>
      </p>

      <div className="mb-4 text-gray-400">
        Available languages ({enabledLanguages.size}/50 enabled)
      </div>

      <input
        type="text"
        placeholder="Find a language..."
        className="block w-full p-2 mb-4 border border-gray-600 rounded-md bg-gray-800 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      />

      <ul className="space-y-4">
        {languages.map((lang) => (
          <li key={lang.name} className="flex items-center justify-between">
            <div>
              <span className="font-semibold">{lang.name}</span>
              <span className="text-gray-400 ml-2">{lang.native}</span>
            </div>
            <CustomSwitch
              checked={enabledLanguages.has(lang.name)}
              onChange={() => toggleLanguage(lang.name)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
