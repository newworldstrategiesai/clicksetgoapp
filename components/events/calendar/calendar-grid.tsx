"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { type Event } from "@/lib/types";

interface CalendarGridProps {
  events: Event[];
  onEventClick: (eventId: string) => void;
  onDateSelect: (start: Date, end: Date) => void;
}

export function CalendarGrid({
  events,
  onEventClick,
  onDateSelect
}: CalendarGridProps) {
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
      selectable={true}
      select={(info) => onDateSelect(info.start, info.end)}
      height="auto"
      aspectRatio={1.8}
    />
  );
}