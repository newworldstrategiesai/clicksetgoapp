"use client";

import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import { Button } from "@/registry/new-york/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/new-york/ui/dropdown-menu";

import { CustomColumnDef } from "./custom-column-def";
import { YourCampaignType } from "./columns";

interface DataTableViewOptionsProps {
  allColumns: CustomColumnDef<YourCampaignType, any>[];
  visibleColumns: string[];
  toggleColumn: (columnId: string) => void;
}

// Helper function for type guard on accessorKey
function hasAccessorKey<TData, TValue>(
  column: CustomColumnDef<TData, TValue>
): column is CustomColumnDef<TData, TValue> & { accessorKey: string } {
  return 'accessorKey' in column && typeof column.accessorKey === 'string';
}

export function DataTableViewOptions({
  allColumns = [],
  visibleColumns = [],
  toggleColumn,
}: DataTableViewOptionsProps) {
  const optionalColumns = allColumns.filter(
    (column) => column.meta?.isDefault === false && (column.id || hasAccessorKey(column))
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto hidden h-8 lg:flex">
          <MixerHorizontalIcon className="mr-2 h-4 w-4" />
          View Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px] p-2">
        <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {optionalColumns.map((column) => {
          const columnId = column.id || (hasAccessorKey(column) ? column.accessorKey : "");
          const isChecked = visibleColumns.includes(columnId);
          const columnLabel = columnId
            .replace('_', ' ')
            .replace(/\b\w/g, (l: string) => l.toUpperCase());

          return (
            <DropdownMenuCheckboxItem
              key={columnId}
              className="capitalize flex items-center space-x-2"
              checked={isChecked}
              onCheckedChange={() => toggleColumn(columnId)}
            >
              <span>{columnLabel}</span>
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
