// /components/ui/Modal.tsx

'use client';

import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  scrollable?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, scrollable }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className={`bg-black text-white rounded-lg p-6 max-w-lg w-full ${scrollable ? 'max-h-screen overflow-y-auto' : ''}`}>
        <div className="flex justify-between items-center mb-4">
          {title && <h2 className="text-xl font-semibold">{title}</h2>}
          <button onClick={onClose} className="text-white hover:text-gray-300">&times;</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
