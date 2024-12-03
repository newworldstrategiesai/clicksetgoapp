"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/utils/supabaseClient";
import { DataTable } from "./components/data-table";
import { UserNav } from "./components/user-nav";
import { getColumns, YourTaskType } from "./components/columns";
import TaskModal from "@/components/TaskModal";
import { TooltipProvider } from "@/components/tasks/tooltip";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { CustomColumnDef } from "./components/custom-column-def";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function TaskPage() {
  const [tasks, setTasks] = useState<YourTaskType[]>([]);
  const [selectedTask, setSelectedTask] = useState<YourTaskType | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [allColumns, setAllColumns] = useState<CustomColumnDef<YourTaskType, any>[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

  const handleEdit = (task: YourTaskType) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  function hasAccessorKey<TData, TValue>(
    column: CustomColumnDef<TData, TValue>
  ): column is CustomColumnDef<TData, TValue> & { accessorKey: string } {
    return "accessorKey" in column && typeof (column as any).accessorKey === "string";
  }

  const initializeColumns = () => {
    const columns = getColumns(handleEdit);
    setAllColumns(columns);

    const defaultVisible = columns
      .filter((column) => column.meta?.isDefault)
      .map(
        (column) =>
          (hasAccessorKey(column) ? column.accessorKey : column.id) as string
      );

    setVisibleColumns(defaultVisible);

    console.log("Initialized Columns:", columns);
    console.log("Default Visible Columns:", defaultVisible);
  };

  const fetchTasks = async function (){
    {
      const { data: callTasks, error } = await supabase
        .from("call_tasks")
        .select(
          "id, campaign_id, call_subject, call_status, priority, scheduled_at, created_at, updated_at, contacts(first_name, last_name, phone)"
        );

      if (error) {
        console.error("Error fetching call tasks:", error.message);
        toast.error("Failed to fetch tasks.");
        return;
      }

      const formattedTasks: YourTaskType[] = callTasks.map((task: any) => ({
        id: task.id,
        campaign_id: task.campaign_id || null,
        call_subject: task.call_subject || "",
        call_status: task.call_status || "",
        priority: task.priority || null,
        scheduled_at: task.scheduled_at ? new Date(task.scheduled_at) : null,
        created_at: task.created_at ? new Date(task.created_at) : new Date(),
        updated_at: task.updated_at ? new Date(task.updated_at) : new Date(),
        contacts: Array.isArray(task.contacts)
          ? task.contacts
          : task.contacts
          ? [task.contacts]
          : [{ first_name: "Unknown", last_name: "Unknown", phone: "" }],
      }));

      // Sort tasks by updated_at in descending order (latest first)
      const sortedTasks = formattedTasks.sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime());

      setTasks(sortedTasks);
    }
  }

  useEffect(() => {
    fetchTasks();
    initializeColumns();
  }, []);

  const handleToggleColumn = (columnId: string) => {
    setVisibleColumns((prev) => {
      if (prev.includes(columnId)) {
        return prev.filter((id) => id !== columnId);
      } else {
        return [...prev, columnId];
      }
    });
  };

  const filteredColumns = allColumns.filter((column) => {
    const columnId = column.id || (hasAccessorKey(column) ? column.accessorKey : "");
    return visibleColumns.includes(columnId);
  });

  useEffect(() => {
    const savedColumns = localStorage.getItem("visibleColumns");
    if (savedColumns) {
      setVisibleColumns(JSON.parse(savedColumns));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("visibleColumns", JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  // Force Launch Handler
  const handleForceLaunch = async () => {
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .update({ status: "active", updated_at: new Date() })
        .eq("status", "pending");

      if (error) {
        throw error;
      }

      toast.success("Campaigns force launched successfully!");
      // Optionally, refresh the task list
      fetchTasks();
    } catch (error: any) {
      console.error("Error force launching campaigns:", error.message);
      toast.error("Failed to force launch campaigns.");
    }
  };

  if (allColumns.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        Loading...
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <>
        <ToastContainer />

        {/* Mobile View Images */}
        <div className="md:hidden flex justify-center items-center p-4">
          <div className="relative w-full h-64 sm:h-80">
            <Image
              src="/examples/tasks-light.png"
              alt="Tasks Light Mode"
              layout="fill"
              objectFit="contain"
              className="block dark:hidden"
              priority
            />
            <Image
              src="/examples/tasks-dark.png"
              alt="Tasks Dark Mode"
              layout="fill"
              objectFit="contain"
              className="hidden dark:block"
              priority
            />
          </div>
        </div>

        {/* Task List Visible on All Screen Sizes */}
        <div className="flex flex-col space-y-8 p-4 sm:p-6 lg:p-8">
          {/* Header with Force Launch Button */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Welcome back!</h2>
              <p className="text-muted-foreground">
                Here's a list of your call tasks!
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleForceLaunch}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition text-sm sm:text-base"
                aria-label="Force Launch Campaigns"
              >
                Force Launch
              </button>
              <UserNav />
            </div>
          </div>

          {/* Task List */}
          <TooltipProvider>
            <div className="overflow-x-auto">
              <DataTable
                data={tasks}
                columns={filteredColumns}
                allColumns={allColumns}
                visibleColumns={visibleColumns}
                toggleColumn={handleToggleColumn}
              />
            </div>
          </TooltipProvider>

          {/* Task Modal */}
          {showModal && selectedTask && (
            <TaskModal
              task={selectedTask}
              onClose={() => setShowModal(false)}
              onSave={() => {
                setShowModal(false);
                toast.success("Task updated successfully.");
              }}
              className="max-w-full sm:max-w-lg"
            />
          )}
        </div>
      </>
    </ErrorBoundary>
  );
}
