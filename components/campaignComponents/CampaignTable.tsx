'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/utils/supabaseClient';
import { DataTable } from './data-table';
import { getColumns, YourCampaignType } from './columns';
import TaskModal from '@/components/TaskModal';
import { TooltipProvider } from '@/components/tasks/tooltip';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { CustomColumnDef } from './custom-column-def';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface CampaignTableProps {
  userId: string; // Receive userId as a prop
  apiKey: string; 
  twilioSid: string; 
  twilioAuthToken : string; 
  vapiKey: string
}

export default function CampaignTable({ userId,apiKey, twilioSid, twilioAuthToken, vapiKey  }: CampaignTableProps) {
  const [tasks, setTasks] = useState<YourCampaignType[]>([]);
  const [selectedTask, setSelectedTask] = useState<YourCampaignType | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [allColumns, setAllColumns] = useState<
    CustomColumnDef<YourCampaignType, any>[]
  >([]);
  const [visibleColumnsCampaign, setVisibleColumnsCampagin] = useState<string[]>([]);
  const apiSetting = {
    apiKey, twilioSid, twilioAuthToken, vapiKey
  }


  const handleEdit = (task: YourCampaignType) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  function hasAccessorKey<TData, TValue>(
    column: CustomColumnDef<TData, TValue>
  ): column is CustomColumnDef<TData, TValue> & { accessorKey: string } {
    return (
      'accessorKey' in column && typeof (column as any).accessorKey === 'string'
    );
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

      setVisibleColumnsCampagin(defaultVisible);
  };

  const fetchTasks = async function () {
    {
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select('id,name, description, start_date, end_date, status, budget')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (campaignsError) {
        console.error('Error fetching call tasks:', campaignsError.message);
        toast.error('Failed to fetch tasks.');
        return;
      }

      const formattedTasks: YourCampaignType[] = campaigns.map((campaign: any) => ({
        id: campaign.id,
        name: campaign.name || '',
        description: campaign.description || '',
        start_date: campaign.start_date ? new Date(campaign.start_date) : null,
        end_date: campaign.end_date ? new Date(campaign.end_date) : null,
        status: campaign.status || '',
        budget: campaign.budget || 0,
        updated_at: campaign.updated_at ? new Date(campaign.updated_at) : new Date()
      }));
      // Sort tasks by updated_at in descending order (latest first)
      const sortedTasks = formattedTasks.sort(
        (a, b) => b.updated_at.getTime() - a.updated_at.getTime()
      );

      setTasks(sortedTasks);
    }
  };

  useEffect(() => {
    fetchTasks();
    initializeColumns();
  }, []);

  const handleToggleColumn = (columnId: string) => {
    setVisibleColumnsCampagin((prev) => {
      if (prev.includes(columnId)) {
        return prev.filter((id) => id !== columnId);
      } else {
        return [...prev, columnId];
      }
    });
  };
  const filteredColumns = allColumns.filter((column) => {
    const columnId =
      column.id || (hasAccessorKey(column) ? column.accessorKey : '');
    console.log(columnId);
    return visibleColumnsCampaign.includes(columnId);
  });

  useEffect(() => {
    const savedColumns = localStorage.getItem('visibleColumnsCampaign');
    if (savedColumns) {
        setVisibleColumnsCampagin(JSON.parse(savedColumns));
    }
  }, []);

  useEffect(() => {
    if (visibleColumnsCampaign.length > 0) {
      localStorage.setItem('visibleColumnsCampaign', JSON.stringify(visibleColumnsCampaign));
    }
  }, [visibleColumnsCampaign]);

  if (allColumns.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen dark:text-white">
        Loading...
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <>
        <ToastContainer />

        {/* Mobile View Images */}
        <div className="md:hidden flex justify-center items-center">
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
          {/* <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight dark:text-white">
                Welcome back!
              </h2>
              <p className="text-muted-foreground">
                Here's a list of your call tasks!
              </p>
            </div>
          </div> */}

          {/* Task List */}
          <TooltipProvider>
            <div className="overflow-x-auto">
              <DataTable
                data={tasks}
                columns={filteredColumns}
                allColumns={allColumns}
                visibleColumns={visibleColumnsCampaign}
                toggleColumn={handleToggleColumn}
              />
            </div>
          </TooltipProvider>
        </div>
      </>
    </ErrorBoundary>
  );
}
