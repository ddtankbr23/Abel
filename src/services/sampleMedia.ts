/**
 * Procedural gothic media synthesizer for immediate offline testing
 * Synthesizes dark ambient gothic music and a sample gothic video loop.
 */

export interface MediaTrack {
  id: string;
  title: string;
  artist: string;
  type: 'audio' | 'video';
  format: string;
  url: string;
  duration: number; // in seconds
  fileSize?: string;
  coverImage?: string;
}

// Generate an audio blob using Web Audio API synthesis
async function synthesizeGothicTrack(
  type: 'requiem' | 'darkwave' | 'waltz',
  durationSeconds: number = 24
): Promise<Blob> {
  const sampleRate = 44100;
  const numSamples = sampleRate * durationSeconds;
  const offlineCtx = new OfflineAudioContext(2, numSamples, sampleRate);

  // Reverb simulation using convolver
  const convolver = offlineCtx.createConvolver();
  const impulseLen = sampleRate * 3.5;
  const impulseBuf = offlineCtx.createBuffer(2, impulseLen, sampleRate);
  for (let c = 0; c < 2; c++) {
    const channelData = impulseBuf.getChannelData(c);
    for (let i = 0; i < impulseLen; i++) {
      channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / impulseLen, 2.2);
    }
  }
  convolver.buffer = impulseBuf;
  convolver.connect(offlineCtx.destination);

  const dryGain = offlineCtx.createGain();
  dryGain.gain.value = 0.65;
  dryGain.connect(offlineCtx.destination);

  const wetGain = offlineCtx.createGain();
  wetGain.gain.value = 0.45;
  wetGain.connect(convolver);

  const masterBus = offlineCtx.createGain();
  masterBus.gain.value = 0.8;
  masterBus.connect(dryGain);
  masterBus.connect(wetGain);

  const bpm = type === 'darkwave' ? 120 : 64;
  const beatDuration = 60 / bpm;

  if (type === 'requiem') {
    // Gothic Organ & Ethereal Bells (D minor: D2, A2, D3, F3, A3, C4, D4)
    const chords = [
      [73.42, 110.0, 146.83, 174.61], // D min
      [65.41, 98.0, 130.81, 164.81],  // C maj
      [58.27, 87.31, 116.54, 146.83], // Bb maj
      [55.0, 82.41, 110.0, 164.81],   // A sus/maj
    ];

    chords.forEach((chord, chordIdx) => {
      const startTime = chordIdx * 6;
      chord.forEach((freq) => {
        // Dark pipe organ harmonic mix
        [1, 2, 3, 4].forEach((harmonic, hIdx) => {
          const osc = offlineCtx.createOscillator();
          const gain = offlineCtx.createGain();
          osc.type = hIdx % 2 === 0 ? 'sine' : 'sawtooth';
          osc.frequency.setValueAtTime(freq * harmonic, startTime);

          const vol = 0.12 / (hIdx + 1);
          gain.gain.setValueAtTime(0.001, startTime);
          gain.gain.linearRampToValueAtTime(vol, startTime + 1.2);
          gain.gain.setValueAtTime(vol, startTime + 5.0);
          gain.gain.linearRampToValueAtTime(0.001, startTime + 6.0);

          osc.connect(gain);
          gain.connect(masterBus);
          osc.start(startTime);
          osc.stop(startTime + 6.0);
        });
      });

      // Church Bell Chime
      const bellFreqs = [587.33, 880.0, 1174.66]; // D5, A5, D6
      const bellTime = startTime + 0.2;
      bellFreqs.forEach((bfreq, bIdx) => {
        const bell = offlineCtx.createOscillator();
        const bGain = offlineCtx.createGain();
        bell.type = 'sine';
        bell.frequency.setValueAtTime(bfreq * (1 + bIdx * 0.003), bellTime);

        bGain.gain.setValueAtTime(0.08 / (bIdx + 1), bellTime);
        bGain.gain.exponentialRampToValueAtTime(0.0001, bellTime + 4.5);

        bell.connect(bGain);
        bGain.connect(masterBus);
        bell.start(bellTime);
        bell.stop(bellTime + 4.5);
      });
    });
  } else if (type === 'darkwave') {
    // 80s Darkwave Synth Bass & Arpeggio in F# minor
    const bassNotes = [92.5, 92.5, 73.42, 82.41]; // F#2, F#2, D2, E2
    const totalBeats = Math.floor(durationSeconds / beatDuration);

    for (let beat = 0; beat < totalBeats; beat++) {
      const time = beat * beatDuration;
      const bar = Math.floor(beat / 4) % bassNotes.length;
      const baseFreq = bassNotes[bar];

      // Bass synth
      const bass = offlineCtx.createOscillator();
      const bFilter = offlineCtx.createBiquadFilter();
      const bGain = offlineCtx.createGain();

      bass.type = 'sawtooth';
      bass.frequency.setValueAtTime(baseFreq, time);

      bFilter.type = 'lowpass';
      bFilter.frequency.setValueAtTime(1200, time);
      bFilter.frequency.exponentialRampToValueAtTime(280, time + 0.35);

      bGain.gain.setValueAtTime(0.28, time);
      bGain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);

      bass.connect(bFilter);
      bFilter.connect(bGain);
      bGain.connect(masterBus);
      bass.start(time);
      bass.stop(time + 0.48);

      // Kick drum on 1 and 3
      if (beat % 2 === 0) {
        const kick = offlineCtx.createOscillator();
        const kGain = offlineCtx.createGain();
        kick.frequency.setValueAtTime(140, time);
        kick.frequency.exponentialRampToValueAtTime(38, time + 0.22);
        kGain.gain.setValueAtTime(0.5, time);
        kGain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
        kick.connect(kGain);
        kGain.connect(masterBus);
        kick.start(time);
        kick.stop(time + 0.26);
      }

      // Snare / Clack on 2 and 4
      if (beat % 2 === 1) {
        const noiseBuffer = offlineCtx.createBuffer(1, sampleRate * 0.15, sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseBuffer.length; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        const whiteNoise = offlineCtx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        const nFilter = offlineCtx.createBiquadFilter();
        nFilter.type = 'highpass';
        nFilter.frequency.setValueAtTime(1200, time);
        const sGain = offlineCtx.createGain();
        sGain.gain.setValueAtTime(0.18, time);
        sGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

        whiteNoise.connect(nFilter);
        nFilter.connect(sGain);
        sGain.connect(masterBus);
        whiteNoise.start(time);
      }

      // Dark arpeggio synth (16th notes)
      const arpFreqs = [baseFreq * 2, baseFreq * 2.4, baseFreq * 3, baseFreq * 3.6];
      for (let step = 0; step < 4; step++) {
        const subTime = time + step * (beatDuration / 4);
        const arp = offlineCtx.createOscillator();
        const aGain = offlineCtx.createGain();
        arp.type = 'triangle';
        arp.frequency.setValueAtTime(arpFreqs[(beat * 4 + step) % arpFreqs.length], subTime);
        aGain.gain.setValueAtTime(0.07, subTime);
        aGain.gain.exponentialRampToValueAtTime(0.001, subTime + 0.12);
        arp.connect(aGain);
        aGain.connect(masterBus);
        arp.start(subTime);
        arp.stop(subTime + 0.14);
      }
    }
  } else {
    // Vampiric Waltz in A minor (Piano & cello pads)
    const waltzChords = [
      [220.0, 261.63, 329.63], // Am
      [207.65, 246.94, 329.63], // E7
      [174.61, 220.0, 261.63],  // F
      [196.0, 246.94, 293.66],  // G
    ];

    const measureTime = beatDuration * 3;
    const measures = Math.floor(durationSeconds / measureTime);

    for (let m = 0; m < measures; m++) {
      const chord = waltzChords[m % waltzChords.length];
      const mStart = m * measureTime;

      // Bass note on 1
      const bass = offlineCtx.createOscillator();
      const bGain = offlineCtx.createGain();
      bass.type = 'sine';
      bass.frequency.setValueAtTime(chord[0] / 2, mStart);
      bGain.gain.setValueAtTime(0.3, mStart);
      bGain.gain.exponentialRampToValueAtTime(0.01, mStart + beatDuration * 1.5);
      bass.connect(bGain);
      bGain.connect(masterBus);
      bass.start(mStart);
      bass.stop(mStart + beatDuration * 1.8);

      // Chords on beats 2 and 3
      [1, 2].forEach((beatOffset) => {
        const cTime = mStart + beatOffset * beatDuration;
        chord.forEach((note) => {
          const osc = offlineCtx.createOscillator();
          const g = offlineCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(note, cTime);
          g.gain.setValueAtTime(0.08, cTime);
          g.gain.exponentialRampToValueAtTime(0.001, cTime + beatDuration * 0.9);
          osc.connect(g);
          g.connect(masterBus);
          osc.start(cTime);
          osc.stop(cTime + beatDuration * 0.95);
        });
      });
    }
  }

  const renderedBuffer = await offlineCtx.startRendering();
  return audioBufferToWavBlob(renderedBuffer);
}

