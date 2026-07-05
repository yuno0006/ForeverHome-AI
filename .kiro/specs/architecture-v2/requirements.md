# Requirements Document: ForeverHome Architecture V2 Refactoring

## Introduction

This document specifies the requirements for refactoring ForeverHome's architecture to support stateless AI operations, permanent adopter profiles, simplified assessments, and multi-role user support. The refactoring ensures Firebase is the source of truth, separates profile management from assessment, and minimizes AI logging overhead.

## Glossary

- **AdopterProfile**: A permanent, editable document in Firestore containing an adopter's home profile, lifestyle, and preferences.
- **Assessment**: A scenario-based evaluation of compatibility between an adopter and a specific cat, using 5 scenario questions.
- **Compatibility Engine**: The algorithm that calculates match scores based on profile data and scenario answers.
- **AI Coach**: A stateless AI endpoint that answers adopter questions using profile data fetched from Firestore.
- **Role Toggle**: UI mechanism allowing users with multiple roles to switch between adopter and shelter staff contexts.
- **AILog**: Minimal record of AI interactions containing only question, response, and timestamp.

## Requirements

### Requirement 1: Adopter Profile Storage

**User Story:** As an adopter, I want my profile stored permanently in Firestore, so that I can edit it anytime and use it across multiple assessments.

#### Acceptance Criteria

1. WHEN an adopter completes the onboarding wizard, THE System SHALL create an AdopterProfile document at `users/{uid}/adopterProfile` in Firestore
2. WHEN an adopter updates their profile, THE System SHALL update the existing AdopterProfile document and set the `updatedAt` timestamp
3. THE AdopterProfile document SHALL contain all fields defined in the AdopterProfile interface (basic info, home profile, lifestyle, preferences)
4. THE System SHALL validate that required fields (name, email, homeType, catExperience) are present before saving
5. THE System SHALL set `isComplete` to true when all required fields are populated

### Requirement 2: Stateless AI Coach

**User Story:** As a system architect, I want the AI coach endpoint to be stateless, so that Firebase serves as the single source of truth and the system scales reliably.

#### Acceptance Criteria

1. WHEN the AI coach endpoint receives a request, THE System SHALL require an `adopterProfileId` parameter
2. WHEN a valid `adopterProfileId` is provided, THE System SHALL fetch the AdopterProfile from Firestore before generating a response
3. IF the `adopterProfileId` is missing or invalid, THE System SHALL return a 400 error with message "Invalid profile reference"
4. WHEN the AI generates a response, THE System SHALL NOT store the full conversation context
5. WHEN the AI generates a response, THE System SHALL log only question, response, timestamp, and source to `aiLogs` collection

### Requirement 3: Simplified Role Selection

**User Story:** As a new user, I want a simple role selection between Adopter and Shelter/Rescue, so that I can quickly start using the app.

#### Acceptance Criteria

1. WHEN a user begins onboarding, THE System SHALL display exactly two role options: "Adopter" and "Shelter/Rescue"
2. WHEN a user selects "Adopter", THE System SHALL proceed to the adopter profile form
3. WHEN a user selects "Shelter/Rescue", THE System SHALL proceed to shelter setup form
4. THE System SHALL NOT display complex role options beyond Adopter and Shelter Staff

### Requirement 4: Simplified Assessment

**User Story:** As an adopter, I want the assessment to ask only 5 scenario questions, so that I can quickly get a compatibility result without re-entering profile information.

#### Acceptance Criteria

1. WHEN an adopter starts an assessment for a cat, THE System SHALL fetch the adopter's profile from Firestore
2. IF no profile exists for the adopter, THE System SHALL redirect to onboarding with message "Please complete your profile first"
3. WHEN the assessment loads, THE System SHALL display exactly 5 scenario-based questions
4. THE Assessment questions SHALL NOT include lifestyle or home profile questions (these are already in the profile)
5. WHEN the adopter completes all 5 questions, THE System SHALL calculate compatibility using the stored profile and scenario answers
6. WHEN compatibility is calculated, THE System SHALL store the assessment record with reference to the profile

