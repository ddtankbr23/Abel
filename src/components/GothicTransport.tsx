import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Repeat,
  Shuffle,
} from 'lucide-react';

interface GothicTransportProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSkip: (delta: number) => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  isLooping: boolean;
  onToggleLoop: () => void;
  isShuffled: boolean;
  onToggleShuffle: () => void;
}

export const GothicTransport: React.FC<GothicTransportProps> = ({
  isPlaying,
  onTogglePlay,
  onNext,
  onPrev,
  onSkip,
  currentTime,
  duration,
  onSeek,
  isLooping,
  onToggleLoop,
  isShuffled,
  onToggleShuffle,
}) => {
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full flex flex-col gap-3 p-4 sm:p-5 rounded-2xl border border-rose-950/40 dark:border-rose-900/30 bg-stone-50 dark:bg-[#110c19] shadow-md transition-colors">
      {/* 1. Time Scrubbing Bar */}
      <div className="flex flex-col gap-1.5">
        <div className="relative group flex items-center">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={(e) => onSeek(Number(e.target.value))}
            className="w-full h-2 rounded-lg cursor-pointer accent-rose-600 dark:accent-rose-500"
          />
        </div>

        {/* Timestamps */}
        <div className="flex justify-between items-center text-xs font-tabular text-stone-500 dark:text-stone-400">
          <span>{formatTime(currentTime)}</span>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-rose-700 dark:text-rose-400">
              {progressPercent.toFixed(0)}%
            </span>
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* 2. Main Controls Row */}
      <div className="flex items-center justify-between sm:justify-center gap-2 sm:gap-6 mt-1">
        {/* Shuffle */}
        <button
          onClick={onToggleShuffle}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            isShuffled
              ? 'text-rose-600 dark:text-rose-400 bg-rose-950/20'
              : 'text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-rose-300'
          }`}
          title="Modo Aleatorio"
        >
          <Shuffle className="w-4 h-4" />
        </button>

        {/* Skip -10s */}
        <button
          onClick={() => onSkip(-10)}
          className="p-2 rounded-lg text-stone-600 dark:text-stone-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-950/20 transition-colors cursor-pointer"
          title="Retroceder 10 segundos"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Prev Track */}
        <button
          onClick={onPrev}
          className="p-2.5 rounded-xl text-stone-700 dark:text-rose-200 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-950/20 transition-all cursor-pointer"
          title="Pista anterior"
        >
          <SkipBack className="w-5 h-5 fill-current" />
        </button>

        {/* BIG CENTRAL GOTHIC PLAY / PAUSE BUTTON */}
        <button
          onClick={onTogglePlay}
          className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-rose-600 to-rose-800 hover:from-rose-500 hover:to-rose-700 text-white flex items-center justify-center shadow-lg shadow-rose-900/40 hover:scale-105 active:scale-95 transition-all duration-200 border border-rose-400/30 cursor-pointer"
          title={isPlaying ? 'Pausar' : 'Reproducir'}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-0.5" />
          )}
        </button>

        {/* Next Track */}
        <button
          onClick={onNext}
          className="p-2.5 rounded-xl text-stone-700 dark:text-rose-200 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-950/20 transition-all cursor-pointer"
          title="Siguiente pista"
        >
          <SkipForward className="w-5 h-5 fill-current" />
        </button>

        {/* Skip +10s */}
        <button
          onClick={() => onSkip(10)}
          className="p-2 rounded-lg text-stone-600 dark:text-stone-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-950/20 transition-colors cursor-pointer"
          title="Adelantar 10 segundos"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        {/* Loop / Repeat */}
        <button
          onClick={onToggleLoop}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            isLooping
              ? 'text-rose-600 dark:text-rose-400 bg-rose-950/20'
              : 'text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-rose-300'
          }`}
          title={isLooping ? 'Repetición activada' : 'Repetir desactivado'}
        >
          <Repeat className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
