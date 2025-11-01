import React from 'react'
import { redirect } from "next/navigation";
import { getIndustryInsights } from "@/actions/dashboard";
import { requireOnboarding, isRedirectError } from "@/lib/onboarding-check";
import DashboardView from './_components/dashboard-view';

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
      error.message?.includes(errorMsg)
    );
    
    if (isOnboardingError) {
      redirect("/onboarding");
    }
    
    // For other errors, redirect to onboarding as safe fallback
    redirect("/onboarding");
  }
}

export default IndustryInsightsPage;