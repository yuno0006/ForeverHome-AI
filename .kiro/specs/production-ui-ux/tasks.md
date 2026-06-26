# Implementation Plan: Production UI/UX

## Overview

This plan transforms ForeverHome AI from a hackathon demo into a production-ready application with Firebase Authentication, role-based user profiles, shelter organization management, cat CRUD operations, proper branding (favicon/PWA icons), a polished design system, responsive layouts, loading/error states, and accessibility compliance. The implementation is structured in 14 task groups progressing from foundational design system and branding through authentication, navigation, CRUD features, and finally polish/accessibility.

## Tasks

- [ ] 1. Favicon & App Icon Generation
  - [ ] 1.1 Process cat.png from project root to generate favicon.ico (16x16, 32x32, 48x48 multi-size) and place in public/favicon.ico, replacing the existing placeholder
    - _Requirements: 5.1_
  - [ ] 1.2 Generate PWA icon at 192x192 pixels from cat.png and save to public/icons/icon-192.png
    - _Requirements: 5.2_
  - [ ] 1.3 Generate PWA icon at 512x512 pixels from cat.png and save to public/icons/icon-512.png
    - _Requirements: 5.2_
  - [ ] 1.4 Generate apple-touch-icon at 180x180 pixels from cat.png and save to public/icons/apple-touch-icon.png
    - _Requirements: 5.3_
  - [ ] 1.5 Update public/manifest.json with app name "ForeverHome AI", short_name "ForeverHome", theme_color "#1B4332", background_color "#FFF8F0", and correct icon references
    - _Requirements: 5.4_
  - [ ] 1.6 Update src/app/layout.tsx metadata to reference new favicon, apple-touch-icon, and updated theme color (#1B4332)
    - _Requirements: 5.1, 5.3_

- [ ] 2. Design System & Color Palette Migration
  - [ ] 2.1 Update CSS custom properties in src/app/globals.css to production palette: --background: #FFF8F0, --primary: #1B4332, --primary-foreground: #FFFFFF, --accent: #E07A5F, --accent-foreground: #FFFFFF, --risk-low: #40916C, --risk-moderate: #E9C46A, --risk-high: #E63946, --foreground: #2D3436, add --surface: #FFFFFF, --surface-hover: #FFF5EB
    - _Requirements: 6.1_
  - [ ] 2.2 Replace Geist font imports in layout.tsx with Nunito (headings) and Inter (body) via next/font/google for a warmer, more approachable feel while maintaining readability
    - _Requirements: 6.4_
  - [ ] 2.3 Update Tailwind theme extensions to include new color tokens (warm-cream, forest, coral, surface) and update border-radius values (0.75rem cards, 0.5rem buttons, 0.375rem inputs)
    - _Requirements: 6.2_
  - [ ] 2.4 Update existing Header, Footer, and card components to use the new primary/accent color tokens instead of the old sunny/heart tokens
    - _Requirements: 6.1_
  - [ ] 2.5 Add shadcn skeleton component (npx shadcn@latest add skeleton) for loading states
    - _Requirements: 8.1_
  - [ ] 2.6 Add shadcn toast component (npx shadcn@latest add toast) for notifications
    - _Requirements: 9.2_
  - [ ] 2.7 Add shadcn dialog component (npx shadcn@latest add dialog) for modals/confirmations
    - _Requirements: 4.6_
  - [ ] 2.8 Add shadcn dropdown-menu component (npx shadcn@latest add dropdown-menu) for user menus
    - _Requirements: 7.6_
  - [ ] 2.9 Add shadcn avatar component (npx shadcn@latest add avatar) for user display
    - _Requirements: 2.6_
  - [ ] 2.10 Add shadcn sheet component (npx shadcn@latest add sheet) for mobile sidebar/nav
    - _Requirements: 6.5_

- [ ] 3. Firebase Authentication & Auth Context
  - [ ] 3.1 Create src/types/user.ts with UserDocument interface (uid, email, displayName, role, photoURL, createdAt, onboardingComplete, shelterId, profile subtypes for adopter/staff)
    - _Requirements: 2.1, 2.2_
  - [ ] 3.2 Create src/lib/auth.ts with functions: registerWithEmail(email, password, role), loginWithEmail(email, password), loginWithGoogle(), logout(), createUserDocument(uid, data), fetchUserDocument(uid)
    - _Requirements: 1.1, 1.2, 1.3, 1.5_
  - [ ] 3.3 Create src/contexts/AuthContext.tsx with AuthProvider that listens to onAuthStateChanged, fetches Firestore user doc on auth state change, exposes user/userDoc/role/loading/login/register/logout
    - _Requirements: 1.3, 1.6_
  - [ ] 3.4 Create src/hooks/useAuth.ts as a convenience hook that returns AuthContext value with null checks
    - _Requirements: 1.3_
  - [ ] 3.5 Create src/hooks/useRole.ts that returns the current user's role with type narrowing
    - _Requirements: 2.3_
  - [ ] 3.6 Wrap the app in AuthProvider by updating src/app/layout.tsx to include the provider inside the body element
    - _Requirements: 1.3_
  - [ ] 3.7 Create src/components/auth/AuthGuard.tsx that checks auth state and role, shows loading while resolving, redirects to /login?redirect={path} if unauthenticated, and redirects to / if role mismatch
    - _Requirements: 1.6_

- [ ] 4. Login & Registration Pages
  - [ ] 4.1 Create src/components/auth/LoginForm.tsx with email/password fields, Google sign-in button, form validation, error display, and loading states
    - _Requirements: 1.1_
  - [ ] 4.2 Create src/components/auth/RegisterForm.tsx with email/password fields, password confirmation, role selector (Adopter vs Shelter Staff), Google sign-in option, and terms acceptance
    - _Requirements: 1.2_
  - [ ] 4.3 Create src/components/auth/GoogleButton.tsx as a styled Google sign-in button with loading state
    - _Requirements: 1.1_
  - [ ] 4.4 Create src/app/login/page.tsx that renders LoginForm, redirects authenticated users to their dashboard, and handles the redirect query param after successful login
    - _Requirements: 1.3, 1.6_
  - [ ] 4.5 Create src/app/register/page.tsx that renders RegisterForm and redirects to /onboarding after successful registration
    - _Requirements: 1.2_
  - [ ] 4.6 Add form validation with field-level error messages (required fields, email format, password minimum 8 chars, password match)
    - _Requirements: 1.4, 2.5_
  - [ ] 4.7 Handle Firebase Auth errors gracefully: display "Invalid credentials" for wrong password (without revealing email existence), "Account already exists" for duplicate email, and "Service unavailable" for network errors with retry
    - _Requirements: 1.4, 1.7_

- [ ] 5. User Onboarding Flow
  - [ ] 5.1 Create src/components/onboarding/OnboardingWizard.tsx as a multi-step form container with progress indicator and step navigation
    - _Requirements: 11.1, 11.3_
  - [ ] 5.2 Create adopter onboarding steps: Step 1 - display name + avatar, Step 2 - household info (home type, adults, children, pets), Step 3 - experience level + preferences
    - _Requirements: 2.1_
  - [ ] 5.3 Create shelter staff onboarding steps: Step 1 - display name + avatar, Step 2 - create new shelter OR enter invitation code, Step 3 - shelter details (name, address, contact) if creating new
    - _Requirements: 2.2, 3.1_
  - [ ] 5.4 Create src/app/onboarding/page.tsx that loads the wizard, checks if onboarding is already complete (redirect to dashboard if so), and saves completed profile to Firestore with onboardingComplete: true
    - _Requirements: 2.1, 2.2_
  - [ ] 5.5 Add logic in AuthGuard to redirect users with onboardingComplete === false to /onboarding before allowing access to protected routes
    - _Requirements: 11.1_

- [ ] 6. Role-Based Navigation Shell
  - [ ] 6.1 Create src/components/layout/NavigationShell.tsx that conditionally renders different navigation based on auth state and role (unauthenticated, adopter, shelter_staff)
    - _Requirements: 7.1, 7.2, 7.4_
  - [ ] 6.2 Create src/components/layout/UserMenu.tsx with avatar display, dropdown showing user name/email, links to Profile/Settings, and Logout button
    - _Requirements: 7.6, 2.6_
  - [ ] 6.3 Create src/components/layout/Sidebar.tsx for shelter staff desktop navigation with collapsible items: Dashboard, Cat Management, Adoptions, Insights, Staff Management, Profile
    - _Requirements: 7.2, 6.6_
  - [ ] 6.4 Create src/components/layout/MobileNav.tsx using shadcn Sheet component for mobile slide-out navigation with role-appropriate links
    - _Requirements: 6.5, 7.1, 7.2_
  - [ ] 6.5 Update src/components/layout/Header.tsx to be role-aware: show minimal nav for unauthenticated users, adopter nav links for adopters, and just logo + user menu for shelter staff (who use sidebar)
    - _Requirements: 7.4, 7.5_
  - [ ] 6.6 Create src/app/shelter/layout.tsx that wraps shelter routes with AuthGuard (requiredRole="shelter_staff") and renders the Sidebar + main content area layout
    - _Requirements: 7.2_
  - [ ] 6.7 Update src/app/layout.tsx to use NavigationShell instead of the standalone Header, remove the static nav links
    - _Requirements: 7.3_

- [ ] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. User Profile Pages
  - [ ] 8.1 Create src/components/profile/AdopterProfileForm.tsx with editable fields: display name, avatar, home type, household details, pet experience, and notification preferences
    - _Requirements: 2.3_
  - [ ] 8.2 Create src/components/profile/StaffProfileForm.tsx with editable fields: display name, avatar, role within shelter, and contact preferences
    - _Requirements: 2.3_
  - [ ] 8.3 Create src/app/profile/page.tsx that renders the appropriate profile form based on user role, loads current data from Firestore, handles save with validation, and shows success toast
    - _Requirements: 2.3, 2.4, 2.5_
  - [ ] 8.4 Add avatar upload functionality using Firebase Storage (path: users/{uid}/avatar) with image compression and preview
    - _Requirements: 2.6_

- [ ] 9. Shelter Organization Management
  - [ ] 9.1 Create src/types/shelter.ts with Shelter interface (id, name, address, phone, email, adminUid, createdAt, settings) and ShelterInvitation interface (id, email, role, invitedBy, createdAt, status)
    - _Requirements: 3.1_
  - [ ] 9.2 Extend src/lib/firestoreService.ts with shelter CRUD: createShelter(), fetchShelter(), updateShelter(), addStaffMember(), removeStaffMember(), createInvitation(), fetchInvitations(), acceptInvitation()
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - [ ] 9.3 Create src/components/shelter/ShelterSettings.tsx form for editing shelter name, address, phone, email
    - _Requirements: 3.5_
  - [ ] 9.4 Create src/components/shelter/StaffList.tsx displaying all staff members with their role and a remove button (admin only)
    - _Requirements: 3.4_
  - [ ] 9.5 Create src/components/shelter/InviteStaffModal.tsx dialog for entering an email address and role to invite
    - _Requirements: 3.2_
  - [ ] 9.6 Create src/app/shelter/staff/page.tsx combining StaffList and invite functionality, protected by admin role check
    - _Requirements: 3.4_
  - [ ] 9.7 Handle the "no shelter" state: if a shelter staff user has no shelterId, show the shelter creation form or invitation acceptance flow
    - _Requirements: 3.6_

- [ ] 10. Cat Profile CRUD
  - [ ] 10.1 Create src/lib/storageService.ts with uploadCatPhoto(shelterId, catId, file) that compresses the image to max 1200px width, uploads to Firebase Storage, and returns the download URL
    - _Requirements: 4.2, 4.7_
  - [ ] 10.2 Extend src/types/cat.ts to add shelterId, createdBy, createdAt, updatedAt fields to the Cat interface
    - _Requirements: 4.1_
  - [ ] 10.3 Extend src/lib/firestoreService.ts with: fetchCatsByShelter(shelterId), addCatWithShelter(cat, shelterId, uid), updateCat(catId, data), archiveCat(catId) functions
    - _Requirements: 4.1, 4.3, 4.5, 4.6_
  - [ ] 10.4 Create src/components/shelter/CatForm.tsx with sections: basic info (name, age, sex, life stage, neutered), photo upload with preview, behavioral traits (all CatBehavior fields as selects), care needs (medical, medication, FIV, notes), and status selector
    - _Requirements: 4.2_
  - [ ] 10.5 Create src/components/shelter/CatListItem.tsx displaying cat thumbnail, name, status badge, age, and action buttons (edit, archive)
    - _Requirements: 4.1_
  - [ ] 10.6 Create src/app/shelter/cats/page.tsx displaying the list of shelter cats with search/filter, an "Add Cat" button, and empty state when no cats exist
    - _Requirements: 4.1, 4.8_
  - [ ] 10.7 Create src/app/shelter/cats/new/page.tsx rendering CatForm in create mode, calling addCatWithShelter on submit, and redirecting to cat list on success
    - _Requirements: 4.3_
  - [ ] 10.8 Create src/app/shelter/cats/[id]/edit/page.tsx loading existing cat data, rendering CatForm in edit mode, calling updateCat on submit
    - _Requirements: 4.4, 4.5_
  - [ ] 10.9 Add archive confirmation dialog: when staff clicks archive, show a dialog explaining the cat will be hidden from public listings but data is preserved, with confirm/cancel buttons
    - _Requirements: 4.6_

- [ ] 11. Loading States & Skeleton Screens
  - [ ] 11.1 Create src/components/feedback/PageLoading.tsx as a full-page centered loader with ForeverHome AI logo and a subtle pulse animation, used during auth state resolution
    - _Requirements: 8.4_
  - [ ] 11.2 Create src/components/feedback/SkeletonCard.tsx as a reusable card-shaped skeleton matching the cat card dimensions
    - _Requirements: 8.1_
  - [ ] 11.3 Create page-level loading states: CatListSkeleton (grid of skeleton cards), DashboardSkeleton (summary cards + activity), ProfileSkeleton (avatar + form fields)
    - _Requirements: 8.1_
  - [ ] 11.4 Add loading spinners inside form submit buttons that disable the button and show a spinner during async operations
    - _Requirements: 8.2_
  - [ ] 11.5 Add a top-of-page progress bar (thin animated line) that appears during route transitions using Next.js navigation events
    - _Requirements: 8.3_

- [ ] 12. Error Handling & Empty States
  - [ ] 12.1 Create src/components/feedback/EmptyState.tsx accepting an illustration, title, description, and optional action button — use for empty cat lists, no assessments, no adoptions, etc.
    - _Requirements: 9.3_
  - [ ] 12.2 Create src/components/error/ErrorBoundary.tsx as a React error boundary that catches render errors and displays a friendly page with "Something went wrong", a cat illustration, and "Go Home" / "Try Again" buttons
    - _Requirements: 9.4_
  - [ ] 12.3 Create src/app/not-found.tsx as a custom 404 page with a cat-themed illustration, "Page not found" message, and navigation back to home/dashboard
    - _Requirements: 9.5_
  - [ ] 12.4 Create src/app/error.tsx as the Next.js error page component using the ErrorBoundary design
    - _Requirements: 9.4_
  - [ ] 12.5 Add inline error handling to data-fetching components: display error message with retry button when Firestore reads fail, retain previously loaded data if available
    - _Requirements: 9.1_
  - [ ] 12.6 Integrate toast notifications for form submission errors: retain form data, show error toast with retry messaging
    - _Requirements: 9.2_

- [ ] 13. Adopter Dashboard & Shelter Staff Dashboard
  - [ ] 13.1 Redesign src/app/dashboard/page.tsx as the adopter home: show "My Assessments" list, "Active Adoptions" with coach access links, and a prominent "Browse Cats" CTA
    - _Requirements: 11.2_
  - [ ] 13.2 Add first-time adopter welcome banner that appears when user has no assessments yet, explaining the browse → assess → report flow with a "Get Started" button
    - _Requirements: 11.1, 11.2_
  - [ ] 13.3 Ensure the assessment flow (src/app/assessment/[catId]/page.tsx) saves partial progress to sessionStorage so users can resume if they navigate away
    - _Requirements: 11.4_
  - [ ] 13.4 Add a transition animation (subtle fade/slide) when navigating from assessment completion to the compatibility report page
    - _Requirements: 11.5_
  - [ ] 13.5 Create src/app/shelter/dashboard/page.tsx with summary cards: Total Active Cats, Active Adoptions (14-day period), Cats Needing Attention, Pending Reviews
    - _Requirements: 12.1_
  - [ ] 13.6 Add a "Recent Activity" section showing last 10 events (new assessments submitted, check-ins flagged, cats added) with timestamps and links
    - _Requirements: 12.3_
  - [ ] 13.7 Make summary cards clickable — navigate to the relevant detailed view (cat list, adoptions monitoring, insights)
    - _Requirements: 12.2_
  - [ ] 13.8 Add zero-state dashboard: when shelter has no cats or adoptions yet, show contextual guidance cards ("Add your first cat", "Your adoption monitoring will appear here")
    - _Requirements: 12.5_
  - [ ] 13.9 Create src/app/shelter/adoptions/page.tsx showing all active adoptions with cat name, adopter name, current day, and last check-in summary — link each to the timeline view
    - _Requirements: 12.2_

- [ ] 14. Responsive Layout & Accessibility Polish
  - [ ] 14.1 Audit all pages for horizontal overflow on 320px viewport width and fix any overflow issues (constrain images, tables, long text)
    - _Requirements: 10.1_
  - [ ] 14.2 Ensure all interactive elements (buttons, links, form controls) have minimum 44x44px touch targets on mobile, add padding where needed
    - _Requirements: 10.2_
  - [ ] 14.3 Add visible focus ring styles (ring-2 ring-offset-2 ring-primary) to all interactive elements for keyboard navigation
    - _Requirements: 10.3_
  - [ ] 14.4 Verify semantic HTML structure: proper heading hierarchy (h1 per page, h2 for sections), nav elements, main landmark, aria-labels on icon-only buttons
    - _Requirements: 10.4_
  - [ ] 14.5 Run contrast checks on all color combinations (text on backgrounds) and adjust any that fail WCAG AA (4.5:1 body, 3:1 large text)
    - _Requirements: 10.5_
  - [ ] 14.6 Add aria-describedby to form fields that have validation errors, connecting the error message element to the input for screen reader announcement
    - _Requirements: 10.6_
  - [ ] 14.7 Test and fix the mobile navigation flow: hamburger opens sheet, links close sheet on navigation, active route is highlighted
    - _Requirements: 6.5, 7.3_

- [ ] 15. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation between major phases
- The design uses TypeScript throughout — all implementation tasks target the existing Next.js + TypeScript codebase
- Tasks are ordered to build foundational layers first (branding, design system, auth) before features that depend on them (navigation, CRUD, dashboards)
- shadcn/ui components are added in Task 2 because they are used across all subsequent tasks
- Firebase Authentication must be set up before any role-gated features (Tasks 4-6 depend on Task 3)
- Shelter management (Task 9) and Cat CRUD (Task 10) both depend on the Firestore service extensions
- Loading states (Task 11) and Error handling (Task 12) can be built in parallel once UI components exist
- Accessibility (Task 14) is a final pass to ensure all preceding work meets WCAG AA standards

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4", "2.1", "2.2", "2.3"] },
    { "id": 1, "tasks": ["1.5", "1.6", "2.4", "2.5", "2.6", "2.7", "2.8", "2.9", "2.10"] },
    { "id": 2, "tasks": ["3.1", "3.2"] },
    { "id": 3, "tasks": ["3.3", "3.4", "3.5"] },
    { "id": 4, "tasks": ["3.6", "3.7"] },
    { "id": 5, "tasks": ["4.1", "4.2", "4.3"] },
    { "id": 6, "tasks": ["4.4", "4.5", "4.6", "4.7"] },
    { "id": 7, "tasks": ["5.1", "5.2", "5.3"] },
    { "id": 8, "tasks": ["5.4", "5.5", "6.1", "6.2"] },
    { "id": 9, "tasks": ["6.3", "6.4", "6.5", "6.6", "6.7"] },
    { "id": 10, "tasks": ["8.1", "8.2", "9.1", "9.2"] },
    { "id": 11, "tasks": ["8.3", "8.4", "9.3", "9.4", "9.5", "9.6", "9.7", "10.1", "10.2"] },
    { "id": 12, "tasks": ["10.3", "10.4", "10.5"] },
    { "id": 13, "tasks": ["10.6", "10.7", "10.8", "10.9"] },
    { "id": 14, "tasks": ["11.1", "11.2", "11.3", "11.4", "11.5", "12.1", "12.2", "12.3", "12.4"] },
    { "id": 15, "tasks": ["12.5", "12.6", "13.1", "13.2", "13.3", "13.4", "13.5"] },
    { "id": 16, "tasks": ["13.6", "13.7", "13.8", "13.9"] },
    { "id": 17, "tasks": ["14.1", "14.2", "14.3", "14.4", "14.5", "14.6", "14.7"] }
  ]
}
```
