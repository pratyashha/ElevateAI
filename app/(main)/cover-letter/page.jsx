import React from 'react';
import { requireOnboarding } from "@/lib/onboarding-check";
import CoverLetterGenerator from '../ai-cover-letter/_components/cover-letter-generator';

const CoverLetterPage = async () => {
    // Check onboarding status - redirects if not onboarded
    await requireOnboarding();

    return <CoverLetterGenerator />;
};

export default CoverLetterPage;


