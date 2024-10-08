"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface TaskModalProps {
  task: any; // Task object containing the call task data
  onClose: () => void; // Function to close the modal
  onSave: () => void; // Function to save the changes
}

export default function TaskModal({ task, onClose, onSave }: TaskModalProps) {
  // State for form fields
  const [callStatus, setCallStatus] = useState(task ? task.call_status : "");
  const [callSubject, setCallSubject] = useState(task ? task.call_subject : "");
  const [scheduledAt, setScheduledAt] = useState(task ? task.scheduled_at : "");
  const [priority, setPriority] = useState(task ? task.priority : "medium");
  const [firstMessage, setFirstMessage] = useState(task ? task.first_message : "");

  const [isSaving, setIsSaving] = useState(false); // Track the save button state
  const [error, setError] = useState<string | null>(null); // Track error messages

  // UseEffect to update form fields when the task changes
  useEffect(() => {
    if (task) {
      setCallStatus(task.call_status || "");
      setCallSubject(task.call_subject || "");
      setScheduledAt(task.scheduled_at || "");
      setPriority(task.priority || "medium");
      setFirstMessage(task.first_message || "");
    }
  }, [task]);

  // Save task data to Supabase
  const handleSave = async () => {
    setIsSaving(true);

    // Sanitize scheduled_at (empty string should become null)
    const sanitizedScheduledAt = scheduledAt || null;

    if (!task || !task.id) {
      console.error("Task is not valid.");
      setError("Task is not valid.");
      setIsSaving(false);
      return;
    }

    const { error } = await supabase
      .from("call_tasks")
      .update({
        call_status: callStatus,
        call_subject: callSubject,
        scheduled_at: sanitizedScheduledAt, // Use sanitized value
        priority: priority,
        first_message: firstMessage,
      })
      .eq("id", task.id); // Check if task.id is valid

    if (error) {
      console.error("Error updating task:", error);
      setError(error.message);
    } else {
      onSave(); // Call the onSave function after successful update
      onClose(); // Close the modal after saving
    }

    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
      <div className="bg-black text-white p-6 rounded-md shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Task</h2>

        {/* Form Fields */}
        <div className="mb-4">
          <label className="block text-sm font-bold mb-1">Call Status</label>
          <input
            type="text"
            value={callStatus}
            onChange={(e) => setCallStatus(e.target.value)}
            placeholder="Enter call status"
            className="w-full p-2 border rounded bg-gray-800 text-white"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-1">Call Subject</label>
          <input
            type="text"
            value={callSubject}
            onChange={(e) => setCallSubject(e.target.value)}
            placeholder="Enter call subject"
            className="w-full p-2 border rounded bg-gray-800 text-white"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-1">Scheduled At</label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            placeholder="Select date and time"
            className="w-full p-2 border rounded bg-gray-800 text-white"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full p-2 border rounded bg-gray-800 text-white"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-1">First Message</label>
          <textarea
            value={firstMessage}
            onChange={(e) => setFirstMessage(e.target.value)}
            placeholder="Enter first message"
            className="w-full p-2 border rounded bg-gray-800 text-white"
            rows={3}
          />
        </div>

        {error && <p className="text-red-500">{error}</p>}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded">
            Close
          </button>
          <button
            onClick={handleSave}
            className={`px-4 py-2 ${isSaving ? "bg-gray-500" : "bg-blue-500"} text-white rounded`}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