// Convert AudioBuffer to WAV Blob
function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const numSamples = buffer.length;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  function writeString(offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Interleave channel samples
  let offset = 44;
  const channels = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(buffer.getChannelData(c));
  }

  for (let i = 0; i < numSamples; i++) {
    for (let c = 0; c < numChannels; c++) {
      let sample = channels[c][i];
      sample = Math.max(-1, Math.min(1, sample));
      const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, int16, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

// Generate an atmospheric dark gothic video using Canvas + MediaRecorder
async function generateGothicVideoBlob(): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No 2d context');

  // Rain particles
  const drops: { x: number; y: number; speed: number; len: number; opacity: number }[] = [];
  for (let i = 0; i < 90; i++) {
    drops.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: 12 + Math.random() * 10,
      len: 14 + Math.random() * 12,
      opacity: 0.2 + Math.random() * 0.4,
    });
  }

  // Draw gothic scene frame
  const drawFrame = (time: number) => {
    // Night sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, '#050208');
    sky.addColorStop(0.6, '#100718');
    sky.addColorStop(1, '#1b0a24');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Glowing Blood Moon / Silver Moon
    const moonX = canvas.width * 0.75;
    const moonY = 85;
    const moonGlow = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, 90);
    moonGlow.addColorStop(0, 'rgba(235, 75, 110, 0.9)');
    moonGlow.addColorStop(0.4, 'rgba(180, 30, 70, 0.4)');
    moonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 90, 0, Math.PI * 2);
    ctx.fill();

    // Moon body
    ctx.fillStyle = '#fce7f3';
    ctx.beginPath();
    ctx.arc(moonX, moonY, 32, 0, Math.PI * 2);
    ctx.fill();

    // Gothic Cathedral silhouette with spires and rose window
    ctx.fillStyle = '#09050e';
    ctx.beginPath();
    // Left spires
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(0, 240);
    ctx.lineTo(80, 200);
    ctx.lineTo(110, 110); // Spire 1
    ctx.lineTo(130, 200);
    // Center cathedral nave
    ctx.lineTo(240, 190);
    ctx.lineTo(320, 60); // High Gothic Spire
    ctx.lineTo(400, 190);
    // Right wing
    ctx.lineTo(510, 200);
    ctx.lineTo(540, 130); // Spire 2
    ctx.lineTo(570, 200);
    ctx.lineTo(canvas.width, 240);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fill();

    // Stained glass Rose Window glow (animated flicker)
    const flicker = 0.7 + Math.sin(time * 0.004) * 0.25;
    const roseGlow = ctx.createRadialGradient(320, 160, 5, 320, 160, 42);
    roseGlow.addColorStop(0, `rgba(225, 29, 72, ${flicker})`);
    roseGlow.addColorStop(0.6, `rgba(147, 51, 234, ${flicker * 0.6})`);
    roseGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = roseGlow;
    ctx.beginPath();
    ctx.arc(320, 160, 42, 0, Math.PI * 2);
    ctx.fill();

    // Rose window tracery
    ctx.strokeStyle = '#09050e';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(320, 160, 26, 0, Math.PI * 2);
    ctx.stroke();
    for (let a = 0; a < 8; a++) {
      const angle = (a * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(320, 160);
      ctx.lineTo(320 + Math.cos(angle) * 26, 160 + Math.sin(angle) * 26);
      ctx.stroke();
    }

    // Gothic cross on high spire
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(320, 45);
    ctx.lineTo(320, 62);
    ctx.moveTo(314, 52);
    ctx.lineTo(326, 52);
    ctx.stroke();

    // Falling rain animation
    ctx.strokeStyle = 'rgba(216, 180, 254, 0.35)';
    ctx.lineWidth = 1.2;
    drops.forEach((d) => {
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - 3, d.y + d.len);
      ctx.stroke();
      d.y += d.speed;
      d.x -= 1.5;
      if (d.y > canvas.height) {
        d.y = -20;
        d.x = Math.random() * (canvas.width + 100);
      }
    });

    // Flying bat silhouette
    const batProgress = (time * 0.001) % 6;
    const batX = (batProgress / 6) * (canvas.width + 100) - 50;
    const batY = 110 + Math.sin(time * 0.008) * 35;
    const wingFlap = Math.sin(time * 0.02) * 12;

    ctx.fillStyle = '#050208';
    ctx.beginPath();
    ctx.arc(batX, batY, 4, 0, Math.PI * 2);
    // Wings
    ctx.moveTo(batX, batY);
    ctx.quadraticCurveTo(batX - 12, batY - 14 + wingFlap, batX - 22, batY - 4);
    ctx.quadraticCurveTo(batX - 10, batY + 2, batX, batY);
    ctx.moveTo(batX, batY);
    ctx.quadraticCurveTo(batX + 12, batY - 14 + wingFlap, batX + 22, batY - 4);
    ctx.quadraticCurveTo(batX + 10, batY + 2, batX, batY);
    ctx.fill();

    // Overlay text watermark
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '12px "Cinzel", serif';
    ctx.fillText('NOCTURNA CINEMATIC · VIDEO DEMO', 20, 340);
  };

  // Record 5 seconds of 30fps canvas video to create an instant video loop
  const stream = canvas.captureStream(30);

  // Also synthesize an audio track for this video!
  const audioBlob = await synthesizeGothicTrack('waltz', 6);
  const audioCtx = new AudioContext();
  const audioBuffer = await audioCtx.decodeAudioData(await audioBlob.arrayBuffer());
  const audioSource = audioCtx.createBufferSource();
  audioSource.buffer = audioBuffer;
  const audioDest = audioCtx.createMediaStreamDestination();
  audioSource.connect(audioDest);
  audioSource.start(0);

  // Combine video and audio tracks
  audioDest.stream.getAudioTracks().forEach((track) => stream.addTrack(track));

  return new Promise<Blob>((resolve) => {
    let mimeType = 'video/webm;codecs=vp8,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4';
    }

    const recorder = new MediaRecorder(stream, { mimeType });
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      audioCtx.close();
      const finalBlob = new Blob(chunks, { type: mimeType });
      resolve(finalBlob);
    };

    recorder.start();

    const startTime = performance.now();
    const interval = setInterval(() => {
      const now = performance.now();
      drawFrame(now);
      if (now - startTime >= 5500) {
        clearInterval(interval);
        recorder.stop();
      }
    }, 1000 / 30);
  });
}

