import React, { useState, useEffect } from 'react';

interface LiveCallModalProps {
  listenUrl: string;
  onClose: () => void;
}

const LiveCallModal: React.FC<LiveCallModalProps> = ({ listenUrl, onClose }) => {
  const [transcript, setTranscript] = useState<string>('');
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);

  // Connect to WebSocket for live listening
  const connectToWebSocket = (listenUrl: string) => {
    const socket = new WebSocket(listenUrl);

    socket.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      // Process audio data (if available)
      if (message.audioUrl) {
        const audioPlayer = new Audio(message.audioUrl);
        audioPlayer.play();
        setAudio(audioPlayer);
      }

      // Update the transcript
      if (message.transcript) {
        setTranscript((prevTranscript) => prevTranscript + '\n' + message.transcript);
      }
    };

    socket.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    };

    setWebSocket(socket);
  };

  useEffect(() => {
    if (listenUrl) {
      connectToWebSocket(listenUrl);
    }

    return () => {
      if (webSocket) {
        webSocket.close();
      }
    };
  }, [listenUrl]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
      {/* Modal Content */}
      <div className="bg-white p-6 rounded-lg w-full h-full max-w-3xl overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-black bg-opacity-60 p-2 rounded-full"
        >
          X
        </button>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-center mb-6 text-black">
          Listening to the Call
        </h2>

        {/* Audio Player */}
        <div className="mb-6">
          {audio ? (
            <div>
              <audio controls autoPlay src={audio.src}>
                Your browser does not support the audio element.
              </audio>
            </div>
          ) : (
            <p>Loading audio...</p>
          )}
        </div>

        {/* Live Transcript */}
        <div className="h-full overflow-auto p-4 bg-gray-100 rounded-lg mb-4">
          <h3 className="text-lg font-medium text-black mb-4">Live Transcript</h3>
          <pre className="whitespace-pre-wrap">{transcript}</pre>
        </div>

        {/* WebSocket Connection Status */}
        <div className="mt-4 text-center text-black">
          {isConnected ? (
            <p>Connected to the call. Listening...</p>
          ) : (
            <p>Connecting...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveCallModal;
