import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { 
  Sparkles, 
  Camera, 
  Hand, 
  Volume2, 
  VolumeX, 
  X, 
  Minimize2, 
  Maximize2,
  Info,
  Mouse,
  Loader2
} from 'lucide-react';
import { useMood } from '@/contexts/MoodContext';
import { useFaceDetection } from '@/hooks/useFaceDetection';
import { useHandGestures } from '@/hooks/useHandGestures';
import { useMoodAudio } from '@/hooks/useMoodAudio';
import { MOOD_CONFIGS } from '@/types/mood';
import { Slider } from '@/components/ui/slider';
import { HandSkeleton } from '@/components/HandSkeleton';
import { VirtualCursor } from '@/components/VirtualCursor';

export function AIControlPanel() {
  const {
    isAIModeActive,
    toggleAIMode,
    currentMood,
    moodConfidence,
    gestureState,
    isAudioPlaying,
    setIsAudioPlaying,
    audioVolume,
    setAudioVolume,
  } = useMood();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showGestureHints, setShowGestureHints] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [videoSize, setVideoSize] = useState({ width: 0, height: 0 });

  // Initialize hooks
  const { isModelLoaded, isInitialScanComplete } = useFaceDetection(videoRef);
  const { loadingState: gestureLoadingState, loadingProgress: gestureLoadingProgress } = useHandGestures(videoRef);
  useMoodAudio();

  const moodConfig = MOOD_CONFIGS[currentMood];

  // Start camera when AI mode is activated
  useEffect(() => {
    if (isAIModeActive && videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'user' }, audio: false })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setCameraError(null);
          }
        })
        .catch((err) => {
          console.error('Camera access error:', err);
          setCameraError('Camera access denied. Please enable camera permissions.');
        });
    } else if (!isAIModeActive && videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, [isAIModeActive]);

  // Track video element size for skeleton overlay
  useEffect(() => {
    const updateVideoSize = () => {
      if (videoRef.current) {
        const rect = videoRef.current.getBoundingClientRect();
        setVideoSize({ width: rect.width, height: rect.height });
      }
    };

    updateVideoSize();
    window.addEventListener('resize', updateVideoSize);
    
    // Also update when video starts playing
    if (videoRef.current) {
      videoRef.current.addEventListener('loadedmetadata', updateVideoSize);
    }

    return () => {
      window.removeEventListener('resize', updateVideoSize);
    };
  }, [isAIModeActive]);

  return (
    <>
      {/* AI Mode Toggle Button */}
      <motion.button
        onClick={toggleAIMode}
        className={`fixed bottom-6 left-6 z-50 p-4 rounded-full ${
          isAIModeActive ? 'mood-gradient mood-glow' : 'glass'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <Sparkles className={`w-6 h-6 ${isAIModeActive ? 'text-primary-foreground' : ''}`} />
      </motion.button>

      {/* Virtual Cursor */}
      <VirtualCursor gestureState={gestureState} isActive={isAIModeActive} />

      {/* Control Panel */}
      <AnimatePresence>
        {isAIModeActive && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`fixed top-4 right-4 z-50 glass rounded-2xl overflow-hidden ${
              isMinimized ? 'w-auto' : 'w-80'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">AI Mode</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setShowGestureHints(!showGestureHints)}
                  className="p-1.5 hover:bg-muted rounded-lg"
                >
                  <Info className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-muted rounded-lg"
                >
                  {isMinimized ? (
                    <Maximize2 className="w-4 h-4" />
                  ) : (
                    <Minimize2 className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={toggleAIMode}
                  className="p-1.5 hover:bg-destructive/20 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <div className="p-4 space-y-4">
                {/* Camera Preview with Skeleton */}
                <div className="relative aspect-video bg-muted rounded-xl overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                  
                  {/* Hand Skeleton Overlay */}
                  <HandSkeleton 
                    landmarks={gestureState.landmarks}
                    width={videoSize.width}
                    height={videoSize.height}
                  />

                  {cameraError && (
                    <div className="absolute inset-0 flex items-center justify-center text-center p-4 bg-background/80">
                      <p className="text-sm text-destructive">{cameraError}</p>
                    </div>
                  )}
                  
                  {/* Status indicators */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <div className="flex gap-2">
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                        isModelLoaded ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                      }`}>
                        <Camera className="w-3 h-3" />
                        {isModelLoaded ? 'Face Ready' : 'Loading...'}
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                        gestureLoadingState === 'ready' 
                          ? gestureState.isHandDetected 
                            ? 'bg-primary/20 text-primary' 
                            : 'bg-muted text-muted-foreground'
                          : gestureLoadingState === 'error'
                            ? 'bg-destructive/20 text-destructive'
                            : 'bg-muted text-muted-foreground'
                      }`}>
                        {gestureLoadingState === 'ready' ? (
                          <>
                            <Hand className="w-3 h-3" />
                            {gestureState.isHandDetected ? 'Tracking' : 'No hand'}
                          </>
                        ) : gestureLoadingState === 'error' ? (
                          <>
                            <Hand className="w-3 h-3" />
                            Error
                          </>
                        ) : (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            {gestureLoadingState === 'loading_model' ? 'Loading AI...' : 'Starting...'}
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Loading progress bar */}
                    {gestureLoadingState !== 'ready' && gestureLoadingState !== 'idle' && gestureLoadingState !== 'error' && (
                      <div className="bg-muted/50 rounded-full h-1.5 w-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${gestureLoadingProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Click status indicator */}
                  {gestureState.isHandDetected && (
                    <div className="absolute bottom-2 left-2 flex gap-2">
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${
                        gestureState.isPinching 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted/50 text-muted-foreground'
                      }`}>
                        <Mouse className="w-3 h-3" />
                        Left
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${
                        gestureState.isRightClicking 
                          ? 'bg-accent text-accent-foreground' 
                          : 'bg-muted/50 text-muted-foreground'
                      }`}>
                        <Mouse className="w-3 h-3" />
                        Right
                      </div>
                    </div>
                  )}
                </div>

                {/* Mood Display */}
                <div className="glass rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Detected Mood</span>
                    <span className="text-sm">{Math.round(moodConfidence * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{moodConfig.emoji}</span>
                    <div>
                      <p className="font-semibold">{moodConfig.name}</p>
                      <p className="text-xs text-muted-foreground">{moodConfig.description}</p>
                    </div>
                  </div>
                </div>

                {/* Gesture Info */}
                {gestureState.gesture && (
                  <div className="glass rounded-xl p-3">
                    <p className="text-sm text-muted-foreground mb-1">Current Gesture</p>
                    <p className="font-semibold capitalize">{gestureState.gesture.replace('_', ' ')}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Fingers up: {gestureState.fingersUp}
                    </p>
                  </div>
                )}

                {/* Audio Controls */}
                <div className="glass rounded-xl p-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm">Mood Music</span>
                    <button
                      onClick={() => setIsAudioPlaying(!isAudioPlaying)}
                      className="p-2 hover:bg-muted rounded-lg"
                    >
                      {isAudioPlaying ? (
                        <Volume2 className="w-4 h-4 text-primary" />
                      ) : (
                        <VolumeX className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <Slider
                    value={[audioVolume]}
                    onValueChange={([v]) => setAudioVolume(v)}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                {/* Gesture Hints */}
                <AnimatePresence>
                  {showGestureHints && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="glass rounded-xl p-3 text-xs space-y-2"
                    >
                      <p className="font-semibold mb-2 flex items-center gap-2">
                        <Mouse className="w-4 h-4" />
                        Mouse Controls
                      </p>
                      <p>☝️ Point finger → Move cursor</p>
                      <p>🤏 Thumb + index pinch → Left click</p>
                      <p>🤙 Thumb + middle pinch → Right click</p>
                      <p>✋ Open palm up/down → Scroll</p>
                      <p>👍 Thumbs up → Scroll to top</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
