import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Trophy, Brain } from 'lucide-react';

const StatsCards = ({ assessments }) => {
  // Handle undefined or null assessments
  if (!assessments || !Array.isArray(assessments)) {
    assessments = [];
  }

  const getAverageScore = () => {
    if(!assessments.length) return 0;
    const total = assessments.reduce((sum, assessment) => sum + (assessment.quizScore || 0), 0);
    return (total / assessments.length).toFixed(1);
  };

  const getLatestAssessment = () => {
    if(!assessments.length) return null;
    return assessments[0];
  };

  const getTotalQuestions = () => {
    if(!assessments.length) return 0;
    return assessments.reduce((sum, assessment) => sum + (assessment.questions?.length || 0), 0);
  };

  const getTotalCorrectAnswers = () => {
    if(!assessments.length) return 0;
    const total = assessments.reduce((sum, assessment) => 
      sum + (assessment.questions?.filter((question) => question.isCorrect).length || 0), 0);
    return total;
  };

  return (
    <div className='grid md:grid-cols-3 gap-4'>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getAverageScore()}%</div>
          <p className="text-xs text-muted-foreground">Across all assessments</p>
        </CardContent>            
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Questions Practiced</CardTitle>
          <Brain className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getTotalQuestions()}</div>
          <p className="text-xs text-muted-foreground">Total Questions</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Latest Score</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {getLatestAssessment() ? `${getLatestAssessment().quizScore?.toFixed(1) || '0.0'}%` : 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground">Your most recent attempt</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;