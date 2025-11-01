"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { industries } from "@/data/industries";

// Helper function to normalize enum values
function normalizeEnum(value, validValues, defaultValue) {
    if (!value) return defaultValue;
    const upperValue = String(value).toUpperCase();
    return validValues.includes(upperValue) ? upperValue : defaultValue;
}

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

export const generateAIInsights = async (industry, subIndustry = null, userSkills = []) => {
    console.log("🚀 Starting AI insights generation for industry:", industry, "subIndustry:", subIndustry, "userSkills:", userSkills);
    
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
    try {
        console.log(" updateUser called with data:", data);
        
        // Validate input data
        if (!data || typeof data !== 'object') {
            return { success: false, error: "Invalid data provided." };
        }
        
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: "Unauthorized - Please sign in to continue." };
        }

        // Get user details from Clerk
        const clerkUser = await currentUser();
        if (!clerkUser) {
            return { success: false, error: "User not found. Please sign in again." };
        }

        // Validate required data
        if (!data.industry || typeof data.industry !== 'string' || data.industry.trim() === '') {
            return { success: false, error: "Industry is required." };
        }

        // Clean and validate industry string
        const industry = data.industry.trim();
        if (industry.length === 0) {
            return { success: false, error: "Industry cannot be empty." };
        }
        
        // Ensure user exists - create if doesn't exist (for new signups)
        let user = await prisma.user.findUnique({  
            where: { clerkUserId: clerkUserId },
        });

        if (!user) {
            console.log("User not found, creating new user for:", clerkUserId);
            // Get user info from Clerk
            const email = clerkUser.emailAddresses[0]?.emailAddress;
            if (!email) {
                return { success: false, error: "Email address is required. Please ensure your account has a verified email." };
            }

            const name = clerkUser.fullName || clerkUser.firstName || "User";

            try {
                user = await prisma.user.create({
                    data: {
                        clerkUserId: clerkUserId,
                        name,
                        imageUrl: clerkUser.imageUrl || null,
                        email: email,
                        skills: [], // Initialize skills as empty array
                    },
                });
                console.log("✅ New user created:", user.id);
            } catch (createError) {
                // If user creation fails due to duplicate, try to fetch again
                const errorMsg = String(createError?.message || "");
                if (errorMsg.includes("Unique constraint") || errorMsg.includes("duplicate") || errorMsg.includes("P2002")) {
                    console.log("User might have been created concurrently, fetching...");
                    user = await prisma.user.findUnique({  
                        where: { clerkUserId: clerkUserId },
                    });
                    if (!user) {
                        return { success: false, error: "Failed to create user account. Please try again." };
                    }
                } else {
                    // Re-throw to be caught by outer catch
                    throw createError;
                }
            }
        }
        
        console.log("👤 User found:", { id: user.id, industry: user.industry }); 
         
        // Parse industry and sub-industry
        let mainIndustryId = industry;
        let subIndustry = null;
        
        // Check if industry contains sub-industry (format: "tech-software-development")
        if (industry.includes('-')) {
            const parts = industry.split('-');
            mainIndustryId = parts[0];
            subIndustry = parts.slice(1).join(' ').replace(/-/g, ' ');
        }
        
        // Parse user skills early to pass to AI
        let userSkillsArray = [];
        if (data.skills) {
            if (Array.isArray(data.skills)) {
                userSkillsArray = data.skills.filter(Boolean);
            } else if (typeof data.skills === 'string') {
                userSkillsArray = data.skills.split(',').map(s => s.trim()).filter(Boolean);
            }
        }
        
        const result = await prisma.$transaction(async (tx) => {
            // find if industry exists
            let industryInsight = await tx.industryInsight.findUnique({
                where: { industry: data.industry },
            });

            // if it doesn't exist, create it with AI-generated values
            if (!industryInsight) {
                console.log("Creating new industry insight for:", data.industry, "subIndustry:", subIndustry, "with user skills:", userSkillsArray);
                let insights;
                
                // Try AI generation first (with shorter timeout)
                try {
                    console.log(" Attempting AI insights generation...");
                    // Use Promise.race to timeout AI generation if it takes too long
                    const aiPromise = generateAIInsights(mainIndustryId, subIndustry, userSkillsArray);
                    const timeoutPromise = new Promise((_, reject) => 
                        setTimeout(() => reject(new Error("AI generation timeout")), 15000)
                    );
                    
                    const rawInsights = await Promise.race([aiPromise, timeoutPromise]);
                    
                    // Normalize and validate the AI insights to match database schema
                    insights = {
                        salaryRange: Array.isArray(rawInsights.salaryRange) 
                            ? rawInsights.salaryRange 
                            : [],
                        growthRate: typeof rawInsights.growthRate === 'number' 
                            ? rawInsights.growthRate 
                            : parseFloat(rawInsights.growthRate) || 15,
                        demandLevel: normalizeEnum(rawInsights.demandLevel, ["HIGH", "MEDIUM", "LOW"], "MEDIUM"),
                        topSkills: Array.isArray(rawInsights.topSkills) 
                            ? rawInsights.topSkills.filter(Boolean) 
                            : [],
                        marketOutlook: normalizeEnum(rawInsights.marketOutlook, ["POSITIVE", "NEUTRAL", "NEGATIVE"], "NEUTRAL"),
                        keyTrends: Array.isArray(rawInsights.keyTrends) 
                            ? rawInsights.keyTrends.filter(Boolean) 
                            : [],
                        recommendedSkills: Array.isArray(rawInsights.recommendedSkills) 
                            ? rawInsights.recommendedSkills.filter(Boolean) 
                            : [],
                    };
                    console.log(" AI insights generated and normalized successfully:", insights);
                } catch (aiError) {
                    console.error(" AI insights generation failed:", aiError.message);
                    
                    // Create realistic fallback data with proper types and enum values
                    insights = {
                        salaryRange: [
                            { role: "Software Developer", min: 600000, max: 1200000, median: 850000, location: "Remote" },
                            { role: "Senior Developer", min: 900000, max: 1500000, median: 1200000, location: "Remote" },
                            { role: "Tech Lead", min: 1200000, max: 1800000, median: 1500000, location: "Remote" }
                        ],
                        growthRate: 15.0,
                        demandLevel: "HIGH", // Must match enum
                        topSkills: ["JavaScript", "React", "Node.js", "Python", "AWS"],
                        marketOutlook: "POSITIVE", // Must match enum
                        keyTrends: ["Remote Work", "AI Integration", "Cloud Computing", "DevOps", "Microservices"],
                        recommendedSkills: ["TypeScript", "Docker", "Kubernetes", "GraphQL", "Machine Learning"],
                    };
                    console.log("Using realistic fallback insights:", insights);
                }
                
                // Validate enum values one more time before saving
                const validDemandLevels = ["HIGH", "MEDIUM", "LOW"];
                const validMarketOutlooks = ["POSITIVE", "NEUTRAL", "NEGATIVE"];
                
                if (!validDemandLevels.includes(insights.demandLevel)) {
                    insights.demandLevel = "MEDIUM";
                }
                if (!validMarketOutlooks.includes(insights.marketOutlook)) {
                    insights.marketOutlook = "NEUTRAL";
                }
                
                console.log("Final insights to save:", insights);
                
                // Ensure all arrays are non-empty (Prisma might have issues with empty arrays)
                const finalTopSkills = insights.topSkills.length > 0 ? insights.topSkills : ["General Skills"];
                const finalKeyTrends = insights.keyTrends.length > 0 ? insights.keyTrends : ["Industry Growth"];
                const finalRecommendedSkills = insights.recommendedSkills.length > 0 ? insights.recommendedSkills : ["Continuous Learning"];
                const finalSalaryRange = insights.salaryRange.length > 0 ? insights.salaryRange : [
                    { role: "Entry Level", min: 300000, max: 600000, median: 450000, location: "Remote" }
                ];
                
                industryInsight = await tx.industryInsight.create({
                    data: {
                        industry: industry,
                        salaryRange: finalSalaryRange,
                        growthRate: insights.growthRate || 10.0,
                        demandLevel: insights.demandLevel,
                        topSkills: finalTopSkills,
                        marketOutlook: insights.marketOutlook,
                        keyTrends: finalKeyTrends,
                        recommendedSkills: finalRecommendedSkills,
                        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    },
                });
                console.log("✅ Industry insight created successfully:", industryInsight);
            } else {
                console.log("ℹ️ Industry insight already exists:", industryInsight);
            }

            // Normalize experience - ensure it's a number or null
            let experienceValue = null;
            if (data.experience !== undefined && data.experience !== null && data.experience !== "") {
                const expNum = typeof data.experience === 'number' 
                    ? data.experience 
                    : parseInt(data.experience, 10);
                experienceValue = isNaN(expNum) ? null : expNum;
            }
            
            // Normalize skills - ensure it's an array
            let skillsArray = [];
            if (data.skills) {
                if (Array.isArray(data.skills)) {
                    skillsArray = data.skills.filter(Boolean);
                } else if (typeof data.skills === 'string') {
                    skillsArray = data.skills.split(',').map(s => s.trim()).filter(Boolean);
                }
            }
            
            // update the user
            const updatedUser = await tx.user.update({
                where: {
                    id: user.id
                },
                data: {
                    industry: industry,
                    experience: experienceValue,
                    bio: data.bio ? String(data.bio).trim() : null,
                    skills: skillsArray,
                },
            });
            return { updatedUser, industryInsight };
        }, {
            timeout: 30000, // Increased timeout for the transaction
        });
        
        console.log("✅ User updated successfully");
        
        // Return only serializable data (no Date objects, no functions)
        return { 
            success: true, 
            updatedUser: {
                id: result.updatedUser.id,
                industry: result.updatedUser.industry,
                experience: result.updatedUser.experience,
            },
            industryInsight: {
                id: result.industryInsight?.id,
                industry: result.industryInsight?.industry,
            }
        };
    } catch (error) {
        // Log the error with full details for debugging
        console.error("❌ Error updating user and Industry:", error);
        console.error("Error details:", {
            message: error?.message,
            stack: error?.stack?.substring(0, 500), // Limit stack trace length
            name: error?.name,
            code: error?.code,
            meta: error?.meta ? JSON.stringify(error.meta) : undefined
        });
        
        // Handle specific error cases with user-friendly messages
        const errorMsg = String(error?.message || "");
        
        // Database connection errors
        if (errorMsg.includes("Can't reach database server") || 
            errorMsg.includes("Connection refused") ||
            errorMsg.includes("ENOTFOUND") ||
            errorMsg.includes("P1001") ||
            errorMsg.includes("connect ECONNREFUSED")) {
            return { 
                success: false, 
                error: "Database connection failed. Please check your database configuration." 
            };
        }
        
        // Unique constraint violations
        if (errorMsg.includes("Unique constraint") || 
            errorMsg.includes("duplicate") ||
            errorMsg.includes("P2002")) {
            if (errorMsg.includes("email")) {
                return { 
                    success: false, 
                    error: "This email is already registered. Please use a different email." 
                };
            }
            if (errorMsg.includes("industry")) {
                return { 
                    success: false, 
                    error: "This industry already exists. Please try again." 
                };
            }
            return { 
                success: false, 
                error: "A record with this information already exists. Please try again." 
            };
        }
        
        // Timeout errors
        if (errorMsg.includes("timeout") || errorMsg.includes("P2024")) {
            return { 
                success: false, 
                error: "Request timed out. Please try again." 
            };
        }
        
        // Record not found
        if (errorMsg.includes("Record to update not found") || 
            errorMsg.includes("P2025") ||
            errorMsg.includes("Record to delete does not exist")) {
            return { 
                success: false, 
                error: "User record not found. Please try signing in again." 
            };
        }
        
        // Invalid enum or data format
        if (errorMsg.includes("Invalid") || 
            errorMsg.includes("enum") ||
            errorMsg.includes("Invalid value for enum")) {
            return { 
                success: false, 
                error: "Invalid data format. Please check your input and try again." 
            };
        }
        
        // Provide a user-friendly error message
        const friendlyMessage = errorMsg.length > 100 
            ? "An unexpected error occurred. Please try again." 
            : errorMsg.replace(/Error: /g, "").substring(0, 200);
        
        // Return error object instead of throwing to prevent Server Components render error
        return { 
            success: false, 
            error: friendlyMessage || "Failed to update profile. Please try again." 
        };
    }
}



export async function getUserOnboardingStatus() {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    try {
        const user = await prisma.user.findUnique({
            where: { clerkUserId: clerkUserId },
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
        
        // Parse industry if it contains sub-industry
        let mainIndustryId = industry;
        let subIndustry = null;
        
        if (industry.includes('-')) {
            const parts = industry.split('-');
            mainIndustryId = parts[0];
            subIndustry = parts.slice(1).join(' ').replace(/-/g, ' ');
        }
        
        // Generate new AI insights (no user skills for force regenerate)
        const insights = await generateAIInsights(mainIndustryId, subIndustry, []);
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



