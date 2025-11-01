import { auth } from "@clerk/nextjs/server";
import { getUserOnboardingStatus } from "@/actions/user";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ isOnboarded: false });
    }

    const { isOnboarded } = await getUserOnboardingStatus();
    return NextResponse.json({ isOnboarded });
  } catch (error) {
    console.error("Error getting onboarding status:", error);
    return NextResponse.json({ isOnboarded: false });
  }
}

