// components/Conversation.tsx

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useConversation } from '@11labs/react';
import { Mic, MicOff } from 'lucide-react';
import { Waveform } from './WaveForm';

export function Conversation() {
  const conversation = useConversation({
    onConnect: () => console.log('Connected'),
    onDisconnect: () => console.log('Disconnected'),
    onMessage: (message) => console.log('Message:', message),
    onError: (error) => console.error('Error:', error),
  });

  // State for audio data
  const [audioData, setAudioData] = useState<Float32Array | null>(null);

  // References for audio processing
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null); // Correct type
  const dataArrayRef = useRef<Float32Array | null>(null);
  const animationFrameRef = useRef<number>();

  // Initialize audio context and analyser
  useEffect(() => {
    // Prevent multiple initializations
    if (sourceRef.current) {
      return;
    }

    if (audioRef.current) {
      // Create AudioContext
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      // Create AnalyserNode
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;

      try {
        // Create MediaElementAudioSourceNode
        const source = audioContext.createMediaElementSource(audioRef.current);
        sourceRef.current = source;

        // Connect nodes
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        // Create data array for analyser
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Float32Array(bufferLength);
        dataArrayRef.current = dataArray;

        // Function to continuously update audio data
        const updateAudioData = () => {
          if (analyserRef.current && dataArrayRef.current) {
            analyserRef.current.getFloatTimeDomainData(dataArrayRef.current);
            setAudioData(new Float32Array(dataArrayRef.current));
          }
          animationFrameRef.current = requestAnimationFrame(updateAudioData);
        };

        // Start updating audio data
        updateAudioData();
      } catch (error) {
        console.error('Error creating MediaElementAudioSourceNode:', error);
      }

      // Cleanup on unmount
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (sourceRef.current) {
          sourceRef.current.disconnect();
        }
        if (analyserRef.current) {
          analyserRef.current.disconnect();
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };
    }
  }, []); // Empty dependency array ensures this runs only once

  // Start Conversation Handler
  const startConversation = useCallback(async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start the conversation with your agent
      await conversation.startSession({
        agentId: 'nLw9sdvgF1d4cdi4emJl', // Replace with your agent ID
      });

      // Optionally, play the audio if it's controlled via audioRef
      // audioRef.current?.play();
    } catch (error) {
      console.error('Failed to start conversation:', error);
      alert('Failed to start conversation. Please check microphone permissions.');
    }
  }, [conversation]);

  // Stop Conversation Handler
  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  return (
    <div className="w-full max-w-3xl flex flex-col items-center gap-8">
      <div className="relative w-full">
        <Waveform audioData={audioData} isSpeaking={conversation.isSpeaking} />
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 pointer-events-none" />
      </div>

      <div className="flex gap-4">
        <button
          onClick={startConversation}
          disabled={conversation.status === 'connected'}
          aria-label="Start Call"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full font-medium shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          <Mic className="w-5 h-5" />
          Start Call
        </button>
        <button
          onClick={stopConversation}
          disabled={conversation.status !== 'connected'}
          aria-label="Stop Call"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full font-medium shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          <MicOff className="w-5 h-5" />
          Stop Call
        </button>
      </div>

      <div className="flex flex-col items-center gap-2 text-gray-600">
        <p className="font-medium">
          Status:{' '}
          <span className="text-indigo-600">{conversation.status}</span>
        </p>
        <p className="font-medium">
          Agent is{' '}
          <span className="text-indigo-600">
            {conversation.isSpeaking ? 'speaking' : 'listening'}
          </span>
        </p>
      </div>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} controls style={{ display: 'none' }} />
    </div>
  );
}
