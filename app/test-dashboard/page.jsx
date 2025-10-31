"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestDashboardPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testDashboard = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-dashboard');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Dashboard Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testDashboard} disabled={loading}>
            {loading ? "Testing..." : "Test Dashboard Data"}
          </Button>

          {result && (
            <div className="p-4 bg-gray-100 border rounded">
              <h3 className="font-bold mb-2">Test Result:</h3>
              <pre className="whitespace-pre-wrap text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}






