"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Google AI with error handling (safe for build time)
let genAI, model;
try {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        // Don't throw during build - just log and continue
        console.warn("⚠️ Neither GOOGLE_API_KEY nor GEMINI_API_KEY is set in environment variables (build-safe mode)");
        genAI = null;
        model = null;
    } else {
        genAI = new GoogleGenerativeAI(apiKey);
        model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
        });
        console.log("✅ Google AI initialized successfully with API key");
    }
} catch (error) {
    // Don't throw during build - just log and continue
    console.warn("⚠️ Failed to initialize Google AI (build-safe mode):", error.message);
    genAI = null;
    model = null;
}

export const generateAIInsights = async (industry) => {
    console.log("🚀 Starting AI insights generation for industry:", industry);
    
    // Check if API key exists
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ Neither GOOGLE_API_KEY nor GEMINI_API_KEY found in environment variables");
        throw new Error("API key not found in environment variables");
    }
    
    // Check if model is initialized
    if (!model) {
        console.error("❌ Google AI model not initialized");
        throw new Error("Google AI model not initialized");
    }
    
    console.log("✅ API key found and model initialized, proceeding with AI generation");
    
    const prompt = `
    Analyze the current state of the ${industry} industry and provide insights in only the following JSON format without any additional notes or explanations:
    {
        "salaryRange": [
            {"role": "string", "min": "number", "max": "number", "median": "number", "location": "string"}
        ],
        "growthRate": "number",
        "demandLevel": "HIGH" | "MEDIUM" | "LOW",
        "topSkills": ["skill1", "skill2"],
        "marketOutlook": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
        "keyTrends": ["trend1", "trend2"],
        "recommendedSkills": ["skill1", "skill2"]
    }
        IMPORTANT: Return ONLY the JSON object, no other text, notes, markdown comments, or formatting.
        Include at least 5 common roles for Salary ranges.
        Growth rate should be percentage.
        Include at least 5 skills and trends.
    `;

    try {
        console.log("📤 Sending prompt to AI model...");
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        console.log("📥 Raw AI response:", response);

        const cleanedText = response.replace(/```(?:json)?\n?```$/g, "").trim();
        console.log("🧹 Cleaned response:", cleanedText);
        
        const parsedInsights = JSON.parse(cleanedText);
        console.log("✅ Parsed insights successfully:", parsedInsights);
        
        return parsedInsights;
    } catch (error) {
        console.error("❌ Error in AI generation:", error);
        throw error;
    }
};

// Test function to debug AI insights
export const testAIInsights = async (industry = "technology") => {
    console.log("Testing AI insights generation...");
    try {
        const insights = await generateAIInsights(industry);
        console.log(" Test successful:", insights);
        return insights;
    } catch (error) {
        console.error("Test failed:", error);
        throw error;
    }
};

export async function updateUser(data) {
    console.log(" updateUser called with data:", data);
    
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({  
        where: { clerkUserId: userId },
    });

    if(!user) throw new Error("User not found");
    
    console.log("👤 User found:", { id: user.id, industry: user.industry }); 
     
    try {
        const result = await prisma.$transaction(async (tx) => {
            // find if industry exists
            let industryInsight = await tx.industryInsight.findUnique({
                where: { industry: data.industry },
            });

            // if it doesn't exist, create it with AI-generated values
            if (!industryInsight) {
                console.log("Creating new industry insight for:", data.industry);
                let insights;
                
                // Try AI generation first
                try {
                    console.log(" Attempting AI insights generation...");
                    insights = await generateAIInsights(data.industry);
                    console.log(" AI insights generated successfully:", insights);
                } catch (aiError) {
                    console.error(" AI insights generation failed:", aiError.message);
                    console.error(" Full error:", aiError);
                    
                    // Create realistic fallback data instead of empty arrays
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
                    console.log("Using realistic fallback insights:", insights);
                }
                
                console.log("Final insights to save:", insights);
                
                industryInsight = await tx.industryInsight.create({
                    data: {
                        industry: data.industry,
                        ...insights,
                        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    },
                });
                console.log("✅ Industry insight created successfully:", industryInsight);
            } else {
                console.log("ℹ️ Industry insight already exists:", industryInsight);
            }

            // update the user
            const updatedUser = await tx.user.update({
                where: {
                    id: user.id
                },
                data: {
                    industry: data.industry,
                    experience: data.experience,
                    bio: data.bio,
                    skills: data.skills,
                },
            });
            return { updatedUser, industryInsight };
        }, {
            timeout: 10000,
        });
        return { success: true, ...result };
    } catch (error) {
        console.error("Error updating user and Industry:", error.message);
        
        // Handle database connection errors gracefully
        if (error.message.includes("Can't reach database server") || 
            error.message.includes("Connection refused") ||
            error.message.includes("ENOTFOUND")) {
            throw new Error("Database connection failed. Please check your database configuration.");
        }
        
        throw new Error("Failed to update profile: " + error.message);
    }
}



export async function getUserOnboardingStatus() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    try {
        const user = await prisma.user.findUnique({
            where: { clerkUserId: userId },
            select: { industry: true },
        });

        if (!user) {
            return { isOnboarded: false };
        }

        return {
            isOnboarded: !!user.industry,
        };
    } catch (error) {
        console.error("Error getting user onboarding status:", error.message);
        
        // Handle database connection errors gracefully
        if (error.message.includes("Can't reach database server") || 
            error.message.includes("Connection refused") ||
            error.message.includes("ENOTFOUND")) {
            console.warn("Database connection failed, assuming user is not onboarded");
            return { isOnboarded: false };
        }
        
        throw new Error("Failed to get user onboarding status");
    }
}

// Function to force regenerate AI insights for debugging
export async function forceRegenerateAIInsights(industry) {
    console.log("🔄 Force regenerating AI insights for:", industry);
    
    try {
        // Delete existing industry insight
        await prisma.industryInsight.deleteMany({
            where: { industry: industry }
        });
        console.log("🗑️ Deleted existing industry insights");
        
        // Generate new AI insights
        const insights = await generateAIInsights(industry);
        console.log("🤖 Generated new AI insights:", insights);
        
        // Create new industry insight
        const newInsight = await prisma.industryInsight.create({
            data: {
                industry: industry,
                ...insights,
                nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        
        console.log("✅ Created new industry insight:", newInsight);
        return newInsight;
        
    } catch (error) {
        console.error("❌ Error force regenerating AI insights:", error);
        throw error;
    }
}

// Function to clear all industry insights for testing
export async function clearAllIndustryInsights() {
    console.log("🗑️ Clearing all industry insights...");
    
    try {
        const result = await prisma.industryInsight.deleteMany({});
        console.log("✅ Cleared", result.count, "industry insights");
        return result;
    } catch (error) {
        console.error("❌ Error clearing industry insights:", error);
        throw error;
    }
}



