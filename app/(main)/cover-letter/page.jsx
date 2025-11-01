import React from 'react';
import { requireOnboarding } from "@/lib/onboarding-check";
import CoverLetterGenerator from '../ai-cover-letter/_components/cover-letter-generator';

// Force dynamic rendering - this page uses auth headers
export const dynamic = 'force-dynamic';

const CoverLetterPage = async () => {
    // Check onboarding status - redirects if not onboarded
    await requireOnboarding();

    return <CoverLetterGenerator />;
};

export default CoverLetterPage;


