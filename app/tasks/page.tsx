'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/utils/supabaseClient'; // Import the Supabase client
import { DataTable } from './components/data-table';
import { UserNav } from './components/user-nav';
import { columns } from './components/columns';
import TaskModal from 'components/TaskModal';
import DataTableRowActions from './components/data-table-row-actions'; // Import DataTableRowActions

// Define the YourTaskType interface
type YourTaskType = {
  id: string;
  name: string | null; // Make name nullable
  campaign_id: string | null;
  priority: string | null;
  created_at: Date;
  updated_at: Date;
  call_subject: string;
  call_status: string;
  scheduled_at: Date | null;
  contacts: { first_name: string; last_name: string; phone: string }[];
  title: string | null;
  label: string | null;
  description: string | null;
  due_date: Date | null;
  status: string | null;
};

export default function TaskPage() {
  const [tasks, setTasks] = useState<YourTaskType[]>([]); // Specify the type for tasks
  const [selectedTask, setSelectedTask] = useState<YourTaskType | null>(null); // Allow selectedTask to be null
  const [showModal, setShowModal] = useState(false); // State to control modal visibility

  // Function to handle editing a task (opens the modal)
  const handleEdit = (task: YourTaskType) => {
    setSelectedTask(task); // No need for type assertion here
    setShowModal(true);
  };

  useEffect(() => {
    async function fetchTasks() {
      const { data: callTasks, error } = await supabase
        .from('call_tasks')
        .select(
          'id, campaign_id, call_subject, call_status, priority, scheduled_at, created_at, updated_at, contacts(first_name, last_name, phone)'
        );

      if (error) {
        console.error('Error fetching call tasks:', error.message);
        return; // Exit the function if there's an error
      }

      // Ensure formattedTasks matches YourTaskType[]
      const formattedTasks = callTasks.map((task) => ({
        id: task.id,
        campaign_id: task.campaign_id || null,
        call_subject: task.call_subject || '', // Ensure this property is included
        call_status: task.call_status || '', // Ensure this property is included
        priority: task.priority || null,
        scheduled_at: task.scheduled_at ? new Date(task.scheduled_at) : null, // Ensure this property is included
        created_at: task.created_at ? new Date(task.created_at) : new Date(), // Default to now if not available
        updated_at: task.updated_at ? new Date(task.updated_at) : new Date(), // Default to now if not available
        contacts: task.contacts || [{ first_name: 'Unknown', last_name: 'Unknown', phone: '' }],
        name: null, // Ensure these properties are not undefined
        title: null,
        label: null,
        description: null,
        due_date: null,
        status: null,
      }));

      setTasks(formattedTasks); // Ensure formattedTasks matches YourTaskType[]
    }

    fetchTasks();
  }, []);

  return (
    <>
      {/* Mobile view */}
      <div className="md:hidden">
        <Image
          src="/examples/tasks-light.png"
          width={1280}
          height={998}
          alt="Tasks"
          className="block dark:hidden"
        />
        <Image
          src="/examples/tasks-dark.png"
          width={1280}
          height={998}
          alt="Tasks"
          className="hidden dark:block"
        />
      </div>

      {/* Desktop/Table view */}
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

        {/* Data table */}
        <DataTable data={tasks} columns={columns} />

        {/* TaskModal to edit the task */}
        {showModal && selectedTask && (
          <TaskModal
            task={selectedTask}
            onClose={() => setShowModal(false)}
            onSave={() => {
              setShowModal(false);
              // Fetch updated tasks or update state after saving
            }}
          />
        )}
      </div>
    </>
  );
}
