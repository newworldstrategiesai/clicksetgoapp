// app/tasks/components/custom-column-def.ts

import { ColumnDef } from "@tanstack/react-table";

// Define the structure of the meta property
interface ColumnMeta {
  isDefault: boolean;
}

// Extend ColumnDef to include the meta property using a type
export type CustomColumnDef<TData, TValue> = ColumnDef<TData, TValue> & {
  meta?: ColumnMeta;
};
