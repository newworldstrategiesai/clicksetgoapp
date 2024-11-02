// components/sidebar-nav.tsx

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { buttonVariants } from '@/components/custom/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/selectsettings';
import { cn } from '@/lib/utils';

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
    icon: JSX.Element;
  }[];
}

export default function SidebarNav({
  className,
  items,
  ...props
}: SidebarNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [val, setVal] = useState<string>(pathname ?? '/settings');

  const handleSelect = (e: string) => {
    setVal(e);
    router.push(e);
  };

  return (
    <>
      {/* Mobile View */}
      <div className="p-1 md:hidden">
        <Select value={val} onValueChange={handleSelect}>
          <SelectTrigger className="h-12 sm:w-48">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.href} value={item.href}>
                <div className="flex gap-x-4 px-2 py-1">
                  <span className="scale-125">{item.icon}</span>
                  <span className="text-md">{item.title}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop View */}
      <div className="hidden w-full overflow-x-auto bg-background px-1 py-2 md:block">
        <nav
          className={cn(
            'flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1',
            className
          )}
          {...props}
        >
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  buttonVariants({ variant: 'ghost' }),
                  isActive
                    ? 'bg-muted hover:bg-muted'
                    : 'hover:bg-transparent hover:underline',
                  'justify-start flex items-center'
                )}
              >
                <span className="mr-2">{item.icon}</span>
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
