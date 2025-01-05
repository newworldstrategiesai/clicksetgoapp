"use client";

import { Button } from "@/components/ui/button";

export function CalendarHeader() {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex gap-2">
        <Button variant="outline" size="sm">Today</Button>
        <Button variant="outline" size="sm">Previous</Button>
        <Button variant="outline" size="sm">Next</Button>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm">Month</Button>
        <Button variant="outline" size="sm">Week</Button>
        <Button variant="outline" size="sm">Day</Button>
      </div>
    </div>
  );
}