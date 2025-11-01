import React from 'react'
import { getAssessments } from '@/actions/interview';
import { requireOnboarding } from "@/lib/onboarding-check";
import StatsCards from './_components/stats-cards';
import PerformanceChart from './_components/performance-chart';
import QuizList from './_components/quiz-list';

// Force dynamic rendering - this page uses auth headers
export const dynamic = 'force-dynamic';

const InterviewPage = async () => {
  // Check onboarding status - redirects if not onboarded
  await requireOnboarding();

  const assessments = await getAssessments();

  return (
    <>
      <StatsCards assessments={assessments}/>
      
      <div className='mt-8'>
        <PerformanceChart assessments={assessments}/>
      </div>
      
      <div className='mt-8'>
        <QuizList assessments={assessments}/>
      </div>
    </>
  )
}

export default InterviewPage