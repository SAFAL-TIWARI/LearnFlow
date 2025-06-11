import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/utils/supabaseClient';

type CursorSize = 'small' | 'medium' | 'large' | number;

interface CursorContextProps {
  cursorSize: CursorSize;
  setCursorSize: (size: CursorSize) => void;
  cursorEnabled: boolean;
  setCursorEnabled: (enabled: boolean) => void;
  saveCursorSettings: () => Promise<void>;
  cursorColor: string;
  setCursorColor: (color: string) => void;
}

const CursorContext = createContext<CursorContextProps | undefined>(undefined);

interface CursorProviderProps {
  children: ReactNode;
}

export const CursorProvider: React.FC<CursorProviderProps> = ({ children }) => {
  const [cursorSize, setCursorSize] = useState<CursorSize>('small');
  const [cursorEnabled, setCursorEnabled] = useState<boolean>(true);
  const [cursorColor, setCursorColor] = useState<string>('#000000');

  // Load cursor settings from localStorage on mount
  useEffect(() => {
    const loadSettings = async () => {
      // First try to load from localStorage
      const storedSize = localStorage.getItem('cursorSize');
      const storedEnabled = localStorage.getItem('cursorEnabled');
      const storedColor = localStorage.getItem('cursorColor');

      if (storedSize) setCursorSize(storedSize as CursorSize);
      if (storedEnabled) setCursorEnabled(storedEnabled === 'true');
      if (storedColor) setCursorColor(storedColor);

      // If user is logged in, try to get their cursor settings from the database
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('user_settings')
            .select('cursor_size, cursor_enabled, cursor_color')
            .eq('user_id', user.id)
            .single();

          if (data && !error) {
            if (data.cursor_size) setCursorSize(data.cursor_size);
            if (data.cursor_enabled !== null) setCursorEnabled(data.cursor_enabled);
            if (data.cursor_color) setCursorColor(data.cursor_color);
          }
        }
      } catch (error) {
        console.error('Error loading cursor settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Save cursor settings to localStorage and database if user is logged in
  const saveCursorSettings = async () => {
    // Save to localStorage
    localStorage.setItem('cursorSize', cursorSize.toString());
    localStorage.setItem('cursorEnabled', cursorEnabled.toString());
    localStorage.setItem('cursorColor', cursorColor);

    // Save to database if user is logged in
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            cursor_size: cursorSize.toString(),
            cursor_enabled: cursorEnabled,
            cursor_color: cursorColor,
            updated_at: new Date()
          }, {
            onConflict: 'user_id'
          });

        if (error) {
          console.error('Error saving cursor settings:', error);
        }
      }
    } catch (error) {
      console.error('Error saving cursor settings:', error);
    }
  };

  // Save settings when they change
  useEffect(() => {
    saveCursorSettings();
  }, [cursorSize, cursorEnabled, cursorColor]);

  return (
    <CursorContext.Provider
      value={{
        cursorSize,
        setCursorSize,
        cursorEnabled,
        setCursorEnabled,
        saveCursorSettings,
        cursorColor,
        setCursorColor
      }}
    >
      {children}
    </CursorContext.Provider>
  );
};

export const useCursor = (): CursorContextProps => {
  const context = useContext(CursorContext);
  if (context === undefined) {
    throw new Error('useCursor must be used within a CursorProvider');
  }
  return context;
};