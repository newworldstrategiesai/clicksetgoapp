'use client';

export default function CustomSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`${
        checked ? 'bg-purple-600' : 'bg-gray-700'
      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200`}
    >
      <span
        className={`${
          checked ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200`}
      />
    </button>
  );
}
