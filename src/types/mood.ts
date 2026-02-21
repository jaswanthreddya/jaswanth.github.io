export type Mood = 'happy' | 'sad' | 'stressed' | 'angry' | 'cool';

export interface MoodConfig {
  name: string;
  emoji: string;
  description: string;
  className: string;
  audioFrequency: number; // Base frequency for procedural audio
  audioTempo: number; // BPM-like value
}

export const MOOD_CONFIGS: Record<Mood, MoodConfig> = {
  happy: {
    name: 'Happy',
    emoji: '😄',
    description: 'Warm, energetic, and playful',
    className: 'mood-happy',
    audioFrequency: 440, // A4 - bright and cheerful
    audioTempo: 120,
  },
  sad: {
    name: 'Sad',
    emoji: '💙',
    description: 'Soft, muted, and gentle',
    className: 'mood-sad',
    audioFrequency: 220, // A3 - lower, melancholic
    audioTempo: 60,
  },
  stressed: {
    name: 'Stressed',
    emoji: '🌿',
    description: 'Calming, minimal, and clean',
    className: 'mood-stressed',
    audioFrequency: 396, // G4 - healing frequency
    audioTempo: 70,
  },
  angry: {
    name: 'Angry',
    emoji: '💪',
    description: 'Bold, intense, and structured',
    className: 'mood-angry',
    audioFrequency: 329.63, // E4 - powerful
    audioTempo: 140,
  },
  cool: {
    name: 'Cool',
    emoji: '✨',
    description: 'Modern, balanced, and professional',
    className: '',
    audioFrequency: 369.99, // F#4 - sophisticated
    audioTempo: 90,
  },
};

export interface GestureState {
  isHandDetected: boolean;
  cursorPosition: { x: number; y: number };
  smoothCursorPosition: { x: number; y: number };
  isPinching: boolean; // Left click
  isRightClicking: boolean; // Right click (fist gesture)
  gesture: string | null;
  fingersUp: number;
  landmarks: Array<{ x: number; y: number; z: number }> | null;
  hoveredElement: HTMLElement | null;
}

export interface FaceDetectionState {
  isDetecting: boolean;
  currentMood: Mood;
  confidence: number;
  lastMoodChange: number;
}
