import React from 'react'
import { getAssessments } from '@/actions/interview';
import StatsCards from './_components/stats-cards';
import PerformanceChart from './_components/performance-chart';
import QuizList from './_components/quiz-list';

const InterviewPage = async () => {

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