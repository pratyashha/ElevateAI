import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";

/**
 * Helper to check if error is a redirect error from Next.js
 */
export function isRedirectError(error) {
  return error?.digest?.startsWith('NEXT_REDIRECT') || 
         error?.message === 'NEXT_REDIRECT' ||
         error?.name === 'NEXT_REDIRECT';
}

/**
 * Check if user is onboarded and redirect to onboarding if not.
 * This should be called at the start of any protected page.
 * 
 * @returns {Promise<void>} - If user is onboarded, function completes. Otherwise redirects.
 * @throws {Error} - Re-throws redirect errors to allow Next.js to handle them
 */
export async function requireOnboarding() {
  try {
    const { isOnboarded } = await getUserOnboardingStatus();
    
    if (!isOnboarded) {
      redirect("/onboarding");
    }
  } catch (error) {
    // Re-throw redirect errors immediately - they should propagate
    if (isRedirectError(error)) {
      throw error;
    }
    
    // If we can't check onboarding status, redirect to onboarding to be safe
    console.error("Error checking onboarding status:", error);
    redirect("/onboarding");
  }
}

/**
 * Check onboarding status and redirect appropriately.
 * Used for redirect page and onboarding page.
 * 
 * @returns {Promise<{isOnboarded: boolean}>} - The onboarding status
 */
export async function checkOnboardingStatus() {
  try {
    const { isOnboarded } = await getUserOnboardingStatus();
    return { isOnboarded };
  } catch (error) {
    // Re-throw redirect errors immediately
    if (isRedirectError(error)) {
      throw error;
    }
    
    console.error("Error checking onboarding status:", error);
    // Default to not onboarded if we can't check
    return { isOnboarded: false };
  }
}

