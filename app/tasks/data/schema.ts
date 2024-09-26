import { z } from "zod"

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const taskSchema = z.object({
  id: z.string().uuid(), // Updated to uuid
  campaign_id: z.string().uuid().nullable(), // New field
  name: z.string(), // New field
  description: z.string().nullable(), // New field
  due_date: z.date().nullable(), // New field
  status: z.string().nullable(), // Existing field
  title: z.string().nullable(), // Change to nullable
  label: z.string().nullable(), // Change to nullable
  priority: z.string().nullable(), // Change to nullable
  created_at: z.date().default(() => new Date()), // Updated to use current timestamp
  updated_at: z.date().default(() => new Date()), // Updated to use current timestamp
})

export type Task = z.infer<typeof taskSchema>
