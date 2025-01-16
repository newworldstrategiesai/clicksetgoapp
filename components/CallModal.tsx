import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import VoiceDropdown from './VoiceDropdown'; // Ensure the path is correct

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

interface Voice {
  voice_id: string;
  name: string;
  gender: string;
  accent: string;
  preview_url: string;
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
}) => {
  const [firstMessage, setFirstMessage] = useState('');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
          },
        });
        setVoices(response.data.voices || []);
        if (response.data.voices.length > 0) {
          setSelectedVoice(response.data.voices[0].voice_id);
        }
      } catch (error) {
        console.error('Failed to fetch voices:', error);
      }
    };

    if (isOpen) {
      fetchVoices();
    }
  }, [isOpen]);

  return (
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
            <label className="block mb-2">
              <span className="block text-gray-400">First Message:</span>
              <input
                type="text"
                value={firstMessage}
                onChange={(e) => setFirstMessage(e.target.value)}
                className="p-2 border rounded-lg w-full"
                placeholder="Enter your first message"
              />
            </label>
            <VoiceDropdown
              voices={voices}
              selectedVoice={selectedVoice}
              setSelectedVoice={setSelectedVoice}
            />
            {error && <p className="text-red-500">{error}</p>}
            <button
              onClick={handleCallNow}
              className="mt-4 px-4 py-2 bg-blue-600 dark:text-white rounded-lg"
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
};

export default CallModal;
