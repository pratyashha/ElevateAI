"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

const OnboardingStatusContext = createContext({ isOnboarded: false, loading: true });

export function OnboardingStatusProvider({ children }) {
  const { user, isLoaded } = useUser();
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkOnboarding() {
      if (!isLoaded) {
        setLoading(true);
        return;
      }

      if (!user) {
        setIsOnboarded(false);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/onboarding-status');
        if (response.ok) {
          const data = await response.json();
          setIsOnboarded(data.isOnboarded || false);
        } else {
          setIsOnboarded(false);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setIsOnboarded(false);
      } finally {
        setLoading(false);
      }
    }

    checkOnboarding();
  }, [user, isLoaded]);

  return (
    <OnboardingStatusContext.Provider value={{ isOnboarded, loading }}>
      {children}
    </OnboardingStatusContext.Provider>
  );
}

export function useOnboardingStatus() {
  return useContext(OnboardingStatusContext);
}

