import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, ArrowLeft } from 'lucide-react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const QuizResult = ({ result, hideStartNew = false, onStartNew }) => {
  if (!result) {
    return (
      null
    );
  }

  return (
    <div className="w-full">
      <Card className="shadow-lg border-0">
        <CardContent className="space-y-4 p-4 sm:p-6 lg:p-8">
            {/* Header with trophy */}
            <div className="text-center">
              <h1 className='flex items-center justify-center gap-2 text-2xl sm:text-3xl lg:text-4xl font-bold mb-2'>
                <Trophy className='h-6 w-6 sm:h-8 sm:w-8 text-yellow-500' />
                Quiz Complete!
              </h1>
            </div>

            {/* Score overview */}
            <div className="text-center space-y-4">
              <div>
                <h3 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-2'>
                  Score:{result.quizScore?.toFixed(1) || 0}%
                </h3>
                <Progress value={result.quizScore || 0} className='w-full h-2 sm:h-3' />
              </div>
            </div>

            {/* Improvement tip */}
            {result.improvementTip && (
              <div className='bg-muted p-3 sm:p-4 lg:p-6 rounded-lg'>
                <p className='font-medium mb-2 text-sm sm:text-base'>💡 Improvement Tip:</p>
                <p className='text-muted-foreground text-sm sm:text-base'>{result.improvementTip}</p>
              </div>
            )}

            {/* Question wise explanation */}
            <div className='space-y-3 sm:space-y-4'>
              <h3 className='text-base sm:text-lg lg:text-xl font-semibold'>Question Review</h3>
              {result.questions?.map((question, index) => (
                <div key={index} className='border p-3 sm:p-4 lg:p-6 rounded-lg space-y-3'>
                  <div className='flex items-start justify-between gap-2'>
                    <p className='font-medium text-xs sm:text-sm lg:text-base flex-1'>{question.question}</p>
                    {question.isCorrect ? (
                      <CheckCircle2 className='h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0 mt-0.5' />
                    ) : (
                      <XCircle className='h-4 w-4 sm:h-5 sm:w-5 text-red-500 shrink-0 mt-0.5' />
                    )}
                  </div>

                  <div className='text-xs sm:text-sm text-muted-foreground space-y-1'>
                    <p><strong>Your Answer:</strong> {question.userAnswer}</p>
                    {!question.isCorrect && (
                      <p><strong>Correct Answer:</strong> {question.answer}</p>
                    )}
                  </div>

                  <div className='text-xs sm:text-sm bg-muted p-2 sm:p-3 rounded'>
                    <p className='font-medium mb-1'>Explanation:</p>
                    <p>{question.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
        </CardContent>
        
          {!hideStartNew && (
            <CardFooter className="p-4 sm:p-6 lg:p-8 pt-0">
              <Button onClick={onStartNew} className='w-full h-10 sm:h-12 text-sm sm:text-base'>
                <ArrowLeft className='h-4 w-4 mr-2' />
                Start New Quiz
              </Button>
            </CardFooter>
          )}
        </Card>
    </div>
  );
};

export default QuizResult;