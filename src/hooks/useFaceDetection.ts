import { useEffect, useRef, useCallback, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Mood } from '@/types/mood';
import { useMood } from '@/contexts/MoodContext';

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';

// Minimum confidence threshold for mood detection
const CONFIDENCE_THRESHOLD = 0.5;
// Minimum time between mood changes (ms)
const MOOD_CHANGE_COOLDOWN = 5000;

export function useFaceDetection(videoRef: React.RefObject<HTMLVideoElement>) {
  const { setMood, setMoodConfidence, setFaceDetection, isAIModeActive, faceDetection } = useMood();
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isInitialScanComplete, setIsInitialScanComplete] = useState(false);
  const detectionIntervalRef = useRef<number | null>(null);
  const lastMoodRef = useRef<Mood>('cool');

  // Load face-api models
  const loadModels = useCallback(async () => {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]);
      setIsModelLoaded(true);
      console.log('Face detection models loaded');
    } catch (error) {
      console.error('Error loading face detection models:', error);
    }
  }, []);

  // Map face expressions to moods
  const expressionToMood = useCallback((expressions: faceapi.FaceExpressions): { mood: Mood; confidence: number } => {
    const { happy, sad, angry, fearful, surprised, neutral } = expressions;

    // Determine primary mood based on expression strengths
    if (happy > CONFIDENCE_THRESHOLD && happy > sad && happy > angry) {
      return { mood: 'happy', confidence: happy };
    }
    if (sad > CONFIDENCE_THRESHOLD && sad > happy && sad > angry) {
      return { mood: 'sad', confidence: sad };
    }
    if (angry > CONFIDENCE_THRESHOLD && angry > happy && angry > sad) {
      return { mood: 'angry', confidence: angry };
    }
    if (fearful > CONFIDENCE_THRESHOLD || (surprised > CONFIDENCE_THRESHOLD && surprised > happy)) {
      return { mood: 'stressed', confidence: Math.max(fearful, surprised) };
    }
    if (neutral > CONFIDENCE_THRESHOLD) {
      return { mood: 'cool', confidence: neutral };
    }

    // Default to cool if no strong expression
    return { mood: 'cool', confidence: neutral || 0.5 };
  }, []);

  // Detect mood from video
  const detectMood = useCallback(async () => {
    if (!videoRef.current || !isModelLoaded) return;

    const video = videoRef.current;
    if (video.readyState !== 4) return;

    try {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detection) {
        const { mood, confidence } = expressionToMood(detection.expressions);
        const now = Date.now();
        const timeSinceLastChange = now - faceDetection.lastMoodChange;

        setFaceDetection(prev => ({
          ...prev,
          isDetecting: true,
          confidence,
        }));

        setMoodConfidence(confidence);

        // Initial scan - set mood immediately
        if (!isInitialScanComplete) {
          setMood(mood);
          lastMoodRef.current = mood;
          setIsInitialScanComplete(true);
          console.log(`Initial mood detected: ${mood} (${(confidence * 100).toFixed(1)}%)`);
          return;
        }

        // Only change mood if it's significantly different and cooldown has passed
        if (mood !== lastMoodRef.current && 
            confidence > CONFIDENCE_THRESHOLD + 0.1 && 
            timeSinceLastChange > MOOD_CHANGE_COOLDOWN) {
          setMood(mood);
          lastMoodRef.current = mood;
          console.log(`Mood changed to: ${mood} (${(confidence * 100).toFixed(1)}%)`);
        }
      } else {
        setFaceDetection(prev => ({
          ...prev,
          isDetecting: false,
        }));
      }
    } catch (error) {
      console.error('Face detection error:', error);
    }
  }, [videoRef, isModelLoaded, expressionToMood, setMood, setMoodConfidence, setFaceDetection, faceDetection.lastMoodChange, isInitialScanComplete]);

  // Start/stop detection based on AI mode
  useEffect(() => {
    if (isAIModeActive && isModelLoaded) {
      // Run detection every 500ms
      detectionIntervalRef.current = window.setInterval(detectMood, 500);
    } else {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
      setIsInitialScanComplete(false);
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [isAIModeActive, isModelLoaded, detectMood]);

  // Load models on mount
  useEffect(() => {
    loadModels();
  }, [loadModels]);

  return {
    isModelLoaded,
    isInitialScanComplete,
  };
}
