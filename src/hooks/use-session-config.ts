"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode, createElement } from 'react';

export interface Assignment {
  id: string;
  sml: string;
  tremie: string;
}

export interface SessionConfig {
  assignments: Assignment[];
  activeAssignmentIds: string[];
}

interface SessionConfigContextType {
  assignments: Assignment[];
  activeAssignments: Assignment[];
  addAssignment: (sml: string, tremie: string) => void;
  removeAssignment: (assignmentId: string) => void;
  activateAssignment: (assignmentId: string) => void;
  deactivateAssignment: (assignmentId: string) => void;
  isLoaded: boolean;
}

const CONFIG_KEY = 'tracefacile-session-config';

const SessionConfigContext = createContext<SessionConfigContextType | undefined>(undefined);

export function SessionConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SessionConfig>({ assignments: [], activeAssignmentIds: [] });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedConfig = localStorage.getItem(CONFIG_KEY);
      if (storedConfig) {
        const parsed = JSON.parse(storedConfig);
        // Basic validation to prevent crashes on structure change
        if (parsed.assignments && Array.isArray(parsed.assignments)) {
          // Compatibility for old structure
          if (parsed.activeAssignmentId && !parsed.activeAssignmentIds) {
            parsed.activeAssignmentIds = parsed.activeAssignmentId ? [parsed.activeAssignmentId] : [];
            delete parsed.activeAssignmentId;
          }
          if (!parsed.activeAssignmentIds) {
             parsed.activeAssignmentIds = [];
          }
          setConfig(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load session config from localStorage", error);
      setConfig({ assignments: [], activeAssignmentIds: [] });
    }
    setIsLoaded(true);
  }, []);

  const persistConfig = (newConfig: SessionConfig) => {
     try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
    } catch (error) {
      console.error("Failed to save session config to localStorage", error);
    }
  };
  
  const addAssignment = useCallback((sml: string, tremie: string) => {
    setConfig(prevConfig => {
      const newAssignment: Assignment = { id: new Date().getTime().toString(), sml, tremie };
      const newConfig = { ...prevConfig, assignments: [...prevConfig.assignments, newAssignment] };
      persistConfig(newConfig);
      return newConfig;
    });
  }, []);
  
  const removeAssignment = useCallback((assignmentId: string) => {
    setConfig(prevConfig => {
      const newAssignments = prevConfig.assignments.filter(a => a.id !== assignmentId);
      const newActiveIds = prevConfig.activeAssignmentIds.filter(id => id !== assignmentId);
      const newConfig = { assignments: newAssignments, activeAssignmentIds: newActiveIds };
      persistConfig(newConfig);
      return newConfig;
    });
  }, []);

  const activateAssignment = useCallback((assignmentId: string) => {
    setConfig(prevConfig => {
      if (prevConfig.activeAssignmentIds.includes(assignmentId)) return prevConfig;
      const newConfig = { ...prevConfig, activeAssignmentIds: [...prevConfig.activeAssignmentIds, assignmentId] };
      persistConfig(newConfig);
      return newConfig;
    });
  }, []);

  const deactivateAssignment = useCallback((assignmentId: string) => {
    setConfig(prevConfig => {
      const newActiveIds = prevConfig.activeAssignmentIds.filter(id => id !== assignmentId);
      if (newActiveIds.length === prevConfig.activeAssignmentIds.length) return prevConfig;
      const newConfig = { ...prevConfig, activeAssignmentIds: newActiveIds };
      persistConfig(newConfig);
      return newConfig;
    });
  }, []);

  const activeAssignments = config.assignments.filter(a => config.activeAssignmentIds.includes(a.id));

  const value = { 
      assignments: config.assignments, 
      activeAssignments,
      addAssignment,
      removeAssignment,
      activateAssignment,
      deactivateAssignment,
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
