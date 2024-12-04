"use client";

import { Badge } from "@/components/ui/badge";

type EventStatus = "Lead" | "Confirmed" | "Contracted" | "Paid" | "Completed";

interface EventStatusBadgeProps {
  status: EventStatus;
}

const statusStyles = {
  Lead: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  Confirmed: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  Contracted: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  Paid: "bg-green-100 text-green-800 hover:bg-green-100",
  Completed: "bg-gray-100 text-gray-800 hover:bg-gray-100",
};

export function EventStatusBadge({ status }: EventStatusBadgeProps) {
  return (
    <Badge className={statusStyles[status]} variant="outline">
      {status}
    </Badge>
  );
}