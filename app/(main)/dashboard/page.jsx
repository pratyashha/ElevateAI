import React from 'react'
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import { getIndustryInsights } from "@/actions/dashboard";
import DashboardView from './_components/dashboard-view';

const IndustryInsightsPage = async() => {
  try {
    // Temporarily bypass onboarding check to access existing data
    // const { isOnboarded } = await getUserOnboardingStatus();
    
    // if (!isOnboarded) {
    //   redirect("/onboarding");
    // }
    
    const insights = await getIndustryInsights();
    
    if (!insights) {
      return (
        <div className='container mx-auto p-8'>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">No Industry Data</h2>
            <p className="text-gray-600 mb-4">Unable to load industry insights at this time.</p>
          </div>
        </div>
      )
    }
    
    return (
      <div className='container mx-auto '>
        <DashboardView insights={insights}/>
      </div>
    )
  } catch (error) {
    console.error("Error in IndustryInsightsPage:", error);
    return (
      <div className='container mx-auto p-8'>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Dashboard Error</h2>
          <p className="text-gray-600 mb-4">Unable to load industry insights</p>
          <p className="text-sm text-gray-500">Error: {error.message}</p>
        </div>
      </div>
    )
  }
}

export default IndustryInsightsPage;