'use client';
import Button from '@/components/ui/Button/Button';
import React, { useState } from 'react';
import { createAgent } from '@/utils/auth-helpers/server';
import { useRouter } from 'next/navigation';

interface ProfileSetupProps {
  userId: string; // Pass the user ID to associate the data
}

export default function ProfileSetup({ userId }: ProfileSetupProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    primaryRole: '',
    assistantName: '',
    additionalInstructions: '',
  });

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    await createAgent(userId, formData);
    setIsSubmitting(false);
    router.push('/dashboard'); // Redirect after successful update
  };

  return (
    <div className="my-8">
      <h2 className="text-xl font-bold mb-4">Complete Your Profile</h2>
      <form noValidate className="mb-4" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          {/* Company Name Field (Optional) */}
          <div className="grid gap-1">
            <label htmlFor="companyName">Company Name (Optional)</label>
            <input
              id="companyName"
              name="companyName"
              placeholder="Your Company Name"
              type="text"
              value={formData.companyName}
              onChange={handleChange}
              autoComplete="organization"
              className="w-full p-3 rounded-md bg-zinc-800"
            />
          </div>

          {/* Primary Role of Agent (Dropdown) */}
          <div className="grid gap-1">
            <label htmlFor="primaryRole">Primary Role of Your Agent</label>
            <select
              id="primaryRole"
              name="primaryRole"
              required
              value={formData.primaryRole}
              onChange={handleChange}
              className="w-full p-3 rounded-md bg-zinc-800"
            >
              <option value="">Select a role</option>
              <option value="Customer Service">Customer Service</option>
              <option value="Appointment Setting">Appointment Setting</option>
              <option value="Q&A">Q&A</option>
              <option value="Technical Support">Technical Support</option>
              <option value="Sales">Sales</option>
              {/* Add more roles as needed */}
            </select>
          </div>

          {/* Name of Assistant (Agent Name) */}
          <div className="grid gap-1">
            <label htmlFor="assistantName">Name of Your Assistant</label>
            <input
              id="assistantName"
              name="assistantName"
              placeholder="Assistant Name"
              type="text"
              required
              value={formData.assistantName}
              onChange={handleChange}
              className="w-full p-3 rounded-md bg-zinc-800"
            />
          </div>

          {/* Additional Instructions (Prompt) */}
          <div className="grid gap-1">
            <label htmlFor="additionalInstructions">Additional Instructions</label>
            <textarea
              id="additionalInstructions"
              name="additionalInstructions"
              placeholder="Enter any additional instructions or prompts..."
              rows={4}
              value={formData.additionalInstructions}
              onChange={handleChange}
              className="w-full p-3 rounded-md bg-zinc-800"
            ></textarea>
          </div>

          {/* Submit Button */}
          <Button
            variant="slim"
            type="submit"
            className="mt-1"
            loading={isSubmitting}
          >
            Complete Profile
          </Button>
        </div>
      </form>
    </div>
  );
}
