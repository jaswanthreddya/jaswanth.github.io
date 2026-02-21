import { useEffect, useRef, useCallback } from 'react';
import { Mood, MOOD_CONFIGS } from '@/types/mood';
import { useMood } from '@/contexts/MoodContext';

/**
 * Procedural audio generator for mood-based ambient sounds
 * Uses Web Audio API to create unique soundscapes for each mood
 */
export function useMoodAudio() {
  const { currentMood, isAudioPlaying, audioVolume, isAIModeActive } = useMood();
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);

  const stopAudio = useCallback(() => {
    oscillatorsRef.current.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // Already stopped
      }
    });
    oscillatorsRef.current = [];

    if (lfoRef.current) {
      try {
        lfoRef.current.stop();
        lfoRef.current.disconnect();
      } catch (e) {
        // Already stopped
      }
      lfoRef.current = null;
    }
  }, []);

  const createMoodAudio = useCallback((mood: Mood) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const ctx = audioContextRef.current;
    const config = MOOD_CONFIGS[mood];

    // Stop any existing audio
    stopAudio();

    // Create main gain node
    if (!gainNodeRef.current) {
      gainNodeRef.current = ctx.createGain();
      gainNodeRef.current.connect(ctx.destination);
    }
    gainNodeRef.current.gain.setValueAtTime(audioVolume * 0.15, ctx.currentTime);

    // Create mood-specific soundscape
    const oscillators: OscillatorNode[] = [];

    switch (mood) {
      case 'happy': {
        // Bright, cheerful major chord arpeggios
        const frequencies = [config.audioFrequency, config.audioFrequency * 1.25, config.audioFrequency * 1.5];
        frequencies.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          oscGain.gain.setValueAtTime(0.3 / (i + 1), ctx.currentTime);
          osc.connect(oscGain);
          oscGain.connect(gainNodeRef.current!);
          osc.start();
          oscillators.push(osc);
        });
        break;
      }

      case 'sad': {
        // Minor key, slow pad
        const frequencies = [config.audioFrequency, config.audioFrequency * 1.2, config.audioFrequency * 1.5];
        frequencies.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          const filter = ctx.createBiquadFilter();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(400, ctx.currentTime);
          oscGain.gain.setValueAtTime(0.25 / (i + 1), ctx.currentTime);
          osc.connect(filter);
          filter.connect(oscGain);
          oscGain.connect(gainNodeRef.current!);
          osc.start();
          oscillators.push(osc);
        });
        break;
      }

      case 'stressed': {
        // Calming nature-like sounds, healing frequencies
        const frequencies = [config.audioFrequency, 528, 639]; // Healing frequencies
        frequencies.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          oscGain.gain.setValueAtTime(0.2 / (i + 1), ctx.currentTime);
          
          // Add subtle vibrato
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          lfo.frequency.setValueAtTime(0.5, ctx.currentTime);
          lfoGain.gain.setValueAtTime(2, ctx.currentTime);
          lfo.connect(lfoGain);
          lfoGain.connect(osc.frequency);
          lfo.start();
          
          osc.connect(oscGain);
          oscGain.connect(gainNodeRef.current!);
          osc.start();
          oscillators.push(osc);
        });
        break;
      }

      case 'angry': {
        // Powerful, driving bass
        const frequencies = [config.audioFrequency / 2, config.audioFrequency, config.audioFrequency * 1.33];
        frequencies.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = i === 0 ? 'sawtooth' : 'square';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          oscGain.gain.setValueAtTime(0.15 / (i + 1), ctx.currentTime);
          osc.connect(oscGain);
          oscGain.connect(gainNodeRef.current!);
          osc.start();
          oscillators.push(osc);
        });
        break;
      }

      case 'cool':
      default: {
        // Sophisticated, ambient pad
        const frequencies = [config.audioFrequency, config.audioFrequency * 1.33, config.audioFrequency * 2];
        frequencies.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          const filter = ctx.createBiquadFilter();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(800, ctx.currentTime);
          oscGain.gain.setValueAtTime(0.2 / (i + 1), ctx.currentTime);
          osc.connect(filter);
          filter.connect(oscGain);
          oscGain.connect(gainNodeRef.current!);
          osc.start();
          oscillators.push(osc);
        });
        break;
      }
    }

    oscillatorsRef.current = oscillators;
  }, [audioVolume, stopAudio]);

  // Handle mood changes
  useEffect(() => {
    if (isAudioPlaying && isAIModeActive) {
      createMoodAudio(currentMood);
    } else {
      stopAudio();
    }

    return () => {
      stopAudio();
    };
  }, [currentMood, isAudioPlaying, isAIModeActive, createMoodAudio, stopAudio]);

  // Update volume
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(audioVolume * 0.15, audioContextRef.current?.currentTime || 0);
    }
  }, [audioVolume]);

  return {
    createMoodAudio,
    stopAudio,
  };
}
