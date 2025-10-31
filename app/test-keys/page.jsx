"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestKeysPage() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const testKeys = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/test-keys');
            const data = await response.json();
            setResult(data);
        } catch (error) {
            setResult({ error: error.message });
        }
        setLoading(false);
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">🔑 Test API Keys</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>Test Your API Keys</CardTitle>
                    <CardDescription>
                        This will test if your API keys are working correctly
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={testKeys} disabled={loading} className="w-full">
                        {loading ? "Testing..." : "Test API Keys"}
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






