import React from 'react';
import { requireOnboarding } from "@/lib/onboarding-check";
import CoverLetterGenerator from './_components/cover-letter-generator';

const AICoverLettersPage = async () => {
    // Check onboarding status - redirects if not onboarded
    await requireOnboarding();

    return <CoverLetterGenerator />;
};

export default AICoverLettersPage;
