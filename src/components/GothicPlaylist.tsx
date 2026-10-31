import React, { useRef } from 'react';
import { Upload, Music, Video, Trash2, Play, Sparkles } from 'lucide-react';
import { MediaTrack } from '../services/sampleMedia';

interface GothicPlaylistProps {
  playlist: MediaTrack[];
  currentTrackId: string | undefined;
  isPlaying: boolean;
  onSelectTrack: (id: string) => void;
  onRemoveTrack: (id: string, e: React.MouseEvent) => void;
  onAddFiles: (files: FileList | File[]) => void;
  onResetSamples: () => void;
}

export const GothicPlaylist: React.FC<GothicPlaylistProps> = ({
  playlist,
  currentTrackId,
  isPlaying,
  onSelectTrack,
  onRemoveTrack,
  onAddFiles,
  onResetSamples,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onAddFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="w-full flex flex-col gap-4 p-4 sm:p-5 rounded-2xl border border-rose-950/40 dark:border-rose-900/30 bg-stone-50 dark:bg-[#110c19] shadow-md transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-rose-950/20 dark:border-rose-900/20 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-gothic text-sm font-semibold tracking-wider text-rose-800 dark:text-rose-200">
            BIBLIOTECA Y COLA DE REPRODUCCIÓN
          </span>
          <span className="text-xs text-stone-500 dark:text-stone-400 font-tabular">
            ({playlist.length} {playlist.length === 1 ? 'pista' : 'pistas'})
          </span>
        </div>

        <button
          onClick={onResetSamples}
          className="flex items-center gap-1.5 text-xs text-rose-700 dark:text-rose-400 hover:underline cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Restaurar Demos Góticos</span>
        </button>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        className="w-full p-4 border-2 border-dashed border-rose-900/30 dark:border-rose-900/40 hover:border-rose-500/60 rounded-xl bg-white/50 dark:bg-rose-950/10 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-all duration-200 hover:bg-rose-950/15 group"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="audio/*,video/*,.mp3,.m4a,.wav,.flac,.ogg,.mp4,.mkv,.webm"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              onAddFiles(e.target.files);
            }
          }}
        />
        <div className="w-10 h-10 rounded-full bg-rose-950/20 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
          <Upload className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs sm:text-sm font-medium text-stone-800 dark:text-rose-100">
            Haz clic o arrastra tus archivos aquí
          </p>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
            Formatos soportados: MP3, M4A, WAV, FLAC, OGG, MP4, MKV, WebM
          </p>
        </div>
      </div>

      {/* Tracks List */}
      <div className="flex flex-col gap-1.5 max-h-[340px] overflow-y-auto pr-1">
        {playlist.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-500 dark:text-stone-400">
            No hay pistas en la lista. Carga tus archivos arriba o restaura las demos góticas.
          </div>
        ) : (
          playlist.map((track, idx) => {
            const isCurrent = track.id === currentTrackId;
            const isVideo = track.type === 'video';

            return (
              <div
                key={track.id}
                onClick={() => onSelectTrack(track.id)}
                className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-rose-950/20 dark:bg-rose-950/40 border-rose-600/50 dark:border-rose-500/40 shadow-sm'
                    : 'bg-white/40 dark:bg-stone-900/30 border-rose-950/10 dark:border-rose-900/15 hover:bg-stone-100/70 dark:hover:bg-rose-950/20'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Play state indicator */}
                  <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-rose-950/20 text-rose-600 dark:text-rose-400">
                    {isCurrent && isPlaying ? (
                      <span className="flex items-end gap-0.5 h-3">
                        <span className="w-0.5 h-3 bg-rose-500 animate-pulse" />
                        <span className="w-0.5 h-2 bg-rose-500 animate-pulse delay-75" />
                        <span className="w-0.5 h-3.5 bg-rose-500 animate-pulse delay-150" />
                      </span>
                    ) : (
                      <span className="text-[11px] font-tabular font-medium">
                        {idx + 1}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-medium text-stone-900 dark:text-rose-100 truncate">
                        {track.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400 font-tabular mt-0.5">
                      <span>{track.artist}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        {isVideo ? (
                          <Video className="w-3 h-3 text-rose-500" />
                        ) : (
                          <Music className="w-3 h-3 text-rose-500" />
                        )}
                        <span>{track.format}</span>
                      </span>
                      {isVideo && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-rose-600 dark:text-rose-400">Audio Defecto</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {isCurrent && (
                    <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium px-1.5 py-0.5 rounded bg-rose-950/20">
                      Actual
                    </span>
                  )}
                  <button
                    onClick={(e) => onRemoveTrack(track.id, e)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                    title="Eliminar de la lista"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
