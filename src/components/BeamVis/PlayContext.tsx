import React, { createContext, useContext, useState, useCallback } from 'react';

// Describe our play context shape
interface PlayContextValue {
  isPlaying: boolean;
  playAngle: number;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  handleStageRotationChange: (val: number) => void;
}

// Create the context (undefined by default)
const PlayContext = createContext<PlayContextValue | undefined>(undefined);

export const PlayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Single source of truth for "play" state
  const [isPlaying, setIsPlaying] = useState(false);

  // Single source of truth for "rotation" state in degrees
  const [playAngle, setPlayAngle] = useState(0);

  // A callback to set the angle
  const handleStageRotationChange = useCallback((val: number) => {
    setPlayAngle(val);
  }, []);

  return (
    <PlayContext.Provider
      value={{
        isPlaying,
        setIsPlaying,
        playAngle,
        handleStageRotationChange,
      }}
    >
      {children}
    </PlayContext.Provider>
  );
};

export function usePlay() {
  const ctx = useContext(PlayContext);
  if (!ctx) {
    throw new Error('usePlay must be used within a <PlayProvider>');
  }
  return ctx;
}
