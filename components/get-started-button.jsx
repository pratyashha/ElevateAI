"use client";

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export function GetStartedButton({ size = "lg", className = "px-8", variant, children = "Get Started" }) {
  const router = useRouter();
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
        // Not signed in - will redirect to sign in, then onboarding
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

  const handleClick = () => {
    if (!user) {
      // Not signed in - redirect to sign in with callback to redirect page
      router.push('/sign-in?redirect_url=/redirect');
      return;
    }

    // Signed in - redirect based on onboarding status
    if (isOnboarded) {
      router.push('/dashboard');
    } else {
      router.push('/onboarding');
    }
  };

  return (
    <Button 
      size={size} 
      className={className}
      variant={variant}
      onClick={handleClick}
      disabled={loading}
    >
      {children}
    </Button>
  );
}

