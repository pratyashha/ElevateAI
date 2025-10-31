import React from 'react';
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import CoverLetterGenerator from './_components/cover-letter-generator';

const AICoverLettersPage = async () => {
    // Check onboarding status - must complete before accessing AI cover letter
    const { isOnboarded } = await getUserOnboardingStatus();
    
    if (!isOnboarded) {
        redirect("/onboarding");
    }

    return <CoverLetterGenerator />;
};

export default AICoverLettersPage;
