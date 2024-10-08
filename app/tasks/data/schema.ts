import { z } from "zod";

// Adjust the schema to allow campaign_id to be null or an empty string
export const taskSchema = z.object({
  id: z.string().uuid(), // Ensures ID is a UUID
  campaign_id: z.string().uuid().nullable(), // Campaign ID, nullable if not a valid UUID
  name: z.string().nullable(), // Name (constructed from contact), nullable if not available
  description: z.string().nullable(), // Task description
  due_date: z.date().nullable(), // Due date, nullable
  status: z.string().nullable(), // Task status
  title: z.string().nullable(), // Task title, nullable
  label: z.string().nullable(), // Task label (like bug, feature), nullable
  priority: z.string().nullable(), // Priority (low, medium, high), nullable
  created_at: z.date().default(() => new Date()), // Defaults to current timestamp
  updated_at: z.date().default(() => new Date()), // Defaults to current timestamp
});

export type Task = z.infer<typeof taskSchema>;
