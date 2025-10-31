import React from 'react'
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";

const CoverLetter = async ({params}) => {
  // Check onboarding status - must complete before accessing cover letter
  const { isOnboarded } = await getUserOnboardingStatus();
  
  if (!isOnboarded) {
    redirect("/onboarding");
  }

  const { id } = await params;
  return (
    <div>CoverLetter: {id}</div>
  )
}

export default CoverLetter