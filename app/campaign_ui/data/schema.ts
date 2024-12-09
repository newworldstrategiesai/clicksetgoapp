import { z } from "zod";

// Update the task schema to match YourTaskType without contacts
export const campaignSchema = z.object({
  id: z.string().uuid(), // Ensures ID is a UUID
  name: z.string(), // Task name (was campaign_name)
  description: z.string(), // Task description
  start_date: z.date().nullable(), // Start date of the task (nullable)
  end_date: z.date().nullable(), // End date of the task (nullable)
  status: z.string(), // Task status (was call_status)
  budget: z.number(), // Budget for the task
  updated_at: z.date().default(() => new Date()), // Defaults to current timestamp
  created_at: z.date().optional(), // Optional created_at timestamp
});

export type Task = z.infer<typeof campaignSchema>;
