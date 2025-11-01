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
    
    console.log(`🔍 DEBUG requireOnboarding: isOnboarded=${isOnboarded}`);
    
    // Only redirect if user is explicitly not onboarded
    // If there's an error checking status, don't redirect (let the error propagate or be handled by the page)
    if (!isOnboarded) {
      console.log(`🔍 DEBUG requireOnboarding: User not onboarded, redirecting to /onboarding`);
      redirect("/onboarding");
    }
    // If isOnboarded is true, just return - user can proceed
    console.log(`🔍 DEBUG requireOnboarding: User is onboarded, allowing access`);
    return;
  } catch (error) {
    // Re-throw redirect errors immediately - they should propagate
    if (isRedirectError(error)) {
      throw error;
    }
    
    // Only redirect to onboarding for specific onboarding-related errors
    // Don't redirect for other errors (like unauthorized, DB connection issues, etc.)
    if (error.message?.includes("Unauthorized")) {
      // Unauthorized should go to sign-in, not onboarding
      throw error; // Let the middleware handle this
    }
    
    // For other errors, log but don't redirect - let the page handle the error
    // This prevents unnecessary redirects when there are temporary issues
    console.warn("Error checking onboarding status (non-critical):", error.message);
    // Don't redirect - assume user is onboarded if we can't check
    // The page will handle the error if needed
    return;
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

