"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { CalendarHeader } from "./calendar-header";
import { CalendarGrid } from "./calendar-grid";
import { type Event } from "@/lib/types";

interface CalendarContainerProps {
  events: Event[];
  onEventClick: (eventId: string) => void;
  onDateSelect: (start: Date, end: Date) => void;
}

export function CalendarContainer({
  events,
  onEventClick,
  onDateSelect
}: CalendarContainerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Card className="p-4">
      <CalendarHeader />
      <CalendarGrid 
        events={events}
        onEventClick={onEventClick}
        onDateSelect={onDateSelect}
      />
    </Card>
  );
}