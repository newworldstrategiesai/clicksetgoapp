"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Phone,
  Users,
  Calendar,
  MessageSquare,
  LayoutDashboard,
  Music,
  Menu,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MainNav } from "@/components/main-nav";

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Leads",
    href: "/leads",
    icon: Users,
  },
  {
    title: "Events",
    href: "/events",
    icon: Calendar,
  },
  {
    title: "Dialer",
    href: "/dialer",
    icon: Phone,
  },
  {
    title: "Messages",
    href: "/sms",
    icon: MessageSquare,
  },
  {
    title: "Requests",
    href: "/requests",
    icon: Music,
  },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <button className="fixed top-4 right-4 z-50 md:hidden p-2 bg-background border rounded-lg">
            <Menu className="h-6 w-6" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>CLICK SET GO DJ</SheetTitle>
          </SheetHeader>
          <MainNav />
        </SheetContent>
      </Sheet>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t md:hidden">
        <nav className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full",
                  "text-muted-foreground hover:text-foreground transition-colors",
                  isActive && "text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}