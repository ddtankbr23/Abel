import { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { MediaTrack } from '../services/sampleMedia';

export interface PlayerState {
  currentTrack: MediaTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  // Controls
  pitch: number; // in semitones (-12 to +12)
  speed: number; // playback rate (0.25 to 2.5)
  volume: number; // independent volume gain (0 to 2.0 = 0% to 200%)
  isMuted: boolean;
  // Video Mode: by default false (audio only!)
  showVideo: boolean;
  isVideoTrack: boolean;
  // Equalizer / Gothic FX
  bassBoost: number; // in dB (0 to 12)
  gothicReverb: boolean;
  // Visualizer mode
  visualizerMode: 'cathedral' | 'rune' | 'velvet';
  // Loop & Shuffle
  isLooping: boolean;
  isShuffled: boolean;
}

export function useGothicMediaPlayer(initialTracks: MediaTrack[]) {
  const [playlist, setPlaylist] = useState<MediaTrack[]>(initialTracks);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Core Media Element (hidden or mounted for video)
  const mediaRef = useRef<HTMLVideoElement | null>(null);

  // Audio Context & Nodes refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const pitchShiftRef = useRef<Tone.PitchShift | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const bassFilterRef = useRef<BiquadFilterNode | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);

  // State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [pitch, setPitch] = useState<number>(0); // 0 semitones
  const [speed, setSpeed] = useState<number>(1.0); // 1.0x speed
  // Volume: base volume (0 to 1.0 = 0% to 100%) and optional super boost (>100%)
  const [baseVolume, setBaseVolume] = useState<number>(1.0);
  const [enableSuperBoost, setEnableSuperBoost] = useState<boolean>(false);
  const [boostVolume, setBoostVolume] = useState<number>(1.5); // 1.0 to 2.5 = 100% to 250%
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [previousBaseVolume, setPreviousBaseVolume] = useState<number>(1.0);
  // User Requirement: "por defecto siempre reproduce solo el audio si es un vídeo"
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const [bassBoost, setBassBoost] = useState<number>(0);
  const [gothicReverb, setGothicReverb] = useState<boolean>(false);
  const [visualizerMode, setVisualizerMode] = useState<'cathedral' | 'rune' | 'velvet'>('cathedral');
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [isShuffled, setIsShuffled] = useState<boolean>(false);

  const currentTrack = playlist[currentIndex] || null;
  const isVideoTrack = currentTrack?.type === 'video' ||
    Boolean(currentTrack?.format?.toLowerCase().includes('mp4') ||
            currentTrack?.format?.toLowerCase().includes('mkv') ||
            currentTrack?.format?.toLowerCase().includes('webm'));

  // Calculate effective gain:
  // If muted: 0
  // If enableSuperBoost is active: baseVolume * boostVolume (e.g. 1.0 * 1.5 = 150%)
  // Otherwise: strictly capped at baseVolume (0% to 100%)
  const effectiveGain = isMuted ? 0 : (enableSuperBoost ? baseVolume * boostVolume : baseVolume);

  // Initialize Web Audio Graph connected to the media element
  const initAudioGraph = useCallback(() => {
    if (audioCtxRef.current || !mediaRef.current) return;

    try {
      const rawContext = Tone.getContext().rawContext as AudioContext;
      audioCtxRef.current = rawContext;

      // 1. Create MediaElementSource
      const source = rawContext.createMediaElementSource(mediaRef.current);
      sourceNodeRef.current = source;

      // 2. Pitch Shifter via Tone.js
      const pitchNode = new Tone.PitchShift({
        pitch: pitch,
        windowSize: 0.08,
        delayTime: 0,
        feedback: 0,
      });
      pitchShiftRef.current = pitchNode;

      // 3. Bass Filter
      const bass = rawContext.createBiquadFilter();
      bass.type = 'lowshelf';
      bass.frequency.value = 180;
      bass.gain.value = bassBoost;
      bassFilterRef.current = bass;

      // 4. Independent Gain Node
      const gain = rawContext.createGain();
      gain.gain.value = effectiveGain;
      gainNodeRef.current = gain;

      // 5. Analyser Node for Visualizer
      const analyser = rawContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserNodeRef.current = analyser;

      // Connect: source -> pitchNode -> bass -> gain -> analyser -> destination
      Tone.connect(source, pitchNode);
      Tone.connect(pitchNode, bass);
      bass.connect(gain);
      gain.connect(analyser);
      analyser.connect(rawContext.destination);
    } catch (err) {
      console.warn('AudioContext initialization note:', err);
    }
  }, [pitch, bassBoost, effectiveGain]);

  // Sync volume with GainNode whenever baseVolume, enableSuperBoost, boostVolume, or isMuted changes
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(effectiveGain, audioCtxRef.current.currentTime, 0.02);
    }
  }, [effectiveGain]);

  // Sync pitch with Tone.PitchShift
  useEffect(() => {
    if (pitchShiftRef.current) {
      pitchShiftRef.current.pitch = pitch;
    }
  }, [pitch]);

  // Sync speed with mediaElement
  useEffect(() => {
    if (mediaRef.current) {
      mediaRef.current.playbackRate = speed;
    }
  }, [speed]);

  // Sync bass boost
  useEffect(() => {
    if (bassFilterRef.current && audioCtxRef.current) {
      bassFilterRef.current.gain.setTargetAtTime(bassBoost, audioCtxRef.current.currentTime, 0.05);
    }
  }, [bassBoost]);

  // When track changes, update element source and reset showVideo to FALSE by default!
  useEffect(() => {
    if (!currentTrack || !mediaRef.current) return;

    // By requirement: Always default to audio only for videos!
    setShowVideo(false);

    mediaRef.current.src = currentTrack.url;
    mediaRef.current.load();
    setCurrentTime(0);

    if (isPlaying) {
      const playPromise = mediaRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Autoplay prevented:', err);
          setIsPlaying(false);
        });
      }
    }
  }, [currentIndex, playlist]);

  // Media element event handlers
  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      setCurrentTime(mediaRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (mediaRef.current) {
      setDuration(mediaRef.current.duration || currentTrack?.duration || 0);
      mediaRef.current.playbackRate = speed;
    }
  };

  const handleEnded = () => {
    if (isLooping) {
      if (mediaRef.current) {
        mediaRef.current.currentTime = 0;
        mediaRef.current.play();
      }
    } else {
      handleNext();
    }
  };

  const togglePlay = async () => {
    if (!mediaRef.current) return;

    // Ensure Tone & AudioContext is started on user gesture
    if (!audioCtxRef.current) {
      initAudioGraph();
    }
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
    }

    if (isPlaying) {
      mediaRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await mediaRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.error('Play error:', err);
      }
    }
  };

  const handleSeek = (newTime: number) => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSkip = (deltaSeconds: number) => {
    if (mediaRef.current) {
      const newTime = Math.max(0, Math.min(mediaRef.current.currentTime + deltaSeconds, duration));
      mediaRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleNext = () => {
    if (playlist.length === 0) return;
    if (isShuffled) {
      const nextIdx = Math.floor(Math.random() * playlist.length);
      setCurrentIndex(nextIdx);
    } else {
      setCurrentIndex((prev) => (prev + 1) % playlist.length);
    }
  };

  const handlePrev = () => {
    if (playlist.length === 0) return;
    if (currentTime > 3 && mediaRef.current) {
      mediaRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      setBaseVolume(previousBaseVolume > 0 ? previousBaseVolume : 1.0);
    } else {
      setPreviousBaseVolume(baseVolume);
      setIsMuted(true);
    }
  };

  // Add custom files (MP3, M4A, MP4, MKV, WebM, etc.)
  const addFilesToPlaylist = (files: FileList | File[]) => {
    const newTracks: MediaTrack[] = Array.from(files).map((file) => {
      const isVideo = file.type.startsWith('video/') ||
        /\.(mp4|mkv|webm|mov|avi|flv)$/i.test(file.name);
      const ext = file.name.split('.').pop()?.toUpperCase() || (isVideo ? 'VIDEO' : 'AUDIO');
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

      return {
        id: 'file-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Archivo Local',
        type: isVideo ? 'video' : 'audio',
        format: `${ext} / ${isVideo ? 'Video' : 'Audio'}`,
        url: URL.createObjectURL(file),
        duration: 0,
        fileSize: sizeMB,
      };
    });

    setPlaylist((prev) => [...prev, ...newTracks]);
  };

  const removeTrack = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlaylist((prev) => {
      const filtered = prev.filter((t) => t.id !== id);
      if (filtered.length === 0) {
        setIsPlaying(false);
      }
      return filtered;
    });
  };

  const playTrackById = (id: string) => {
    const idx = playlist.findIndex((t) => t.id === id);
    if (idx !== -1) {
      setCurrentIndex(idx);
      setIsPlaying(true);
    }
  };

  return {
    playlist,
    currentTrack,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    pitch,
    setPitch,
    speed,
    setSpeed,
    // Independent Volume: 0-100% and Super Boost (>100%)
    baseVolume,
    setBaseVolume,
    enableSuperBoost,
    setEnableSuperBoost,
    boostVolume,
    setBoostVolume,
    effectiveGain,
    isMuted,
    toggleMute,
    showVideo,
    setShowVideo,
    isVideoTrack,
    bassBoost,
    setBassBoost,
    gothicReverb,
    setGothicReverb,
    visualizerMode,
    setVisualizerMode,
    isLooping,
    setIsLooping,
    isShuffled,
    setIsShuffled,
    mediaRef,
    analyserNode: analyserNodeRef.current,
    togglePlay,
    handleSeek,
    handleSkip,
    handleNext,
    handlePrev,
    addFilesToPlaylist,
    removeTrack,
    playTrackById,
    handleTimeUpdate,
    handleLoadedMetadata,
    handleEnded,
    setPlaylist,
  };
}
