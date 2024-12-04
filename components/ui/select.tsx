// components/ui/select.tsx

import React from 'react';

// Define and export each component individually
export const Select: React.FC<{ value: string; onValueChange: (value: string) => void; children: React.ReactNode }> = ({ value, onValueChange, children }) => {
  return (
    <div className="relative inline-block text-left">
      {children}
    </div>
  );
};

export const SelectTrigger: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <button className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
      {children}
    </button>
  );
};

export const SelectContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
      <div className="py-1">
        {children}
      </div>
    </div>
  );
};

export const SelectItem: React.FC<{ value: string; children: React.ReactNode }> = ({ value, children }) => {
  const handleClick = () => {
    // Handle the selection logic
    console.log(`Selected: ${value}`);
  };

  return (
    <div
      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
      onClick={handleClick}
    >
      {children}
    </div>
  );
};

export const SelectValue: React.FC<{ placeholder: string }> = ({ placeholder }) => {
  return (
    <span className="truncate">
      {placeholder}
    </span>
  );
};
