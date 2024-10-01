import { Metadata } from "next";
import Image from "next/image";
import { z } from "zod";
import { createClient } from '@/server'; // Adjust the import path
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { UserNav } from "./components/user-nav";
import { taskSchema } from "./data/schema";

export const metadata: Metadata = {
  title: "Call Tasks",
  description: "A call task and issue tracker built using Tanstack Table.",
};

// Fetch data from the `call_tasks` table
async function getCallTasks() {
  const { data: callTasks, error } = await supabase
    .from('call_tasks')
    .select('id, campaign_id, call_subject, call_status, priority, scheduled_at, created_at, updated_at, contacts(first_name, last_name, phone)'); // Make sure 'id' is included

  if (error) {
    throw new Error(error.message);
  }

  // Format the call tasks similarly to how tasks are formatted
  const formattedTasks = callTasks
    .filter(task => 
      task.campaign_id &&
      task.contacts?.first_name && // Ensure contact fields are present
      task.call_subject && 
      task.call_status && 
      task.priority &&
      task.id // Ensure the id field is present
    )
    .map(task => ({
      id: task.id, // Include the id field
      campaign_id: task.campaign_id, // Campaign ID for the task
      name: `${task.contacts.first_name} ${task.contacts.last_name}`, // Name is constructed from contact info
      description: task.call_subject, // Use the call_subject as description
      status: task.call_status || 'inactive', // Call status, default to 'inactive' if missing
      title: task.call_subject, // Use the call_subject as title
      label: task.priority || 'low', // Task priority, default to 'low'
      priority: task.priority || 'low', // Use priority from call_tasks
      due_date: task.scheduled_at ? new Date(task.scheduled_at) : null, // Use scheduled_at as due date
      created_at: new Date(task.created_at),
      updated_at: new Date(task.updated_at),
    }));

  return z.array(taskSchema).parse(formattedTasks);
}

export default async function TaskPage() {
  const tasks = await getCallTasks();

  return (
    <>
      <div className="md:hidden">
        <Image
          src="/examples/tasks-light.png"
          width={1280}
          height={998}
          alt="Playground"
          className="block dark:hidden"
        />
        <Image
          src="/examples/tasks-dark.png"
          width={1280}
          height={998}
          alt="Playground"
          className="hidden dark:block"
        />
      </div>
      <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
            <p className="text-muted-foreground">
              Here&apos;s a list of your call tasks!
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <UserNav />
          </div>
        </div>
        <DataTable data={tasks} columns={columns} />
      </div>
    </>
  );
}
