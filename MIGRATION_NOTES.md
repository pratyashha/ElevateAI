# Clerk to NextAuth Migration Guide

## Overview
This migration replaces Clerk authentication with NextAuth.js (Auth.js) for better hosting compatibility.

## Changes Made

### 1. Dependencies
- ✅ Installed: `next-auth@beta`, `@auth/prisma-adapter`, `bcryptjs`
- ⚠️  Remove: `@clerk/nextjs`, `@clerk/themes` (can be removed after verification)

### 2. Database Schema Changes
- Removed: `clerkUserId` field from User model
- Added: `emailVerified`, `password` fields to User model
- Added: `Account`, `Session`, `VerificationToken` models for NextAuth

### 3. Environment Variables Required
Add to your `.env` file:
```
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000  # or your production URL
```

Generate secret:
```bash
openssl rand -base64 32
```

### 4. Migration Steps

**IMPORTANT: Back up your database before running migrations!**

1. Run the Prisma migration:
```bash
npx prisma migrate dev --name replace_clerk_with_nextauth
```

2. Or manually run the SQL if migration fails:
```bash
# Connect to your database and run the SQL from:
# prisma/migrations/replace_clerk_with_nextauth/migration.sql
```

3. Regenerate Prisma client:
```bash
npx prisma generate
```

## Updated Files

### Authentication Files
- `lib/auth.js` - NextAuth configuration
- `middleware.js` - NextAuth middleware
- `app/api/auth/[...nextauth]/route.js` - NextAuth API routes
- `app/api/auth/register/route.js` - User registration endpoint

### Pages
- `app/(auth)/sign-in/page.jsx` - Custom sign-in page
- `app/(auth)/sign-up/page.jsx` - Custom sign-up page
- Removed: Old Clerk catch-all routes

### Components
- `components/header.jsx` - Uses NextAuth session
- `components/providers.jsx` - SessionProvider wrapper

### Server Actions
- All actions updated: `actions/user.js`, `actions/dashboard.js`, `actions/resume.js`, `actions/interview.js`, `actions/cover-letter.js`
- Changed from `auth()` from Clerk to `auth()` from NextAuth
- Changed from `clerkUserId` to `id` in user queries

### Utilities
- `lib/checkUser.js` - Updated to use NextAuth

## User Data Migration

If you have existing users in the database:
1. Users will need to sign up again (can't migrate Clerk passwords)
2. Or create a migration script to convert Clerk users to NextAuth format

## Testing Checklist

- [ ] Sign up new user
- [ ] Sign in existing user
- [ ] Access protected routes
- [ ] Onboarding flow works
- [ ] Dashboard displays correctly
- [ ] Resume saving works
- [ ] Cover letter generation works
- [ ] Interview quiz generation works

## Rollback Plan

If needed, you can rollback by:
1. Restoring from database backup
2. Reverting git commits
3. Reinstalling Clerk dependencies

## Notes

- Email/password authentication is implemented
- Can add OAuth providers (Google, GitHub, etc.) later via NextAuth
- Session uses JWT strategy (no database sessions by default)
- All authentication checks are now consistent across the app

