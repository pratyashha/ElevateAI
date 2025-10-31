import { inngest } from "@/lib/inngest/client";
import prisma from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

// Initialize AI services only when needed
const getGenAI = () => {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenerativeAI(apiKey);
};

const getOpenAI = () => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return null;
    return new OpenAI({ apiKey });
};

// AI-powered insights generator with fallback
const generateAIInsights = async (industry) => {
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

    // Try Gemini first
    try {
        const genAI = getGenAI();
        if (!genAI) {
            console.log(`No Gemini API key found, skipping Gemini for ${industry}`);
            throw new Error("No Gemini API key");
        }
        
        console.log(`Trying Gemini API for ${industry}...`);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash-exp",
            generationConfig: {
                temperature: 0.7,
            }
        });
        
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        const cleanedText = response.replace(/```(?:json)?\n?/g, "").trim();
        const insights = JSON.parse(cleanedText);
        
        console.log(`✅ Gemini API successful for ${industry}`);
        return insights;
    } catch (geminiError) {
        console.log(`❌ Gemini API failed for ${industry}:`, geminiError.message);
        
        // Try OpenAI as fallback
        try {
            const openai = getOpenAI();
            if (!openai) {
                console.log(`No OpenAI API key found, skipping OpenAI for ${industry}`);
                throw new Error("No OpenAI API key");
            }
            
            console.log(`Trying OpenAI API for ${industry}...`);
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a career insights expert. Return only valid JSON without any additional text or formatting."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            });
            
            const response = completion.choices[0].message.content;
            const cleanedText = response.replace(/```(?:json)?\n?/g, "").trim();
            const insights = JSON.parse(cleanedText);
            
            console.log(`✅ OpenAI API successful for ${industry}`);
            return insights;
        } catch (openaiError) {
            console.log(`❌ OpenAI API failed for ${industry}:`, openaiError.message);
            
            // Fallback to mock data
            console.log(`Using mock data for ${industry}...`);
            return generateMockInsights(industry);
        }
    }
};

// Mock data generator (final fallback)
const generateMockInsights = (industry) => {
    const baseData = {
        "tech-software-development": {
            salaryRange: [
                { role: "Junior Developer", min: 50000, max: 80000, median: 65000, location: "Remote" },
                { role: "Software Developer", min: 70000, max: 120000, median: 95000, location: "Remote" },
                { role: "Senior Developer", min: 100000, max: 160000, median: 130000, location: "Remote" },
                { role: "Tech Lead", min: 120000, max: 180000, median: 150000, location: "Remote" },
                { role: "Engineering Manager", min: 140000, max: 220000, median: 180000, location: "Remote" }
            ],
            growthRate: 15.5,
            demandLevel: "HIGH",
            topSkills: ["JavaScript", "React", "Node.js", "Python", "AWS", "TypeScript", "Docker"],
            marketOutlook: "POSITIVE",
            keyTrends: ["Remote Work", "AI Integration", "Cloud Computing", "DevOps", "Microservices", "Edge Computing"],
            recommendedSkills: ["TypeScript", "Docker", "Kubernetes", "GraphQL", "Machine Learning", "Rust", "Go"]
        },
        "healthcare": {
            salaryRange: [
                { role: "Registered Nurse", min: 45000, max: 75000, median: 60000, location: "Hospital" },
                { role: "Physician Assistant", min: 80000, max: 120000, median: 100000, location: "Clinic" },
                { role: "Medical Doctor", min: 150000, max: 300000, median: 225000, location: "Hospital" },
                { role: "Healthcare Administrator", min: 60000, max: 100000, median: 80000, location: "Office" },
                { role: "Pharmacist", min: 90000, max: 130000, median: 110000, location: "Pharmacy" }
            ],
            growthRate: 12.8,
            demandLevel: "HIGH",
            topSkills: ["Patient Care", "Medical Records", "HIPAA Compliance", "Electronic Health Records", "Telemedicine"],
            marketOutlook: "POSITIVE",
            keyTrends: ["Telemedicine", "AI Diagnostics", "Precision Medicine", "Digital Health", "Population Health"],
            recommendedSkills: ["Data Analytics", "Telehealth", "AI/ML", "Healthcare IT", "Population Health Management"]
        },
        "finance": {
            salaryRange: [
                { role: "Financial Analyst", min: 55000, max: 85000, median: 70000, location: "Office" },
                { role: "Investment Banker", min: 80000, max: 150000, median: 115000, location: "Office" },
                { role: "Portfolio Manager", min: 100000, max: 200000, median: 150000, location: "Office" },
                { role: "Risk Manager", min: 90000, max: 140000, median: 115000, location: "Office" },
                { role: "Financial Advisor", min: 60000, max: 120000, median: 90000, location: "Office" }
            ],
            growthRate: 8.2,
            demandLevel: "MEDIUM",
            topSkills: ["Financial Modeling", "Excel", "SQL", "Risk Analysis", "Investment Analysis"],
            marketOutlook: "NEUTRAL",
            keyTrends: ["Fintech", "Digital Banking", "Cryptocurrency", "ESG Investing", "Robo-Advisors"],
            recommendedSkills: ["Python", "Machine Learning", "Blockchain", "ESG Analysis", "Data Science"]
        }
    };

    return baseData[industry] || baseData["tech-software-development"];
};

// Function to generate industry insights using mock data (free alternative)
export const generateIndustryInsights = inngest.createFunction(
    { name: "Generate Industry Insights" },
    { cron: "0 0 * * 0" }, // Run every Sunday at midnight
    async ({ step }) => {
        const industries = await step.run("Fetch industries", async () => {
            return await prisma.industryInsight.findMany({
                select: {
                    industry: true,
                }
            });
        });

        for (const industryData of industries) {
            const industry = industryData.industry;
            
            const insights = await step.run(`Generate insights for ${industry}`, async () => {
                return await generateAIInsights(industry);
            });

            if (insights) {
                await step.run(`Update ${industry} insights`, async () => {
                    await prisma.industryInsight.update({
                        where: { industry },
                        data: {
                            ...insights,
                            lastUpdated: new Date(),
                            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        }
                    });
                    console.log(`Successfully updated insights for ${industry}`);
                });
            }
        }
    }
);