# Active Context: Next.js Starter Template

## Current State

**Template Status**: ✅ Ready for development

The template is a clean Next.js 16 starter with TypeScript and Tailwind CSS 4. It's ready for AI-assisted expansion to build any type of application.

## Recently Completed

- [x] Base Next.js 16 setup with App Router
- [x] TypeScript configuration with strict mode
- [x] Tailwind CSS 4 integration
- [x] ESLint configuration
- [x] Memory bank documentation
- [x] Recipe system for common features
- [x] Full-stack School Volunteer Attendance & Points Tracker app
  - SQLite database with Drizzle ORM (users, events, attendance tables)
  - Session-based authentication with cookie storage
  - Admin role: create events, QR code scanner for check-in
  - Parent role: dashboard with points, unique QR code, attendance history
  - Leaderboard page with podium display (sorted by points)
  - Profile page with stats and account info
  - Bottom navigation bar (Home, Leaderboard, Profile)
  - Eco-friendly green theme, fully mobile-responsive
  - +10 points per event check-in, duplicate prevention
- [x] Fixed QR scanner: re-enabled react-qr-scanner by installing missing @babel/runtime peer dependency
  - Added @babel/runtime and react-qr-scanner back to package.json dependencies
  - Rewrote QRScanner.tsx to use react-qr-scanner (Reader component) via next/dynamic (SSR-safe)
  - Added src/types/react-qr-scanner.d.ts TypeScript declarations
  - Uses facingMode: "environment" for rear camera on mobile
  - Remounts scanner via key prop when "Scan Again" is clicked

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Home page | ✅ Ready |
| `src/app/layout.tsx` | Root layout | ✅ Ready |
| `src/app/globals.css` | Global styles | ✅ Ready |
| `.kilocode/` | AI context & recipes | ✅ Ready |

## Current Focus

The template is ready. Next steps depend on user requirements:

1. What type of application to build
2. What features are needed
3. Design/branding preferences

## Quick Start Guide

### To add a new page:

Create a file at `src/app/[route]/page.tsx`:
```tsx
export default function NewPage() {
  return <div>New page content</div>;
}
```

### To add components:

Create `src/components/` directory and add components:
```tsx
// src/components/ui/Button.tsx
export function Button({ children }: { children: React.ReactNode }) {
  return <button className="px-4 py-2 bg-blue-600 text-white rounded">{children}</button>;
}
```

### To add a database:

Follow `.kilocode/recipes/add-database.md`

### To add API routes:

Create `src/app/api/[route]/route.ts`:
```tsx
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Hello" });
}
```

## Available Recipes

| Recipe | File | Use Case |
|--------|------|----------|
| Add Database | `.kilocode/recipes/add-database.md` | Data persistence with Drizzle + SQLite |

## Pending Improvements

- [ ] Add more recipes (auth, email, etc.)
- [ ] Add example components
- [ ] Add testing setup recipe

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
