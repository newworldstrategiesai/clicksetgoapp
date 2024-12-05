'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  LayoutDashboard,
  Users,
  Calendar as CalendarIcon,
  FileText,
  Inbox,
  MessageSquare,
  Phone,
  Settings,
  Mic,
  PieChart,
  Bot,
  Megaphone,
  QrCode,
  Map,
  Box,
} from "lucide-react";

const mainNavItems = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
      },
      {
        title: "Analytics",
        href: "/analytics",
        icon: PieChart,
      },
    ],
  },
  {
    title: "Business",
    items: [
      {
        title: "Leads",
        href: "/leads",
        icon: Users,
      },
      {
        title: "Contacts",
        href: "/contacts",
        icon: Users,
      },
      {
        title: "Calendar",
        href: "/events",
        icon: CalendarIcon,
      },
      {
        title: "Contracts",
        href: "/contracts",
        icon: FileText,
      },
    ],
  },
  {
    title: "Communications",
    items: [
      {
        title: "Inbox",
        href: "/emails",
        icon: Inbox,
      },
      {
        title: "SMS",
        href: "/sms-logs",
        icon: MessageSquare,
      },
      {
        title: "Calls",
        href: "/call-logs",
        icon: Phone,
      },
      {
        title: "Marketing",
        href: "/marketing",
        icon: Megaphone,
      },
    ],
  },
  {
    title: "AI Assistants",
    items: [
      {
        title: "Voice Agents",
        href: "/agents",
        icon: Mic,
      },
      {
        title: "Automations",
        href: "/leads/pipeline/automation",
        icon: Bot,
      },
    ],
  },
  {
    title: "Tools",
    items: [
      {
        title: "Inventory",
        href: "/equipment",
        icon: Box,
      },
      {
        title: "Directory",
        href: "/venues",
        icon: Map,
      },
      {
        title: "QR Generator",
        href: "/requests",
        icon: QrCode,
      },
    ],
  },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col flex-1 bg-white dark:bg-black transition-colors duration-300 overflow-y-auto">
      <nav className="flex flex-col gap-2 p-4 flex-1">
        {mainNavItems.map((group) => (
          <div key={group.title} className="mb-6">
            <h3 className="mb-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      "hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100",
                      isActive
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        : "text-gray-600 dark:text-gray-300"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Link
          href="/settings"
          className={clsx(
            "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors mb-2",
            "hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100",
            pathname === "/settings"
              ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              : "text-gray-600 dark:text-gray-300"
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        {/* Integrate the ThemeToggle component here */}
        <div className="mt-4">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
