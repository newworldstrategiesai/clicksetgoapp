"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import TaskModal from "@/components/TaskModal"; // Import the TaskModal component
import { Switch } from '@headlessui/react'; // Import Switch component for toggle

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
  contact_name?: string; // Add this line if it should be optional
}

interface CampaignData {
  id: string;
  name: string;
  status: string;
  start_date: string;
  end_date: string;
  twilioNumber?: string; // Optional field
}

interface CampaignPageProps {
  params: { id: string };
}

export default function CampaignPage({ params }: CampaignPageProps) {
  const { id } = params;
  const [campaignTasks, setCampaignTasks] = useState<(CallTask & { contact_name: string })[]>([]);
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null); // Updated type
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isPausing, setIsPausing] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<CallTask | null>(null);

  // Toggle state
  const [sendSMS, setSendSMS] = useState<string>("no"); // Change initial state to string
  const [sendEmail, setSendEmail] = useState<string>("no"); // Change initial state to string

  // Fetch campaign details and call tasks
  useEffect(() => {
    let isMounted = true; // Track if component is mounted

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
          setError(campaignError.message); // Display actual error message
          return;
        }

        if (isMounted) {
          setCampaignData(campaign);
        }

        const { data: tasks, error: taskError } = await supabase
          .from("call_tasks")
          .select(`*, contacts(first_name, last_name, phone, user_id)`)
          .eq("campaign_id", id);

        if (taskError) {
          console.error("Error fetching call tasks:", taskError.message);
          setError(taskError.message); // Display actual error message
        } else {
          const enrichedTasks = tasks.map((task: any) => ({
            ...task,
            contact_name: task.contacts
              ? `${task.contacts.first_name} ${task.contacts.last_name}`
              : "Unknown Contact",
          }));
          if (isMounted) {
            setCampaignTasks(enrichedTasks || []);
          }
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.error("Error fetching campaign and tasks:", error.message);
          setError(error.message); // Display actual error message
        } else {
          console.error("Unexpected error:", error);
        }
        setError("Error fetching campaign and tasks.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchCampaignAndTasks();

    return () => {
      isMounted = false; // Cleanup function to prevent memory leaks
    };
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
          user_id: contact.user_id // Ensure user_id is included
        };
        

        try {
          await axios.post("/api/make-call", {
            contact: contactData, // Ensure this contains all necessary fields
            reason: task.call_subject,
            twilioNumber: campaignData?.twilioNumber || process.env.TWILIO_NUMBER, // Added optional chaining
            firstMessage: task.first_message || `Calling ${contact.first_name} for ${task.call_subject}`,
            userId: contact.user_id, // Ensure user ID is passed to fetch API keys
            voiceId: "CwhRBWXzGAHq8TQ4Fs17",
            sendSMS: sendSMS,
            sendEmail: sendEmail
          });
          const { error: updateTaskError } = await supabase
            .from('call_tasks')
            .update({ call_status: 'Completed' }) // Update the status to "Completed"
            .eq('id', task.id); // Update the specific call task row

          if (updateTaskError) {
            console.error('Error updating call task status:', updateTaskError.message);
            setError(`Failed to update status for task ${task.id}.`);
          } else {
            console.log(`Call task status updated to 'Completed' for task ID: ${task.id}`);
          }
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

  const openModal = async (task: CallTask) => {
    // Fetch additional details if needed here
    const { data, error } = await supabase
      .from('call_tasks')
      .select('*') // Fetch any additional needed details
      .eq('id', task.id)
      .single();

    if (error) {
      console.error('Error fetching task details:', error.message);
      return;
    }

    setSelectedTask(data); // Set the selected task to the modal state
    setIsModalOpen(true); // Open the modal
  };

  const closeModal = () => {
    setSelectedTask(null);
    setIsModalOpen(false);
  };

  if (loading) {
    return <p className="text-center">Loading campaign data...</p>;
  }

  return (
    <div className="container mx-auto pt-16 py-8 px-4 sm:px-6 lg:px-8">
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : campaignData ? (
        <>
          <h1 className="text-3xl font-bold mb-6">{campaignData.name}</h1>
          <p>Status: {campaignData.status}</p>
          <p>Start Date: {new Date(campaignData.start_date).toLocaleDateString()}</p>
          <p>End Date: {new Date(campaignData.end_date).toLocaleDateString()}</p>

          {/* Toggle switches for SMS and Email */}
          <div className="flex items-center mt-4">
            <span className="mr-2">Send SMS:</span>
            <Switch
              checked={sendSMS === "yes"} // Update condition to check for "yes"
              onChange={(value) => {setSendSMS(value ? "yes" : "no"), console.log(value ? "yes" : "no")}} // Update state to "yes" or "no"
              className={`${
                sendSMS === "yes" ? 'bg-green-600' : 'bg-gray-200'
              } relative inline-flex items-center h-6 rounded-full w-11`}
            >
              <span className="sr-only">Send SMS</span>
              <span
                className={`${
                  sendSMS === "yes" ? 'translate-x-6' : 'translate-x-1'
                } inline-block w-4 h-4 transform bg-white rounded-full transition`}
              />
            </Switch>
          </div>
          <div className="flex items-center mt-2">
            <span className="mr-2">Send Email:</span>
            <Switch
              checked={sendEmail === "yes"} // Update condition to check for "yes"
              onChange={(value) => {setSendEmail(value ? "yes" : "no"), console.log(value ? "yes" : "no")}} // Update state to "yes" or "no"
              className={`${
                sendEmail === "yes" ? 'bg-green-600' : 'bg-gray-200'
              } relative inline-flex items-center h-6 rounded-full w-11`}
            >
              <span className="sr-only">Send Email</span>
              <span
                className={`${
                  sendEmail === "yes" ? 'translate-x-6' : 'translate-x-1'
                } inline-block w-4 h-4 transform bg-white rounded-full transition`}
              />
            </Switch>
          </div>

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
                  <th className="px-4 py-2 border">Call Status</th>
                  <th className="px-4 py-2 border">Scheduled At</th>
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaignTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-100">
                    <td className="border px-4 py-2">{task.call_subject}</td>
                    <td className="border px-4 py-2">{task.contact_name}</td>
                    <td className="border px-4 py-2">{task.call_status}</td>
                    <td className="border px-4 py-2">{new Date(task.scheduled_at).toLocaleString()}</td>
                    <td className="border px-4 py-2">
                      <button
                        onClick={() => openModal(task)} // Open modal on row click
                        className="text-blue-500 hover:underline"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modal for editing task */}
          {isModalOpen && selectedTask && (
            <TaskModal
              task={selectedTask}
              onClose={closeModal}
              onSave={() => {
                setCampaignTasks((prevTasks) =>
                  prevTasks.map((t) =>
                    t.id === selectedTask.id
                      ? { ...selectedTask, contact_name: selectedTask.contact_name || '' } // Ensure contact_name is a string
                      : t
                  )
                );
                closeModal(); // Close the modal after saving
              }}
            />
          )}
        </>
      ) : (
        <p>No campaign data found.</p>
      )}
    </div>
  );
}
