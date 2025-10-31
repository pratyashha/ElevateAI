"use server";

import { auth } from "@clerk/nextjs/server";
import db from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

export async function generateQuiz(){
  const {userId} = await auth();
  if(!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: {
        clerkUserId: userId,
    }
  });

  if(!user) throw new Error("User not found");

  try {
  const prompt = `
Generate a list of 10 interview questions for the following job title: ${user.industry} professionals${user.skills && user.skills.length ? ` with expertise in ${user.skills.join(", ")}` : ""}.

Each question should be multiple choice with 4 options.
Return the response in the JSON format only without any additional notes or text:
{
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string",
      "explanation": "string"
    }
  ]
}
`;

const result = await model.generateContent(prompt);

const text = result.response.text();

const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
const quiz = JSON.parse(cleanedText);

return quiz.questions
} catch (error) {
  console.error("Error generating quiz:", error);
  throw new Error("Failed to generate quiz");   
}   
}

export async function saveQuizResult(questions, answers, score){
  const {userId} = await auth();
  if(!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: {
        clerkUserId: userId,
    }
  });
  if(!user) throw new Error("User not found");

  const questionResults = questions.map((question, index) => ({
    question: question.question,
    answer: question.correctAnswer,
    userAnswer: answers[index],
    isCorrect: question.correctAnswer === answers[index],
    explanation: question.explanation,
  }));

  const wrongAnswers = questionResults.filter((question) => !question.isCorrect);

  let improvementTip = null;

  if(wrongAnswers.length > 0){
    const wrongQuestionsText = wrongAnswers.map((question) => `${question.question}"\nCorrect Answers: ${question.answer}"\nUser Answer: ${question.userAnswer}`).join("\n\n");

    const improvementPrompt = `
    The user got the following ${user.industry} interview questions wrong:

    ${wrongQuestionsText}
    Based on these mistakes, provide a concise, specific improvement tip.
    Focus on the knowledge gaps revealed by these wrong answers and skills the user needs to improve.
    Keep the response under 2 sentences and make it encouraging.
    Dont ecplicitly mention the mistakes, just focus on the improvement, learning and practice.
    
    `;

    try{
    const result = await model.generateContent(improvementPrompt);
    improvementTip = result.response.text().trim();
    } catch (error) {
      console.error("Error generating improvement tip:", error);
    }
    }

    try{
        const assessment = await db.assessment.create({
            data: {
                userId : user.id,
                quizScore : score,
                questions : questionResults,
                category:"Technical",
               improvementTip,
            },
        });
        return assessment;
    } catch (error) {
        console.error("Error saving quiz result:", error);
        throw new Error("Failed to save quiz result");
    }
}

export async function getAssessments() {
  const {userId} = await auth();
  if(!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: {
        clerkUserId: userId,
    }
  });
  if(!user) throw new Error("User not found");

  try{
    const assessments = await db.assessment.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return assessments;
  } catch (error) {
    console.error("Error getting assessments:", error);
    throw new Error("Failed to get assessments");
  }

}