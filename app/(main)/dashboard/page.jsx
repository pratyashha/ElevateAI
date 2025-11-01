import React from 'react'
import { redirect } from "next/navigation";
import { getIndustryInsights } from "@/actions/dashboard";
import { requireOnboarding, isRedirectError } from "@/lib/onboarding-check";
import DashboardView from './_components/dashboard-view';

// Force dynamic rendering - this page uses auth headers
export const dynamic = 'force-dynamic';

const IndustryInsightsPage = async() => {
  // Check onboarding status - redirects if not onboarded
  await requireOnboarding();
  
  // Only proceed if user is onboarded
  try {
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
    // Re-throw redirect errors immediately - they should propagate
    if (isRedirectError(error)) {
      throw error;
    }
    
    console.error("Error in IndustryInsightsPage:", error);
    
    // Only redirect to onboarding for actual onboarding-related errors
    const onboardingErrors = [
      "User not found",
      "Industry not set",
      "Unable to fetch user data",
      "User not found. Please complete onboarding.",
      "Industry not set. Please complete onboarding."
    ];
    
    const isOnboardingError = onboardingErrors.some(errorMsg => 
      error.message?.includes(errorMsg)
    );
    
    if (isOnboardingError) {
      redirect("/onboarding");
    }
    
    // For other errors (like AI generation failures), show error message instead of redirecting
    // This prevents users from being redirected to onboarding when they're already onboarded
    return (
      <div className='container mx-auto p-8'>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Unable to Load Insights</h2>
          <p className="text-gray-600 mb-4">{error.message || "Failed to load industry insights. Please try again later."}</p>
          <p className="text-sm text-gray-500">If this problem persists, please contact support.</p>
        </div>
      </div>
    );
  }
}

export default IndustryInsightsPage;