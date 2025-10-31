import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "career-crafter",
  name: "Career Crafter",
  credentials: {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
    },
  },
});