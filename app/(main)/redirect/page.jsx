import React from 'react'
import { redirect } from "next/navigation";
import { checkOnboardingStatus } from "@/lib/onboarding-check";

/**
 * This page handles post-authentication routing
 * - If user hasn't completed onboarding: redirect to /onboarding
 * - If user has completed onboarding: redirect to /dashboard
 */
const RedirectPage = async () => {
  const { isOnboarded } = await checkOnboardingStatus();
  
  if (isOnboarded) {
    redirect("/dashboard");
  } else {
    redirect("/onboarding");
  }
}

export default RedirectPage;

