"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Square } from "lucide-react";

interface VoicePreviewProps {
  text: string;
  voiceId: string;
}

export function VoicePreview({ text, voiceId }: VoicePreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const handlePlay = async () => {
    try {
      if (isPlaying && audio) {
        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
        return;
      }

      if (!voiceId || !text) {
        console.error("Missing voiceId or text");
        return;
      }

      const apiUrl = "https://api.elevenlabs.io/v1/text-to-speech";
      const requestBody = { voice_id: voiceId, text };

      // Log the request to ensure the data is correct
      console.log("Requesting voice preview:", requestBody);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error fetching audio:", errorText);
        throw new Error(`Error fetching audio: ${response.statusText}`);
      }

      const data = await response.blob();
      const audioUrl = URL.createObjectURL(data);
      const newAudio = new Audio(audioUrl);

      setAudio(newAudio);
      newAudio.onended = () => {
        setIsPlaying(false);
      };

      await newAudio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePlay}
        disabled={!voiceId || !text}
      >
        {isPlaying ? (
          <Square className="h-4 w-4 mr-2" />
        ) : (
          <Play className="h-4 w-4 mr-2" />
        )}
        {isPlaying ? "Stop" : "Preview Voice"}
      </Button>
      {!voiceId && (
        <p className="text-sm text-muted-foreground">
          Enter a Voice ID to preview
        </p>
      )}
      {!text && (
        <p className="text-sm text-muted-foreground">
          Enter text to preview the voice
        </p>
      )}
    </div>
  );
}
