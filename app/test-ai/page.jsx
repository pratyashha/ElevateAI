"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { testAIInsights, forceRegenerateAIInsights, clearAllIndustryInsights } from "@/actions/user";

export default function TestAIPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testAI = async () => {
    setLoading(true);
    setError(null);
    try {
      const insights = await testAIInsights("technology");
      setResult(insights);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const forceRegenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const insights = await forceRegenerateAIInsights("technology");
      setResult(insights);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await clearAllIndustryInsights();
      setResult({ message: `Cleared ${result.count} industry insights`, result });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>AI Insights Debug Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <Button onClick={testAI} disabled={loading}>
              {loading ? "Testing..." : "Test AI Generation"}
            </Button>
            <Button onClick={forceRegenerate} disabled={loading} variant="outline">
              {loading ? "Regenerating..." : "Force Regenerate"}
            </Button>
            <Button onClick={clearAll} disabled={loading} variant="destructive">
              {loading ? "Clearing..." : "Clear All Insights"}
            </Button>
          </div>

          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <strong>Error:</strong> {error}
            </div>
          )}

          {result && (
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              <h3 className="font-bold mb-2">AI Insights Result:</h3>
              <pre className="whitespace-pre-wrap text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="text-sm text-gray-600">
            <p><strong>Instructions:</strong></p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Make sure you have GOOGLE_API_KEY in your .env.local file</li>
              <li>Click "Test AI Generation" to test the AI function</li>
              <li>Click "Force Regenerate" to clear and recreate industry insights</li>
              <li>Check the browser console for detailed logs</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
