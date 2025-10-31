"use server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY || process.env.GENAI_API_KEY,
);
const model = genAI.getGenerativeModel({model: "gemini-2.5-flash"});

export async function saveResume(content){
    try {
        const { userId } = await auth();
        if (!userId) {
            throw new Error('Unauthorized');
        }

        // If DB URL is not configured, fail gracefully with a clear message
        if (!process.env.DATABASE_URL) {
            console.error('DATABASE_URL is not set; cannot save resume.');
            throw new Error('Database connection not configured. Please check your environment variables.');
        }

        const user = await prisma.user.findUnique({
            where: { clerkUserId: userId },
        });
        if (!user) {
            throw new Error('User not found. Please complete your profile setup first.');
        }

        const resume = await prisma.resume.upsert({
            where: { userId: user.id },
            update: { content: content },
            create: { content: content, userId: user.id },
        });

        return resume;
    } catch (error) {
        console.error('Error saving resume:', error?.message || error);
        // Re-throw with a user-friendly message
        const message = error?.message || 'Failed to save resume. Please check your database connection.';
        throw new Error(message);
    }
}

export async function getResume(){
    try {
        const { userId } = await auth();
        if (!userId) {
            return null;
        }

        // If DB URL is not configured, skip DB access gracefully
        if (!process.env.DATABASE_URL) {
            console.warn('DATABASE_URL is not set; returning empty resume.');
            return null;
        }

        const user = await prisma.user.findUnique({
            where: { clerkUserId: userId },
        });
        if (!user) {
            return null;
        }

        return await prisma.resume.findUnique({
            where: { userId: user.id },
        });
    } catch (error) {
        console.error('getResume fallback due to DB error:', error?.message || error);
        // Return null so the page renders without crashing when DB is unreachable
        return null;
    }
}

export async function improveWithAI({current, type}){
    const {userId} = await auth();
    if(!userId){
        throw new Error('Unauthorized');
    }
    const user = await prisma.user.findUnique({
        where: {
            clerkUserId: userId
        },
        include: {
            industryInsights: true
        }
    })
    if(!user){
        throw new Error('User not found');
    }

    const prompt = `
    As an expert resume writer, improve the following ${type} description for a ${user.industry} professional.
    Make it more impactful, quantifiable, and ATS-friendly and also aligning with the industry standards and best practices.
    Current content: "${current}"

    Requirements:
    1. Use action verbs
    2. Use specific numbers and metrics where poossible
    3. Highlight relevant technical skills and tools
    4. Use bullet points for better readability
    5. Keep it concise and to the point
    6. Use the same language and tone as the current content
    7. Focus on results and achievements rather than just responsibilities
    8. Use industry Specific Keywords
    9. Do not add any new information that is not relevant to the role
    `;

    try{
        const result = await model.generateContent(prompt);
        const improvedContent = result.response.text().trim();
        return improvedContent;
    } catch (error) {
        console.error('Error improving resume:', error.message);
        throw new Error(error.message);
    }
}