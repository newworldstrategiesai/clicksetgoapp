import React from 'react';
import { Popover as HeadlessPopover } from '@headlessui/react';

export function Popover({ children }: { children: React.ReactNode }) {
  return (
    <HeadlessPopover className="relative">
      {children}
    </HeadlessPopover>
  );
}

export function PopoverTrigger({ children }: { children: React.ReactNode }) {
  return (
    <HeadlessPopover.Button className="focus:outline-none">
      {children}
    </HeadlessPopover.Button>
  );
}

export function PopoverContent({ children }: { children: React.ReactNode }) {
  return (
    <HeadlessPopover.Panel className="absolute z-10 w-56 p-2 mt-2 bg-white border rounded-md shadow-lg">
      {children}
    </HeadlessPopover.Panel>
  );
}
