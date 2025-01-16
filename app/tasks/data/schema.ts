// app/tasks/data/schema.ts

import { z } from "zod";

// Define the contact schema
export const contactSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  phone: z.string().optional(), // Assuming phone can be optional
});

// Update the task schema to match YourTaskType
export const taskSchema = z.object({
  id: z.string().uuid(), // Ensures ID is a UUID
  campaign_id: z.string().uuid().nullable(), // Campaign ID, nullable if not a valid UUID
  campaign_name: z.string(),
  call_subject: z.string(), // Call subject
  call_status: z.string(), // Call status
  priority: z.string().nullable(), // Priority, nullable
  scheduled_at: z.date().nullable(), // Scheduled date, nullable
  created_at: z.date().default(() => new Date()), // Defaults to current timestamp
  updated_at: z.date().default(() => new Date()), // Defaults to current timestamp
  contacts: z.array(contactSchema), // Contacts as an array
});

export type Task = z.infer<typeof taskSchema>;
