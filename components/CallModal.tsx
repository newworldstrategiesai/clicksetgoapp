import React from 'react';
import Modal from 'react-modal';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '500px',
    padding: '20px',
    borderRadius: '10px',
    backgroundColor: 'black',
    color: 'white',
  },
};

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  user_id: string;
}

interface TwilioNumber {
  sid: string;
  phoneNumber: string;
}

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedContact: Contact | null;
  selectedTwilioNumber: string;
  setSelectedTwilioNumber: (value: string) => void;
  callReason: string;
  setCallReason: (value: string) => void;
  handleCallNow: () => void;
  error: string;
  loading: boolean;
  twilioNumbers: TwilioNumber[];
}

const CallModal: React.FC<CallModalProps> = ({
  isOpen,
  onClose,
  selectedContact,
  selectedTwilioNumber,
  setSelectedTwilioNumber,
  callReason,
  setCallReason,
  handleCallNow,
  error,
  loading,
  twilioNumbers = [],
}) => (
  <Modal
    isOpen={isOpen}
    onRequestClose={onClose}
    style={customStyles}
    contentLabel="Call Modal"
  >
    <h2 className="text-xl font-bold mb-4">Call Contact</h2>
    {selectedContact ? (
      <div>
        <p>
          <strong>Name:</strong> {selectedContact.first_name} {selectedContact.last_name}
        </p>
        <p>
          <strong>Phone:</strong> {selectedContact.phone}
        </p>
        <div className="mt-4">
          <label className="block mb-2">
            <span className="block text-gray-400">Twilio Number:</span>
            <select
              value={selectedTwilioNumber}
              onChange={(e) => setSelectedTwilioNumber(e.target.value)}
              className="p-2 border rounded-lg w-full"
            >
              <option value="">Select Twilio Number</option>
              {twilioNumbers.length > 0 ? (
                twilioNumbers.map((number) => (
                  <option key={number.sid} value={number.phoneNumber}>
                    {number.phoneNumber}
                  </option>
                ))
              ) : (
                <option value="" disabled>No Twilio Numbers Available</option>
              )}
            </select>
          </label>
          <label className="block mb-2">
            <span className="block text-gray-400">Call Reason:</span>
            <textarea
              value={callReason}
              onChange={(e) => setCallReason(e.target.value)}
              className="p-2 border rounded-lg w-full"
            />
          </label>
          {error && <p className="text-red-500">{error}</p>}
          <button
            onClick={handleCallNow}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
            disabled={loading}
          >
            {loading ? 'Calling...' : 'Call Now'}
          </button>
        </div>
      </div>
    ) : (
      <p>No contact selected.</p>
    )}
  </Modal>
);

export default CallModal;
