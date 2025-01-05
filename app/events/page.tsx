"use client";

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Calendar as CalendarIcon, List } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { type Event } from "@/lib/types";
import { EventForm } from "@/components/events/event-form";
import { EventStatusBadge } from "@/components/events/event-status-badge";
import { EventCalendar } from "@/components/events/event-calendar";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const columns: ColumnDef<Event>[] = [
  {
    accessorKey: "type",
    header: "Event Type",
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => formatDate(row.getValue("date")),
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <EventStatusBadge status={row.getValue("status")} />
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const event = row.original;
      return (
        <div className="flex items-center gap-2">
          <Link href={`/contracts/${event.id}`}>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-1" />
              Contract
            </Button>
          </Link>
        </div>
      );
    },
  },
];

const mockEvents: Event[] = [
  {
    id: "1",
    clientId: "1",
    type: "Wedding",
    date: new Date("2024-06-15"),
    location: "Grand Hotel",
    status: "Confirmed",
    musicPreferences: ["Pop", "Jazz"],
    notes: "Outdoor ceremony",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [showEventForm, setShowEventForm] = useState(false);
  const [view, setView] = useState<"calendar" | "list">("calendar");

  const handleCreateEvent = (eventData: Partial<Event>) => {
    const newEvent: Event = {
      id: crypto.randomUUID(),
      clientId: crypto.randomUUID(),
      type: eventData.type || "Other",
      date: eventData.date || new Date(),
      location: eventData.location || "",
      status: "Lead",
      musicPreferences: eventData.musicPreferences || [],
      notes: eventData.notes || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setEvents((prev) => [...prev, newEvent]);
    setShowEventForm(false);
  };

  const handleEventClick = (eventId: string) => {
    // Navigate to event details page
    window.location.href = `/events/${eventId}`;
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground mt-2">
            Manage your upcoming events and bookings
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Tabs value={view} onValueChange={(v) => setView(v as "calendar" | "list")}>
            <TabsList>
              <TabsTrigger value="calendar">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="list">
                <List className="h-4 w-4 mr-2" />
                List
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={() => setShowEventForm(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {view === "calendar" ? (
          <EventCalendar events={events} onEventClick={handleEventClick} />
        ) : (
          <DataTable columns={columns} data={events} />
        )}
      </div>

      <EventForm
        open={showEventForm}
        onOpenChange={setShowEventForm}
        onSubmit={handleCreateEvent}
      />
    </div>
  );
}