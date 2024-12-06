// components/CampModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link'; // Import Next.js Link for navigation

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface CampModalProps {
  campaign: {
    id: string;
    name: string;
    description?: string; // Make it optional
    start_date?: string; // Optional
    end_date?: string; // Optional
    status: string;
    audience: string; // Add audience to campaign
  };
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  audience: { name: string | null };
}

// Fetch audience name based on audience
const fetchAudienceName = async (audience: string) => {
  if (!audience) {
    return null; // Return null if audience is not provided
  }
  const { data, error } = await supabase
    .from('lists')
    .select('name')
    .eq('id', audience)
    .single();

  if (error) {
    console.error("Error fetching audience name:", error.message);
    return null;
  }
  return data?.name;
};

export default function CampModal({ campaign, onClose, onEdit, onDelete, audience }: CampModalProps) {
  const [status, setStatus] = useState(campaign.status); // Default status from the campaign
  const [isSaving, setIsSaving] = useState(false); // For tracking save button click
  const [isEditing, setIsEditing] = useState(false); // Track if the modal is in editing mode
  const [error, setError] = useState<string | null>(null); // Handle error state
  const [formData, setFormData] = useState({
    name: campaign.name,
    description: campaign.description || '', // Default to empty string if undefined
  });
  const [audienceName, setAudienceName] = useState<string | null>(null);

  // Fetch audience name when the component mounts
  useEffect(() => {
    const getAudienceName = async () => {
      if (campaign.audience) { // Check if audience is provided
        const name = await fetchAudienceName(campaign.audience);
        setAudienceName(name);
      }
    };
    getAudienceName();
  }, [campaign.audience]);

  // Save status update
  const handleSave = async () => {
    setIsSaving(true);

    const { error } = await supabase
      .from('campaigns')
      .update({ status, updated_at: new Date() })
      .eq('id', campaign.id)
      .neq('status', 'Aborted');

    if (error) {
      console.error("Error updating campaign status:", error.message);
      setError(error.message); // Set the error message
    } else {
      console.log(`Campaign status updated to '${status}'`);
      onEdit(); // Call onEdit to refresh campaign data if needed
    }

    setIsSaving(false);
    onClose(); // Close the modal after saving
  };

  // Toggle between edit and view mode
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  // Handle form data change
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Save edited campaign details
  const handleEditSave = async () => {
    if (!formData.name.trim()) {
      setError("Campaign name cannot be empty");
      return;
    }

    setIsSaving(true);
    try{
    const { error: campaignError  } = await supabase
      .from('campaigns')
      .update({ name: formData.name, description: formData.description, updated_at: new Date() })
      .eq('id', campaign.id);

    if (campaignError) {
      setError(campaignError.message);
    } 
    const { error: taskError   } = await supabase
      .from('call_tasks')
      .update({call_subject: formData.description, updated_at: new Date() })
      .eq('campaign_id', campaign.id);

    if (taskError ) {
      setError(taskError .message);
    } 
      setIsEditing(false); // Exit edit mode
      console.log("Campaign details updated");
      onEdit(); // Refresh campaign data if necessary
    }catch(error){

    }finally{
    setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center backdrop-blur-sm justify-center bg-opacity-80">
      <div className="bg-modal dark:bg-gray-800 dark:text-white p-6 rounded-md shadow-md w-1/2">
        {/* Campaign Title with Link */}
        <h2 className="text-xl font-bold mb-4">
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              className="w-full p-2 dark:bg-gray-500 dark:text-white rounded-md"
              placeholder='Edit Campaign Name'
            />
          ) : (
            <Link href={`/campaigns/${campaign.id}`} className="text-blue-500">
              {formData.name} {/* Ensure this is clickable */}
            </Link>
          )}
        </h2>

        {/* Campaign Details */}
        {isEditing ? (
          <textarea
            name="description"
            value={formData.description}
            onChange={handleFormChange}
            className="w-full p-2 text-lg dark:border-black dark:bg-gray-500 dark:text-white rounded-md mb-4"
            placeholder="Edit campaign description"
          />
        ) : (
          <>
            <p className='text-lg'>Description: {formData.description || 'No description provided'}</p>
            <p className='text-lg'>Start Date: {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'N/A'}</p>
            <p className='text-lg'>End Date: {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : 'N/A'}</p>
          </>
        )}

        {audienceName && <p className='text-2xl'>Audience: {audienceName}</p>}

        {/* Status Dropdown */}
        <div className="mt-4">
          <label htmlFor="status" className="block mb-2 font-bold">Campaign Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2  dark:bg-gray-500 dark:text-white rounded-md border-black"
          >
            <option className='bg-green-400' value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Paused">Paused</option>
            <option value="Aborted">Aborted</option>
            <option value="Resumed">Resumed</option>
            <option value="Scheduled">Scheduled</option>
          </select>
        </div>  

        {error && <p className="text-red-500 mt-2">{error}</p>}

        {/* Action Buttons */}
        <div className="mt-4 flex justify-end space-x-4">
          {isEditing ? (
            <button
              onClick={handleEditSave}
              className="px-4 py-2 bg-green-500 dark:text-white rounded"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="px-4 py-2 text-white bg-green-500 dark:text-white rounded"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Status'}
            </button>
          )}
          <button
            onClick={handleEditToggle}
            className={`px-4 py-2 ${isEditing ? 'bg-gray-500' : 'bg-blue-500'} text-white dark:text-white rounded`}
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-500 text-white dark:text-white rounded"
          >
            Delete
          </button>
          <button onClick={onClose} className="px-4 py-2 text-white bg-gray-500 dark:text-white rounded">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
