import { useEffect, useRef, useCallback, useState } from 'react';
import { useMood } from '@/contexts/MoodContext';

export type HandGestureLoadingState = 'idle' | 'loading_model' | 'initializing' | 'ready' | 'error';

// Access MediaPipe from global window (loaded via CDN)
declare global {
  interface Window {
    Hands: any;
    Camera: any;
  }
}

interface HandResults {
  multiHandLandmarks?: Array<Array<{ x: number; y: number; z: number }>>;
}

// Landmark indices
const WRIST = 0;
const THUMB_TIP = 4;
const THUMB_IP = 3;
const THUMB_MCP = 2;
const INDEX_TIP = 8;
const INDEX_PIP = 6;
const MIDDLE_TIP = 12;
const MIDDLE_PIP = 10;
const RING_TIP = 16;
const RING_PIP = 14;
const PINKY_TIP = 20;
const PINKY_PIP = 18;
const INDEX_MCP = 5;
const MIDDLE_MCP = 9;
const RING_MCP = 13;
const PINKY_MCP = 17;

// Thresholds
const MIN_PINCH_THRESHOLD = 0.04;
const MAX_PINCH_THRESHOLD = 0.11;
// Higher smoothing = smoother but slightly laggier cursor (0.1 = very smooth, 0.5 = responsive)
const CURSOR_SMOOTHING = 0.15;
const CLICK_DEBOUNCE = 350;
const SCROLL_DEBOUNCE = 30;

