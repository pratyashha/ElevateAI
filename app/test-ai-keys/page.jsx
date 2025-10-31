"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TestAIKeysPage() {
    const [results, setResults] = useState({});
    const [loading, setLoading] = useState(false);

    const testAPIKeys = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/test-ai-keys');
            const data = await response.json();
            setResults(data);
        } catch (error) {
            setResults({ error: error.message });
        }
        setLoading(false);
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">AI API Keys Test</h1>
            
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>🔑 Get Your Free API Keys</CardTitle>
                        <CardDescription>
                            Follow these steps to get your free API keys for AI-powered insights
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-lg font-semibold">1. Gemini API (Primary - FREE)</Label>
                            <p className="text-sm text-gray-600">
                                • Go to: <a href="https://makersuite.google.com/app/apikey" target="_blank" className="text-blue-600 underline">https://makersuite.google.com/app/apikey</a>
                            </p>
                            <p className="text-sm text-gray-600">
                                • Click "Create API Key" → Copy the key
                            </p>
                            <p className="text-sm text-gray-600">
                                • Add to your <code className="bg-gray-100 px-1 rounded">.env.local</code> file: <code className="bg-gray-100 px-1 rounded">GOOGLE_API_KEY=your_key_here</code>
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-lg font-semibold">2. OpenAI API (Backup - FREE $5 credit)</Label>
                            <p className="text-sm text-gray-600">
                                • Go to: <a href="https://platform.openai.com/api-keys" target="_blank" className="text-blue-600 underline">https://platform.openai.com/api-keys</a>
                            </p>
                            <p className="text-sm text-gray-600">
                                • Click "Create new secret key" → Copy the key
                            </p>
                            <p className="text-sm text-gray-600">
                                • Add to your <code className="bg-gray-100 px-1 rounded">.env.local</code> file: <code className="bg-gray-100 px-1 rounded">OPENAI_API_KEY=your_key_here</code>
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-lg font-semibold">3. Example .env.local file:</Label>
                            <pre className="bg-gray-100 p-3 rounded text-sm">
{`GOOGLE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
DATABASE_URL=postgresql://xxxxx`}
                            </pre>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>🧪 Test Your API Keys</CardTitle>
                        <CardDescription>
                            Test if your API keys are working correctly
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={testAPIKeys} disabled={loading} className="w-full">
                            {loading ? "Testing..." : "Test API Keys"}
                        </Button>
                        
                        {Object.keys(results).length > 0 && (
                            <div className="mt-4 p-4 bg-gray-50 rounded">
                                <h3 className="font-semibold mb-2">Test Results:</h3>
                                <pre className="text-sm overflow-auto">
                                    {JSON.stringify(results, null, 2)}
                                </pre>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>💰 Free Limits</CardTitle>
                        <CardDescription>
                            Both APIs offer generous free tiers
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div>
                            <strong>Gemini API:</strong> 15 requests/minute, 1M tokens/day (FREE)
                        </div>
                        <div>
                            <strong>OpenAI API:</strong> $5 free credit (thousands of requests)
                        </div>
                        <div className="text-sm text-gray-600">
                            The system will automatically use the best available AI service!
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}






