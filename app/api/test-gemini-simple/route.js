import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET() {
    try {
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
        
        if (!apiKey) {
            return Response.json({ error: "No Gemini API key found" });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Try to list available models first
        try {
            const models = await genAI.listModels();
            return Response.json({
                success: true,
                message: "Gemini API connection successful",
                availableModels: models.map(m => m.name),
                totalModels: models.length
            });
        } catch (listError) {
            return Response.json({
                error: "Failed to list models",
                details: listError.message
            });
        }

    } catch (error) {
        return Response.json({
            error: error.message,
            details: error.toString()
        });
    }
}






