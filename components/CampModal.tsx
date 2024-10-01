"use client";

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link'; // Import Next.js Link for navigation

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CampModal({ campaign, onClose, onEdit, onDelete, audience }) {
  const [status, setStatus] = useState(campaign.status); // Default status from the campaign
  const [isSaving, setIsSaving] = useState(false); // For tracking save button click
  const [isEditing, setIsEditing] = useState(false); // Track if the modal is in editing mode
  const [error, setError] = useState(null); // Handle error state
  const [formData, setFormData] = useState({
    name: campaign.name,
    description: campaign.description || '',
  });

  // Save status update
  const handleSave = async () => {
    setIsSaving(true);

    const { error } = await supabase
      .from('campaigns')
      .update({ status })
      .eq('id', campaign.id);

    if (error) {
      console.error("Error updating campaign status:", error.message);
      setError(error.message); // Set the error message
    } else {
      console.log(`Campaign status updated to '${status}'`);
    }

    setIsSaving(false);
    onClose(); // Close the modal after saving
  };

  // Toggle between edit and view mode
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  // Handle form data change
  const handleFormChange = (e) => {
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
    const { error } = await supabase
      .from('campaigns')
      .update({ name: formData.name, description: formData.description })
      .eq('id', campaign.id);

    if (error) {
      setError(error.message);
    } else {
      setIsEditing(false); // Exit edit mode
      console.log("Campaign details updated");
    }
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
      <div className="bg-black text-white p-6 rounded-md shadow-md w-1/2">
        {/* Campaign Title with Link */}
        <h2 className="text-xl font-bold mb-4">
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              className="w-full p-2 bg-gray-800 text-white rounded-md"
            />
          ) : (
            <Link href={`/campaigns/${campaign.id}`} className="text-blue-500 underline">
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
            className="w-full p-2 bg-gray-800 text-white rounded-md mb-4"
            placeholder="Edit campaign description"
          />
        ) : (
          <>
            <p>Description: {formData.description || 'No description provided'}</p>
            <p>Start Date: {new Date(campaign.start_date).toLocaleDateString()}</p>
            <p>End Date: {new Date(campaign.end_date).toLocaleDateString()}</p>
          </>
        )}

        {audience && <p>Audience: {audience.name}</p>}

        {/* Status Dropdown */}
        <div className="mt-4">
          <label htmlFor="status" className="block mb-2 font-bold">Campaign Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2 bg-gray-800 text-white rounded-md"
          >
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Paused">Paused</option>
          </select>
        </div>

        {error && <p className="text-red-500 mt-2">{error}</p>}

        {/* Action Buttons */}
        <div className="mt-4 flex justify-end space-x-4">
          {isEditing ? (
            <button
              onClick={handleEditSave}
              className="px-4 py-2 bg-green-500 text-white rounded"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-500 text-white rounded"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Status'}
            </button>
          )}
          <button
            onClick={handleEditToggle}
            className={`px-4 py-2 ${isEditing ? 'bg-gray-500' : 'bg-blue-500'} text-white rounded`}
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Delete
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
