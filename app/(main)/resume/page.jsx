import React from 'react'
import { getResume } from '@/actions/resume';
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import ResumeBuilder from './_components/resume-builder';

const ResumePage = async () => {
  // Check onboarding status - must complete before accessing resume
  const { isOnboarded } = await getUserOnboardingStatus();
  
  if (!isOnboarded) {
    redirect("/onboarding");
  }

  const resume = await getResume();

  return (
    <div className='space-y-6'>
      <ResumeBuilder initialContent={resume?.content} />
    </div>
  )
}

export default ResumePage
