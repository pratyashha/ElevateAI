"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestGeminiPage() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const testGemini = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/test-gemini');
            const data = await response.json();
            setResult(data);
        } catch (error) {
            setResult({ error: error.message });
        }
        setLoading(false);
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">🧪 Test Gemini API</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>Test Your Gemini API Key</CardTitle>
                    <CardDescription>
                        This will test if your Gemini API key is working correctly
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={testGemini} disabled={loading} className="w-full">
                        {loading ? "Testing..." : "Test Gemini API"}
                    </Button>
                    
                    {result && (
                        <div className="mt-4 p-4 bg-gray-50 rounded">
                            <h3 className="font-semibold mb-2">Test Result:</h3>
                            <pre className="text-sm overflow-auto">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}






