'use client';

import React, { useState } from 'react';
import  Button  from '@/components/ui/Button/Button';
import Modal from '@/components/ui/Modal';
import { ElevenLabsClient } from 'elevenlabs'; // Import the ElevenLabsClient

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSamples([...samples, ...Array.from(e.target.files)]);
    }
  };

  const handleSubmit = async () => {
    if (!name || samples.length === 0) {
      alert("Please provide a name and at least one audio sample.");
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      console.log("API Key:", apiKey); // Debugging: Log the API key
  
      if (!apiKey) {
        throw new Error("API key is missing.");
      }
  
      // Initialize ElevenLabs client
      const client = new ElevenLabsClient({ apiKey });
  
      // Upload the files directly using the File API
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      samples.forEach((sample, index) => {
        formData.append(`files[${index}]`, sample);
      });
  
      // Extract the File objects from formData
      const files = formData.getAll('files').filter(item => item instanceof File) as File[];
  
      const response = await client.voices.add({
        files, // Pass the filtered File objects directly
        name,
      });
  
      if (response) {
        alert("Voice successfully added!");
        setName('');
        setDescription('');
        setSamples([]);
        onClose();
      } else {
        alert("Failed to add voice. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting voice to ElevenLabs:", error);
      alert("Error submitting voice to ElevenLabs. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Voice" scrollable>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium dark:text-white">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-500 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium dark:text-white">
            Click to upload a file or drag and drop
          </label>
          <input
            type="file"
            onChange={handleFileUpload}
            className="mt-1 block w-full p-2 bg-white border border-gray-300 rounded-md dark:bg-gray-500 dark:text-white"
            multiple
          />
          <p className="mt-2 text-sm text-gray-800 dark:text-gray-200">Audio or Video files, up to 10MB each</p>
        </div>

        <div>
          <label className="block text-sm font-medium dark:text-white">Samples {samples.length} / 25</label>
          <ul className="list-disc pl-5 text-gray-300">
            {samples.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>

        <div>
          <label className="block text-sm font-medium dark:text-white">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full p-2 bg-white border border-gray-300 rounded-md dark:bg-gray-500 dark:text-white"
            rows={4}
            placeholder='How would you describe the voice? e.g. "An old American male voice with a slight hoarseness in his throat. Perfect for news."'
          ></textarea>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="confirm"
            className="mr-2 dark:bg-white"
          />
          <label htmlFor="confirm" className="text-sm text-gray-800 dark:text-gray-200" >
            I hereby confirm that I have all necessary rights or consents to upload and clone these voice samples...
          </label>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="flat" className='hover:text-white dark:hover:text-white' onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button variant="flat" className='hover:text-white dark:hover:text-white' onClick={handleSubmit} loading={isSubmitting}>Add Voice</Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddVoiceModal;
