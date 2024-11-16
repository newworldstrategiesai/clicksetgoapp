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
    return 'accessorKey' in column && typeof (column as any).accessorKey === 'string';
  }
  
  const initializeColumns = () => {
    const columns = getColumns(handleEdit);
    setAllColumns(columns);

    const defaultVisible = columns
      .filter((column) => column.meta?.isDefault)
      .map((column) => (hasAccessorKey(column) ? column.accessorKey : column.id) as string);

    setVisibleColumns(defaultVisible);

    console.log("Initialized Columns:", columns);
    console.log("Default Visible Columns:", defaultVisible);
  };

  useEffect(() => {
    async function fetchTasks() {
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

      setTasks(formattedTasks);
    }

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

  if (allColumns.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <ErrorBoundary>
      <>
        <ToastContainer />
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

        <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
          <div className="flex items-center justify-between space-y-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
              <p className="text-muted-foreground">
                Here's a list of your call tasks!
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <UserNav />
            </div>
          </div>

          <TooltipProvider>
            <DataTable
              data={tasks}
              columns={filteredColumns}
              allColumns={allColumns}
              visibleColumns={visibleColumns}
              toggleColumn={handleToggleColumn}
            />
          </TooltipProvider>

          {showModal && selectedTask && (
            <TaskModal
              task={selectedTask}
              onClose={() => setShowModal(false)}
              onSave={() => {
                setShowModal(false);
                toast.success("Task updated successfully.");
              }}
            />
          )}
        </div>
      </>
    </ErrorBoundary>
  );
}