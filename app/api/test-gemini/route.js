import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET() {
    try {
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
        
        if (!apiKey) {
            return Response.json({ 
                error: "No Gemini API key found",
                keys: {
                    GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
                    GOOGLE_API_KEY: !!process.env.GOOGLE_API_KEY
                }
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash-exp",
            generationConfig: {
                temperature: 0.7,
            }
        });

        const prompt = "Generate a simple career insight for software development. Return a JSON object with: growthRate (number), demandLevel (string), and topSkills (array of strings).";
        
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        
        return Response.json({
            success: true,
            message: "Gemini API is working!",
            response: response,
            apiKey: apiKey.substring(0, 10) + "..."
        });

    } catch (error) {
        return Response.json({
            error: error.message,
            details: error.toString()
        });
    }
}
