"use client";
import { BriefcaseIcon, LineChart, TrendingDown, TrendingUp, BrainIcon } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';





const DashboardView = ({ insights }) => {
    const [isLargeScreen, setIsLargeScreen] = useState(false);
    const [isExtraLargeScreen, setIsExtraLargeScreen] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsLargeScreen(window.innerWidth >= 1024);
            setIsExtraLargeScreen(window.innerWidth >= 1280);
        };
        
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);
    
    // Check if insights exist and have the required data
    if (!insights) {
        return (
            <div className='space-y-6'>
                <div className='flex items-center justify-between'> 
                    <Badge variant="outline">No insights available</Badge>
                </div>
                <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
                    <h3 className="font-semibold text-yellow-800">Debug Info</h3>
                    <p className="text-sm text-yellow-700">No industry insights found. This could be because:</p>
                    <ul className="text-sm text-yellow-700 list-disc list-inside mt-2">
                        <li>Database connection failed</li>
                        <li>No industry insights have been created yet</li>
                        <li>User hasn&apos;t completed onboarding</li>
                    </ul>
                </div>
            </div>
        );
    }

    // Format salary data in Indian Rupees (₹) - showing in Lakhs (divide by 100000)
    const salaryData = insights.salaryRange?.map((range) => ({
        name: range.role,
        min: range.min / 100000, // Convert to Lakhs (1 Lakh = 100,000)
        max: range.max / 100000,
        median: range.median / 100000,
    })) || [];

    const getDemandLevelColor = (level) => {
        switch (level?.toLowerCase()) {
            case "high":
                return "bg-green-500";
            case "medium":
                return "bg-yellow-500";
            case "low":
                return "bg-red-500";
            default:
                return "bg-gray-500";  
        }
    };

    const getMarketOutlookInfo = (outlook) => {
        switch (outlook?.toLowerCase()) {
            case "positive":
                return {icon: TrendingUp, color: "text-green-500"};
            case "neutral":
                return {icon: LineChart, color: "text-yellow-500"};
            case "negative":
                return {icon: TrendingDown, color: "text-red-500"};
            default:
                return {icon: LineChart, color: "text-gray-500"};
        }
    };

    const OutlookIcon = getMarketOutlookInfo(insights.marketOutlook).icon;
    const OutlookColor = getMarketOutlookInfo(insights.marketOutlook).color;

    // Format dates safely
    const lastUpdatedDate = insights.lastUpdated ? 
        format(new Date(insights.lastUpdated), "MMM dd, yyyy") : 
        "Not available";
    
    // Calculate next update - show actual date if future, or relative time
    const getNextUpdateDisplay = () => {
        if (!insights.nextUpdate) return "Not available";
        
        const nextUpdate = new Date(insights.nextUpdate);
        const now = new Date();
        
        if (nextUpdate > now) {
            // Future date - show as "in X days" or actual date if more than 7 days away
            const daysUntil = Math.ceil((nextUpdate - now) / (1000 * 60 * 60 * 24));
            if (daysUntil <= 7) {
                return `in ${daysUntil} ${daysUntil === 1 ? 'day' : 'days'}`;
            } else {
                return format(nextUpdate, "MMM dd, yyyy");
            }
        } else {
            // Past date - show as "overdue by X days" or actual date
            const daysOverdue = Math.ceil((now - nextUpdate) / (1000 * 60 * 60 * 24));
            if (daysOverdue <= 7) {
                return `${daysOverdue} ${daysOverdue === 1 ? 'day' : 'days'} overdue`;
            } else {
                return format(nextUpdate, "MMM dd, yyyy");
            }
        }
    };
    
    const nextUpdateDate = getNextUpdateDisplay();

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'> 
                <Badge variant="outline">Last Updated: {lastUpdatedDate}</Badge>
                <Badge variant="secondary">Next Update: {nextUpdateDate}</Badge>
            </div>
            
            {/* Display insights data in cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Market Outlook Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Market Outlook</CardTitle>
                        <OutlookIcon className={`h-4 w-4 ${OutlookColor}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{insights.marketOutlook}</div>
                        <p className="text-xs text-muted-foreground">Next update: {nextUpdateDate}</p>
                    </CardContent>
                </Card>

                {/* Industry Growth Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Industry Growth</CardTitle>
                        <TrendingUp className={`h-4 w-4 text-muted-foreground`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{insights.growthRate.toFixed(1)}%</div>
                        <Progress value={insights.growthRate} className="mt-2" />
                    </CardContent>
                </Card>

                {/* Demand Level Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Demand Level</CardTitle>
                        <BriefcaseIcon className={`h-4 w-4 text-muted-foreground`} />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>{insights.demandLevel}</div>
                        <div className={`h-2 w-full rounded-full mt-2 ${getDemandLevelColor(insights.demandLevel)}`}/>
                        
                    </CardContent>
                </Card>

                {/* Top Skills */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Top Skills</CardTitle>
                            <BrainIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                           <div className="flex flex-wrap gap-2">
                                {insights.topSkills.map((skill) => (
                                    <Badge key={skill} variant="secondary">{skill}</Badge>
                                ))}
                           </div>
                        </CardContent>
                    </Card>
                
            </div>

            

            {/* Key Trends */}
            <Card>
                <CardHeader>
                    <CardTitle>Key Trends</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {insights.keyTrends && insights.keyTrends.length > 0 ? (
                            insights.keyTrends.map((trend, index) => (
                                <Badge key={index} variant="outline">{trend}</Badge>
                            ))
                        ) : (
                            <p className="text-gray-500">No trends available</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Salary Ranges by Role */}
            {insights.salaryRange && insights.salaryRange.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Salary Ranges by Role</CardTitle>
                        <CardDescription>Displaying minimum, maximum and median salaries in Indian Rupees (Lakhs)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[500px] sm:h-[600px] lg:h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart 
                                    data={salaryData} 
                                    layout={isLargeScreen ? "horizontal" : "vertical"}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    {isLargeScreen ? (
                                        <>
                                            <XAxis 
                                                dataKey="name" 
                                                height={isExtraLargeScreen ? 80 : 100}
                                                tick={{ fontSize: 12 }}
                                                interval={0}
                                                angle={isExtraLargeScreen ? 0 : -45}
                                                textAnchor={isExtraLargeScreen ? "middle" : "end"}
                                            />
                                            <YAxis 
                                                type="number" 
                                                tickFormatter={(value) => `₹${value}L`}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <XAxis 
                                                type="number" 
                                                tickFormatter={(value) => `₹${value}L`}
                                            />
                                            <YAxis dataKey="name" type="category" width={120} angle={-45} textAnchor="end" />
                                        </>
                                    )}
                                    <Tooltip content={({active, payload, label}) =>{
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-background border rounded-lg p-2 shadow-md">
                                                    <p className="font-medium">{label}</p>
                                                    {payload.map((item, index) =>{
                                                        const valueInLakhs = item.value.toFixed(1);
                                                        return <p key={index} className="text-sm">
                                                            {item.name}: ₹{valueInLakhs}L
                                                        </p>
                                                    })}
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}/>
                                    <Bar dataKey="min" fill="#94a3b8" name="Min Salary (₹L)"/>
                                    <Bar dataKey="median" fill="#64748b" name="Median Salary (₹L)"/>
                                    <Bar dataKey="max" fill="#475569" name="Max Salary (₹L)"/>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>         
            )}

            {/* Recommended Skills */}
            
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Key Industry Trends</CardTitle>
                        <CardDescription>Current trends shaping the industry</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className='space-y-4'>
                            {insights.keyTrends.map((trend, index) => (
                                <li key={index} className='flex items-center space-x-2'>
                                    <div className='h-2 w-2 mt-2 rounded-full bg-primary '/>
                                    <span >{trend}</span>
                                </li>
                            ))}

                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recommended Skills</CardTitle>
                        <CardDescription>Skills to develop to stay competitive</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {insights.recommendedSkills.map((skill, index) => (
                                <Badge key={index} variant="outline">{skill}</Badge>
                            ))}
                        </div>
                        
                    </CardContent>
                </Card>
            </div>

            
        </div>
    );
};

export default DashboardView;