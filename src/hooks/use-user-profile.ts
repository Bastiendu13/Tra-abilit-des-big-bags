"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode, createElement } from 'react';

export type UserProfile = 'administrateur' | 'utilisateur' | null;

const PROFILE_KEY = 'tracefacile-user-profile';

interface UserProfileContextType {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  isLoaded: boolean;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem(PROFILE_KEY) as UserProfile;
      if (storedProfile) {
        setProfileState(storedProfile);
      }
    } catch (error) {
      console.error("Failed to load user profile from localStorage", error);
      setProfileState(null);
    }
    setIsLoaded(true);
  }, []);

  const setProfile = useCallback((newProfile: UserProfile) => {
    try {
      if (newProfile) {
        localStorage.setItem(PROFILE_KEY, newProfile);
      } else {
        localStorage.removeItem(PROFILE_KEY);
      }
      setProfileState(newProfile);
    } catch (error) {
      console.error("Failed to save user profile to localStorage", error);
    }
  }, []);
  
  const value = { profile, setProfile, isLoaded };

  return createElement(UserProfileContext.Provider, { value }, children);
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}
