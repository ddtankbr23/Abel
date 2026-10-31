import React, { useEffect, useRef } from 'react';

interface GothicVisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  visualizerMode?: 'cathedral' | 'rune' | 'velvet';
  isDarkMode?: boolean;
}

export const GothicVisualizer: React.FC<GothicVisualizerProps> = ({
  analyser,
  isPlaying,
  visualizerMode = 'cathedral',
  isDarkMode = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let rotationAngle = 0;

    const dataArray = analyser ? new Uint8Array(analyser.frequencyBinCount) : new Uint8Array(64);

    const render = () => {
      animationFrameId = requestAnimationFrame(render);

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(dataArray);
      } else {
        // Idle gentle breathing motion
        const time = performance.now() * 0.002;
        for (let i = 0; i < dataArray.length; i++) {
          dataArray[i] = Math.max(12, Math.sin(time + i * 0.15) * 20 + 25);
        }
      }

      if (visualizerMode === 'cathedral') {
        // Mode 1: Gothic Cathedral Arches
        const barCount = 48;
        const barWidth = (width / barCount) * 0.75;
        const gap = (width / barCount) * 0.25;

        for (let i = 0; i < barCount; i++) {
          // Mirror from center
          const distFromCenter = Math.abs(i - barCount / 2) / (barCount / 2);
          const freqIndex = Math.floor((1 - distFromCenter * 0.6) * (dataArray.length * 0.45));
          const value = dataArray[freqIndex] || 15;
          const barHeight = (value / 255) * (height * 0.78);

          const x = i * (barWidth + gap) + gap / 2;
          const y = height - barHeight;

          // Gothic Arch top
          ctx.beginPath();
          ctx.moveTo(x, height);
          ctx.lineTo(x, y + barWidth);
          // Pointed gothic lancet tip
          ctx.quadraticCurveTo(x + barWidth / 2, y, x + barWidth / 2, y - 6);
          ctx.quadraticCurveTo(x + barWidth / 2, y, x + barWidth, y + barWidth);
          ctx.lineTo(x + barWidth, height);
          ctx.closePath();

          const grad = ctx.createLinearGradient(0, height, 0, y);
          if (isDarkMode) {
            grad.addColorStop(0, 'rgba(159, 18, 57, 0.2)');
            grad.addColorStop(0.5, 'rgba(225, 29, 72, 0.75)');
            grad.addColorStop(1, 'rgba(244, 63, 94, 0.95)');
          } else {
            grad.addColorStop(0, 'rgba(159, 18, 57, 0.15)');
            grad.addColorStop(0.5, 'rgba(190, 18, 60, 0.65)');
            grad.addColorStop(1, 'rgba(136, 19, 55, 0.85)');
          }

          ctx.fillStyle = grad;
          ctx.fill();

          // Highlight top spire tip
          ctx.fillStyle = isDarkMode ? '#fecdd3' : '#881337';
          ctx.beginPath();
          ctx.arc(x + barWidth / 2, y - 6, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (visualizerMode === 'rune') {
        // Mode 2: Arcane Gothic Sigil Ring
        const centerX = width / 2;
        const centerY = height / 2;
        const baseRadius = Math.min(width, height) * 0.28;
        rotationAngle += isPlaying ? 0.008 : 0.002;

        // Outer frequency spikes
        const points = 64;
        ctx.beginPath();
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2 + rotationAngle;
          const val = dataArray[i % 32] || 20;
          const r = baseRadius + (val / 255) * 55;
          const px = centerX + Math.cos(angle) * r;
          const py = centerY + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = isDarkMode ? 'rgba(225, 29, 72, 0.8)' : 'rgba(159, 18, 57, 0.7)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner gothic circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius * 0.85, 0, Math.PI * 2);
        ctx.strokeStyle = isDarkMode ? 'rgba(168, 85, 247, 0.5)' : 'rgba(126, 34, 206, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Gothic cross inside circle
        ctx.strokeStyle = isDarkMode ? 'rgba(244, 63, 94, 0.7)' : 'rgba(159, 18, 57, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - baseRadius * 0.6);
        ctx.lineTo(centerX, centerY + baseRadius * 0.6);
        ctx.moveTo(centerX - baseRadius * 0.38, centerY - baseRadius * 0.2);
        ctx.lineTo(centerX + baseRadius * 0.38, centerY - baseRadius * 0.2);
        ctx.stroke();
      } else {
        // Mode 3: Velvet Soundwaves
        ctx.beginPath();
        const sliceWidth = width / 64;
        let x = 0;
        ctx.moveTo(0, height / 2);

        for (let i = 0; i < 64; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2.8 + height * 0.15;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }

        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, 0, 0, height);
        if (isDarkMode) {
          grad.addColorStop(0, 'rgba(168, 85, 247, 0.5)');
          grad.addColorStop(0.5, 'rgba(225, 29, 72, 0.3)');
          grad.addColorStop(1, 'rgba(15, 10, 20, 0.8)');
        } else {
          grad.addColorStop(0, 'rgba(147, 51, 234, 0.3)');
          grad.addColorStop(0.5, 'rgba(190, 18, 60, 0.2)');
          grad.addColorStop(1, 'rgba(240, 235, 245, 0.8)');
        }

        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = isDarkMode ? '#f43f5e' : '#be123c';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [analyser, isPlaying, visualizerMode, isDarkMode]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={180}
      className="w-full h-full block rounded-lg select-none pointer-events-none"
    />
  );
};
