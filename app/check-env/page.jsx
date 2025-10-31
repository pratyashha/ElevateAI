"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CheckEnvPage() {
  const [result, setResult] = useState(null);

  const checkEnv = async () => {
    try {
      const response = await fetch('/api/check-env');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error.message });
    }
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Environment Check</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={checkEnv}>
            Check Environment Variables
          </Button>

          {result && (
            <div className="p-4 bg-gray-100 border rounded">
              <h3 className="font-bold mb-2">Environment Status:</h3>
              <pre className="whitespace-pre-wrap text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="text-sm text-gray-600">
            <p><strong>What to check:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>GOOGLE_API_KEY should be set</li>
              <li>API key should be valid (not empty or "your_key_here")</li>
              <li>Check your .env.local file exists</li>
              <li>Restart your dev server after adding the key</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}






