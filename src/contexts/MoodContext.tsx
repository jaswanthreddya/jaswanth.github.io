import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Mood, MOOD_CONFIGS, FaceDetectionState, GestureState } from '@/types/mood';

interface MoodContextType {
  // Mood state
  currentMood: Mood;
  setMood: (mood: Mood) => void;
  moodConfidence: number;
  setMoodConfidence: (confidence: number) => void;
  
  // AI Mode state
  isAIModeActive: boolean;
  toggleAIMode: () => void;
  
  // Face detection state
  faceDetection: FaceDetectionState;
  setFaceDetection: React.Dispatch<React.SetStateAction<FaceDetectionState>>;
  
  // Gesture state
  gestureState: GestureState;
  setGestureState: React.Dispatch<React.SetStateAction<GestureState>>;
  
  // Audio state
  isAudioPlaying: boolean;
  setIsAudioPlaying: (playing: boolean) => void;
  audioVolume: number;
  setAudioVolume: (volume: number) => void;
  
  // Helpers
  getMoodConfig: () => typeof MOOD_CONFIGS[Mood];
}

const MoodContext = createContext<MoodContextType | null>(null);

export function MoodProvider({ children }: { children: ReactNode }) {
  const [currentMood, setCurrentMood] = useState<Mood>('cool');
  const [moodConfidence, setMoodConfidence] = useState(0);
  const [isAIModeActive, setIsAIModeActive] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0.3);
  
  const [faceDetection, setFaceDetection] = useState<FaceDetectionState>({
    isDetecting: false,
    currentMood: 'cool',
    confidence: 0,
    lastMoodChange: Date.now(),
  });
  
  const [gestureState, setGestureState] = useState<GestureState>({
    isHandDetected: false,
    cursorPosition: { x: 0, y: 0 },
    smoothCursorPosition: { x: 0, y: 0 },
    isPinching: false,
    isRightClicking: false,
    gesture: null,
    fingersUp: 0,
    landmarks: null,
    hoveredElement: null,
  });

  const setMood = useCallback((mood: Mood) => {
    setCurrentMood(mood);
    setFaceDetection(prev => ({
      ...prev,
      currentMood: mood,
      lastMoodChange: Date.now(),
    }));
  }, []);

  const toggleAIMode = useCallback(() => {
    setIsAIModeActive(prev => !prev);
  }, []);

  const getMoodConfig = useCallback(() => {
    return MOOD_CONFIGS[currentMood];
  }, [currentMood]);

  // Apply mood class to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all mood classes
    Object.values(MOOD_CONFIGS).forEach(config => {
      if (config.className) {
        root.classList.remove(config.className);
      }
    });
    
    // Add current mood class
    const moodConfig = MOOD_CONFIGS[currentMood];
    if (moodConfig.className) {
      root.classList.add(moodConfig.className);
    }
  }, [currentMood]);

  return (
    <MoodContext.Provider
      value={{
        currentMood,
        setMood,
        moodConfidence,
        setMoodConfidence,
        isAIModeActive,
        toggleAIMode,
        faceDetection,
        setFaceDetection,
        gestureState,
        setGestureState,
        isAudioPlaying,
        setIsAudioPlaying,
        audioVolume,
        setAudioVolume,
        getMoodConfig,
      }}
    >
      {children}
    </MoodContext.Provider>
  );
}

export function useMood() {
  const context = useContext(MoodContext);
  if (!context) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
}
