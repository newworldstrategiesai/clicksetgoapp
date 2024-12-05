// components/TimeRangeSelector.tsx
import React from 'react';

type TimeRange = 'today' | 'week' | 'month' | 'year';

interface Props {
  selectedRange: TimeRange;
  onSelectRange: (range: TimeRange) => void;
}

const TimeRangeSelector: React.FC<Props> = ({ selectedRange, onSelectRange }) => {
  return (
    <div className="flex space-x-4 mb-4">
      {['today', 'week', 'month', 'year'].map((range) => (
        <button
          key={range}
          className={`px-4 py-2 border rounded ${selectedRange === range ? 'bg-blue-500 dark:text-white' : 'bg-white text-black'}`}
          onClick={() => onSelectRange(range as TimeRange)}
        >
          {range.charAt(0).toUpperCase() + range.slice(1)}
        </button>
      ))}
    </div>
  );
};

export default TimeRangeSelector;
