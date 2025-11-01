import React from 'react'
import { redirect } from "next/navigation";
import { checkOnboardingStatus } from "@/lib/onboarding-check";
import { industries } from "@/data/industries";
import OnboardingForm from "./_components/onboarding-form";

// Force dynamic rendering - this page uses auth headers
export const dynamic = 'force-dynamic';

const OnboardingPage = async () => {
  const { isOnboarded } = await checkOnboardingStatus();

  // If already onboarded, redirect to dashboard
  if (isOnboarded) {
    redirect("/dashboard");
  }

  // Otherwise show onboarding form
  return (
    <main>
      <OnboardingForm industries={industries} />
    </main>
  )
}

export default OnboardingPage;