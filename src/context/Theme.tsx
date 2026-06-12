import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../utils/color';

export interface ThemeProperties {
  background: string;
  text: string;
  card: string;
  googleButton: string;
}

const themes: Record<'light' | 'dark', ThemeProperties> = {
  light: {
    background: colors.lightBackground,
    text: colors.black,
    card: colors.lightCard,
    googleButton: colors.offWhite,
  },
  dark: {
    background: colors.darkBackground,
    text: colors.white,
    card: colors.darkCard,
    googleButton: colors.darkButton,
  },
};

export interface ThemeContextType {
  themeMode: 'light' | 'dark';
  currentTheme: ThemeProperties;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>(null!);

interface ThemeProviderProps {
  children: ReactNode;
}

const THEME_STORAGE_KEY = 'user_theme_preference';

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const systemTheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedMode === 'light' || savedMode === 'dark') {
          setThemeMode(savedMode);
        } else {
          setThemeMode(systemTheme === 'dark' ? 'dark' : 'light');
        }
      } catch (error) {
        console.error('Failed ', error);
      }
    };

    loadSavedTheme();
  }, [systemTheme]);

  const toggleTheme = async () => {
    try {
      const nextMode = themeMode === 'light' ? 'dark' : 'light';
      setThemeMode(nextMode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, nextMode);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const currentTheme = themes[themeMode];

  return (
    <ThemeContext.Provider value={{ themeMode, currentTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('Display ThemeProvider Error');
  }
  return context;
};
