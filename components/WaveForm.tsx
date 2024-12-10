// components/Waveform.tsx

import React, { useEffect, useRef } from 'react';

interface WaveformProps {
  audioData: Float32Array | null;
  isSpeaking: boolean; // Added prop
}

export function Waveform({ audioData, isSpeaking }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const smoothedAmplitudeRef = useRef<number>(0);
  const hueRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hueRef.current = (hueRef.current + 0.5) % 360;

      // Calculate maximum amplitude
      let maxAmplitude = 0;
      if (audioData) {
        for (let i = 0; i < audioData.length; i++) {
          const amplitude = Math.abs(audioData[i]);
          maxAmplitude = Math.max(maxAmplitude, amplitude * 1.5);
        }
      }

      // Amplitude smoothing
      const targetAmplitude = audioData ? maxAmplitude : 0;
      const attackSpeed = 0.4;
      const releaseSpeed = 0.15;
      const smoothingFactor = audioData ? attackSpeed : releaseSpeed;
      smoothedAmplitudeRef.current += (targetAmplitude - smoothedAmplitudeRef.current) * smoothingFactor;

      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      if (audioData) {
        gradient.addColorStop(0, `hsla(${hueRef.current}, 100%, 65%, 0.8)`);
        gradient.addColorStop(0.5, `hsla(${(hueRef.current + 60) % 360}, 100%, 65%, 0.8)`);
        gradient.addColorStop(1, `hsla(${(hueRef.current + 120) % 360}, 100%, 65%, 0.8)`);
      } else {
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0.5)');
      }

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const segments = 256;
      const baseAmplitude = 40;
      const timeOffset = Date.now() * 0.002;

      if (audioData) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);

        for (let i = 0; i <= segments; i++) {
          const x = (i / segments) * canvas.width;
          const normalizedIndex = Math.floor((i / segments) * audioData.length);
          const audioValue = audioData[normalizedIndex] || 0;

          let y = canvas.height / 2;
          const audioAmplitude = audioValue * baseAmplitude * smoothedAmplitudeRef.current * 4;
          const waveAmplitude = baseAmplitude * smoothedAmplitudeRef.current;

          y += audioAmplitude;
          y += Math.sin(timeOffset * 3 + i * 0.03) * waveAmplitude * 0.6;
          y += Math.sin(timeOffset * 5 + i * 0.05) * waveAmplitude * 0.4;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            const prevX = ((i - 1) / segments) * canvas.width;
            const cpX1 = prevX + (x - prevX) / 3;
            const cpX2 = prevX + (x - prevX) * 2 / 3;
            ctx.bezierCurveTo(cpX1, canvas.height / 2, cpX2, y, x, y);
          }
        }

        // Dynamic glow effect
        ctx.shadowBlur = 10 + smoothedAmplitudeRef.current * 15;
        ctx.shadowColor = `hsla(${hueRef.current}, 100%, 65%, ${smoothedAmplitudeRef.current})`;
      } else {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.strokeStyle = gradient;
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
      }

      ctx.stroke();

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioData, isSpeaking]); // Added isSpeaking to dependencies

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={200}
      className="w-full max-w-3xl h-[100px] rounded-xl"
    />
  );
}
