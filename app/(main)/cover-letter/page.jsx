import React from 'react';
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import CoverLetterGenerator from '../ai-cover-letter/_components/cover-letter-generator';

const CoverLetterPage = async () => {
    // Check onboarding status - must complete before accessing cover letter
    const { isOnboarded } = await getUserOnboardingStatus();
    
    if (!isOnboarded) {
        redirect("/onboarding");
    }

    return <CoverLetterGenerator />;
};

export default CoverLetterPage;


