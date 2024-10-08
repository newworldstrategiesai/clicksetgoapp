"use client";

import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";
import { Button } from "@/registry/new-york/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/registry/new-york/ui/dropdown-menu";
import { labels } from "../data/data";
import { taskSchema } from "../data/schema";

// Define a Task type that matches the shape of your task data
interface Task {
  id: string;
  campaign_id: string | null;
  name: string | null;
  description: string | null;
  due_date: Date | null;
  status: string | null;
  title: string | null;
  label: string | null;
  priority: string | null;
  created_at: Date;
  updated_at: Date;
}

interface DataTableRowActionsProps {
  row: Row<Task>; // Use the defined Task type
  onEdit: (task: Task) => void; // Update this to match the Task type
}

export default function DataTableRowActions({
  row,
  onEdit, // Destructure the new prop
}: DataTableRowActionsProps) {
  const task = taskSchema.parse(row.original); // Validate the task schema

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={() => onEdit(task)}> {/* Trigger edit */}
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem>Make a copy</DropdownMenuItem>
        <DropdownMenuItem>Favorite</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Labels</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={task.label ?? undefined}>
              {labels.map((label) => (
                <DropdownMenuRadioItem key={label.value} value={label.value}>
                  {label.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
