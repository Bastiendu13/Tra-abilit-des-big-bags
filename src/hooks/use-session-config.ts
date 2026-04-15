"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode, createElement } from 'react';

export interface Assignment {
  id: string;
  sml: string;
  tremie: string;
}

export interface SessionConfig {
  assignments: Assignment[];
  activeAssignmentId: string | null;
}

interface SessionConfigContextType {
  assignments: Assignment[];
  activeAssignment: Assignment | null;
  addAssignment: (sml: string, tremie: string) => void;
  removeAssignment: (assignmentId: string) => void;
  setActiveAssignmentId: (assignmentId: string | null) => void;
  isLoaded: boolean;
}

const CONFIG_KEY = 'tracefacile-session-config';

const SessionConfigContext = createContext<SessionConfigContextType | undefined>(undefined);

export function SessionConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SessionConfig>({ assignments: [], activeAssignmentId: null });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedConfig = localStorage.getItem(CONFIG_KEY);
      if (storedConfig) {
        const parsed = JSON.parse(storedConfig);
        // Basic validation to prevent crashes on structure change
        if (parsed.assignments && Array.isArray(parsed.assignments)) {
          setConfig(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load session config from localStorage", error);
      setConfig({ assignments: [], activeAssignmentId: null });
    }
    setIsLoaded(true);
  }, []);

  const updateConfig = (newConfig: SessionConfig) => {
     try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
      setConfig(newConfig);
    } catch (error) {
      console.error("Failed to save session config to localStorage", error);
    }
  };
  
  const addAssignment = useCallback((sml: string, tremie: string) => {
    setConfig(prevConfig => {
      const newAssignment: Assignment = { id: new Date().getTime().toString(), sml, tremie };
      const newConfig = { ...prevConfig, assignments: [...prevConfig.assignments, newAssignment] };
      updateConfig(newConfig);
      return newConfig;
    });
  }, []);
  
  const removeAssignment = useCallback((assignmentId: string) => {
    setConfig(prevConfig => {
      const newAssignments = prevConfig.assignments.filter(a => a.id !== assignmentId);
      const newActiveId = prevConfig.activeAssignmentId === assignmentId ? null : prevConfig.activeAssignmentId;
      const newConfig = { assignments: newAssignments, activeAssignmentId: newActiveId };
      updateConfig(newConfig);
      return newConfig;
    });
  }, []);

  const setActiveAssignmentId = useCallback((assignmentId: string | null) => {
    setConfig(prevConfig => {
      const newConfig = { ...prevConfig, activeAssignmentId: assignmentId };
      updateConfig(newConfig);
      return newConfig;
    });
  }, []);

  const activeAssignment = config.assignments.find(a => a.id === config.activeAssignmentId) || null;

  const value = { 
      assignments: config.assignments, 
      activeAssignment,
      addAssignment,
      removeAssignment,
      setActiveAssignmentId,
      isLoaded 
  };

  return createElement(SessionConfigContext.Provider, { value }, children);
}

export function useSessionConfig() {
  const context = useContext(SessionConfigContext);
  if (context === undefined) {
    throw new Error('useSessionConfig must be used within a SessionConfigProvider');
  }
  return context;
}
