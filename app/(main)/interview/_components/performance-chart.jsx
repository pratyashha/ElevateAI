"use client"
import React, { useState, useEffect } from 'react'
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, XAxis, YAxis, Line, CartesianGrid, Tooltip } from 'recharts';

const PerformanceChart = ({ assessments }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (assessments && Array.isArray(assessments) && assessments.length > 0) {
      const formattedData = assessments
        .map((assessment) => ({
          date: format(new Date(assessment.createdAt), 'MMM dd, yyyy'),
          score: Number(assessment.quizScore) || 0,
          timestamp: new Date(assessment.createdAt).getTime(), // For sorting
        }))
        .sort((a, b) => a.timestamp - b.timestamp); // Sort by date ascending (oldest first)
      setChartData(formattedData);
    } else {
      setChartData([]);
    }
  }, [assessments]);

  if (!chartData || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='text-3xl md:text-4xl gradient-title'>Performance Trend</CardTitle>
          <CardDescription>Track your quiz performance over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8 text-muted-foreground'>
            No assessment data available yet. Complete a quiz to see your performance trend.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-3xl md:text-4xl gradient-title'>Performance Trend</CardTitle>
        <CardDescription>Track your quiz performance over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='h-[300px] w-full'>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={chartData}
              margin={{ top: 5, right: 0, left: 0, bottom: chartData.length > 7 ? 60 : 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
                angle={0}
                textAnchor="middle"
                height={60}
                padding={{ left: 0, right: 0 }}
                tickLine={false}
              />
              <YAxis 
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                width={50}
                tickLine={false}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border rounded-lg p-2 shadow-md">
                        <p className="text-sm text-primary">
                          Score: {payload[0].value}%
                        </p>
                        <p className="font-medium">{payload[0].payload.date}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#8884d8" 
                strokeWidth={3}
                dot={{ fill: '#8884d8', r: 5 }}
                activeDot={{ r: 7 }}
                connectNulls={false}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart

