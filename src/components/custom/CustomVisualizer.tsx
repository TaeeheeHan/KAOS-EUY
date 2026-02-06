'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Move, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useCustomDesignStore, CustomPosition } from '@/stores/customDesign';

interface CustomVisualizerProps {
  baseColor: string;
  productImage?: string;
}

const positionLabels: Record<CustomPosition, string> = {
  front: 'Front',
  back: 'Back',
  leftArm: 'Left Sleeve',
  rightArm: 'Right Sleeve',
};

// Design area boundaries (percentage based)
const designAreaBounds: Record<CustomPosition, { top: number; left: number; width: number; height: number }> = {
  front: { top: 20, left: 25, width: 50, height: 40 },
  back: { top: 20, left: 25, width: 50, height: 40 },
  leftArm: { top: 15, left: 5, width: 20, height: 30 },
  rightArm: { top: 15, left: 75, width: 20, height: 30 },
};

export function CustomVisualizer({ baseColor }: CustomVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    activePosition,
    setActivePosition,
    front,
    back,
    leftArm,
    rightArm,
    setPartPosition,
    setPartScale,
  } = useCustomDesignStore();

  const positions: CustomPosition[] = ['front', 'back', 'leftArm', 'rightArm'];

  const getCurrentPart = () => {
    switch (activePosition) {
      case 'front': return front;
      case 'back': return back;
      case 'leftArm': return leftArm;
      case 'rightArm': return rightArm;
    }
  };

  const currentPart = getCurrentPart();
  const bounds = designAreaBounds[activePosition];

  const handleDragEnd = (_: unknown, info: { offset: { x: number; y: number } }) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newX = currentPart.position.x + (info.offset.x / containerRect.width) * 100;
    const newY = currentPart.position.y + (info.offset.y / containerRect.height) * 100;

    // Clamp within bounds
    const clampedX = Math.max(-20, Math.min(20, newX));
    const clampedY = Math.max(-20, Math.min(20, newY));

    setPartPosition(activePosition, { x: clampedX, y: clampedY });
  };

  const handleZoom = (delta: number) => {
    setPartScale(activePosition, currentPart.scale + delta);
  };

  const handleReset = () => {
    setPartPosition(activePosition, { x: 0, y: 0 });
    setPartScale(activePosition, 1);
  };

  return (
    <div className="space-y-4">
      {/* Main Visualizer */}
      <div
        ref={containerRef}
        className="relative aspect-square rounded-2xl overflow-hidden"
        style={{ backgroundColor: baseColor || '#f3f4f6' }}
      >
        {/* Base T-shirt illustration */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            viewBox="0 0 200 200"
            className="w-4/5 h-4/5"
            fill="currentColor"
            style={{ color: baseColor || '#e5e7eb' }}
          >
            {/* Simple T-shirt shape */}
            <path
              d="M40 50 L60 30 L80 45 L120 45 L140 30 L160 50 L145 65 L145 170 L55 170 L55 65 Z"
              fill="currentColor"
              stroke="#d1d5db"
              strokeWidth="2"
            />
            {/* Left sleeve */}
            <path
              d="M40 50 L20 80 L35 90 L55 65 Z"
              fill="currentColor"
              stroke="#d1d5db"
              strokeWidth="2"
            />
            {/* Right sleeve */}
            <path
              d="M160 50 L180 80 L165 90 L145 65 Z"
              fill="currentColor"
              stroke="#d1d5db"
              strokeWidth="2"
            />
            {/* Collar */}
            <path
              d="M80 45 Q100 55 120 45"
              fill="none"
              stroke="#d1d5db"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* Design Area Indicator */}
        <div
          className="absolute border-2 border-dashed border-primary/30 rounded-lg pointer-events-none"
          style={{
            top: `${bounds.top}%`,
            left: `${bounds.left}%`,
            width: `${bounds.width}%`,
            height: `${bounds.height}%`,
          }}
        />

        {/* Custom Design Overlay - Draggable */}
        <AnimatePresence mode="wait">
          {currentPart.previewUrl && (
            <motion.div
              key={`${activePosition}-image`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              drag
              dragMomentum={false}
              onDragEnd={handleDragEnd}
              whileDrag={{ cursor: 'grabbing' }}
              className="absolute cursor-grab"
              style={{
                top: `${bounds.top + bounds.height / 2}%`,
                left: `${bounds.left + bounds.width / 2}%`,
                width: `${bounds.width * 0.8}%`,
                height: `${bounds.height * 0.8}%`,
                x: '-50%',
                y: '-50%',
              }}
            >
              <motion.div
                className="relative w-full h-full"
                style={{
                  x: `${currentPart.position.x}%`,
                  y: `${currentPart.position.y}%`,
                  scale: currentPart.scale,
                }}
              >
                <Image
                  src={currentPart.previewUrl}
                  alt="Custom design"
                  fill
                  className="object-contain pointer-events-none"
                  draggable={false}
                />
                {/* Drag handle indicator */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <Move className="w-3 h-3 text-white" />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text Overlay - Draggable */}
        {currentPart.text && !currentPart.previewUrl && (
          <motion.div
            drag
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            whileDrag={{ cursor: 'grabbing' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute flex items-center justify-center text-white font-bold text-lg cursor-grab"
            style={{
              top: `${bounds.top + bounds.height / 2}%`,
              left: `${bounds.left + bounds.width / 2}%`,
              x: `calc(-50% + ${currentPart.position.x}%)`,
              y: `calc(-50% + ${currentPart.position.y}%)`,
              scale: currentPart.scale,
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            {currentPart.text}
          </motion.div>
        )}

        {/* Position indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
          {positionLabels[activePosition]}
        </div>

        {/* Drag instruction */}
        {(currentPart.previewUrl || currentPart.text) && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
            <Move className="w-3 h-3" />
            Drag to reposition
          </div>
        )}
      </div>

      {/* Zoom Controls */}
      {(currentPart.previewUrl || currentPart.text) && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleZoom(-0.1)}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-5 h-5 text-gray-700" />
          </button>
          <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 min-w-[80px] text-center">
            {Math.round(currentPart.scale * 100)}%
          </div>
          <button
            onClick={() => handleZoom(0.1)}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors ml-2"
            title="Reset position"
          >
            <RotateCcw className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      )}

      {/* Position Tabs */}
      <div className="flex gap-2">
        {positions.map((pos) => {
          const part = pos === 'front' ? front : pos === 'back' ? back : pos === 'leftArm' ? leftArm : rightArm;
          const isActive = activePosition === pos;
          const hasContent = part.applied || part.previewUrl || part.text;

          return (
            <button
              key={pos}
              onClick={() => setActivePosition(pos)}
              className={`flex-1 py-3 px-2 rounded-lg text-sm font-medium transition-all relative ${
                isActive
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {positionLabels[pos]}
              {hasContent && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
