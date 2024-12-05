// app/tasks/components/columns.tsx

"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretSortIcon,
  EyeNoneIcon,
} from "@radix-ui/react-icons";
import { Checkbox } from "@/registry/new-york/ui/checkbox";

import { cn } from "@/lib/utils";
import { Button } from "@/registry/new-york/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/new-york/ui/dropdown-menu";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/tasks/tooltip";

import { labels, priorities, statuses } from "../data/data";
import { Badge } from "@/registry/new-york/ui/badge";
import DataTableRowActions from "./data-table-row-actions"; // Ensure correct path

import { CustomColumnDef } from "./custom-column-def"; // Correct import
import { Column, Row, Table } from "@tanstack/react-table"; // Import Column, Row, and Table types

// Define the YourTaskType interface
export type YourTaskType = {
  id: string;
  campaign_id: string | null;
  call_subject: string;
  call_status: string;
  priority: string | null;
  scheduled_at: Date | null;
  created_at: Date;
  updated_at: Date;
  contacts: { first_name: string; last_name: string; phone: string }[];
  // Add 'label' if required
  // label?: string;
};

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>; // Use Column from @tanstack/react-table
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            <span>{title}</span>
            {column.getIsSorted() === "desc" ? (
              <ArrowDownIcon className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUpIcon className="ml-2 h-4 w-4" />
            ) : (
              <CaretSortIcon className="ml-2 h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Desc
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <EyeNoneIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Hide
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Function to get all columns with visibility flags
export const getColumns = (
  handleEdit: (task: YourTaskType) => void
): CustomColumnDef<YourTaskType, any>[] => [
  // Select Checkbox Column (Optional)
  {
    id: "select",
    header: ({ table }: { table: Table<YourTaskType> }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }: { row: Row<YourTaskType> }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    meta: { isDefault: false }, // Not a default column
  },
  // Task ID Column (Default)
  {
    accessorKey: "id",
    header: ({ column }: { column: Column<YourTaskType, any> }) => (
      <DataTableColumnHeader column={column} title="Task ID" />
    ),
    cell: ({ row }: { row: Row<YourTaskType> }) => {
      const fullId = row.getValue("id") as string; // Cast to string
      const truncatedId = `${fullId.substring(0, 8)}...`; // Truncate to first 8 characters

      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-[80px] truncate cursor-pointer">{truncatedId}</div>
          </TooltipTrigger>
          <TooltipContent>{fullId}</TooltipContent>
        </Tooltip>
      );
    },
    enableSorting: true,
    enableHiding: false,
    meta: { isDefault: true }, // Default column
  },
  // Call Subject Column (Default)
  {
    accessorKey: "call_subject",
    header: ({ column }: { column: Column<YourTaskType, any> }) => (
      <DataTableColumnHeader column={column} title="Call Subject" />
    ),
    cell: ({ row }: { row: Row<YourTaskType> }) => {
      const fullCallSubject = row.getValue("call_subject") as string; // Cast to string
      const truncatedCallSubject =
        fullCallSubject.length > 30
          ? `${fullCallSubject.substring(0, 30)}...`
          : fullCallSubject;

      return (
        <div className="flex space-x-2">
          {/* Adjusted to use 'call_subject' if 'label' is not present */}
          {labels.find((label) => label.value === row.original.call_subject) && (
            <Badge variant="outline">
              {labels.find((label) => label.value === row.original.call_subject)?.label}
            </Badge>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="max-w-[500px] truncate font-medium cursor-pointer">
                {truncatedCallSubject}
              </span>
            </TooltipTrigger>
            <TooltipContent>{fullCallSubject}</TooltipContent>
          </Tooltip>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: false,
    meta: { isDefault: true }, // Default column
  },
  // Contact Name Column (Default)
  {
    accessorFn: (row: YourTaskType) =>
      `${row.contacts[0]?.first_name} ${row.contacts[0]?.last_name}`,
    id: "contact_name",
    header: ({ column }: { column: Column<YourTaskType, any> }) => (
      <DataTableColumnHeader column={column} title="Contact Name" />
    ),
    cell: ({ row }: { row: Row<YourTaskType> }) => {
      const contactName = `${row.original.contacts[0]?.first_name} ${row.original.contacts[0]?.last_name}`;

      return <div className="truncate">{contactName || "N/A"}</div>;
    },
    enableSorting: true,
    enableHiding: false,
    meta: { isDefault: true }, // Default column
  },
  // Call Status Column (Default)
  {
    accessorKey: "call_status",
    header: ({ column }: { column: Column<YourTaskType, any> }) => (
      <DataTableColumnHeader column={column} title="Call Status" />
    ),
    cell: ({ row }: { row: Row<YourTaskType> }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue("call_status")
      );
      if (!status) return null;

      return (
        <div className="flex items-center">
          {status.icon && (
            <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{status.label}</span>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: false,
    meta: { isDefault: true }, // Default column
    filterFn: (row: Row<YourTaskType>, id: string, value: any) =>
      value.includes(row.getValue(id)),
  },
  // Scheduled At Column (Default)
  {
    accessorKey: "scheduled_at",
    header: ({ column }: { column: Column<YourTaskType, any> }) => (
      <DataTableColumnHeader column={column} title="Scheduled At" />
    ),
    cell: ({ row }: { row: Row<YourTaskType> }) => {
      const scheduledAt = row.getValue("scheduled_at") as Date | null;
      return scheduledAt ? scheduledAt.toLocaleString() : "N/A";
    },
    enableSorting: true,
    enableHiding: false,
    meta: { isDefault: true }, // Default column
    filterFn: (row: Row<YourTaskType>, id: string, value: any) => {
      if (!row.getValue(id)) return false;
      const date = new Date(row.getValue(id) as string); // Cast to string
      return date >= value[0] && date <= value[1];
    },
  },

  // Optional Columns
  {
    accessorKey: "priority",
    header: ({ column }: { column: Column<YourTaskType, any> }) => (
      <DataTableColumnHeader column={column} title="Priority" />
    ),
    cell: ({ row }: { row: Row<YourTaskType> }) => {
      const priority = priorities.find(
        (priority) => priority.value === row.getValue("priority")
      );
      if (!priority) return null;

      return (
        <div className="flex items-center">
          {priority.icon && (
            <priority.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{priority.label}</span>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
    meta: { isDefault: false }, // Optional column
    filterFn: (row: Row<YourTaskType>, id: string, value: any) =>
      value.includes(row.getValue(id)),
  },
  {
    accessorKey: "campaign_id",
    header: ({ column }: { column: Column<YourTaskType, any> }) => (
      <DataTableColumnHeader column={column} title="Campaign ID" />
    ),
    cell: ({ row }: { row: Row<YourTaskType> }) => {
      const campaignId = row.getValue("campaign_id") as string | null;
      return campaignId ? campaignId : "N/A";
    },
    enableSorting: true,
    enableHiding: true,
    meta: { isDefault: false }, // Optional column
  },
  // Add more optional columns as needed
  {
    id: "actions",
    cell: ({ row }: { row: Row<YourTaskType> }) => (
      <DataTableRowActions row={row} onEdit={handleEdit} />
    ),
    enableSorting: false,
    enableHiding: false,
    meta: { isDefault: false }, // Optional column
  },
];