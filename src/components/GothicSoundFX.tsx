import React from 'react';
import { Sliders, Sparkles, Activity } from 'lucide-react';

interface GothicSoundFXProps {
  bassBoost: number;
  setBassBoost: (val: number) => void;
  visualizerMode: 'cathedral' | 'rune' | 'velvet';
  setVisualizerMode: (mode: 'cathedral' | 'rune' | 'velvet') => void;
}

export const GothicSoundFX: React.FC<GothicSoundFXProps> = ({
  bassBoost,
  setBassBoost,
  visualizerMode,
  setVisualizerMode,
}) => {
  const fxPresets = [
    { label: 'Cripta Profunda', bass: 9 },
    { label: 'Catedral Gótica', bass: 5 },
    { label: 'Voces Espectrales', bass: 0 },
    { label: 'Plano (Neutral)', bass: 0 },
  ];

  return (
    <div className="w-full flex flex-col gap-5 p-4 sm:p-5 rounded-2xl border border-rose-950/40 dark:border-rose-900/30 bg-stone-50 dark:bg-[#110c19] shadow-md transition-colors">
      <div className="flex items-center justify-between border-b border-rose-950/20 dark:border-rose-900/20 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-gothic text-sm font-semibold tracking-wider text-rose-800 dark:text-rose-200">
            EFECTOS GÓTICOS Y VISUALIZADOR
          </span>
        </div>
        <span className="text-[11px] text-stone-500 dark:text-rose-400/60 font-tabular">
          Procesador Acústico
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Visualizer Mode Selection */}
        <div className="flex flex-col gap-3 p-3.5 rounded-xl bg-white/70 dark:bg-rose-950/15 border border-rose-950/20 dark:border-rose-900/20">
          <div className="flex items-center gap-1.5 text-xs font-medium text-stone-700 dark:text-rose-200">
            <Activity className="w-3.5 h-3.5 text-rose-500" />
            <span>Estilo del Visualizador de Espectro</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setVisualizerMode('cathedral')}
              className={`p-2.5 rounded-lg border text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                visualizerMode === 'cathedral'
                  ? 'bg-rose-950/30 border-rose-500 text-rose-600 dark:text-rose-200 font-medium shadow-sm'
                  : 'bg-stone-100/60 dark:bg-stone-900/40 border-stone-200 dark:border-rose-950/30 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-rose-200'
              }`}
            >
              <span className="text-base">⛪</span>
              <span>Catedral</span>
            </button>

            <button
              onClick={() => setVisualizerMode('rune')}
              className={`p-2.5 rounded-lg border text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                visualizerMode === 'rune'
                  ? 'bg-rose-950/30 border-rose-500 text-rose-600 dark:text-rose-200 font-medium shadow-sm'
                  : 'bg-stone-100/60 dark:bg-stone-900/40 border-stone-200 dark:border-rose-950/30 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-rose-200'
              }`}
            >
              <span className="text-base">⛧</span>
              <span>Runa Arcana</span>
            </button>

            <button
              onClick={() => setVisualizerMode('velvet')}
              className={`p-2.5 rounded-lg border text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                visualizerMode === 'velvet'
                  ? 'bg-rose-950/30 border-rose-500 text-rose-600 dark:text-rose-200 font-medium shadow-sm'
                  : 'bg-stone-100/60 dark:bg-stone-900/40 border-stone-200 dark:border-rose-950/30 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-rose-200'
              }`}
            >
              <span className="text-base">〰</span>
              <span>Terciopelo</span>
            </button>
          </div>
        </div>

        {/* Bass Boost Equalizer */}
        <div className="flex flex-col gap-3 p-3.5 rounded-xl bg-white/70 dark:bg-rose-950/15 border border-rose-950/20 dark:border-rose-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-medium text-stone-700 dark:text-rose-200">
              <Sliders className="w-3.5 h-3.5 text-rose-500" />
              <span>Realce de Graves (Bass Boost)</span>
            </div>
            <span className="text-xs font-tabular font-semibold text-rose-700 dark:text-rose-300">
              +{bassBoost.toFixed(0)} dB
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={12}
            step={1}
            value={bassBoost}
            onChange={(e) => setBassBoost(Number(e.target.value))}
            className="w-full accent-rose-600 dark:accent-rose-500"
          />

          <div className="flex items-center justify-between gap-1 flex-wrap mt-1">
            {fxPresets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => setBassBoost(preset.bass)}
                className={`text-[10px] px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  bassBoost === preset.bass
                    ? 'bg-rose-600 text-white font-medium'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-rose-200 bg-stone-200/50 dark:bg-rose-950/30'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
