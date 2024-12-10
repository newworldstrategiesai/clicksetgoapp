// components/ui/AddVoiceModal.tsx

'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button/Button';
import Modal from '@/components/ui/Modal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface AddVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string; // Pass the API key from the parent component
}

const AddVoiceModal: React.FC<AddVoiceModalProps> = ({ isOpen, onClose, apiKey }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [samples, setSamples] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [labels, setLabels] = useState(''); // Assuming labels are entered as a JSON string

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSamples([...samples, ...Array.from(e.target.files)]);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      toast.error("Please provide a name for the voice.");
      return;
    }

    if (samples.length === 0) {
      toast.error("Please upload at least one audio sample.");
      return;
    }

    // Optional: Validate labels if provided
    if (labels.trim()) {
      try {
        JSON.parse(labels);
      } catch (err) {
        toast.error("Labels must be a valid JSON string.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Construct FormData
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('remove_background_noise', 'true'); // or 'false' based on your requirement

      // Append each file individually
      samples.forEach((file, index) => {
        formData.append('files', file);
      });

      // Append labels if provided
      if (labels.trim()) {
        formData.append('labels', labels);
      }

      // Make the API call using fetch
      const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey, // Set the API key in headers
          // Note: Do NOT set 'Content-Type' header when using FormData
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error submitting voice to ElevenLabs:", errorData);
        toast.error(`Failed to add voice: ${errorData.detail.message}`);
        return;
      }

      const responseData = await response.json();
      console.log("Voice successfully added:", responseData);
      toast.success("Voice successfully added!");

      // Reset form
      setName('');
      setDescription('');
      setSamples([]);
      setLabels('');
      onClose();
    } catch (error) {
      console.error("Error submitting voice to ElevenLabs:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <Modal isOpen={isOpen} onClose={onClose} title="Add Voice" scrollable>
        <div className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium dark:text-white">Name<span className="text-red-500">*</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white"
              placeholder="e.g., John Doe"
            />
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium dark:text-white">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white"
              rows={4}
              placeholder='e.g., "A friendly and clear voice, ideal for customer service."'
            ></textarea>
          </div>

          {/* Labels Field */}
          <div>
            <label className="block text-sm font-medium dark:text-white">Labels (JSON)</label>
            <textarea
              value={labels}
              onChange={(e) => setLabels(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white"
              rows={2}
              placeholder='e.g., {"emotion":"friendly","tone":"clear"}'
            ></textarea>
          </div>

          {/* File Upload Field */}
          <div>
            <label className="block text-sm font-medium dark:text-white">
              Click to upload a file or drag and drop
            </label>
            <input
              type="file"
              onChange={handleFileUpload}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white"
              multiple
              accept=".mp3, .wav, .m4a" // Specify accepted file types
            />
            <p className="mt-2 text-sm text-gray-400">Audio files, up to 10MB each</p>
          </div>

          {/* Display Uploaded Samples */}
          <div>
            <label className="block text-sm font-medium dark:text-white">Samples {samples.length} / 25</label>
            <ul className="list-disc pl-5 text-gray-300">
              {samples.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          </div>

          {/* Terms Confirmation */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="confirm"
              className="mr-2"
              required
            />
            <label htmlFor="confirm" className="text-sm text-gray-400">
              I confirm that I have all necessary rights or consents to upload and clone these voice samples and will abide by ElevenLabs’ Terms of Service, Prohibited Use Policy, and Privacy Policy.
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="flat" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button variant="flat" onClick={handleSubmit} loading={isSubmitting}>Add Voice</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AddVoiceModal;
