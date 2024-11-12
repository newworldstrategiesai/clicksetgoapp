// app/tasks/components/data-table-row-actions.tsx

"use client";

import React, { useState } from "react";
import {
  DotsHorizontalIcon,
  TrashIcon,
  Pencil1Icon,
} from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";
import { Button } from "@/registry/new-york/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/new-york/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/registry/new-york/ui/dialog";
import { taskSchema } from "../data/schema";
import { supabase } from '@/utils/supabaseClient'; // Import Supabase client
import { toast } from 'react-toastify'; // For user feedback

interface Task {
  id: string;
  campaign_id: string | null;
  call_subject: string;
  call_status: string;
  priority: string | null;
  scheduled_at: Date | null;
  created_at: Date;
  updated_at: Date;
  contacts: { first_name: string; last_name: string; phone: string }[];
}

interface DataTableRowActionsProps {
  row: Row<Task>;
  onEdit: (task: Task) => void;
}

export default function DataTableRowActions({
  row,
  onEdit,
}: DataTableRowActionsProps) {
  let task: Task;
  try {
    const parsedTask = taskSchema.parse(row.original); // Validate the task schema
    // Ensure all contacts have a phone number
    const contactsWithPhone = parsedTask.contacts.map(contact => ({
      ...contact,
      phone: contact.phone || '', // This ensures 'phone' is a string
    }));
    task = {
      ...parsedTask,
      contacts: contactsWithPhone
    };
  } catch (error) {
    console.error('Task validation failed:', error);
    return null; // Optionally, render a fallback UI
  }

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDelete = async () => {
    // Implement your delete logic here, such as calling Supabase to delete the task
    const { error } = await supabase
      .from('call_tasks')
      .delete()
      .eq('id', task.id);

    if (error) {
      console.error('Error deleting task:', error.message);
      toast.error('Failed to delete task. Please try again.');
    } else {
      console.log("Task deleted:", task.id);
      toast.success('Task deleted successfully.');
      // Optionally, trigger a data refresh or state update here
    }

    setIsDialogOpen(false);
  };

  return (
    <div className="flex items-center justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={() => onEdit(task)}>
            <Pencil1Icon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
            <TrashIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Delete
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {/* Add more actions as needed */}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