### Requirement 5: Multi-Role User Support

**User Story:** As a shelter staff member, I want to also be an adopter, so that I can use the app for both work and personal cat adoption.

#### Acceptance Criteria

1. WHEN a user has both adopter and shelter staff roles, THE System SHALL display a role toggle in the UI
2. WHEN a user toggles to "Adopter" role, THE System SHALL set `activeRole` to "adopter" and redirect to the adopter dashboard
3. WHEN a user toggles to "Shelter Staff" role, THE System SHALL set `activeRole` to "shelter_staff" and redirect to the shelter dashboard
4. IF a shelter staff user has no adopter profile and toggles to "Adopter", THE System SHALL redirect to onboarding to create a profile
5. THE System SHALL store `roles` as an array in the user document

### Requirement 6: Extended Onboarding Wizard

**User Story:** As an adopter, I want to provide detailed profile information during onboarding, so that assessments can be personalized without asking lifestyle questions.

#### Acceptance Criteria

1. WHEN an adopter begins profile creation, THE System SHALL display a multi-section form with Home Profile, Lifestyle, and Preferences
2. THE Home Profile section SHALL collect: homeType, hasChildren, childrenAges, hasExistingPets, existingPets details, hasGarden, indoorOnlyPreference
3. THE Lifestyle section SHALL collect: workHours, travelFrequency, householdNoise, catExperience
4. THE Preferences section SHALL collect: personalityPreference, agePreference, specialNeedsOpenness
5. THE System SHALL save the profile to Firestore upon completion of all sections
6. THE System SHALL allow optional fields: profilePhoto, phone

### Requirement 7: Minimal AI Logging

**User Story:** As a system operator, I want minimal AI logging, so that storage costs are reduced and user privacy is protected.

#### Acceptance Criteria

1. WHEN an AI interaction occurs, THE System SHALL store only: uid, catId, question, response, timestamp, source
2. THE System SHALL NOT store full conversation context in AI logs
3. THE System SHALL NOT store adopter profile data in AI logs
4. AI logs SHALL be stored in the `aiLogs` Firestore collection
5. AI logs SHALL be write-only for authenticated users (no read access)

### Requirement 8: Profile Editability

**User Story:** As an adopter, I want to edit my profile anytime, so that I can keep my information up to date.

#### Acceptance Criteria

1. WHEN an adopter views their profile, THE System SHALL display an edit button
2. WHEN an adopter edits their profile, THE System SHALL update the Firestore document
3. WHEN a profile is updated, THE System SHALL set `updatedAt` to the current timestamp
4. THE System SHALL preserve assessment history even when the profile is updated
5. THE System SHALL validate all fields on edit using the same rules as creation

### Requirement 9: Compatibility Calculation

**User Story:** As an adopter, I want the system to calculate my compatibility with a cat, so that I can make an informed adoption decision.

#### Acceptance Criteria

1. WHEN an assessment is completed, THE System SHALL calculate a compatibility score between 0 and 100
2. THE compatibility calculation SHALL use both the AdopterProfile and the 5 scenario answers
3. WHEN the score is calculated, THE System SHALL assign a recommendation of "excellent", "good", "fair", or "not-recommended"
4. THE System SHALL store the compatibility result with the assessment record
5. THE assessment record SHALL include a reference to the AdopterProfile used for the calculation

### Requirement 10: Firestore Security

**User Story:** As a security-conscious user, I want my data protected by Firestore security rules, so that only I can access my personal information.

#### Acceptance Criteria

1. THE System SHALL enforce Firestore security rules that allow users to read/write only their own AdopterProfile
2. THE System SHALL enforce that users can only read assessments where they are the adopter
3. THE System SHALL enforce that AI logs are write-only for authenticated users
4. THE System SHALL validate that API requests reference profiles belonging to the authenticated user
