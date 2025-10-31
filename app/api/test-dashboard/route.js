import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    console.log("🧪 Testing dashboard data...");
    
    // Test database connection
    const userCount = await prisma.user.count();
    console.log("👤 User count:", userCount);
    
    // Test industry insights
    const insightsCount = await prisma.industryInsight.count();
    console.log("📊 Industry insights count:", insightsCount);
    
    // Get all industry insights
    const allInsights = await prisma.industryInsight.findMany({
      take: 5,
      orderBy: { lastUpdated: 'desc' }
    });
    
    console.log("📈 Recent insights:", allInsights);
    
    return NextResponse.json({
      success: true,
      userCount,
      insightsCount,
      recentInsights: allInsights,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ Dashboard test error:", error);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}






