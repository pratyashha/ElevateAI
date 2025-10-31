import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "elevate-ai",
  name: "Elevate AI",
  credentials: {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
    },
  },
});