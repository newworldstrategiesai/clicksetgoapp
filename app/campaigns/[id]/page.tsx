"use client"; // Declare this as a Client Component

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import Modal from "react-modal";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface CallTask {
  id: string;
  campaign_id: string;
  call_subject: string;
  call_status: string;
  scheduled_at: string;
  priority: string;
  contact_id: string;
  first_message?: string;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
}

interface CampaignPageProps {
  params: { id: string };
}

export default function CampaignPage({ params }: CampaignPageProps) {
  const { id } = params;
  const [campaignTasks, setCampaignTasks] = useState<(CallTask & { contact_name: string })[]>([]);
  const [campaignData, setCampaignData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isPausing, setIsPausing] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<CallTask | null>(null);

  // Fetch campaign details and call tasks
  useEffect(() => {
    async function fetchCampaignAndTasks() {
      setLoading(true);

      try {
        const { data: campaign, error: campaignError } = await supabase
          .from("campaigns")
          .select("*")
          .eq("id", id)
          .single();

        if (campaignError) {
          console.error("Error fetching campaign:", campaignError.message);
          setError("Error fetching campaign details.");
          return;
        }

        setCampaignData(campaign);

        const { data: tasks, error: taskError } = await supabase
          .from("call_tasks")
          .select(`*, contacts(first_name, last_name, phone)`)
          .eq("campaign_id", id);

        if (taskError) {
          console.error("Error fetching call tasks:", taskError.message);
          setError("Error fetching call tasks.");
        } else {
          const enrichedTasks = tasks.map((task: any) => ({
            ...task,
            contact_name: task.contacts
              ? `${task.contacts.first_name} ${task.contacts.last_name}`
              : "Unknown Contact",
          }));
          setCampaignTasks(enrichedTasks || []);
        }
      } catch (error: unknown) { // Explicitly set the type of error
        if (axios.isAxiosError(error)) {
          console.error("Error fetching campaign and tasks:", error.message);
        } else {
          console.error("Unexpected error:", error);
        }
        setError("Error fetching campaign and tasks.");
      } finally {
        setLoading(false);
      }
    }

    fetchCampaignAndTasks();
  }, [id]);

  const handleLaunchCampaign = async () => {
    setIsLaunching(true);
    setError(null);

    try {
      for (const task of campaignTasks) {
        const { data: contact, error: contactError } = await supabase
          .from("contacts")
          .select("*")
          .eq("id", task.contact_id)
          .single();

        if (contactError || !contact) {
          console.error("Error fetching contact details:", contactError || "No contact found.");
          setError(`Failed to fetch contact details for task ${task.id}.`);
          continue;
        }

        if (!contact.phone) {
          console.error(`Contact for task ${task.id} does not have a phone number.`);
          setError(`Contact for task ${task.id} does not have a phone number.`);
          continue;
        }

        const contactData = {
          first_name: contact.first_name,
          last_name: contact.last_name,
          phone: contact.phone,
        };

        try {
          await axios.post("/api/make-call", {
            contact: contactData,
            reason: task.call_subject,
            twilioNumber: campaignData.twilioNumber || '+19014102020',
            firstMessage: task.first_message || `Calling ${contact.first_name} for ${task.call_subject}`,
          });
        } catch (apiError) {
          console.error(`Failed to initiate call for task ${task.id}:`, apiError);
          setError(`Failed to initiate call for task ${task.id}.`);
        }
      }

      alert("Campaign launched successfully!");
    } catch (error) {
      console.error("Error launching campaign:", error);
      setError("Failed to launch campaign. Check the console for more details.");
    } finally {
      setIsLaunching(false);
    }
  };

  const handlePauseCampaign = () => {
    setIsPausing(true);
    setTimeout(() => {
      alert("Campaign paused.");
      setIsPausing(false);
    }, 500);
  };

  const openModal = (task: CallTask) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTask(null);
    setIsModalOpen(false);
  };

  const handleSaveTask = async () => {
    if (selectedTask) {
      const { error } = await supabase
        .from("call_tasks")
        .update({
          call_subject: selectedTask.call_subject,
          call_status: selectedTask.call_status,
          scheduled_at: selectedTask.scheduled_at,
          priority: selectedTask.priority,
          first_message: selectedTask.first_message,
        })
        .eq("id", selectedTask.id);

      if (error) {
        console.error("Error saving task:", error.message);
        setError("Error saving task.");
      } else {
        setIsModalOpen(false);
        alert("Task saved successfully.");
      }
    }
  };

  if (loading) {
    return <p className="text-center">Loading campaign data...</p>;
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : campaignData ? (
        <>
          <h1 className="text-3xl font-bold mb-6">{campaignData.name}</h1>
          <p>Status: {campaignData.status}</p>
          <p>Start Date: {new Date(campaignData.start_date).toLocaleDateString()}</p>
          <p>End Date: {new Date(campaignData.end_date).toLocaleDateString()}</p>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-6">
            <button
              onClick={handleLaunchCampaign}
              disabled={isLaunching}
              className={`px-4 py-2 bg-green-500 text-white rounded-lg transition-all ${
                isLaunching ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600"
              }`}
            >
              {isLaunching ? "Launching..." : "Launch Campaign"}
            </button>
            <button
              onClick={handlePauseCampaign}
              disabled={isPausing}
              className={`px-4 py-2 bg-red-500 text-white rounded-lg transition-all ${
                isPausing ? "opacity-50 cursor-not-allowed" : "hover:bg-red-600"
              }`}
            >
              {isPausing ? "Pausing..." : "Pause Campaign"}
            </button>
          </div>

          <h2 className="text-2xl font-bold mt-6">Call Tasks</h2>
          <div className="overflow-x-auto">
            <table className="table-auto w-full text-left border-collapse mt-4">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 border">Call Subject</th>
                  <th className="px-4 py-2 border">Contact Name</th>
                  <th className="px-4 py-2 border">Status</th>
                  <th className="px-4 py-2 border">Scheduled At</th>
                  <th className="px-4 py-2 border">Priority</th>
                </tr>
              </thead>
              <tbody>
                {campaignTasks.length > 0 ? (
                  campaignTasks.map((task) => (
                    <tr
                      key={task.id}
                      className="hover:bg-gray-100 cursor-pointer"
                      onClick={() => openModal(task)}
                    >
                      <td className="border px-4 py-2">{task.call_subject}</td>
                      <td className="border px-4 py-2">{task.contact_name}</td>
                      <td className="border px-4 py-2">{task.call_status}</td>
                      <td className="border px-4 py-2">{new Date(task.scheduled_at).toLocaleString()}</td>
                      <td className="border px-4 py-2">{task.priority}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="border px-4 py-2" colSpan={5}>
                      No tasks available for this campaign.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Modal for editing call task */}
          {isModalOpen && selectedTask && (
            <Modal
              isOpen={isModalOpen}
              onRequestClose={closeModal}
              contentLabel="Edit Call Task"
              ariaHideApp={false}
              className="bg-white dark:bg-gray-900 p-8 rounded-lg max-w-lg mx-auto mt-10 shadow-lg"
            >
              <h2 className="text-2xl font-bold mb-6">Edit Task</h2>

              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300">Call Subject</label>
                <input
                  type="text"
                  value={selectedTask.call_subject}
                  onChange={(e) =>
                    setSelectedTask((prev) => prev ? { ...prev, call_subject: e.target.value } : prev)
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300">Call Status</label>
                <select
                  value={selectedTask.call_status}
                  onChange={(e) =>
                    setSelectedTask((prev) => prev ? { ...prev, call_status: e.target.value } : prev)
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300">Scheduled At</label>
                <input
                  type="datetime-local"
                  value={new Date(selectedTask.scheduled_at).toISOString().slice(0, 16)}
                  onChange={(e) =>
                    setSelectedTask((prev) =>
                      prev ? { ...prev, scheduled_at: new Date(e.target.value).toISOString() } : prev
                    )
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300">Priority</label>
                <select
                  value={selectedTask.priority}
                  onChange={(e) =>
                    setSelectedTask((prev) => prev ? { ...prev, priority: e.target.value } : prev)
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300">First Message</label>
                <textarea
                  value={selectedTask.first_message || ""}
                  onChange={(e) =>
                    setSelectedTask((prev) => prev ? { ...prev, first_message: e.target.value } : prev)
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTask}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </Modal>
          )}
        </>
      ) : (
        <p className="text-center">Loading campaign data...</p>
      )}
    </div>
  );
}
