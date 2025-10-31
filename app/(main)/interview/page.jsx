import React from 'react'
import { getAssessments } from '@/actions/interview';
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import StatsCards from './_components/stats-cards';
import PerformanceChart from './_components/performance-chart';
import QuizList from './_components/quiz-list';

const InterviewPage = async () => {
  // Check onboarding status - must complete before accessing interview features
  const { isOnboarded } = await getUserOnboardingStatus();
  
  if (!isOnboarded) {
    redirect("/onboarding");
  }

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