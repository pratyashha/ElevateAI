"use client"
import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Trophy, TrendingUp, BookOpen, Lightbulb } from 'lucide-react';
import QuizResult from './quiz-result';

const QuizList = ({ assessments }) => {
  const router = useRouter();
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  // Handle undefined or null assessments
  if (!assessments || !Array.isArray(assessments) || assessments.length === 0) {
    return (
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle className='text-3xl md:text-4xl gradient-title'>Recent Quizzes</CardTitle>
            <CardDescription>Track your quiz performance over time</CardDescription>
          </div>
          <Button onClick={() => router.push('/interview/mock')}>
            Start a New Quiz
          </Button>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8 text-muted-foreground'>
            No quiz attempts yet. Start your first quiz to see your results here.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
          <div>
            <CardTitle className='text-3xl md:text-4xl gradient-title mb-2'>Recent Quizzes</CardTitle>
            <CardDescription>Track your quiz performance over time</CardDescription>
          </div>
          <Button onClick={() => router.push('/interview/mock')}>
            Start a New Quiz
          </Button>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {assessments.map((assessment, index) => {
              const correctAnswers = assessment.questions?.filter(q => q.isCorrect).length || 0;
              const totalQuestions = assessment.questions?.length || 0;
              const score = assessment.quizScore || 0;
              const ScoreIcon = score >= 80 ? Trophy : score >= 60 ? TrendingUp : BookOpen;
              const iconColor = score >= 80 ? 'text-yellow-500' : score >= 60 ? 'text-green-500' : 'text-blue-500';
              
              return (
                <Card 
                  key={assessment.id}
                  className="cursor-pointer hover:bg-muted/50 transition-all hover:shadow-md" 
                  onClick={() => setSelectedQuiz(assessment)}
                >
                  <CardHeader className='pb-3'>
                    <div className='flex items-start justify-between mb-2'>
                      <CardTitle className='text-lg font-semibold flex items-center gap-2'>
                        <ScoreIcon className={`h-5 w-5 ${iconColor}`} />
                        Quiz {index + 1}
                      </CardTitle>
                      <span className='text-2xl font-bold text-primary'>
                        {(assessment.quizScore || 0).toFixed(0)}%
                      </span>
                    </div>
                    <div className='space-y-2'>
                      <CardDescription className='flex flex-col gap-1'>
                        <div className='flex items-center justify-between text-sm'>
                          <span className='text-muted-foreground'>Date:</span>
                          <span className='font-medium'>{format(new Date(assessment.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                        </div>
                        <div className='flex items-center justify-between text-sm'>
                          <span className='text-muted-foreground'>Questions:</span>
                          <span className='font-medium'>{correctAnswers} / {totalQuestions} correct</span>
                        </div>
                        {assessment.improvementTip && (
                          <div className='bg-muted/50 p-2 rounded mt-2 flex items-start gap-2'>
                            <Lightbulb className='h-4 w-4 text-yellow-500 shrink-0 mt-0.5' />
                            <p className='text-xs text-muted-foreground line-clamp-2'>
                              {assessment.improvementTip}
                            </p>
                          </div>
                        )}
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dialog for quiz details */}
      <Dialog open={!!selectedQuiz} onOpenChange={(open) => !open && setSelectedQuiz(null)}>
        <DialogContent className='max-w-[90vw] max-h-[90vh] overflow-y-auto p-0'>
          <div className='p-6'>
            <DialogHeader className='mb-4'>
              <DialogTitle className='text-2xl'>Quiz Details</DialogTitle>
            </DialogHeader>
            <QuizResult
              result={selectedQuiz}
              onStartNew={() => router.push('/interview/mock')}
              hideStartNew
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuizList;