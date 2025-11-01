import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { requireOnboarding } from "@/lib/onboarding-check";
import Quiz from "../_components/quiz";

const MockInterviewPage = async () => {
  // Check onboarding status - redirects if not onboarded
  await requireOnboarding();

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/interview">
        <Button variant="link" className="gap-2 pl-0 text-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          Back to Interview Prep
        </Button>
      </Link>

      {/* Page Header */}
      <div className="space-y-2 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground">Mock Interview</h1>
        <p className="text-muted-foreground text-lg">
          Test your knowledge with industry-specific questions.
        </p>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <Quiz/>
      </div>
    </div>
  );
};

export default MockInterviewPage;
