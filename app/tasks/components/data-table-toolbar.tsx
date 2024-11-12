// app/tasks/components/data-table-toolbar.tsx

"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { Button } from "@/registry/new-york/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";

import { priorities, statuses } from "../data/data";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { CustomColumnDef } from "./custom-column-def"; // Correct import
import { YourTaskType } from "./columns"; // Import YourTaskType from columns.tsx

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  allColumns: CustomColumnDef<YourTaskType, any>[];
  visibleColumns: string[];
  toggleColumn: (columnId: string) => void;
}

export function DataTableToolbar<TData>({
  table,
  allColumns,
  visibleColumns,
  toggleColumn,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  // Log available columns for debugging
  console.log("Available Columns in Toolbar:", table.getAllColumns());

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {/* Corrected 'call_subject' */}
        <Input
          placeholder="Filter tasks..."
          value={(table.getColumn("call_subject")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("call_subject")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {/* Corrected 'call_status' */}
        {table.getColumn("call_status") && (
          <DataTableFacetedFilter
            column={table.getColumn("call_status")}
            title="Status"
            options={statuses}
          />
        )}
        {table.getColumn("priority") && (
          <DataTableFacetedFilter
            column={table.getColumn("priority")}
            title="Priority"
            options={priorities}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      {/* Pass the correct props to DataTableViewOptions */}
      <DataTableViewOptions
        allColumns={allColumns}
        visibleColumns={visibleColumns}
        toggleColumn={toggleColumn}
      />
    </div>
  );
}
