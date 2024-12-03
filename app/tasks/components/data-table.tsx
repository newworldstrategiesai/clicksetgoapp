"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  Table as ReactTableType,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/new-york/ui/table";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar"; // Correct import

import { CustomColumnDef } from "./custom-column-def"; // Correct import
import { YourTaskType } from "./columns"; // Correct import

interface DataTableProps {
  columns: CustomColumnDef<YourTaskType, any>[];
  data: YourTaskType[];
  allColumns: CustomColumnDef<YourTaskType, any>[];
  visibleColumns: string[];
  toggleColumn: (columnId: string) => void;
  onColumnClick: (columnId: string) => void; // Added onColumnClick for sorting
}

export function DataTable({
  columns,
  data,
  allColumns,
  visibleColumns,
  toggleColumn,
  onColumnClick, // Added onColumnClick
}: DataTableProps) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table: ReactTableType<YourTaskType> = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  // Log all columns for debugging
  console.log("All Columns in DataTable:", allColumns);
  console.log("Visible Columns in DataTable:", visibleColumns);

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        allColumns={allColumns}
        visibleColumns={visibleColumns}
        toggleColumn={toggleColumn}
      />
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isSorted = sorting.some(
                    (sort) => sort.id === header.id
                  );
                  const sortDirection = isSorted
                    ? sorting.find((sort) => sort.id === header.id)?.desc
                      ? "desc"
                      : "asc"
                    : undefined;

                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : (
                        <button
                          onClick={() => onColumnClick(header.id)} // Trigger sorting when clicked
                          className={`flex items-center space-x-2 ${
                            isSorted
                              ? sortDirection === "asc"
                                ? "text-blue-600"
                                : "text-red-600"
                              : "text-white"
                          }`}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {isSorted && (
                            <span className="ml-1">
                              {sortDirection === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </button>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}