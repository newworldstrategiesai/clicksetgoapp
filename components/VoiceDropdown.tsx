import React from 'react';

interface Voice {
  voice_id: string;
  name: string;
  gender: string;
  accent: string;
  preview_url: string;
}

interface VoiceDropdownProps {
  voices: Voice[];
  selectedVoice: string;
  setSelectedVoice: (voiceId: string) => void;
}

const VoiceDropdown: React.FC<VoiceDropdownProps> = ({ voices, selectedVoice, setSelectedVoice }) => {
  return (
    <div>
      <label className="block mb-2">
        <span className="block text-gray-400">Select Voice:</span>
        <select
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
          className="p-2 border rounded-lg w-full bg-gray-800 text-white max-h-40 overflow-y-auto"
        >
          {voices.length > 0 ? (
            voices.map((voice) => (
              <option key={voice.voice_id} value={voice.voice_id}>
                {voice.name} (ID: {voice.voice_id}) - {voice.gender}, {voice.accent}
              </option>
            ))
          ) : (
            <option value="" disabled>
              No voices available
            </option>
          )}
        </select>
      </label>
    </div>
  );
};

export default VoiceDropdown;
