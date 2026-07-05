# Implementation Plan: ForeverHome Architecture V2 Refactoring

## Overview

This implementation plan converts the Architecture V2 design into incremental coding tasks. The refactoring introduces stateless AI architecture, permanent adopter profiles in Firestore, simplified 5-question assessments, multi-role support, and minimal AI logging. Each task builds on previous work with no orphaned code.

## Tasks

- [x] 1. Update type definitions for new data models
  - Expand AdopterProfile interface in `src/types/user.ts` with all fields from design
  - Add ScenarioQuestion and AssessmentSession interfaces in `src/types/assessment.ts`
  - Update UserDocument interface to support roles array and activeRole
  - Add AILog interface in `src/types/ai.ts`
  - _Requirements: 1.3, 5.5_

- [x] 2. Create Firestore service methods for profile management
  - Add `fetchAdopterProfile(uid: string)` method to `src/lib/firestoreService.ts`
  - Add `createAdopterProfile(uid: string, profile: AdopterProfile)` method
  - Add `updateAdopterProfile(uid: string, updates: Partial<AdopterProfile>)` method
  - Add `deleteAdopterProfile(uid: string)` method
  - _Requirements: 1.1, 1.2, 8.2_

- [ ] 3. Implement profile validation functions
  - Create `src/lib/validators/profileValidator.ts`
  - Implement `validateAdopterProfile(profile: unknown): ValidationResult`
  - Add validation for required fields (name, email, homeType, catExperience)
  - Add validation for field formats and constraints
  - _Requirements: 1.4, 1.5_

- [ ]* 3.1 Write property tests for profile validation
  - **Property 2: Required Field Validation**
  - **Property 3: Profile Completeness Calculation**
  - _Requirements: 1.4, 1.5_

- [ ] 4. Refactor onboarding wizard for extended profile collection
  - Update `src/app/onboarding/page.tsx` to use multi-step wizard
  - Add Home Profile step (homeType, children, pets, garden, indoor preference)
  - Add Lifestyle step (workHours, travel, noise, experience)
  - Add Preferences step (personality, age, special needs)
  - Update form to save to `users/{uid}/adopterProfile` subcollection
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ]* 4.1 Write property tests for form field capture
  - **Property 10: Form Field Capture**
  - **Property 11: Optional Fields Handling**
  - _Requirements: 6.2, 6.3, 6.4, 6.6_

- [ ] 5. Create profile editor component
  - Create `src/app/profile/edit/page.tsx` for profile editing
  - Load existing profile from Firestore
  - Reuse form sections from onboarding
  - Update Firestore on save with `updatedAt` timestamp
  - _Requirements: 8.1, 8.2, 8.3_

- [ ]* 5.1 Write property tests for profile updates
  - **Property 12: Update Timestamp Monotonicity**
  - **Property 15: Validation Rule Consistency**
  - _Requirements: 8.3, 8.5_

- [ ] 6. Simplify assessment to 5 scenario questions
  - Update `src/app/assessment/[catId]/page.tsx` to fetch profile from Firestore
  - Remove lifestyle/home profile questions from questions array
  - Keep exactly 5 scenario-based questions
  - Update `mapAnswers` function for new question structure
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ]* 6.1 Write property tests for assessment questions
  - **Property 6: Scenario Questions Only**
  - _Requirements: 4.4_

- [ ] 7. Update compatibility engine for new profile structure
  - Update `src/lib/compatibilityEngine.ts` to accept AdopterProfile and scenario answers
  - Ensure score calculation always returns 0-100
  - Map scores to recommendations ("excellent", "good", "fair", "not-recommended")
  - Include profile reference in assessment record
  - _Requirements: 9.1, 9.2, 9.3, 9.5_

- [ ]* 7.1 Write property tests for compatibility calculation
  - **Property 7: Compatibility Score Bounds**
  - **Property 8: Valid Recommendation Assignment**
  - **Property 13: Assessment Profile Reference**
  - _Requirements: 9.1, 9.3, 9.5_

- [x] 8. Create assessment storage service
  - Add `saveAssessment(assessment: AssessmentSession)` to `src/lib/firestoreService.ts`
  - Add `fetchAssessment(id: string)` method
  - Store assessment with reference to profile
  - _Requirements: 4.6_

- [ ] 9. Update AI coach API to be stateless
  - Update `src/app/api/coach/route.ts` to require `adopterProfileId`
  - Fetch profile from Firestore using the ID
  - Return 400 error if profileId is missing or invalid
  - _Requirements: 2.1, 2.2, 2.3_

- [ ]* 9.1 Write property tests for API validation
  - **Property 4: Invalid Profile ID Rejection**
  - **Property 14: Unauthorized Profile Access Rejection**
  - _Requirements: 2.3, 10.4_

- [ ] 10. Implement minimal AI logging
  - Create `src/lib/aiLoggingService.ts`
  - Implement `logAIInteraction(log: AILogInput)` function
  - Store only: uid, catId, question, response, timestamp, source
  - Save to `aiLogs` collection in Firestore
  - _Requirements: 7.1, 7.4_

- [ ]* 10.1 Write property tests for AI log structure
  - **Property 5: Minimal AI Log Structure**
  - _Requirements: 7.1_

- [ ] 11. Implement multi-role support
  - Update `src/types/user.ts` with roles array and activeRole
  - Create role toggle component in `src/components/ui/RoleToggle.tsx`
  - Update user document on role switch
  - Redirect appropriately based on active role
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 11.1 Write property tests for roles array
  - **Property 9: Roles Array Preservation**
  - _Requirements: 5.5_

- [x] 12. Update role selection in onboarding
  - Simplify role options to just "Adopter" and "Shelter/Rescue"
  - Remove any complex role options
  - Update UI to show only two choices
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 13. Add Firestore security rules
  - Update `firestore.rules` with profile access control
  - Allow users to read/write only their own AdopterProfile
  - Allow users to read only their own assessments
  - Make AI logs write-only for authenticated users
  - _Requirements: 10.1, 10.2, 10.3_

- [x] 14. Checkpoint - Ensure all tests pass
  - Run all unit tests and property tests
  - Verify Firestore integration works locally
  - Ensure all validation logic is correct
  - Ask the user if questions arise.

- [x] 15. Wire components together
  - Connect onboarding to profile creation service
  - Connect assessment page to profile fetch and assessment storage
  - Connect AI coach to logging service
  - Connect role toggle to user document updates
  - _Requirements: All_

- [x] 16. Update dashboard to show profile completion status
  - Add profile completeness indicator to adopter dashboard
  - Add link to profile editor
  - Add role toggle for multi-role users
  - _Requirements: 1.5, 5.1_

- [x] 17. Final checkpoint - Ensure all tests pass
  - Run full test suite
  - Verify all integration points work
  - Test complete user flows (onboarding, assessment, role toggle)
  - Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation uses existing dependencies (Firebase, Zod, fast-check)
- Firestore security rules are included as a coding task (rules files are code)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2", "3"] },
    { "id": 2, "tasks": ["4", "5", "6", "7", "8", "9", "10", "11", "12"] },
    { "id": 3, "tasks": ["13", "14"] },
    { "id": 4, "tasks": ["15", "16", "17"] }
  ],
  "optional": ["3.1", "4.1", "5.1", "6.1", "7.1", "9.1", "10.1", "11.1"]
}
```
