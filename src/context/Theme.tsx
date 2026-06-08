import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface ThemeProperties {
  background: string;
  text: string;
  card: string;
}

const themes: Record<'light' | 'dark', ThemeProperties> = {
  light: {
    background: '#F4F4F4',
    text: '#000000',
    card: '#F2F2F2',
  },
  dark: {
    background: '#222222',
    text: '#FFFFFF',
    card: '#121212',
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

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setThemeMode(prevMode => (prevMode === 'light' ? 'dark' : 'light'));
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
