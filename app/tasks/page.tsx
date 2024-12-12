// Add the dynamic rendering configuration
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createClient } from '@/server';
import { getUser } from '@/utils/supabase/queries';
import TaskPage from './components/TaskPage';

export default async function TasksPage() {
  try {
    const supabase = await createClient();
    const user = await getUser(supabase);


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
  };

  const fetchTasks = async function (){
    {
      const { data: callTasks, error: callTasksError } = await supabase
        .from("call_tasks")
        .select(
          "id, campaign_id, call_subject, call_status, priority, scheduled_at, created_at, updated_at, contacts(first_name, last_name, phone), campaigns!fk_campaign(name)"
        );

      if (callTasksError) {
        console.error("Error fetching call tasks:", callTasksError.message);
        toast.error("Failed to fetch tasks.");
        return;
      }
      console.log("callTasks",callTasks)

      const formattedTasks: YourTaskType[] = callTasks.map((task: any) => ({
        id: task.id,
        campaign_id: task.campaign_id || null,
        campaign_name: task.campaigns ? task.campaigns.name : "Unknown",
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
    console.log(columnId)
    return visibleColumns.includes(columnId);
  });

    if (!user) {
      return redirect('/signin');
    }


    return <TaskPage userId={user.id} />; // Pass userId to CallLogsClient
  } catch (error) {
    console.error('Error fetching user data:', error);
    return redirect('/signin');
  }
}
