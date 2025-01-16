// app/tasks/components/columns.tsx

'use client';

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretSortIcon,
  EyeNoneIcon
} from '@radix-ui/react-icons';
import { Checkbox } from '@/registry/new-york/ui/checkbox';

import { cn } from '@/lib/utils';
import { Button } from '@/registry/new-york/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/registry/new-york/ui/dropdown-menu';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from '@/components/tasks/tooltip';

import { labels, priorities, statuses } from '../../app/campaign_ui/data/data';
import { Badge } from '@/registry/new-york/ui/badge';

import { CustomColumnDef } from './custom-column-def'; // Correct import
import { Column, Row, Table } from '@tanstack/react-table'; // Import Column, Row, and Table types
import DataTableRowActions from './data-table-row-actions';

// Define the YourTaskType interface
export type YourCampaignType = {
  id: string;
  name: string; // Represents the name of the campaign or task
  description: string; // Description of the task
  start_date: Date | null; // Start date of the campaign/task
  end_date: Date | null; // End date of the campaign/task
  status: string; // Current status of the task (e.g., active, pending)
  budget: number; // Budget for the campaign
  updated_at: Date; // Last updated timestamp
  created_at?: Date; // Optional field for creation timestamp
};

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>; // Use Column from @tanstack/react-table
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            <span>{title}</span>
            {column.getIsSorted() === 'desc' ? (
              <ArrowDownIcon className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'asc' ? (
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
  handleEdit: (task: YourCampaignType) => void
): CustomColumnDef<YourCampaignType, any>[] => [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Campaign ID" />
    ),
    cell: ({ row }) => {
      const fullId = row.getValue('id') as string;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-[100px] truncate">{fullId}</div>
          </TooltipTrigger>
          <TooltipContent>{fullId}</TooltipContent>
        </Tooltip>
      );
    },
    enableSorting: true,
    meta: { isDefault: false }
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => <span>{row.getValue('name')}</span>,
    enableSorting: false,
    meta: { isDefault: true }
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => <span>{row.getValue('description')}</span>,
    enableSorting: false,
    meta: { isDefault: true }
  },
  {
    accessorKey: 'start_date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Start Date" />
    ),
    cell: ({ row }) => {
      const date = row.getValue('start_date') as Date | null;
      return date ? date.toLocaleDateString() : 'N/A';
    },
    enableSorting: true,
    meta: { isDefault: true }
  },
  {
    accessorKey: 'end_date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="End Date" />
    ),
    cell: ({ row }) => {
      const date = row.getValue('end_date') as Date | null;
      return date ? date.toLocaleDateString() : 'N/A';
    },
    enableSorting: true,
    meta: { isDefault: true }
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = statuses.find((s) => s.value === row.getValue('status'));
      return <span>{status?.label || 'Unknown'}</span>;
    },
    enableSorting: false,
    meta: { isDefault: true }
  },
  {
    accessorKey: 'budget',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Budget" />
    ),
    cell: ({ row }: { row: Row<YourCampaignType> }) => {
      const budget = row.getValue('budget') as number; // Cast to number
      return `$${budget.toFixed(2)}`;
    },
    enableSorting: true,
    meta: { isDefault: true }
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Action" />
    ),
    cell: ({ row }: { row: Row<YourCampaignType> }) => (
      <DataTableRowActions row={row} onEdit={handleEdit} />
    ),
    enableSorting: false,
    meta: { isDefault: false } // Optional column
  }
];
