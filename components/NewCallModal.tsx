import React from 'react';

interface NewCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewCallModal: React.FC<NewCallModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null; // Don't render if not open

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Handle form submission logic here
    onClose(); // Close modal after submission
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Schedule Outbound Call</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Call Time:
            <input type="datetime-local" required />
          </label>
          <label>
            Contact:
            <input type="text" required />
          </label>
          <button type="submit">Schedule Call</button>
        </form>
      </div>
    </div>
  );
};

export default NewCallModal;