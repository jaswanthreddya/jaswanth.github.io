import { useEffect, useRef } from 'react';

interface HandSkeletonProps {
  landmarks: Array<{ x: number; y: number; z: number }> | null;
  width: number;
  height: number;
}

// Hand connections for drawing skeleton
const HAND_CONNECTIONS = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle
  [5, 9], [9, 10], [10, 11], [11, 12],
  // Ring
  [9, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [13, 17], [17, 18], [18, 19], [19, 20],
  // Palm
  [0, 17],
];

export function HandSkeleton({ landmarks, width, height }: HandSkeletonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (!landmarks || landmarks.length === 0) return;

    // Draw connections
    ctx.strokeStyle = 'hsl(270, 60%, 60%)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    HAND_CONNECTIONS.forEach(([start, end]) => {
      const startPoint = landmarks[start];
      const endPoint = landmarks[end];
      
      // Mirror X for natural display
      const x1 = (1 - startPoint.x) * width;
      const y1 = startPoint.y * height;
      const x2 = (1 - endPoint.x) * width;
      const y2 = endPoint.y * height;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });

    // Draw landmarks
    landmarks.forEach((landmark, index) => {
      const x = (1 - landmark.x) * width;
      const y = landmark.y * height;

      // Fingertips get larger circles
      const isFingertip = [4, 8, 12, 16, 20].includes(index);
      const radius = isFingertip ? 6 : 4;

      // Color gradient based on finger
      let color = 'hsl(270, 60%, 60%)';
      if (index <= 4) color = 'hsl(0, 70%, 60%)'; // Thumb - red
      else if (index <= 8) color = 'hsl(45, 90%, 55%)'; // Index - yellow
      else if (index <= 12) color = 'hsl(150, 45%, 50%)'; // Middle - green
      else if (index <= 16) color = 'hsl(200, 60%, 50%)'; // Ring - cyan
      else color = 'hsl(280, 70%, 60%)'; // Pinky - purple

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Glow effect for fingertips
      if (isFingertip) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });
  }, [landmarks, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
    />
  );
}