// Generate the initial library of sample media tracks
export async function getPreloadedGothicTracks(): Promise<MediaTrack[]> {
  try {
    const [requiemBlob, darkwaveBlob, waltzBlob, videoBlob] = await Promise.all([
      synthesizeGothicTrack('requiem', 24),
      synthesizeGothicTrack('darkwave', 28),
      synthesizeGothicTrack('waltz', 20),
      generateGothicVideoBlob().catch(() => null),
    ]);

    const tracks: MediaTrack[] = [
      {
        id: 'track-1-requiem',
        title: 'Nocturnal Requiem (Campanas & Órgano)',
        artist: 'Gothic Chamber Ensemble',
        type: 'audio',
        format: 'MP3 / Audio',
        url: URL.createObjectURL(requiemBlob),
        duration: 24,
        fileSize: '3.8 MB',
      },
      {
        id: 'track-2-darkwave',
        title: 'Crimson Eclipse (Darkwave Pulse)',
        artist: 'Velvet Synth Syndicate',
        type: 'audio',
        format: 'M4A / Audio',
        url: URL.createObjectURL(darkwaveBlob),
        duration: 28,
        fileSize: '4.2 MB',
      },
      {
        id: 'track-3-waltz',
        title: 'Vals de las Sombras en La Menor',
        artist: 'Cello & Melancolía',
        type: 'audio',
        format: 'FLAC / Audio',
        url: URL.createObjectURL(waltzBlob),
        duration: 20,
        fileSize: '3.1 MB',
      },
    ];

    if (videoBlob) {
      tracks.unshift({
        id: 'track-video-cathedral',
        title: 'Midnight Cathedral Rain (Video MP4)',
        artist: 'Nocturna Cinematic Visuals',
        type: 'video',
        format: 'MP4 / Video',
        url: URL.createObjectURL(videoBlob),
        duration: 5.5,
        fileSize: '2.4 MB',
      });
    }

    return tracks;
  } catch (err) {
    console.error('Error generating procedural sample media:', err);
    return [];
  }
}