export function useHandGestures(videoRef: React.RefObject<HTMLVideoElement>) {
  const { setGestureState, isAIModeActive, gestureState } = useMood();
  const handsRef = useRef<any>(null);
  // NOTE: We intentionally do NOT use MediaPipe's Camera helper because AIControlPanel
  // already owns the getUserMedia stream. Using both at once prevents stable tracking.
  const rafRef = useRef<number | null>(null);
  const lastScrollTimeRef = useRef(0);
  const lastClickTimeRef = useRef(0);
  const lastRightClickTimeRef = useRef(0);
  // Use a ring buffer of positions for extra smoothness
  const positionBufferRef = useRef<{ x: number; y: number }[]>([]);
  const smoothPositionRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const lastGestureRef = useRef<string | null>(null);
  const lastHoveredElementRef = useRef<HTMLElement | null>(null);
  const wasPinchingRef = useRef(false);
  const wasRightPinchingRef = useRef(false);
  
  // Loading state for UI feedback
  const [loadingState, setLoadingState] = useState<HandGestureLoadingState>('idle');
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Smooth cursor using weighted moving average over a small buffer
  const BUFFER_SIZE = 5;
  const smoothCursor = useCallback((rawX: number, rawY: number) => {
    const buffer = positionBufferRef.current;
    buffer.push({ x: rawX, y: rawY });
    if (buffer.length > BUFFER_SIZE) buffer.shift();

    // Weighted average: more recent positions weighted higher
    let totalWeight = 0;
    let sumX = 0;
    let sumY = 0;
    buffer.forEach((pos, i) => {
      const weight = i + 1;
      sumX += pos.x * weight;
      sumY += pos.y * weight;
      totalWeight += weight;
    });
    const avgX = sumX / totalWeight;
    const avgY = sumY / totalWeight;

    // Apply exponential smoothing on top for extra stability
    const prev = smoothPositionRef.current;
    const newX = prev.x + (avgX - prev.x) * CURSOR_SMOOTHING;
    const newY = prev.y + (avgY - prev.y) * CURSOR_SMOOTHING;
    smoothPositionRef.current = { x: newX, y: newY };
    return { x: newX, y: newY };
  }, []);

  // Check if finger is extended (tip is above PIP joint)
  const isFingerExtended = useCallback((landmarks: { x: number; y: number; z: number }[], tipIdx: number, pipIdx: number): boolean => {
    return landmarks[tipIdx].y < landmarks[pipIdx].y - 0.02;
  }, []);

  // Count extended fingers
  const countFingersUp = useCallback((landmarks: { x: number; y: number; z: number }[]): number => {
    let count = 0;
    
    // Thumb - check horizontal distance (works for both hands)
    const thumbExtended = Math.abs(landmarks[THUMB_TIP].x - landmarks[THUMB_MCP].x) > 0.05;
    if (thumbExtended) count++;
    
    if (isFingerExtended(landmarks, INDEX_TIP, INDEX_PIP)) count++;
    if (isFingerExtended(landmarks, MIDDLE_TIP, MIDDLE_PIP)) count++;
    if (isFingerExtended(landmarks, RING_TIP, RING_PIP)) count++;
    if (isFingerExtended(landmarks, PINKY_TIP, PINKY_PIP)) count++;
    
    return count;
  }, [isFingerExtended]);

  // Calculate dynamic pinch threshold based on hand distance from camera
  // Uses the average Z-depth of key landmarks to estimate distance
  const calculateDynamicPinchThreshold = useCallback((landmarks: { x: number; y: number; z: number }[]): number => {
    // Average Z value of palm landmarks (higher Z = hand further from camera)
    const palmZ = (landmarks[WRIST].z + landmarks[INDEX_MCP].z + landmarks[PINKY_MCP].z) / 3;
    
    // Map Z depth (-0.3 to 0.1 typical range) to threshold
    // Closer hand (negative Z) = smaller threshold, farther hand = larger threshold
    const normalizedZ = Math.max(-0.3, Math.min(0.1, palmZ));
    const t = (normalizedZ + 0.3) / 0.4; // Normalize to 0-1 range
    
    return MIN_PINCH_THRESHOLD + t * (MAX_PINCH_THRESHOLD - MIN_PINCH_THRESHOLD);
  }, []);

  // Check for pinch gesture (left click) with dynamic threshold
  const isPinching = useCallback((landmarks: { x: number; y: number; z: number }[]): boolean => {
    const thumbTip = landmarks[THUMB_TIP];
    const indexTip = landmarks[INDEX_TIP];
    const distance = Math.sqrt(
      Math.pow(thumbTip.x - indexTip.x, 2) +
      Math.pow(thumbTip.y - indexTip.y, 2)
    );
    const dynamicThreshold = calculateDynamicPinchThreshold(landmarks);
    return distance < dynamicThreshold;
  }, [calculateDynamicPinchThreshold]);

  // Check for right-click gesture: thumb + middle finger pinch
  // This is deliberately different from index pinch (left click)
  const isRightPinching = useCallback((landmarks: { x: number; y: number; z: number }[]): boolean => {
    const thumbTip = landmarks[THUMB_TIP];
    const middleTip = landmarks[MIDDLE_TIP];
    const distance = Math.sqrt(
      Math.pow(thumbTip.x - middleTip.x, 2) +
      Math.pow(thumbTip.y - middleTip.y, 2)
    );
    const dynamicThreshold = calculateDynamicPinchThreshold(landmarks);
    // Index finger must NOT be pinching (to avoid ambiguity with left click)
    const indexDistance = Math.sqrt(
      Math.pow(landmarks[THUMB_TIP].x - landmarks[INDEX_TIP].x, 2) +
      Math.pow(landmarks[THUMB_TIP].y - landmarks[INDEX_TIP].y, 2)
    );
    return distance < dynamicThreshold && indexDistance >= dynamicThreshold;
  }, [calculateDynamicPinchThreshold]);

  // Check for open palm (all 5 fingers extended)
  const isOpenPalm = useCallback((landmarks: { x: number; y: number; z: number }[]): boolean => {
    return countFingersUp(landmarks) >= 4;
  }, [countFingersUp]);

  // Detect gesture type
  const detectGesture = useCallback((landmarks: { x: number; y: number; z: number }[]): string | null => {
    const fingersUp = countFingersUp(landmarks);
    const pinching = isPinching(landmarks);
    const rightPinching = isRightPinching(landmarks);
    const openPalm = isOpenPalm(landmarks);
    
    if (pinching) return 'pinch';
    if (rightPinching) return 'right_pinch';
    if (openPalm) return 'open_palm';
    
    // Thumbs up - only thumb extended
    if (fingersUp === 1 && Math.abs(landmarks[THUMB_TIP].x - landmarks[THUMB_MCP].x) > 0.05 &&
        landmarks[THUMB_TIP].y < landmarks[WRIST].y - 0.1) {
      return 'thumbs_up';
    }
    
    // Point - only index extended
    if (fingersUp === 1 && isFingerExtended(landmarks, INDEX_TIP, INDEX_PIP)) {
      return 'point';
    }
    
    // Peace - index and middle extended
    if (fingersUp === 2 && 
        isFingerExtended(landmarks, INDEX_TIP, INDEX_PIP) &&
        isFingerExtended(landmarks, MIDDLE_TIP, MIDDLE_PIP)) {
      return 'peace';
    }
    
    return null;
  }, [countFingersUp, isPinching, isRightPinching, isOpenPalm, isFingerExtended]);

  // Handle scroll with open palm
  const handleScroll = useCallback((landmarks: { x: number; y: number; z: number }[], gesture: string | null) => {
    const now = Date.now();
    if (now - lastScrollTimeRef.current < SCROLL_DEBOUNCE) return;
    
    // Use wrist Y position for scroll direction
    const wristY = landmarks[WRIST].y;
    
    // Open palm scrolling
    if (gesture === 'open_palm') {
      const scrollAmount = 25;
      
      if (wristY < 0.3) {
        // Hand in upper portion - scroll up
        window.scrollBy({ top: -scrollAmount, behavior: 'auto' });
        lastScrollTimeRef.current = now;
      } else if (wristY > 0.7) {
        // Hand in lower portion - scroll down
        window.scrollBy({ top: scrollAmount, behavior: 'auto' });
        lastScrollTimeRef.current = now;
      }
    }
    
    // Thumbs up - scroll to top (only trigger once)
    if (gesture === 'thumbs_up' && lastGestureRef.current !== 'thumbs_up') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    lastGestureRef.current = gesture;
  }, []);

  // Handle click events - dispatches full mouse event sequence so Radix UI modals
  // can detect outside-clicks and close properly
  const handleClick = useCallback((x: number, y: number, isRightClick: boolean) => {
    const now = Date.now();
    const lastRef = isRightClick ? lastRightClickTimeRef : lastClickTimeRef;
    
    if (now - lastRef.current < CLICK_DEBOUNCE) return;
    lastRef.current = now;

    const element = document.elementFromPoint(x, y) as HTMLElement;
    if (!element) return;

    console.log(`[Gesture] ${isRightClick ? 'Right' : 'Left'} click on:`, element.tagName, element.className);

    const eventInit = {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: x,
      clientY: y,
    };

    if (isRightClick) {
      element.dispatchEvent(new MouseEvent('contextmenu', { ...eventInit, button: 2 }));
    } else {
      // Fire the full sequence: pointerdown → mousedown → pointerup → mouseup → click
      // This is required for Radix UI dialogs to detect outside pointer-down events
      element.dispatchEvent(new PointerEvent('pointerdown', { ...eventInit, button: 0, pointerId: 1 }));
      element.dispatchEvent(new MouseEvent('mousedown', { ...eventInit, button: 0 }));
      element.dispatchEvent(new PointerEvent('pointerup', { ...eventInit, button: 0, pointerId: 1 }));
      element.dispatchEvent(new MouseEvent('mouseup', { ...eventInit, button: 0 }));
      element.dispatchEvent(new MouseEvent('click', { ...eventInit, button: 0 }));
      
      if ('focus' in element) {
        (element as HTMLElement).focus();
      }
    }
  }, []);

  // Handle hover states
  const handleHover = useCallback((x: number, y: number): HTMLElement | null => {
    const element = document.elementFromPoint(x, y) as HTMLElement;
    
    if (lastHoveredElementRef.current && lastHoveredElementRef.current !== element) {
      lastHoveredElementRef.current.classList.remove('gesture-hover');
    }
    
    if (element && element !== lastHoveredElementRef.current) {
      element.classList.add('gesture-hover');
      lastHoveredElementRef.current = element;
    }
    
    return element;
  }, []);

  // Store callback in ref to avoid recreating MediaPipe on every render
  const onResultsRef = useRef<(results: HandResults) => void>(() => {});
  
  // Update the ref with latest callback logic
  useEffect(() => {
    onResultsRef.current = (results: HandResults) => {
      if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
        setGestureState(prev => ({
          ...prev,
          isHandDetected: false,
          gesture: null,
          landmarks: null,
          hoveredElement: null,
        }));
        return;
      }

      const landmarks = results.multiHandLandmarks[0];
      const indexTip = landmarks[INDEX_TIP];
      
      // Calculate cursor position (mirror X for natural movement)
      const rawX = (1 - indexTip.x) * window.innerWidth;
      const rawY = indexTip.y * window.innerHeight;
      const smoothPos = smoothCursor(rawX, rawY);

      // Detect gestures
      const pinching = isPinching(landmarks);
      const rightPinching = isRightPinching(landmarks);
      const fingersUp = countFingersUp(landmarks);
      const gesture = detectGesture(landmarks);

      // Handle hover
      const hoveredElement = handleHover(smoothPos.x, smoothPos.y);

      // Trigger on gesture START only (edge detection)
      if (pinching && !wasPinchingRef.current) {
        handleClick(smoothPos.x, smoothPos.y, false);
      }
      if (rightPinching && !wasRightPinchingRef.current) {
        handleClick(smoothPos.x, smoothPos.y, true);
      }
      
      wasPinchingRef.current = pinching;
      wasRightPinchingRef.current = rightPinching;

      // Handle scrolling
      handleScroll(landmarks, gesture);

      // Update state
      setGestureState({
        isHandDetected: true,
        cursorPosition: { x: rawX, y: rawY },
        smoothCursorPosition: smoothPos,
        isPinching: pinching,
        isRightClicking: rightPinching,
        gesture,
        fingersUp,
        landmarks: [...landmarks],
        hoveredElement,
      });
    };
  }, [setGestureState, smoothCursor, isPinching, isRightPinching, countFingersUp, detectGesture, handleHover, handleClick, handleScroll]);

  // Initialize MediaPipe
  useEffect(() => {
    if (!isAIModeActive || !videoRef.current) {
      setLoadingState('idle');
      setLoadingProgress(0);
      return;
    }

    if (!window.Hands) {
      console.warn('MediaPipe Hands not loaded yet');
      setLoadingState('error');
      return;
    }

    setLoadingState('loading_model');
    setLoadingProgress(10);
    console.log('[Gesture] Initializing MediaPipe Hands...');

    const hands = new window.Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5,
    });

    setLoadingProgress(30);
    setLoadingState('initializing');

    // Track first successful detection to mark as ready
    let hasReceivedFirstResult = false;
    
    hands.onResults((results: HandResults) => {
      if (!hasReceivedFirstResult) {
        hasReceivedFirstResult = true;
        setLoadingState('ready');
        setLoadingProgress(100);
        console.log('[Gesture] First frame processed - ready!');
      }
      onResultsRef.current(results);
    });
    
    handsRef.current = hands;

    let cancelled = false;

    // Initialize the WASM model first, then start the tracking loop
    hands.initialize().then(() => {
      if (cancelled) return;
      console.log('[Gesture] MediaPipe WASM initialized successfully');
      setLoadingProgress(70);

      const startTrackingLoop = () => {
        if (cancelled) return;

        const video = videoRef.current;
        const handsInstance = handsRef.current;

        // If the <video> isn't ready yet (no frames), retry next frame.
        if (!video || !handsInstance || video.readyState < 2 || video.videoWidth === 0) {
          rafRef.current = window.requestAnimationFrame(startTrackingLoop);
          return;
        }

        // Update progress as we start processing frames
        if (!hasReceivedFirstResult && loadingProgress < 90) {
          setLoadingProgress(prev => Math.min(prev + 2, 90));
        }

        // Send the current frame to MediaPipe.
        Promise.resolve(handsInstance.send({ image: video })).catch((err) => {
          if (!cancelled) {
            console.warn('[Gesture] hands.send failed:', err);
            setLoadingState('error');
          }
        });

        rafRef.current = window.requestAnimationFrame(startTrackingLoop);
      };

      rafRef.current = window.requestAnimationFrame(startTrackingLoop);
      console.log('[Gesture] Tracking loop started');
    }).catch((err) => {
      if (!cancelled) {
        console.error('[Gesture] MediaPipe initialization failed:', err);
        setLoadingState('error');
      }
    });

    return () => {
      console.log('[Gesture] Cleaning up...');
      cancelled = true;
      setLoadingState('idle');
      setLoadingProgress(0);
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      // Delay close() to allow any in-flight WASM processing to complete
      // This prevents "memory access out of bounds" errors
      const handsToClose = handsRef.current;
      handsRef.current = null;
      if (handsToClose) {
        setTimeout(() => {
          try {
            handsToClose.close();
          } catch (err) {
            // Ignore WASM errors during cleanup - common when hot-reloading
            console.log('[Gesture] Cleanup complete (WASM may have already been released)');
          }
        }, 100);
      }
    };
  }, [isAIModeActive, videoRef]);

  return { gestureState, loadingState, loadingProgress };
}
