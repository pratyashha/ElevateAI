import React from 'react'
import { getResume } from '@/actions/resume';
import { requireOnboarding } from "@/lib/onboarding-check";
import ResumeBuilder from './_components/resume-builder';

// Force dynamic rendering - this page uses auth headers
export const dynamic = 'force-dynamic';

const ResumePage = async () => {
  // Check onboarding status - redirects if not onboarded
  await requireOnboarding();

  const resume = await getResume();

  return (
    <div className='space-y-6'>
      <ResumeBuilder initialContent={resume?.content} />
    </div>
  )
}

export default ResumePage
