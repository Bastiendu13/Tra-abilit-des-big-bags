"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode, createElement } from 'react';
import type { Scan } from '@/lib/types';

const HISTORY_KEY = 'tracefacile-scan-history';

interface ScanHistoryContextType {
  scans: Scan[];
  addScan: (newScan: Omit<Scan, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  isLoaded: boolean;
}

const ScanHistoryContext = createContext<ScanHistoryContextType | undefined>(undefined);

export function ScanHistoryProvider({ children }: { children: ReactNode }) {
  const [scans, setScans] = useState<Scan[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedScans = localStorage.getItem(HISTORY_KEY);
      if (storedScans) {
        setScans(JSON.parse(storedScans));
      }
    } catch (error) {
      console.error("Failed to load scan history from localStorage", error);
      setScans([]);
    }
    setIsLoaded(true);
  }, []);

  const updateLocalStorage = (updatedScans: Scan[]) => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedScans));
    } catch (error) {
      console.error("Failed to save scan history to localStorage", error);
    }
  };

  const addScan = useCallback((newScan: Omit<Scan, 'id' | 'timestamp'>) => {
    const scanWithMetadata: Scan = {
      ...newScan,
      id: new Date().getTime().toString(),
      timestamp: Date.now(),
    };

    setScans(prevScans => {
      const updatedScans = [scanWithMetadata, ...prevScans];
      updateLocalStorage(updatedScans);
      return updatedScans;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setScans([]);
    updateLocalStorage([]);
  }, []);

  return createElement(
    ScanHistoryContext.Provider,
    { value: { scans, addScan, clearHistory, isLoaded } },
    children
  );
}

export function useScanHistory() {
  const context = useContext(ScanHistoryContext);
  if (context === undefined) {
    throw new Error('useScanHistory must be used within a ScanHistoryProvider');
  }
  return context;
}
