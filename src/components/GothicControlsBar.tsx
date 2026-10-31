import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Gauge,
  Music,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Zap,
  SlidersHorizontal,
} from 'lucide-react';

interface GothicControlsBarProps {
  pitch: number;
  setPitch: (pitch: number) => void;
  speed: number;
  setSpeed: (speed: number) => void;
  baseVolume: number;
  setBaseVolume: (vol: number) => void;
  enableSuperBoost: boolean;
  setEnableSuperBoost: (enabled: boolean) => void;
  boostVolume: number;
  setBoostVolume: (vol: number) => void;
  effectiveGain: number;
  isMuted: boolean;
  toggleMute: () => void;
}

export const GothicControlsBar: React.FC<GothicControlsBarProps> = ({
  pitch,
  setPitch,
  speed,
  setSpeed,
  baseVolume,
  setBaseVolume,
  enableSuperBoost,
  setEnableSuperBoost,
  boostVolume,
  setBoostVolume,
  effectiveGain,
  isMuted,
  toggleMute,
}) => {
  // Dropdown menu state
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const pitchPresets = [
    { label: 'Vampírico (-5)', value: -5 },
    { label: 'Grave (-2)', value: -2 },
    { label: 'Normal (0)', value: 0 },
    { label: 'Espectral (+4)', value: 4 },
    { label: 'Nightcore (+7)', value: 7 },
  ];

  const speedPresets = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  const basePercent = Math.round(baseVolume * 100);
  const boostPercent = Math.round(boostVolume * 100);
  const totalPercent = Math.round(effectiveGain * 100);

  return (
    <div className="w-full rounded-2xl border border-rose-950/40 dark:border-rose-900/30 bg-stone-50 dark:bg-[#110c19] shadow-md transition-all duration-300 overflow-hidden">
      {/* Collapsible Dropdown Header */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full p-4 sm:px-5 flex items-center justify-between hover:bg-stone-100/70 dark:hover:bg-rose-950/20 transition-colors cursor-pointer text-left select-none"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-rose-950/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-gothic text-sm font-semibold tracking-wider text-rose-800 dark:text-rose-200">
                PANEL DE TONO, VELOCIDAD Y VOLUMEN
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-900/20 text-rose-600 dark:text-rose-400 font-medium">
                {isOpen ? 'Menú Desplegado' : 'Desplegable'}
              </span>
            </div>
            {/* Quick status summary when collapsed */}
            <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 font-tabular mt-0.5">
              <span>Tono: {pitch > 0 ? `+${pitch}` : pitch} st</span>
              <span aria-hidden="true">·</span>
              <span>Vel: {speed.toFixed(2)}x</span>
              <span aria-hidden="true">·</span>
              <span className={enableSuperBoost ? 'text-rose-600 dark:text-rose-400 font-semibold' : ''}>
                Vol: {isMuted ? 'Mudo' : `${totalPercent}%`}
                {enableSuperBoost && ' (Super Boost)'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
          <span className="text-xs font-medium hidden sm:inline">
            {isOpen ? 'Plegar controles' : 'Desplegar controles'}
          </span>
          <div className="p-1.5 rounded-full bg-rose-950/20 dark:bg-rose-950/40">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* Dropdown Body Content */}
      {isOpen && (
        <div className="p-4 sm:p-5 pt-1 border-t border-rose-950/20 dark:border-rose-900/20 flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. CONTROL DE TONO (PITCH SHIFT) */}
            <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-white/70 dark:bg-rose-950/15 border border-rose-950/20 dark:border-rose-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-medium text-stone-700 dark:text-rose-200">
                  <Music className="w-3.5 h-3.5 text-rose-500" />
                  <span>Control de Tono (Pitch)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-tabular font-semibold text-rose-700 dark:text-rose-300">
                    {pitch > 0 ? `+${pitch}` : pitch} semitonos
                  </span>
                  {pitch !== 0 && (
                    <button
                      onClick={() => setPitch(0)}
                      className="p-1 text-stone-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Restablecer tono a 0"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Pitch Slider */}
              <input
                type="range"
                min={-12}
                max={12}
                step={1}
                value={pitch}
                onChange={(e) => setPitch(Number(e.target.value))}
                className="w-full accent-rose-600 dark:accent-rose-500"
              />

              {/* Quick Pitch Presets */}
              <div className="flex items-center justify-between gap-1 mt-1 flex-wrap">
                {pitchPresets.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setPitch(preset.value)}
                    className={`text-[10px] px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                      pitch === preset.value
                        ? 'bg-rose-600 text-white font-medium'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-rose-200 bg-stone-200/50 dark:bg-rose-950/30'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. CONTROL DE VELOCIDAD (PLAYBACK RATE) */}
            <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-white/70 dark:bg-rose-950/15 border border-rose-950/20 dark:border-rose-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-medium text-stone-700 dark:text-rose-200">
                  <Gauge className="w-3.5 h-3.5 text-rose-500" />
                  <span>Control de Velocidad</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-tabular font-semibold text-rose-700 dark:text-rose-300">
                    {speed.toFixed(2)}x
                  </span>
                  {speed !== 1.0 && (
                    <button
                      onClick={() => setSpeed(1.0)}
                      className="p-1 text-stone-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Restablecer velocidad a 1.0x"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Speed Slider */}
              <input
                type="range"
                min={0.25}
                max={2.5}
                step={0.05}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full accent-rose-600 dark:accent-rose-500"
              />

              {/* Quick Speed Presets */}
              <div className="flex items-center justify-between gap-1 mt-1">
                {speedPresets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setSpeed(preset)}
                    className={`text-[10px] px-1.5 py-0.5 rounded font-tabular transition-colors cursor-pointer ${
                      Math.abs(speed - preset) < 0.02
                        ? 'bg-rose-600 text-white font-medium'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-rose-200 bg-stone-200/50 dark:bg-rose-950/30'
                    }`}
                  >
                    {preset}x
                  </button>
                ))}
              </div>
            </div>

            {/* 3. VOLUMEN INDEPENDIENTE: 0-100% Y SEGUNDA BARRA DE VOLUMEN SUPERIOR AL 100% */}
            <div className="flex flex-col gap-2.5 p-3.5 rounded-xl bg-white/70 dark:bg-rose-950/15 border border-rose-950/20 dark:border-rose-900/20">
              {/* Header with Mute & Total status */}
              <div className="flex items-center justify-between">
                <button
                  onClick={toggleMute}
                  className="flex items-center gap-1.5 text-xs font-medium text-stone-700 dark:text-rose-200 hover:text-rose-600 transition-colors cursor-pointer"
                  title={isMuted ? 'Activar sonido' : 'Silenciar'}
                >
                  {isMuted || baseVolume === 0 ? (
                    <VolumeX className="w-3.5 h-3.5 text-stone-400" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-rose-500" />
                  )}
                  <span>Volumen Independiente</span>
                </button>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-xs font-tabular font-semibold ${
                      enableSuperBoost && totalPercent > 100
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-stone-700 dark:text-rose-300'
                    }`}
                  >
                    {isMuted ? 'Mudo' : `${totalPercent}%`}
                  </span>
                  {(baseVolume !== 1.0 || enableSuperBoost) && (
                    <button
                      onClick={() => {
                        setBaseVolume(1.0);
                        setEnableSuperBoost(false);
                      }}
                      className="p-1 text-stone-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Restablecer volumen a 100% estándar"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Barra 1: Deslizante estándar del 0 al 100% */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[11px] text-stone-600 dark:text-stone-400">
                  <span>Nivel Base (0 - 100%)</span>
                  <span className="font-tabular font-medium">{isMuted ? 0 : basePercent}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1.0}
                  step={0.01}
                  value={isMuted ? 0 : baseVolume}
                  onChange={(e) => {
                    if (isMuted) toggleMute();
                    setBaseVolume(Number(e.target.value));
                  }}
                  className="w-full accent-rose-600 dark:accent-rose-500"
                />
              </div>

              {/* Opción extra: Activar / Desactivar volumen superior al 100% */}
              <div className="pt-2 border-t border-rose-950/15 dark:border-rose-900/15 flex flex-col gap-2">
                <label className="flex items-center justify-between cursor-pointer select-none">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-stone-800 dark:text-rose-200">
                    <Zap className={`w-3.5 h-3.5 ${enableSuperBoost ? 'text-rose-500 animate-pulse' : 'text-stone-400'}`} />
                    <span>Activar volumen superior al 100%</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableSuperBoost}
                    onChange={(e) => setEnableSuperBoost(e.target.checked)}
                    className="w-4 h-4 rounded border-rose-900/40 text-rose-600 focus:ring-rose-500 cursor-pointer accent-rose-600"
                  />
                </label>

                {/* Barra 2: Segunda barra deslizante (solo activa si la opción está encendida) */}
                {enableSuperBoost ? (
                  <div className="p-2 rounded-lg bg-rose-950/25 border border-rose-600/30 flex flex-col gap-1.5 transition-all">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-rose-700 dark:text-rose-300 font-medium flex items-center gap-1">
                        <span>Super Boost Extra (&gt;100%):</span>
                      </span>
                      <span className="text-rose-600 dark:text-rose-400 font-tabular font-bold">
                        {boostPercent}%
                      </span>
                    </div>

                    <input
                      type="range"
                      min={1.0}
                      max={2.5}
                      step={0.05}
                      value={boostVolume}
                      onChange={(e) => setBoostVolume(Number(e.target.value))}
                      className="w-full accent-rose-500"
                    />

                    <div className="flex justify-between items-center text-[10px] text-stone-500 dark:text-stone-400 font-tabular">
                      <span>100% (x1)</span>
                      <span>175% (+5dB)</span>
                      <span className="text-rose-600 dark:text-rose-400 font-bold">250% (+8dB)</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 italic">
                    Marca la casilla para desbloquear amplificación digital hasta el 250%.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
