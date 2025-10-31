"use client";

import React, { useState } from 'react';
import { generateQuiz, saveQuizResult } from '@/actions/interview';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarLoader } from 'react-spinners';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import QuizResult from './quiz-result';
import { Loader2 } from 'lucide-react';

const Quiz = () => {
  // ===== STATE MANAGEMENT =====
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savingResult, setSavingResult] = useState(false);
  const [resultData, setResultData] = useState(null);

  // ===== QUIZ INITIALIZATION =====
  const startQuiz = async () => {
    setLoading(true);
    try {
      const questions = await generateQuiz();
      setQuizData(questions);
      setAnswers(new Array(questions.length).fill(null));
      setCurrentQuestion(0);
      setShowExplanation(false);
      setResultData(null);
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast.error('Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ===== QUIZ RESET FUNCTION =====
  const startNewQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowExplanation(false);
    setQuizData(null);
    setResultData(null);
  };

  // ===== ANSWER HANDLING =====
  const handleAnswer = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  // ===== NAVIGATION FUNCTIONS =====
  const handleNext = () => {
    if(currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };

  // ===== SCORE CALCULATION =====
  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if(answer === quizData[index].correctAnswer) {
        correct++;
      }
    });
    return (correct / quizData.length) * 100;
  };

  // ===== QUIZ COMPLETION =====
  const finishQuiz = async () => {
    setSavingResult(true);
    try {
      const score = calculateScore();
      const result = await saveQuizResult(quizData, answers, score);
      setResultData(result);
      toast.success("Quiz finished and saved");
    } catch (error) {
      toast.error("Error saving quiz result: " + error.message);
    } finally {
      setSavingResult(false);
    }
  };

  // ===== RENDER CONDITIONS =====
  if(loading) {
    return <BarLoader className="mt-4" width="100%" color="gray" />
  }

  if(resultData) {
    return (
      <div>
        <QuizResult result={resultData} onStartNew={startNewQuiz}/>
      </div>
    )
  }

  if(!quizData) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Ready to test your knowledge?</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className='text-muted-foreground'>
            This quiz contains 10 specific questions based on your industry and skills. Take your time to answer each question.
          </p>
        </CardContent>
        <CardFooter>
          <Button className='w-full' onClick={startQuiz}>
            Start Quiz
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // ===== QUIZ INTERFACE RENDER =====
  const quizQuestion = quizData[currentQuestion];

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>
          Question {currentQuestion + 1} of {quizData.length}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <p className='text-lg font-medium mb-4 text-center'>
          {quizQuestion.question}
        </p>

        <RadioGroup 
          className='space-y-2'
          onValueChange={handleAnswer}
          value={answers[currentQuestion] || ""} 
        >
          {quizQuestion.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`}>{option}</Label>
            </div>
          ))}
        </RadioGroup>

        {showExplanation && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-lg font-medium mb-2">Explanation</p>
            <p className="text-muted-foreground">{quizQuestion.explanation}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {!showExplanation && (
          <Button 
            variant="outline" 
            onClick={() => setShowExplanation(true)}
            disabled={!answers[currentQuestion]}
          >
            Show Explanation
          </Button>
        )}
        <Button 
          onClick={handleNext}
          variant="outline"
          disabled={!answers[currentQuestion] || savingResult}
        >
          {savingResult ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            currentQuestion < quizData.length - 1 ? "Next Question" : 'Finish Quiz'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Quiz;