import React from 'react';
import { Moon, Sun, Music2, Sliders, ListMusic } from 'lucide-react';

interface GothicHeaderProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  activeTab: 'player' | 'playlist' | 'fx';
  setActiveTab: (tab: 'player' | 'playlist' | 'fx') => void;
  playlistCount: number;
}

export const GothicHeader: React.FC<GothicHeaderProps> = ({
  isDarkMode,
  onToggleTheme,
  activeTab,
  setActiveTab,
  playlistCount,
}) => {
  return (
    <header className="w-full border-b border-rose-950/40 dark:border-rose-950/40 bg-white/80 dark:bg-[#0e0a14]/90 backdrop-blur-md sticky top-0 z-40 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark in Gothic serif */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-full border border-rose-600/50 flex items-center justify-center bg-rose-950/30 text-rose-500 shadow-sm shadow-rose-900/20">
            <span className="font-gothic text-base font-bold">✝</span>
          </div>
          <span className="font-gothic tracking-widest text-lg font-bold text-stone-900 dark:text-rose-100 whitespace-nowrap">
            NOCTURNA
          </span>
        </div>

        {/* Zone 2: Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('player')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              activeTab === 'player'
                ? 'bg-rose-950/20 text-rose-700 dark:bg-rose-950/50 dark:text-rose-200 border border-rose-800/40'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-rose-200'
            }`}
          >
            <Music2 className="w-3.5 h-3.5" />
            <span>Reproductor</span>
          </button>

          <button
            onClick={() => setActiveTab('playlist')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              activeTab === 'playlist'
                ? 'bg-rose-950/20 text-rose-700 dark:bg-rose-950/50 dark:text-rose-200 border border-rose-800/40'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-rose-200'
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span>Biblioteca</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-900/30 text-rose-400 font-tabular">
              {playlistCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('fx')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              activeTab === 'fx'
                ? 'bg-rose-950/20 text-rose-700 dark:bg-rose-950/50 dark:text-rose-200 border border-rose-800/40'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-rose-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Efectos & Visor</span>
          </button>
        </nav>

        {/* Zone 3: Dark Gothic / Light Gothic Alabaster Mode Switch */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onToggleTheme}
            aria-label="Cambiar tema"
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-rose-900/30 bg-stone-100 hover:bg-stone-200 dark:bg-rose-950/30 dark:hover:bg-rose-950/60 text-stone-800 dark:text-rose-200 transition-colors whitespace-nowrap"
            title={isDarkMode ? 'Cambiar a modo claro (Alabastro Gótico)' : 'Cambiar a modo Dark Gothic'}
          >
            {isDarkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Modo Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Dark Gothic</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
