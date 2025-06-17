import React, { createContext, useContext, ReactNode } from 'react';
import { useScrollSmoother } from '../hooks/useScrollSmoother';

interface ScrollSmootherContextType {
  smoother: any;
  refresh: () => void;
  scrollTo: (target: string | Element, smooth?: boolean, position?: string) => void;
  isInitialized: boolean;
}

const ScrollSmootherContext = createContext<ScrollSmootherContextType | undefined>(undefined);

interface ScrollSmootherProviderProps {
  children: ReactNode;
  smooth?: number;
  effects?: boolean;
  normalizeScroll?: boolean;
}

export const ScrollSmootherProvider: React.FC<ScrollSmootherProviderProps> = ({
  children,
  smooth = 1.5,
  effects = true,
  normalizeScroll = true
}) => {
  const scrollSmootherData = useScrollSmoother({
    smooth,
    effects,
    normalizeScroll
  });

  return (
    <ScrollSmootherContext.Provider value={scrollSmootherData}>
      {children}
    </ScrollSmootherContext.Provider>
  );
};

export const useScrollSmootherContext = () => {
  const context = useContext(ScrollSmootherContext);
  if (context === undefined) {
    throw new Error('useScrollSmootherContext must be used within a ScrollSmootherProvider');
  }
  return context;
};