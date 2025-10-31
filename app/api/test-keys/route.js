export async function GET() {
    try {
        const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
        const openaiKey = process.env.OPENAI_API_KEY;
        
        return Response.json({
            gemini: {
                hasKey: !!geminiKey,
                keyPreview: geminiKey ? geminiKey.substring(0, 10) + "..." : "Not found"
            },
            openai: {
                hasKey: !!openaiKey,
                keyPreview: openaiKey ? openaiKey.substring(0, 10) + "..." : "Not found"
            },
            message: "API Keys Status Check"
        });

    } catch (error) {
        return Response.json({
            error: error.message,
            details: error.toString()
        });
    }
}






