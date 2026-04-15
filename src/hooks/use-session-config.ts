"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode, createElement } from 'react';

export interface SessionConfig {
  sml: string | null;
  tremie: string | null;
}

interface SessionConfigContextType {
  config: SessionConfig;
  setConfig: (sml: string, tremie: string) => void;
  clearConfig: () => void;
  isLoaded: boolean;
}

const CONFIG_KEY = 'tracefacile-session-config';

const SessionConfigContext = createContext<SessionConfigContextType | undefined>(undefined);

export function SessionConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<SessionConfig>({ sml: null, tremie: null });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedConfig = localStorage.getItem(CONFIG_KEY);
      if (storedConfig) {
        setConfigState(JSON.parse(storedConfig));
      }
    } catch (error) {
      console.error("Failed to load session config from localStorage", error);
      setConfigState({ sml: null, tremie: null });
    }
    setIsLoaded(true);
  }, []);

  const setConfig = useCallback((sml: string, tremie: string) => {
    const newConfig = { sml, tremie };
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
      setConfigState(newConfig);
    } catch (error) {
      console.error("Failed to save session config to localStorage", error);
    }
  }, []);
  
  const clearConfig = useCallback(() => {
    const clearedConfig = { sml: null, tremie: null };
     try {
      localStorage.removeItem(CONFIG_KEY);
      setConfigState(clearedConfig);
    } catch (error) {
      console.error("Failed to clear session config from localStorage", error);
    }
  }, []);
  
  const value = { config, setConfig, clearConfig, isLoaded };

  return createElement(SessionConfigContext.Provider, { value }, children);
}

export function useSessionConfig() {
  const context = useContext(SessionConfigContext);
  if (context === undefined) {
    throw new Error('useSessionConfig must be used within a SessionConfigProvider');
  }
  return context;
}
