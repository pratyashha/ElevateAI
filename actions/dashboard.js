"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { industries } from "@/data/industries";

// Initialize AI model
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-2.5-flash" }) : null;

const generateAIInsights = async (industry, subIndustry = null, userSkills = [], retries = 3) => {
    if (!apiKey || !model) {
        throw new Error("AI service is not configured. Please check your API keys.");
    }

    // Parse industry if it contains sub-industry (format: "tech-software-development")
    let mainIndustryId = industry;
    let actualSubIndustry = subIndustry;
    
    if (industry.includes('-') && !subIndustry) {
        const parts = industry.split('-');
        mainIndustryId = parts[0];
        actualSubIndustry = parts.slice(1).join(' ').replace(/-/g, ' ');
    }
    
    // Map industry ID to industry name
    const industryObj = industries.find(ind => ind.id === mainIndustryId);
    const mainIndustryName = industryObj ? industryObj.name : mainIndustryId;
    
    // Build industry description
    const industryDescription = actualSubIndustry 
        ? `${mainIndustryName} industry, specifically in ${actualSubIndustry}`
        : `${mainIndustryName} industry`;
    
    // Build user skills context
    const skillsContext = userSkills && userSkills.length > 0
        ? ` The user has the following skills: ${userSkills.join(', ')}. Consider these when generating recommended skills.`
        : '';

    const prompt = `
    Analyze the current state of the ${industryDescription} in India and provide insights in only the following JSON format without any additional notes or explanations:
    {
        "salaryRange": [
            {"role": "string", "min": number, "max": number, "median": number, "location": "string"}
        ],
        "growthRate": number,
        "demandLevel": "HIGH" | "MEDIUM" | "LOW",
        "topSkills": ["skill1", "skill2"],
        "marketOutlook": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
        "keyTrends": ["trend1", "trend2"],
        "recommendedSkills": ["skill1", "skill2"]
    }
    IMPORTANT: Return ONLY the JSON object, no other text, notes, markdown comments, or formatting.
    - Focus specifically on ${actualSubIndustry ? actualSubIndustry : mainIndustryName} roles and requirements.
    - Generate topSkills based specifically on ${industryDescription}. Include skills that are most relevant and in-demand for this specific industry${actualSubIndustry ? ' and sub-industry' : ''}.
    - Include at least 5-7 common roles for Salary ranges specific to ${industryDescription}.
    - Salary amounts should be in Indian Rupees (INR). Use annual salary figures typical for Indian market.
    - For example: Entry level roles: 3-8 Lakhs (300000-800000), Mid level: 8-15 Lakhs (800000-1500000), Senior: 15-30 Lakhs (1500000-3000000).
    - Growth rate should be a percentage number (e.g., 15 for 15%).
    - Include at least 5-7 top skills and trends specific to ${industryDescription}.
    - Location should be Indian cities like "Bangalore", "Mumbai", "Delhi", "Hyderabad", "Pune", "Remote" etc.${skillsContext}
    - Recommended skills should complement the user's existing skills and align with ${industryDescription} requirements.
    `;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const result = await model.generateContent(prompt);
            const response = result.response.text();
            const cleanedText = response.replace(/```(?:json)?\n?/g, "").replace(/```$/g, "").trim();
            const parsedInsights = JSON.parse(cleanedText);
            
            // Validate and ensure proper data structure
            return {
                salaryRange: parsedInsights.salaryRange || [],
                growthRate: parsedInsights.growthRate || 0,
                demandLevel: (parsedInsights.demandLevel || "MEDIUM").toUpperCase(),
                topSkills: parsedInsights.topSkills || [],
                marketOutlook: (parsedInsights.marketOutlook || "NEUTRAL").toUpperCase(),
                keyTrends: parsedInsights.keyTrends || [],
                recommendedSkills: parsedInsights.recommendedSkills || [],
            };
        } catch (error) {
            const isTransientError = error?.message?.includes("503") || 
                                   error?.message?.includes("overloaded") ||
                                   error?.message?.includes("429") ||
                                   error?.message?.includes("Service Unavailable");
            
            if (isTransientError && attempt < retries) {
                const waitTime = attempt * 1000; // Exponential backoff: 1s, 2s, 3s
                console.log(`⚠️ AI API overloaded (attempt ${attempt}/${retries}), retrying in ${waitTime}ms...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }
            
            console.error(`Error generating AI insights (attempt ${attempt}/${retries}):`, error?.message || error);
            throw error;
        }
    }
};

export async function getIndustryInsights() {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) throw new Error("Unauthorized");

    try {
        // Get user's industry and skills - CRITICAL: Must verify this is the correct user
        let user;
        try {
            user = await prisma.user.findUnique({
                where: { clerkUserId: clerkUserId },
                select: { industry: true, skills: true }
            });
        } catch (dbError) {
            console.error("Database query failed for user:", clerkUserId, dbError.message);
            throw new Error("Unable to fetch user data. Please try again.");
        }
        
        // If user doesn't exist, they need to complete onboarding first
        if (!user) {
            throw new Error("User not found. Please complete onboarding.");
        }
        
        // If user hasn't set their industry, they need to complete onboarding
        if (!user.industry) {
            throw new Error("Industry not set. Please complete onboarding.");
        }
        
        const industry = user.industry;
        const userSkills = user.skills || [];
        
        // Parse industry and sub-industry
        let mainIndustryId = industry;
        let subIndustry = null;
        
        // Check if industry contains sub-industry (format: "tech-software-development")
        if (industry.includes('-')) {
            const parts = industry.split('-');
            mainIndustryId = parts[0];
            subIndustry = parts.slice(1).join(' ').replace(/-/g, ' ');
        }
        
        // Check for cached data first
        let cachedInsight = null;
        try {
            cachedInsight = await prisma.industryInsight.findUnique({
                where: { industry }
            });
        } catch (dbError) {
            console.warn("Could not fetch cached insights:", dbError.message);
        }
        
        // Check if cached data is still fresh (less than 7 days old)
        const CACHE_DURATION_DAYS = 7;
        
        if (cachedInsight && cachedInsight.lastUpdated) {
            const cacheAge = Date.now() - new Date(cachedInsight.lastUpdated).getTime();
            const daysSinceUpdate = cacheAge / (1000 * 60 * 60 * 24);
            
            if (daysSinceUpdate < CACHE_DURATION_DAYS) {
                console.log(`📦 Using cached insights (${Math.round(daysSinceUpdate * 10) / 10} days old, fresh until ${CACHE_DURATION_DAYS} days)`);
                // Return cached data with its original dates
                return {
                    ...cachedInsight,
                    lastUpdated: cachedInsight.lastUpdated,
                    nextUpdate: cachedInsight.nextUpdate,
                    _fromCache: true,
                };
            } else {
                console.log(`🔄 Cached data expired (${Math.round(daysSinceUpdate * 10) / 10} days old), generating fresh insights`);
            }
        } else {
            console.log(`🔄 No cached data found, generating fresh insights`);
        }
        
        // Generate fresh AI insights (only if cache is expired or doesn't exist)
        console.log(`🔄 Generating fresh AI insights for industry: ${industry}, subIndustry: ${subIndustry}, userSkills: ${userSkills}`);
        let insights;
        let isFreshData = false;
        
        try {
            insights = await generateAIInsights(mainIndustryId, subIndustry, userSkills);
            console.log("✅ Fresh AI insights generated successfully");
            isFreshData = true;
        } catch (aiError) {
            console.error("❌ AI generation failed after retries:", aiError.message);
            
            // Use cached data even if expired (better than nothing)
            if (cachedInsight) {
                const cacheAge = Date.now() - new Date(cachedInsight.lastUpdated).getTime();
                const daysSinceUpdate = cacheAge / (1000 * 60 * 60 * 24);
                console.log(`⚠️ Using expired cached data (${Math.round(daysSinceUpdate * 10) / 10} days old) due to AI failure`);
                return {
                    ...cachedInsight,
                    _fromCache: true,
                    _expired: true,
                };
            }
            
            // Final fallback data if AI fails and no cache exists
            insights = {
                salaryRange: [
                    { role: "Software Developer", min: 60000, max: 120000, median: 85000, location: "Remote" },
                    { role: "Senior Developer", min: 90000, max: 150000, median: 120000, location: "Remote" },
                    { role: "Tech Lead", min: 120000, max: 180000, median: 150000, location: "Remote" }
                ],
                growthRate: 15,
                demandLevel: "HIGH",
                topSkills: ["JavaScript", "React", "Node.js", "Python", "AWS"],
                marketOutlook: "POSITIVE",
                keyTrends: ["Remote Work", "AI Integration", "Cloud Computing", "DevOps", "Microservices"],
                recommendedSkills: ["TypeScript", "Docker", "Kubernetes", "GraphQL", "Machine Learning"],
            };
        }
        
        // Try to update database with fresh insights (non-blocking)
        try {
            await prisma.industryInsight.upsert({
                where: { industry },
                update: {
                    ...insights,
                    lastUpdated: new Date(),
                    nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
                create: {
                    industry,
                    ...insights,
                    lastUpdated: new Date(),
                    nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
            });
        } catch (dbError) {
            console.warn("Database update failed (non-critical):", dbError.message);
            // Continue even if DB update fails
        }
        
        // Return fresh insights with metadata
        // Note: Database upsert happens above, but we return the data here
        const freshInsight = {
            id: industry,
            industry,
            ...insights,
            lastUpdated: new Date(),
            nextUpdate: new Date(Date.now() + CACHE_DURATION_DAYS * 24 * 60 * 60 * 1000),
        };
        
        return freshInsight;
        
    } catch (error) {
        console.error("Error getting industry insights:", error);
        
        // Re-throw user-related errors so they can be handled properly (e.g., redirect to onboarding)
        if (error.message.includes("User not found") || 
            error.message.includes("Industry not set") ||
            error.message.includes("Unable to fetch user data")) {
            throw error;
        }
        
        // Only return fallback for system/API errors, not user data issues
        throw new Error("Failed to load industry insights. Please try again later.");
    }
}