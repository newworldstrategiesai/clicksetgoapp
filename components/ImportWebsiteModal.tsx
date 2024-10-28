import { useState } from 'react';
import { Button } from '@/components/ui/Home/button';
import { Input } from '@/components/ui/input';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
}

export function ImportWebsiteModal({ isOpen, onClose, onSubmit }: ModalProps) {
  const [url, setUrl] = useState('');

  if (!isOpen) return null;

  const handleImport = () => {
    onSubmit(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Import website</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300">Source name</label>
          <Input
            type="text"
            placeholder="Enter website URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mt-1 bg-gray-700 border-gray-600 text-white w-full"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="secondary" className="bg-purple-600" onClick={handleImport}>
            Import
          </Button>
        </div>
      </div>
    </div>
  );
}
