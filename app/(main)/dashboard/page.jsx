import React from 'react'
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import { getIndustryInsights } from "@/actions/dashboard";
import DashboardView from './_components/dashboard-view';

const IndustryInsightsPage = async() => {
  try {
    // Check onboarding status first - redirect immediately if not onboarded
    const { isOnboarded } = await getUserOnboardingStatus();
    
    if (!isOnboarded) {
      redirect("/onboarding");
    }
    
    // Only proceed if user is onboarded
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
    
    // Any error related to onboarding or user data should redirect to onboarding
    const onboardingErrors = [
      "User not found",
      "Industry not set",
      "Unable to fetch user data",
      "Unauthorized",
      "User not found. Please complete onboarding.",
      "Industry not set. Please complete onboarding."
    ];
    
    const isOnboardingError = onboardingErrors.some(errorMsg => 
      error.message.includes(errorMsg)
    );
    
    if (isOnboardingError) {
      redirect("/onboarding");
    }
    
    // For other errors, still try to check onboarding status as fallback
    try {
      const { isOnboarded } = await getUserOnboardingStatus();
      if (!isOnboarded) {
        redirect("/onboarding");
      }
    } catch (checkError) {
      // If we can't check onboarding status, redirect to onboarding to be safe
      redirect("/onboarding");
    }
    
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