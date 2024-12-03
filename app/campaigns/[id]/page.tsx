'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/utils/supabaseClient';
import axios from 'axios';
import TaskModal from '@/components/TaskModal'; // Import the TaskModal component
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation'; // Import useRouter
import { useSearchParams } from 'next/navigation'; // Import useSearchParams
import CryptoJS from 'crypto-js';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesomeIcon

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
  country_code?: string;
}

interface CampaignPageProps {
  params: Promise<{ id: string }>; // or adjust based on migration guide details
}

export default function CampaignPage({ params }: CampaignPageProps) {
  const { id } = use(params);
  const router = useRouter(); // Initialize useRouter
  const searchParams = useSearchParams(); // Use useSearchParams to get query parameters
  const userId = searchParams?.get('userId') || null; // Get encrypted userId
  const apiKey = searchParams?.get('apiKey') || null; // Get encrypted apiKey
  const twilioSid = searchParams?.get('twilioSid') || null; // Get encrypted twilioSid
  const twilioAuthToken = searchParams?.get('twilioAuthToken') || null; // Get encrypted twilioAuthToken
  const vapiKey = searchParams?.get('vapiKey') || null; // Get encrypted vapiKey

  // Decrypt the keys using CryptoJS
  const decryptedUserId = userId
    ? CryptoJS.AES.decrypt(userId, process.env.SECRET_KEY || '').toString(
        CryptoJS.enc.Utf8
      )
    : '';
  const decryptedApiKey = apiKey
    ? CryptoJS.AES.decrypt(apiKey, process.env.SECRET_KEY || '').toString(
        CryptoJS.enc.Utf8
      )
    : '';
  const decryptedTwilioSid = twilioSid
    ? CryptoJS.AES.decrypt(twilioSid, process.env.SECRET_KEY || '').toString(
        CryptoJS.enc.Utf8
      )
    : '';
  const decryptedTwilioAuthToken = twilioAuthToken
    ? CryptoJS.AES.decrypt(
        twilioAuthToken,
        process.env.SECRET_KEY || ''
      ).toString(CryptoJS.enc.Utf8)
    : '';
  const decryptedVapiKey = vapiKey
    ? CryptoJS.AES.decrypt(vapiKey, process.env.SECRET_KEY || '').toString(
        CryptoJS.enc.Utf8
      )
    : '';

  // Use the decrypted keys as needed
  const credentials = {
    apiKey: decryptedApiKey,
    twilioSid: decryptedTwilioSid,
    twilioAuthToken: decryptedTwilioAuthToken,
    vapiKey: decryptedVapiKey
  };

  const [campaignTasks, setCampaignTasks] = useState<
    (CallTask & { contact_name: string })[]
  >([]);
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null); // Updated type
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isPausing, setIsPausing] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // Add state to track pause/resume

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<CallTask | null>(null);

  const [twilioNumbers, setTwilioNumbers] = useState<any[]>([]); // State to store Twilio numbers
  const [selectedTwilioNumber, setSelectedTwilioNumber] = useState<
    string | null
  >(null); // State for selected Twilio number

  const [showLaunchBtn, setShowLaunchBtn] = useState(false);
  const [showPauseBtn, setShowPauseBtn] = useState(false);
  const [showAbortBtn, setShowAbortBtn] = useState(false);
  const [showResumeBtn, setShowResumeBtn] = useState(false);

  useEffect(() => {
    setShowLaunchBtn(shouldShowButton('launchBtn'));
    setShowPauseBtn(shouldShowButton('pauseBtn'));
    setShowAbortBtn(shouldShowButton('abortBtn'));
    setShowResumeBtn(shouldShowButton('resumeBtn'));
  }, [campaignData?.status, campaignTasks]); // Re-run the effect when campaignData changes

  console.log(campaignData?.status);

  const shouldShowButton = (buttonName: string) => {
    if (buttonName === 'launchBtn' && campaignData?.status === 'Pending') {
      return true;
    } else if (
      buttonName === 'pauseBtn' &&
      (campaignData?.status === 'Scheduled' ||
        campaignData?.status === 'Active' ||
        campaignData?.status === 'Resumed')
    ) {
      return true;
    } else if (
      buttonName === 'abortBtn' &&
      campaignData?.status !== 'Completed'
    ) {
      return true;
    } else if (
      buttonName === 'resumeBtn' &&
      campaignData?.status === 'Paused'
    ) {
      return true;
    } else {
      return false;
    }
  };

  useEffect(() => {
    // Fetch Twilio numbers
    const fetchTwilioNumbers = async () => {
      try {
        const userId = decryptedUserId;
        const twilioClient = {
          twilioSid: credentials.twilioSid,
          twilioAuthToken: credentials.twilioAuthToken
        };

        const response = await axios.post(`/api/get-twilio-numbers`, {
          user_Id: userId,
          twilioClient: twilioClient // Include the credentials data
        });

        setTwilioNumbers(response.data.allNumbers || []);
        if (response.data.allNumbers && response.data.allNumbers.length > 0) {
          setSelectedTwilioNumber(response.data.allNumbers[0].phoneNumber);
        }
      } catch (error) {
        console.error('Error fetching Twilio numbers:', error);
        toast.error('Failed to fetch Twilio numbers. Please try again later.');
      }
    };

    // Fetch campaign details and call tasks
    let isMounted = true; // Track if component is mounted

    async function fetchCampaignAndTasks() {
      setLoading(true);

      try {
        const { data: campaign, error: campaignError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', id)
          .single();

        if (campaignError) {
          console.error('Error fetching campaign:', campaignError.message);
          setError(campaignError.message); // Display actual error message
          return;
        }

        if (isMounted) {
          setCampaignData(campaign);
        }

        const { data: tasks, error: taskError } = await supabase
          .from('call_tasks')
          .select(`*, contacts(first_name, last_name, phone, user_id)`)
          .eq('campaign_id', id);

        if (taskError) {
          console.error('Error fetching call tasks:', taskError.message);
          setError(taskError.message); // Display actual error message
        } else {
          const enrichedTasks = tasks.map((task: any) => ({
            ...task,
            contact_name: task.contacts
              ? `${task.contacts.first_name} ${task.contacts.last_name}`
              : 'Unknown Contact'
          }));
          if (isMounted) {
            setCampaignTasks(enrichedTasks || []);
          }
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.error('Error fetching campaign and tasks:', error.message);
          setError(error.message); // Display actual error message
        } else {
          console.error('Unexpected error:', error);
        }
        setError('Error fetching campaign and tasks.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchCampaignAndTasks();

    fetchTwilioNumbers(); // Fetch Twilio numbers on component mount

    return () => {
      isMounted = false; // Cleanup function to prevent memory leaks
    };
  }, [id, showLaunchBtn, showAbortBtn, showPauseBtn, showResumeBtn]);

  const handleLaunchCampaign = async () => {
    setIsLaunching(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: 'Scheduled' })
        .eq('id', id);

      const { error: updateStatusError } = await supabase
        .from('call_tasks')
        .update({ call_status: 'Scheduled' }) // Update the status based on current state
        .eq('campaign_id', id); // Update all tasks related to the campaign

      if (updateStatusError) {
        console.error(
          'Error updating call task status:',
          updateStatusError.message
        );
        setError(
          `Failed to update call task status. ${updateStatusError.message}`
        );
      } else {
        console.log(
          `Call task status updated to Scheduled for campaign ID:`,
          id
        );
        window.location.reload();
        setIsPaused(!isPaused); // Toggle the pause state
      }

      alert('Campaign launched successfully!');
    } catch (error) {
      console.error('Error launching campaign:', error);
      setError(
        'Failed to launch campaign. Check the console for more details.'
      );
    } finally {
      setIsLaunching(false);
    }
  };
  
  const handleResumeCampaign = async () => {
    setIsPausing(true);
    setError(null); // Reset error state

    try {
      const newStatus = 'Resumed'; // Determine new status

          console.log('execute-call task completed');
          // const { error: updateTaskError } = await supabase
          //   .from('call_tasks')
          //   .update({ call_status: 'Completed' }) // Update the status to "Completed"
          //   .eq('id', task.id); // Update the specific call task row

          // if (updateTaskError) {
          //   console.error('Error updating call task status:', updateTaskError.message);
          //   setError(`Failed to update status for task ${task.id}.`);
          // } else {
          //   console.log(`Call task status updated to 'Completed' for task ID: ${task.id}`);
          // }
        } catch (apiError) {
          console.error(`Failed to initiate call for task ${task.id}:`, apiError);
          setError(`Failed to initiate call for task ${task.id}.`);
        }
      }

      const { error } = await supabase
        .from('campaigns')
        .update({ status: newStatus })
        .eq('id', id)
        .eq('status', 'Paused');

      const { error: updateStatusError } = await supabase
        .from('call_tasks')
        .update({ call_status: 'Scheduled' }) // Update the status based on current state
        .eq('campaign_id', id) // Update all tasks related to the campaign
        .eq('call_status', 'Paused');

      if (updateStatusError) {
        console.error(
          'Error updating call task status:',
          updateStatusError.message
        );
        setError(
          `Failed to update call task status. ${updateStatusError.message}`
        );
      } else {
        console.log(
          `Call task status updated to "${newStatus}" for campaign ID:`,
          id
        );
        setIsPaused(!isPaused); // Toggle the pause state
      }
      toast.info(`Campaign ${newStatus.toLowerCase()}.`); // New toast notification
      window.location.reload();
    } catch (error) {
      console.error('Error Resuming campaign:', error);
      setError(
        'Failed to update campaign status. Check the console for more details.'
      );
    } finally {
      setIsPausing(false);
    }
  };

  const handlePauseCampaign = async () => {
    setIsPausing(true);
    setError(null); // Reset error state

    try {
      const newStatus = 'Paused'; // Determine new status

      const { error } = await supabase
        .from('campaigns')
        .update({ status: 'Paused' })
        .eq('id', id)
        .in('status', ['Scheduled', 'Active', 'Resumed']);

      const { error: updateStatusError } = await supabase
        .from('call_tasks')
        .update({ call_status: 'Paused' }) // Update the status based on current state
        .eq('campaign_id', id) // Update all tasks related to the campaign
        .in('call_status', ['Scheduled', 'Active']);

      if (updateStatusError) {
        console.error(
          'Error updating call task status:',
          updateStatusError.message
        );
        setError(
          `Failed to update call task status. ${updateStatusError.message}`
        );
      } else {
        console.log(
          `Call task status updated to "${newStatus}" for campaign ID:`,
          id
        );
        setIsPaused(!isPaused); // Toggle the pause state
      }
      toast.info(`Campaign ${newStatus.toLowerCase()}.`); // New toast notification
      window.location.reload();
    } catch (error) {
      console.error('Error Pausing campaign:', error);
      setError(
        'Failed to update campaign status. Check the console for more details.'
      );
    } finally {
      setIsPausing(false);
    }
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

  const handleAbortCampaign = async () => {
    setError(null); // Reset error state

    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: 'Aborted' })
        .eq('id', id)
        .neq('status', 'Completed');

      const { error: updateStatusError } = await supabase
        .from('call_tasks')
        .update({ call_status: 'Aborted' }) // Update the status to "Aborted"
        .eq('campaign_id', id) // Update all tasks related to the campaign
        .neq('call_status', 'Completed');

      if (updateStatusError) {
        console.error(
          'Error updating call task status:',
          updateStatusError.message
        );
        setError(
          `Failed to update call task status. ${updateStatusError.message}`
        );
      } else {
        console.log(
          `Call task status updated to "Aborted" for campaign ID:`,
          id
        );
        toast.error('Campaign aborted successfully!'); // New toast notification
        window.location.reload();
      }
    } catch (error) {
      console.error('Error aborting campaign:', error);
      setError('Failed to abort campaign. Check the console for more details.');
    }
  };

  const handleForceLaunchCampaign = async () => {
    setIsLaunching(true);
    setError(null);

    try {
      for (const task of campaignTasks) {
        const { data: contact, error: contactError } = await supabase
          .from('contacts')
          .select('*')
          .eq('id', task.contact_id)
          .single();

        if (contactError || !contact) {
          console.error(
            'Error fetching contact details:',
            contactError || 'No contact found.'
          );
          setError(`Failed to fetch contact details for task ${task.id}.`);
          continue;
        }

        if (!contact.phone) {
          console.error(
            `Contact for task ${task.id} does not have a phone number.`
          );
          setError(`Contact for task ${task.id} does not have a phone number.`);
          continue;
        }

        // Conditional Phone Number Dialing
        const countryCode = campaignData?.country_code || '';
        const phoneNumber = contact.phone.startsWith(countryCode)
          ? contact.phone
          : `${countryCode}${contact.phone}`;

        const contactData = {
          first_name: contact.first_name,
          last_name: contact.last_name,
          phone: phoneNumber,
          user_id: contact.user_id // Ensure user_id is included
        };

        const userId = decryptedUserId;

        try {
          await axios.post('/api/make-call', {
            contact: contactData, // Ensure this contains all necessary fields
            reason: task.call_subject,
            twilioNumber:
              selectedTwilioNumber ||
              campaignData?.twilioNumber ||
              process.env.TWILIO_NUMBER, // Use optional chaining
            firstMessage:
              task.first_message ||
              `Calling ${contact.first_name} for ${task.call_subject}`,
            userId: contact.user_id, // Ensure user ID is passed to fetch API keys
            user_Id: userId,
            voiceId: 'CwhRBWXzGAHq8TQ4Fs17',
            credentials
          });

          const { error: updateTaskError } = await supabase
            .from('call_tasks')
            .update({ call_status: 'Completed' }) // Update the status to "Completed"
            .eq('id', task.id); // Update the specific call task row

          if (updateTaskError) {
            console.error(
              'Error updating call task status:',
              updateTaskError.message
            );
            setError(`Failed to update status for task ${task.id}.`);
          } else {
            console.log(
              `Call task status updated to 'Completed' for task ID: ${task.id}`
            );
          }
        } catch (apiError) {
          console.error(
            `Failed to initiate call for task ${task.id}:`,
            apiError
          );
          setError(`Failed to initiate call for task ${task.id}.`);
        }
      }

      alert('Campaign launched successfully!');
    } catch (error) {
      console.error('Error launching campaign:', error);
      setError(
        'Failed to launch campaign. Check the console for more details.'
      );
    } finally {
      setIsLaunching(false);
    }
  };

  if (loading) {
    return <p className="text-center">Loading campaign data...</p>;
  }

  return (
    <div className="container mx-auto pt-16 py-8 px-4 sm:px-6 lg:px-8">
      <button
        onClick={() => router.push('/campaigns')} // Navigate back to the campaign table
        className="flex items-center mb-4 bg-gray-200 text-gray-800 hover:bg-gray-300 rounded-lg px-4 py-2 transition"
      >
        <FontAwesomeIcon icon={faArrowLeft} className=" text-gray-600" />
      </button>
      <ToastContainer
        position="top-right"
        autoClose={3000} // Adjust timing as desired
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 9999 }} // Ensure it overlays content without shifting it
      />{' '}
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : campaignData ? (
        <>
          <h1 className="text-3xl font-bold mb-6">{campaignData.name}</h1>
          <p>Status: {campaignData.status}</p>
          <p>
            Start Date: {new Date(campaignData.start_date).toLocaleDateString()}
          </p>
          <p>
            End Date: {new Date(campaignData.end_date).toLocaleDateString()}
          </p>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-6">
            {showLaunchBtn && (
              <button
                onClick={handleLaunchCampaign}
                disabled={isLaunching}
                style={{
                  display: shouldShowButton('launchBtn') ? 'block' : 'none'
                }}
                className={`px-4 py-2 bg-green-500 text-white rounded-lg transition-all ${
                  isLaunching
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-green-600'
                }`}
              >
                {isLaunching ? 'Launching...' : 'Launch Campaign'}
              </button>
            )}
            {/* <button
              onClick={handleForceLaunchCampaign} // New button for force launch
              disabled={isLaunching}
              className={`px-4 py-2 bg-orange-500 text-white rounded-lg transition-all ${
                isLaunching
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-orange-600'
              }`}
            >
              {isLaunching ? 'Force Launching...' : 'Force Launch Campaign'}
            </button> */}
            {showPauseBtn && (
              <button
                onClick={handlePauseCampaign}
                disabled={isPausing}
                style={{
                  display: shouldShowButton('abortBtn') ? 'block' : 'none'
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
              >
                Pause Campaign
              </button>
            )}
            {showAbortBtn && (
              <button
                onClick={handleAbortCampaign}
                style={{
                  display: shouldShowButton('abortBtn') ? 'block' : 'none'
                }}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg transition-all hover:bg-yellow-600"
              >
                Abort Campaign
              </button>
            )}
            {showResumeBtn && (
              <button
                onClick={handleResumeCampaign}
                style={{
                  display: shouldShowButton('resumeBtn') ? 'block' : 'none'
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-lg transition-all hover:bg-green-600"
              >
                Resume Campaign
              </button>
            )}
          </div>

          <h2 className="text-2xl font-bold mt-6">Call Tasks</h2>
          <div className="overflow-x-auto">
            <table className="table-auto w-full text-left border-collapse mt-4">
              <thead>
                <tr className="bg-gray-800">
                  <th className="px-4 py-2 border">Call Subject</th>
                  <th className="px-4 py-2 border">Contact Name</th>
                  <th className="px-4 py-2 border">Call Status</th>
                  <th className="px-4 py-2 border">Scheduled At</th>
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaignTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-700">
                    <td className="border px-4 py-2">{task.call_subject}</td>
                    <td className="border px-4 py-2">{task.contact_name}</td>
                    <td className="border px-4 py-2">{task.call_status}</td>
                    <td className="border px-4 py-2">
                      {new Date(task.scheduled_at).toLocaleString()}
                    </td>
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
                      ? {
                          ...selectedTask,
                          contact_name: selectedTask.contact_name || ''
                        } // Ensure contact_name is a string
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
