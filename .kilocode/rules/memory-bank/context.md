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
- [x] Fixed QR scanner detection: react-qr-scanner could not detect app-generated QR codes
  - Root cause 1: QR codes used custom green colors (#166534 on #f0fdf4) — insufficient contrast for scanner algorithms
  - Root cause 2: react-qr-scanner (@zxing/library) is unreliable with non-standard QR code colors
  - Fix 1: Changed QRCodeDisplay.tsx to generate standard black-on-white QR codes (#000000 on #ffffff)
  - Fix 2: Replaced react-qr-scanner with custom jsqr canvas-based scanner in QRScanner.tsx
  - New scanner: getUserMedia → video element → hidden canvas → jsqr frame-by-frame analysis via requestAnimationFrame
  - Camera properly stopped on close/unmount via streamRef and animFrameRef cleanup
- [x] Added edit functionality for Clean-up Events
  - PUT /api/events endpoint updates event title and date (admin-only)
  - Pencil icon button on each event card opens an inline edit form
  - Edit form pre-fills current title and date values
  - Shows inline error messages on validation or server failure
  - Cancel button restores normal event view without saving
- [x] Added admin management of registered parent volunteer accounts
  - GET /api/users returns all parent accounts (admin-only)
  - PUT /api/users updates name, email, points, and optionally password (admin-only)
  - DELETE /api/users removes a parent account and all their attendance records (admin-only)
  - New AdminUserManager component on admin page lists all parents with edit/delete buttons
- [x] Added attendance download feature for events
  - GET /api/attendance/download?eventId=X endpoint for admin to download attendance CSV
  - Download button on each event card (visible when attendees > 0)
  - CSV includes: Name, Email, Grade Level, Points Awarded, Check-in Time
- [x] Added grade level field to parent volunteer registration
  - Added gradeLevel column to users table in database schema
  - Created database migration (0001_adept_guardians.sql)
  - Grade level dropdown in registration form (Kindergarten through 6th Grade)
  - Grade level display and editing in admin user manager
- [x] Fixed CSV download button: added `export const dynamic = "force-dynamic"` to attendance download API route to prevent caching issues
  - QR code button added to each parent volunteer in admin panel
  - Clicking opens modal with parent's unique QR code for event check-in
  - Modal displays user name, grade level, and ID along with QR code
- [x] Added search bar to filter parent volunteers by name or email
  - Search input appears above the user list when there are users
  - Filters by name or email (case-insensitive)
  - Shows "X of Y volunteers" count when filtering
  - Shows "No matching volunteers found" message when no results
  - Edit form: inline per-user form with name, email, points, optional new password fields
  - Delete: two-step confirmation with warning about permanent data loss
  - Admin page now fetches allParents directly and passes to AdminUserManager
- [x] Fixed attendance download functionality
  - Download button now visible for ALL events (not just those with attendees)
  - API returns friendly message when no attendees checked in
  - Client shows "No attendees have checked in for this event yet" message
- [x] Added console logging to debug attendance download button issue

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
