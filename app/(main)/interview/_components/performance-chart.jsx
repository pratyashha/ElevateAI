"use client"
import React, { useState, useEffect } from 'react'
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, XAxis, YAxis, Line, CartesianGrid, Tooltip, Legend } from 'recharts';

const PerformanceChart = ({ assessments }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (assessments && Array.isArray(assessments) && assessments.length > 0) {
      const formattedData = assessments.map((assessment) => ({
        date: format(new Date(assessment.createdAt), 'MMM dd, yyyy'),
        score: assessment.quizScore || 0,
      }));
      setChartData(formattedData);
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
        <div className='h-[300px]'>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date"
              tick={{ fontSize: 12 }}
              interval={0}
              angle={0}
              textAnchor="middle"
              height={60}
            />
            <YAxis 
              domain={[0, 100]}
              
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
              strokeWidth={2}
              dot={{ fill: '#8884d8', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart

