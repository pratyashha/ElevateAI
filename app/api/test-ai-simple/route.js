import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  try {
    console.log("🧪 Testing AI API...");
    
    // Check environment variables
    const googleApiKey = process.env.GOOGLE_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const apiKey = googleApiKey || geminiApiKey;
    
    console.log("🔑 API Key check:", {
      hasGoogleApiKey: !!googleApiKey,
      hasGeminiApiKey: !!geminiApiKey,
      apiKeyLength: apiKey?.length || 0,
      apiKeyPreview: apiKey ? apiKey.substring(0, 10) + '...' : 'Not set'
    });
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: "No API key found",
        hasGoogleApiKey: !!googleApiKey,
        hasGeminiApiKey: !!geminiApiKey
      });
    }
    
    // Initialize AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    console.log("🤖 Testing AI generation...");
    
    // Simple test prompt
    const prompt = "Generate a simple JSON response with just a greeting message: {\"message\": \"Hello from AI\"}";
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    console.log("📥 AI Response:", response);
    
    return NextResponse.json({
      success: true,
      message: "AI API is working!",
      aiResponse: response,
      apiKeyUsed: apiKey.substring(0, 10) + '...',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ AI Test Error:", error);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}






