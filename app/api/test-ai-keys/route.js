import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

export async function GET() {
    const results = {
        gemini: { available: false, error: null },
        openai: { available: false, error: null },
        mock: { available: true, message: "Always available as fallback" }
    };

    // Test Gemini API
    try {
        const geminiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
        if (!geminiKey) {
            results.gemini.error = "No API key found. Add GOOGLE_API_KEY to .env.local";
        } else {
            const genAI = new GoogleGenerativeAI(geminiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            
            // Test with a simple prompt
            const result = await model.generateContent("Say 'Hello' in JSON format: {\"message\": \"Hello\"}");
            const response = result.response.text();
            results.gemini.available = true;
            results.gemini.message = "Gemini API is working! ✅";
        }
    } catch (error) {
        results.gemini.error = error.message;
    }

    // Test OpenAI API
    try {
        const openaiKey = process.env.OPENAI_API_KEY;
        if (!openaiKey) {
            results.openai.error = "No API key found. Add OPENAI_API_KEY to .env.local";
        } else {
            const openai = new OpenAI({ apiKey: openaiKey });
            
            // Test with a simple completion
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "user", content: "Say 'Hello' in JSON format: {\"message\": \"Hello\"}" }
                ],
                max_tokens: 50
            });
            
            results.openai.available = true;
            results.openai.message = "OpenAI API is working! ✅";
        }
    } catch (error) {
        results.openai.error = error.message;
    }

    return NextResponse.json(results);
}






