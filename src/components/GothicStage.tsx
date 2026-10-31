import React, { useRef } from 'react';
import { Eye, EyeOff, Maximize2, Video, Music } from 'lucide-react';
import { GothicVisualizer } from './GothicVisualizer';
import { MediaTrack } from '../services/sampleMedia';

interface GothicStageProps {
  currentTrack: MediaTrack | null;
  isPlaying: boolean;
  isVideoTrack: boolean;
  showVideo: boolean;
  setShowVideo: (show: boolean) => void;
  analyser: AnalyserNode | null;
  visualizerMode: 'cathedral' | 'rune' | 'velvet';
  isDarkMode: boolean;
  videoElementRef: React.RefObject<HTMLVideoElement | null>;
  onTimeUpdate: () => void;
  onLoadedMetadata: () => void;
  onEnded: () => void;
}

export const GothicStage: React.FC<GothicStageProps> = ({
  currentTrack,
  isPlaying,
  isVideoTrack,
  showVideo,
  setShowVideo,
  analyser,
  visualizerMode,
  isDarkMode,
  videoElementRef,
  onTimeUpdate,
  onLoadedMetadata,
  onEnded,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen().catch((err) => {
        console.warn('Fullscreen request failed:', err);
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden border border-rose-950/40 dark:border-rose-900/30 bg-gradient-to-b from-stone-100 to-stone-200 dark:from-[#130d1c] dark:to-[#0a0710] shadow-xl shadow-rose-950/10 dark:shadow-rose-950/30 transition-all duration-300"
    >
      {/* Subtle Gothic Arch border ornament */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-rose-600/50 to-transparent" />

      {/* Main Visualizer or Video Screen */}
      <div className="relative w-full aspect-video sm:aspect-[21/9] max-h-[380px] flex items-center justify-center overflow-hidden bg-black/40">
        {/* The video element is ALWAYS attached here so playback and audio graph are persistent */}
        <video
          ref={videoElementRef}
          className={`w-full h-full object-contain transition-opacity duration-300 ${
            isVideoTrack && showVideo ? 'opacity-100 block' : 'opacity-0 hidden'
          }`}
          playsInline
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onEnded={onEnded}
        />

        {/* Audio-only Stage (rendered when not showing video or when track is pure audio) */}
        {(!isVideoTrack || !showVideo) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none">
            {/* Visualizer canvas in background */}
            <div className="absolute inset-0 opacity-85 pointer-events-none">
              <GothicVisualizer
                analyser={analyser}
                isPlaying={isPlaying}
                visualizerMode={visualizerMode}
                isDarkMode={isDarkMode}
              />
            </div>

            {/* Center Gothic Crest & Metadata */}
            <div className="relative z-10 flex flex-col items-center max-w-md">
              <div
                className={`w-20 h-20 rounded-full border-2 flex items-center justify-center mb-3 transition-transform duration-700 ${
                  isPlaying ? 'scale-105 border-rose-500 shadow-lg shadow-rose-500/30' : 'border-rose-900/40'
                } bg-rose-950/30 backdrop-blur-sm`}
              >
                {isVideoTrack ? (
                  <Video className="w-9 h-9 text-rose-400" />
                ) : (
                  <Music className="w-9 h-9 text-rose-400" />
                )}
              </div>

              <h2 className="font-gothic text-lg sm:text-xl font-bold tracking-wide text-stone-900 dark:text-rose-100 truncate max-w-full">
                {currentTrack?.title || 'Sin pista seleccionada'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-rose-300/70 mt-0.5">
                {currentTrack?.artist || 'Selecciona un archivo de audio o video'}
              </p>

              {/* Zero-Pill Unboxed Metadata */}
              <div className="flex items-center gap-2 mt-2 text-xs text-stone-500 dark:text-stone-400 font-tabular">
                <span>{currentTrack?.format || 'Audio'}</span>
                <span aria-hidden="true">·</span>
                <span>{currentTrack?.fileSize || 'Local'}</span>
                {isVideoTrack && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-rose-600 dark:text-rose-400 font-medium">Modo Solo Audio Activo</span>
                  </>
                )}
              </div>

              {/* KEY USER REQUIREMENT: Easy Toggle button to activate video right on the interface */}
              {isVideoTrack && !showVideo && (
                <div className="mt-4 flex flex-col items-center gap-1.5">
                  <button
                    onClick={() => setShowVideo(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs shadow-md shadow-rose-700/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Activar Pantalla de Video</span>
                  </button>
                  <span className="text-[11px] text-stone-500 dark:text-rose-300/60">
                    Por defecto reproduce solo el audio para optimizar batería y recursos
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Floating Controls Overlay when Video is Active */}
        {isVideoTrack && showVideo && (
          <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
            <button
              onClick={() => setShowVideo(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-stone-900/80 hover:bg-stone-900 text-rose-200 text-xs backdrop-blur-md border border-rose-800/40 shadow-sm transition-colors cursor-pointer"
              title="Volver a reproducir solo audio"
            >
              <EyeOff className="w-3.5 h-3.5 text-rose-400" />
              <span>Ocultar Video (Solo Audio)</span>
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-md bg-stone-900/80 hover:bg-stone-900 text-rose-200 backdrop-blur-md border border-rose-800/40 shadow-sm transition-colors cursor-pointer"
              title="Pantalla Completa"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
