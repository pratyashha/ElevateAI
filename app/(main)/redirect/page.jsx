import React from 'react'
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";

/**
 * This page handles post-authentication routing
 * - If user hasn't completed onboarding: redirect to /onboarding
 * - If user has completed onboarding: redirect to /dashboard
 */
const RedirectPage = async () => {
  try {
    const { isOnboarded } = await getUserOnboardingStatus();
    
    if (isOnboarded) {
      redirect("/dashboard");
    } else {
      redirect("/onboarding");
    }
  } catch (error) {
    console.error("Error in redirect page:", error);
    // If we can't determine onboarding status, default to onboarding
    redirect("/onboarding");
  }
}

export default RedirectPage;

