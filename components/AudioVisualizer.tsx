import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Waveform } from './WaveForm';

export function AudioVisualizer() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState<Float32Array | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Float32Array(bufferLength);

      const updateData = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getFloatTimeDomainData(dataArray);
        setAudioData(new Float32Array(dataArray));
        animationFrameRef.current = requestAnimationFrame(updateData);
      };

      updateData();
      setIsRecording(true);

    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    setIsRecording(false);
    setAudioData(null);
  }, []);

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  return (
    <div className="w-full max-w-3xl flex flex-col items-center gap-8">
      <div className="relative w-full">
        <Waveform audioData={audioData} />
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 pointer-events-none" />
      </div>

      <div className="flex gap-4">
        <button
          onClick={startRecording}
          disabled={isRecording}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full font-medium shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          <Mic className="w-5 h-5" />
          Start Recording
        </button>
        <button
          onClick={stopRecording}
          disabled={!isRecording}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full font-medium shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          <MicOff className="w-5 h-5" />
          Stop Recording
        </button>
      </div>

      <div className="flex flex-col items-center gap-2 text-gray-600">
        <p className="font-medium">
          Status:{' '}
          <span className="text-indigo-600">
            {isRecording ? 'Recording' : 'Idle'}
          </span>
        </p>
      </div>
    </div>
  );
}