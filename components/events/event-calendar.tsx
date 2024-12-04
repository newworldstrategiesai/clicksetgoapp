"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { type Event } from "@/lib/types";

interface EventCalendarProps {
  events: Event[];
  onEventClick: (eventId: string) => void;
}

export function EventCalendar({ events, onEventClick }: EventCalendarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const calendarEvents = events.map((event) => ({
    id: event.id,
    title: `${event.type} - ${event.location}`,
    start: event.date,
    allDay: true,
    className: `status-${event.status.toLowerCase()}`,
    extendedProps: {
      status: event.status,
      location: event.location,
      type: event.type,
    },
  }));

  return (
    <Card className="p-4">
      <style jsx global>{`
        .fc {
          --fc-border-color: hsl(var(--border));
          --fc-button-text-color: hsl(var(--foreground));
          --fc-button-bg-color: hsl(var(--background));
          --fc-button-border-color: hsl(var(--border));
          --fc-button-hover-bg-color: hsl(var(--accent));
          --fc-button-hover-border-color: hsl(var(--accent));
          --fc-button-active-bg-color: hsl(var(--accent));
          --fc-button-active-border-color: hsl(var(--accent));
          --fc-event-bg-color: hsl(var(--primary));
          --fc-event-border-color: hsl(var(--primary));
          --fc-today-bg-color: hsl(var(--accent) / 0.1);
        }

        .fc .fc-button {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          border-radius: var(--radius);
        }

        .fc .fc-button-primary:not(:disabled).fc-button-active,
        .fc .fc-button-primary:not(:disabled):active {
          background-color: hsl(var(--accent));
          border-color: hsl(var(--accent));
          color: hsl(var(--accent-foreground));
        }

        .fc-event {
          cursor: pointer;
          padding: 2px 4px;
          font-size: 0.875rem;
        }

        .status-lead {
          background-color: hsl(var(--warning) / 0.2) !important;
          border-color: hsl(var(--warning)) !important;
          color: hsl(var(--warning)) !important;
        }

        .status-confirmed {
          background-color: hsl(var(--success) / 0.2) !important;
          border-color: hsl(var(--success)) !important;
          color: hsl(var(--success)) !important;
        }

        .status-contracted {
          background-color: hsl(var(--primary) / 0.2) !important;
          border-color: hsl(var(--primary)) !important;
          color: hsl(var(--primary)) !important;
        }

        .status-completed {
          background-color: hsl(var(--muted) / 0.2) !important;
          border-color: hsl(var(--muted)) !important;
          color: hsl(var(--muted)) !important;
        }
      `}</style>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={calendarEvents}
        eventClick={(info) => onEventClick(info.event.id)}
        height="auto"
        aspectRatio={1.8}
      />
    </Card>
  );
}