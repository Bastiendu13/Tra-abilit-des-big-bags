"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Scan } from '@/lib/types';

const HISTORY_KEY = 'tracefacile-scan-history';

export function useScanHistory() {
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

  return { scans, addScan, clearHistory, isLoaded };
}
