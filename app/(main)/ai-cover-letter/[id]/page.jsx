import React from 'react'
import { requireOnboarding } from "@/lib/onboarding-check";

const CoverLetter = async ({params}) => {
  // Check onboarding status - redirects if not onboarded
  await requireOnboarding();

  const { id } = await params;
  return (
    <div>CoverLetter: {id}</div>
  )
}

export default CoverLetter