import prisma from "./prisma";  // ✅ default import
import { currentUser } from "@clerk/nextjs/server";

export const checkUser = async () => {
  try {
    // Check if Clerk environment variables are configured
    if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
      console.warn("Clerk environment variables not configured");
      return null;
    }

    const user = await currentUser();
    if (!user) return null;

    let loggedInUser = await prisma.user.findUnique({
      where: { clerkUserId: user.id },
    });

    if (loggedInUser) return loggedInUser;

    const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
    const newUser = await prisma.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0]?.emailAddress,
      },
    });

    return newUser;
  } catch (err) {
    console.error("checkUser error:", err);
    return null;
  }
};



// import { currentUser } from "@clerk/nextjs/server";
// import db from "./prisma"; // default import

// export const checkUser = async () => {
//   const user = await currentUser();
//   if (!user) return null;

//   try {
//     const loggedInUser = await db.user.findUnique({
//       where: { clerkUserId: user.id },
//     });

//     if (loggedInUser) return loggedInUser;

//     const name = `${user.firstName} ${user.lastName}`;

//     const newUser = await db.user.create({
//       data: {
//         clerkUserId: user.id,
//         name,
//         imageUrl: user.imageUrl,
//         email: user.emailAddresses[0]?.emailAddress,
//       },
//     });

//     return newUser;
//   } catch (error) {
//     console.error(error.message);
//     return null;
//   }
// };
