import React, { useState, useEffect } from 'react';
import { GothicHeader } from './components/GothicHeader';
import { GothicStage } from './components/GothicStage';
import { GothicControlsBar } from './components/GothicControlsBar';
import { GothicTransport } from './components/GothicTransport';
import { GothicPlaylist } from './components/GothicPlaylist';
import { GothicSoundFX } from './components/GothicSoundFX';
import { useGothicMediaPlayer } from './hooks/useGothicMediaPlayer';
import { getPreloadedGothicTracks, MediaTrack } from './services/sampleMedia';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'player' | 'playlist' | 'fx'>('player');
  const [isLoadingSamples, setIsLoadingSamples] = useState<boolean>(true);

  // Hook for player
  const player = useGothicMediaPlayer([]);

  // Load initial demo tracks on mount
  useEffect(() => {
    let isMounted = true;
    getPreloadedGothicTracks().then((tracks) => {
      if (isMounted) {
        player.setPlaylist(tracks);
        setIsLoadingSamples(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync dark mode class on document element
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleResetSamples = async () => {
    setIsLoadingSamples(true);
    const tracks = await getPreloadedGothicTracks();
    player.setPlaylist(tracks);
    setIsLoadingSamples(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf9f6] dark:bg-[#0b090e] text-stone-900 dark:text-[#ece7f2] font-body transition-colors duration-300">
      {/* Top Bar Header */}
      <GothicHeader
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        playlistCount={player.playlist.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {isLoadingSamples && player.playlist.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
            <p className="font-gothic text-sm text-stone-600 dark:text-rose-200">
              Sintetizando atmósfera gótica y pistas de demostración...
            </p>
          </div>
        ) : (
          <>
            {/* Hidden media element bound to videoElementRef */}
            {/* Note: GothicStage renders the video tag when showVideo is true, or keeps it attached */}
            {activeTab === 'player' && (
              <div className="flex flex-col gap-5">
                {/* 1. Main Gothic Visualizer & Video Viewport Stage */}
                <GothicStage
                  currentTrack={player.currentTrack}
                  isPlaying={player.isPlaying}
                  isVideoTrack={player.isVideoTrack}
                  showVideo={player.showVideo}
                  setShowVideo={player.setShowVideo}
                  analyser={player.analyserNode}
                  visualizerMode={player.visualizerMode}
                  isDarkMode={isDarkMode}
                  videoElementRef={player.mediaRef}
                  onTimeUpdate={player.handleTimeUpdate}
                  onLoadedMetadata={player.handleLoadedMetadata}
                  onEnded={player.handleEnded}
                />

                {/* 2. Transport & Scrubbing Bar */}
                <GothicTransport
                  isPlaying={player.isPlaying}
                  onTogglePlay={player.togglePlay}
                  onNext={player.handleNext}
                  onPrev={player.handlePrev}
                  onSkip={player.handleSkip}
                  currentTime={player.currentTime}
                  duration={player.duration}
                  onSeek={player.handleSeek}
                  isLooping={player.isLooping}
                  onToggleLoop={() => player.setIsLooping((prev) => !prev)}
                  isShuffled={player.isShuffled}
                  onToggleShuffle={() => player.setIsShuffled((prev) => !prev)}
                />

                {/* 3. Dropdown Controls for Pitch, Playback Speed, and Independent Dual Volume */}
                <GothicControlsBar
                  pitch={player.pitch}
                  setPitch={player.setPitch}
                  speed={player.speed}
                  setSpeed={player.setSpeed}
                  baseVolume={player.baseVolume}
                  setBaseVolume={player.setBaseVolume}
                  enableSuperBoost={player.enableSuperBoost}
                  setEnableSuperBoost={player.setEnableSuperBoost}
                  boostVolume={player.boostVolume}
                  setBoostVolume={player.setBoostVolume}
                  effectiveGain={player.effectiveGain}
                  isMuted={player.isMuted}
                  toggleMute={player.toggleMute}
                />
              </div>
            )}

            {/* Tab: Biblioteca / Playlist */}
            {activeTab === 'playlist' && (
              <GothicPlaylist
                playlist={player.playlist}
                currentTrackId={player.currentTrack?.id}
                isPlaying={player.isPlaying}
                onSelectTrack={player.playTrackById}
                onRemoveTrack={player.removeTrack}
                onAddFiles={player.addFilesToPlaylist}
                onResetSamples={handleResetSamples}
              />
            )}

            {/* Tab: Efectos Góticos & Visualizador */}
            {activeTab === 'fx' && (
              <GothicSoundFX
                bassBoost={player.bassBoost}
                setBassBoost={player.setBassBoost}
                visualizerMode={player.visualizerMode}
                setVisualizerMode={player.setVisualizerMode}
              />
            )}
          </>
        )}
      </main>

      {/* Persistent Audio/Video listener hooks attached to mediaRef */}
      <audio
        style={{ display: 'none' }}
        onTimeUpdate={player.handleTimeUpdate}
        onLoadedMetadata={player.handleLoadedMetadata}
        onEnded={player.handleEnded}
      />

      {/* Footer */}
      <footer className="w-full border-t border-rose-950/20 dark:border-rose-950/40 py-4 text-center text-xs text-stone-500 dark:text-stone-400">
        <p className="font-gothic tracking-wider">
          NOCTURNA · REPRODUCTOR MULTIMEDIA DARK GOTHIC
        </p>
      </footer>
    </div>
  );
}
