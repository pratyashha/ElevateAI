import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const googleApiKey = process.env.GOOGLE_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const apiKey = googleApiKey || geminiApiKey;
    
    const hasApiKey = !!apiKey;
    const apiKeyLength = apiKey?.length || 0;
    const apiKeyPreview = apiKey ? 
      apiKey.substring(0, 10) + '...' : 
      'Not set';

    return NextResponse.json({
      hasApiKey,
      apiKeyLength,
      apiKeyPreview,
      hasGoogleApiKey: !!googleApiKey,
      hasGeminiApiKey: !!geminiApiKey,
      usingKey: googleApiKey ? 'GOOGLE_API_KEY' : geminiApiKey ? 'GEMINI_API_KEY' : 'None',
      isApiKeyValid: hasApiKey && apiKeyLength > 20 && !apiKeyPreview.includes('your_key'),
      environment: process.env.NODE_ENV,
      allEnvVars: Object.keys(process.env).filter(key => key.includes('GOOGLE') || key.includes('GEMINI') || key.includes('CLERK'))
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error.message,
      hasApiKey: false 
    });
  }
}
