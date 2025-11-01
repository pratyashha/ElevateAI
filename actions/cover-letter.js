"use server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateCoverLetter({ companyName, jobTitle, jobDescription, contactInfo = {} }){
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            throw new Error('Unauthorized');
        }

        // Check if API key is configured
        const apiKey = process.env.GEMINI_API_KEY || process.env.GENAI_API_KEY;
        if (!apiKey) {
            throw new Error('AI service is not configured. Please contact support or check your environment variables.');
        }

        // Initialize AI model
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({model: "gemini-2.5-flash"});

        // Get user data for personalization
        let userData = null;
        try {
            if (process.env.DATABASE_URL) {
                const user = await prisma.user.findUnique({
                    where: { clerkUserId: clerkUserId },
                    include: {
                        resume: true
                    }
                });
                if (user) {
                    userData = user;
                }
            }
        } catch (dbError) {
            console.warn('Could not fetch user data for personalization:', dbError);
        }

        // Build personalized prompt
        const resumeContent = userData?.resume?.content 
            ? JSON.parse(userData.resume.content) 
            : null;

        // Build contact information header
        const contactLines = [];
        if (contactInfo.fullName) contactLines.push(contactInfo.fullName);
        if (contactInfo.location) contactLines.push(contactInfo.location);
        if (contactInfo.phone) contactLines.push(contactInfo.phone);
        if (contactInfo.email) contactLines.push(contactInfo.email);
        if (contactInfo.linkedIn) contactLines.push(contactInfo.linkedIn);
        
        const contactHeader = contactLines.length > 0 
            ? contactLines.join('\n') 
            : '';

        // Get current date in proper format
        const currentDate = new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        const userInfo = userData 
            ? `Applicant Name: ${contactInfo.fullName || userData.fullName || 'Professional'}\n` +
              `Industry: ${userData.industry || 'Professional'}\n` +
              `Experience: ${userData.experience || 'Experienced'} years\n` +
              (resumeContent?.summary ? `Professional Summary: ${resumeContent.summary}\n` : '') +
              (resumeContent?.skills ? `Key Skills: ${resumeContent.skills}\n` : '')
            : '';

        const prompt = `
Write a professional, compelling cover letter for the following job application:

Company Name: ${companyName}
Job Title: ${jobTitle}
Job Description:
${jobDescription}

${contactHeader ? `Contact Information (include these at the top, each on a separate line):\n${contactHeader}\n` : ''}

${userInfo ? `\nApplicant Background:\n${userInfo}` : ''}

Requirements:
1. Start the cover letter with the sender's contact information at the top, formatted EXACTLY as follows (each on its own line):
   ${contactInfo.fullName || '[Full Name]'}
   ${contactInfo.location || '[Location]'}
   ${contactInfo.phone || '[Phone]'}
   ${contactInfo.email || '[Email]'}
   ${contactInfo.linkedIn ? contactInfo.linkedIn : ''}
   
   IMPORTANT: Each piece of contact information MUST be on a separate line. Do NOT combine them on one line.
   
2. Add the current date below the contact information, on its own line. Use this exact date: ${currentDate}
   DO NOT use placeholders like [Current Date] or [Date]. Use the actual date provided: ${currentDate}
   
3. Add the recipient information below the date:
   - "Hiring Manager" (on one line)
   - "${companyName}" (on the next line, company name only)
   - DO NOT include company address or any placeholder text about address. If company address is not provided, only show the company name.
   - DO NOT write "[Company Address - Not provided, so omitted for accuracy]" or any similar placeholder text.
   
4. Address the letter to the hiring manager (use "Dear Hiring Manager,")
5. Open with a strong hook that demonstrates enthusiasm for the role
6. Show how the candidate's skills and experience align with the job requirements
7. Highlight 2-3 key qualifications that match the job description
8. Express genuine interest in the company and position
9. Close professionally with a call to action
10. Keep it between 250-400 words
11. Use professional, confident language
12. Tailor content specifically to this company and role
13. Format it as a proper business letter with proper spacing

CRITICAL FORMATTING REQUIREMENTS:
- Contact information MUST be on separate lines, NOT combined on one line
- Use the actual current date: ${currentDate} (not [Current Date] or any placeholder)
- Only show company name in recipient section, NO address placeholder text
- Do NOT use any placeholders like [Your Name], [Company Address], etc. Use only actual provided information

Generate the cover letter now:
        `.trim();

        const result = await model.generateContent(prompt);
        const coverLetter = result.response.text().trim();
        
        return coverLetter;
    } catch (error) {
        console.error('Error generating cover letter:', error);
        
        const errorMessage = error?.message || String(error || 'Unknown error');
        
        // Handle specific API key errors
        if (
            errorMessage.includes('API key not valid') || 
            errorMessage.includes('API_KEY_INVALID') ||
            errorMessage.includes('API key not valid') ||
            error?.cause?.message?.includes('API key')
        ) {
            throw new Error('Invalid AI API key configured. Please check your GEMINI_API_KEY or GENAI_API_KEY environment variable.');
        }
        
        // Handle network/API errors
        if (errorMessage.includes('fetching') || errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED')) {
            throw new Error('Unable to reach AI service. Please check your internet connection and try again.');
        }
        
        // Handle quota/rate limit errors
        if (errorMessage.includes('quota') || errorMessage.includes('rate limit') || errorMessage.includes('429')) {
            throw new Error('AI service quota exceeded. Please try again later.');
        }
        
        // Generic error message - show a user-friendly message
        throw new Error('Failed to generate cover letter. Please ensure your AI API key is correctly configured and try again.');
    }
}

export async function saveCoverLetter({ companyName, jobTitle, jobDescription, coverLetter }){
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            throw new Error('Unauthorized');
        }

        if (!process.env.DATABASE_URL) {
            throw new Error('Database connection not configured. Please check your environment variables.');
        }

        const user = await prisma.user.findUnique({
            where: { clerkUserId: clerkUserId },
        });
        if (!user) {
            throw new Error('User not found. Please complete your profile setup first.');
        }

        // Note: You may need to create a CoverLetter model in Prisma schema
        // For now, we'll just return success
        // You can implement actual saving later if needed
        
        return { success: true };
    } catch (error) {
        console.error('Error saving cover letter:', error?.message || error);
        throw new Error(error?.message || 'Failed to save cover letter.');
    }
}

