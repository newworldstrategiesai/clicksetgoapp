const Queue = require('bull');
const axios = require('axios');
const { supabase } = require("../utils/supabaseClient");

// Initialize Supabase client
const supabase = supabase(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Create a Bull queue
const callQueue = new Queue('call-queue', {
  redis: {
    host: 'localhost', // Your Redis host
    port: 6379 // Redis port
  }
});

// Function to schedule a task
async function scheduleCallTask(task) {
  const scheduledTime = new Date(task.scheduled_at).getTime() - Date.now(); // Time difference between now and scheduled_at
  if (scheduledTime > 0) {
    callQueue.add({ taskId: task.id }, { delay: scheduledTime });
  }
}

// Background worker to process the queue
callQueue.process(async (job) => {
  const taskId = job.data.taskId;

  // Fetch the task details from Supabase
  const { data: task, error: taskError } = await supabase
    .from("call_tasks")
    .select("*, contacts(first_name, last_name, phone)")
    .eq("id", taskId)
    .single();

  if (taskError || !task) {
    console.error(`Failed to fetch task ${taskId}:`, taskError || "No task found.");
    return;
  }

  // Check if the contact has a valid phone number
  if (!task.contacts.phone) {
    console.error(`Contact for task ${taskId} does not have a phone number.`);
    return;
  }

  // Make the call via your API
  try {
    await axios.post("/api/make-call", {
      contact: {
        first_name: task.contacts.first_name,
        last_name: task.contacts.last_name,
        phone: task.contacts.phone,
      },
      reason: task.call_subject,
      twilioNumber: task.twilioNumber || process.env.TWILIO_NUMBER, // Default Twilio number if not specified
      firstMessage: task.first_message || `Calling ${task.contacts.first_name} for ${task.call_subject}`,
    });

    // After the call is initiated, update the task status to "Completed"
    await supabase
      .from("call_tasks")
      .update({ call_status: "Completed" })
      .eq("id", taskId);
  } catch (apiError) {
    console.error(`Failed to initiate call for task ${taskId}:`, apiError);
    await supabase
      .from("call_tasks")
      .update({ call_status: "Failed" })
      .eq("id", taskId); // Update the status to "Failed" if the call fails
  }
});

// Export the function if needed elsewhere
module.exports = { scheduleCallTask };
