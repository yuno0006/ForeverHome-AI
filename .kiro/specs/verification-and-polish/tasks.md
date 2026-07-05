# Implementation Plan: Verification and Polish

## Overview

This plan establishes automated testing for critical system components (compatibility engine, medical escalation, AI coach, check-in system), validates demo data integrity, and defines manual verification procedures for UX, mobile responsiveness, and accessibility compliance. The implementation uses property-based testing for core logic with deterministic verification of the 26 correctness properties.

## Tasks

- [x] 1. Set up testing infrastructure
  - [x] 1.1 Install and configure Vitest testing framework
    - Add Vitest and related dependencies to package.json
    - Create vitest.config.ts with TypeScript and React support
    - Add test script to package.json
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [x] 1.2 Install fast-check for property-based testing
    - Add fast-check library for property-based testing
    - Configure fast-check to work with Vitest
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [x] 1.3 Create test utilities and helpers
    - Create src/__tests__/setup.ts with test utilities
    - Create helper functions for generating test data
    - Create fixtures for cat and adopter test data
    - _Requirements: 9.1, 9.5_

- [x] 2. Implement Compatibility Engine Tests
  - [x] 2.1 Write property tests for compatibility level determination
    - **Property 1: Compatibility Level Validity** - Test that any cat-adopter pair returns level "low", "moderate", or "high"
    - **Property 6: High Concern Level Determination** - Test that >= 2 significant concerns yields level "high"
    - **Property 7: Moderate Concern Level Determination** - Test that 1 significant concern yields level "moderate"
    - **Property 8: Low Concern Level Determination** - Test that empty concerns yields level "low"
    - _Requirements: 1.1, 1.6, 1.7, 1.8_
  
  - [x] 2.2 Write property tests for compatibility rules
    - **Property 2: Stress-Noise Rule Application** - Test high stress sensitivity + high noise generates "stress-noise" concern
    - **Property 3: Stress-Children Rule Application** - Test not comfortable with children + children 0-9 generates "stress-children" concern
    - **Property 4: Indoor-Safety Rule Application** - Test indoor-only required + not secure generates "indoor-safety" concern
    - **Property 5: FIV-Experience Rule Application** - Test FIV+ + no experience generates "fiv-experience" concern
    - _Requirements: 1.2, 1.3, 1.4, 1.5_
  
  - [x] 2.3 Write property test for alternative recommendations
    - **Property 9: Alternative Recommendations** - Test that "high" or "moderate" results include alternatives with "low" level
    - _Requirements: 1.9_
  
  - [x] 2.4 Write unit tests for remaining compatibility rules
    - Test energy-absence rule (high energy + long hours away)
    - Test vertical-space rule (needs vertical space + cannot provide)
    - Test dog-incompatibility rule (not comfortable with dogs + has dogs)
    - Test special-care rule (medical needs + no special needs experience)
    - Test unknown-compatibility rule (unknown compatibility with children)
    - Test senior-cat-absence rule (senior cat + long hours away)
    - _Requirements: 9.1_

- [x] 3. Implement Medical Escalation Tests
  - [x] 3.1 Write property tests for emergency phrase detection
    - **Property 10: Emergency Phrase Detection** - Test all 25 emergency phrases trigger isMedicalEmergency(true)
    - **Property 11: Non-Emergency Message Handling** - Test non-emergency messages return false
    - Test case-insensitive matching
    - _Requirements: 2.1, 2.4, 2.5_
  
  - [x] 3.2 Write unit tests for each emergency category
    - Test breathing difficulties category (5 phrases)
    - Test collapse/unresponsive category (6 phrases)
    - Test seizures category (3 phrases)
    - Test bleeding/trauma category (4 phrases)
    - Test poisoning category (3 phrases)
    - Test other urgent conditions category (4 phrases)
    - _Requirements: 2.4_

- [x] 4. Implement AI Coach Tests
  - [x] 4.1 Write property tests for coach response generation
    - **Property 12: Coach Response Context Integration** - Test hiding questions include cat name, day, and check-in history
    - **Property 13: Return Mention Response** - Test return-related messages include shelter contact suggestion
    - **Property 14: Timeline Response Structure** - Test timeline questions include all phases (Days 1-3, 4-7, 8-14, Weeks 2-4)
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [x] 4.2 Write property tests for fallback mechanism
    - **Property 15: Fallback Response Mechanism** - Test Gemini API failure returns fallback response
    - **Property 16: Fallback Disclaimer** - Test fallback responses include disclaimer
    - _Requirements: 3.5, 3.6, 11.1_
  
  - [x] 4.3 Write unit tests for coach edge cases
    - Test medical disclaimer presence in all responses
    - Test empty message handling
    - Test Gemini API timeout handling
    - _Requirements: 3.7, 11.1_

- [x] 5. Implement Check-In System Tests
  - [x] 5.1 Write property tests for check-in data handling
    - **Property 17: Check-In Data Completeness** - Test saved check-ins contain all required fields
    - **Property 18: Current Day Calculation** - Test day calculation with various check-in arrays
    - _Requirements: 4.1, 4.2, 4.4_
  
  - [x] 5.2 Write integration tests for check-in flow
    - Test check-in save and retrieval cycle
    - Test progress timeline display order
    - Test empty check-ins display Day 1
    - _Requirements: 4.3, 9.4_

- [x] 6. Implement Demo Cat Data Validation Tests
  - [x] 6.1 Write property tests for demo cat data completeness
    - **Property 19: Demo Cat Data Completeness** - Test all cats have required fields
    - **Property 20: Demo Cat Behavior Completeness** - Test behavior objects have all fields with valid enum values
    - **Property 21: Demo Cat Care Completeness** - Test care objects have all required fields
    - _Requirements: 5.2, 5.3, 5.4_
  
  - [x] 6.2 Write unit tests for demo cat retrieval
    - Test getCatById returns correct cat for each valid ID
    - **Property 22: Invalid Cat ID Handling** - Test invalid IDs return undefined
    - Test exactly 9 demo cats exist with unique IDs (expanded from 6 to 9: added cleo, oliver, bella)
    - _Requirements: 5.1, 5.5, 5.6_

- [ ] 7. Checkpoint - Core tests complete
  - Ensure all property-based tests pass
  - Ensure all unit tests pass
  - Ask the user if questions arise.

- [ ] 8. Implement Accessibility Tests
  - [x] 8.1 Write property tests for accessibility requirements
    - **Property 23: Image Alt Text Presence** - Test all cat photos have non-empty alt attributes
    - **Property 24: Form Label Association** - Test all form inputs have associated labels
    - **Property 25: Button Accessible Name** - Test all buttons have discernible accessible names
    - _Requirements: 8.2, 8.3, 8.7_
  
  - [ ] 8.2 Write unit tests for accessibility components
    - Test visible focus indicators on interactive elements
    - Test screen reader message announcements in chat
    - Test color contrast ratios (4.5:1 normal, 3:1 large text)
    - Test non-color indicators for risk levels
    - _Requirements: 8.1, 8.4, 8.5, 8.6_

- [x] 9. Implement Error Handling Tests
  - [x] 9.1 Write property tests for error scenarios
    - **Property 26: Empty Input Disables Send** - Test empty chat input disables send button
    - Test incomplete assessment highlights missing fields
    - _Requirements: 11.3, 11.4_
  
  - [x] 9.2 Write unit tests for error handling
    - Test Gemini API failure returns fallback without crash
    - Test invalid cat ID displays not-found message
    - Test network error displays user-friendly message with retry
    - _Requirements: 11.1, 11.2, 11.5_

- [ ] 10. Create manual verification procedures document
  - [ ] 10.1 Write adopter assessment flow test procedure
    - Document steps to complete full assessment from landing page to match report
    - Define expected outcomes at each step
    - Include screenshots or visual references where helpful
    - _Requirements: 10.1_
  
  - [ ] 10.2 Write AI coach conversation test procedure
    - Document test case for normal conversation flow
    - Document test case for emergency phrase detection
    - Include expected emergency message and contact display
    - _Requirements: 10.2_
  
  - [ ] 10.3 Write mobile responsiveness test procedure
    - Document testing at 375px viewport width
    - Document testing at 768px viewport width
    - Document testing at 1024px viewport width
    - Include specific checks for chat interface and assessment form
    - _Requirements: 10.3, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
  
  - [ ] 10.4 Write keyboard navigation test procedure
    - Document tab navigation through all pages
    - Define expected focus order and visible indicators
    - Include shortcuts and accessibility keys
    - _Requirements: 10.4, 8.1_
  
  - [ ] 10.5 Write screen reader test procedure
    - Document VoiceOver (macOS) testing steps
    - Document NVDA (Windows) testing steps
    - Define expected announcements for chat messages
    - _Requirements: 10.5, 8.4_
  
  - [ ] 10.6 Write cat image verification test procedure
    - Document verification that all 6 demo cat images load
    - Document alt text verification for each image
    - Include expected alt text for each cat
    - _Requirements: 10.6, 8.2_
  
  - [ ] 10.7 Write shelter staff workflow test procedure
    - Document steps for adding a new cat
    - Document steps for viewing insights dashboard
    - Document steps for reviewing adoptions
    - _Requirements: 10.7_

- [ ] 11. Add shelter insights placeholder documentation
  - [ ] 11.1 Add visual indicator for demo data
    - Add visible note or badge indicating demonstration data
    - Ensure indicator is prominent but not intrusive
    - _Requirements: 6.1_
  
  - [ ] 11.2 Add code comments for placeholder data
    - Add comment indicating data is placeholder
    - Document what real analytics should replace
    - _Requirements: 6.2_
  
  - [ ] 11.3 Verify demo metrics display
    - Confirm active adoptions metric displays
    - Confirm average time to adoption displays
    - Confirm high concerns reviewed displays
    - Confirm adopter satisfaction displays
    - Confirm cats needing attention list displays
    - Confirm common concerns list displays
    - _Requirements: 6.3_

- [ ] 12. Final checkpoint - All verification complete
  - Ensure all automated tests pass
  - Ensure manual verification procedures are documented
  - Ensure accessibility tests pass
  - Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Property-based tests validate universal correctness properties across all inputs
- Unit tests validate specific examples and edge cases
- Manual verification procedures ensure UX quality that cannot be automated
- Each property test references a specific property from the design document
- Tests are organized by component for focused implementation
- The testing framework (Vitest + fast-check) provides both unit and property-based testing capabilities

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3"] },
    { "id": 2, "tasks": ["2.1", "3.1", "6.1"] },
    { "id": 3, "tasks": ["2.2", "2.3", "2.4", "3.2", "4.1", "5.1", "6.2"] },
    { "id": 4, "tasks": ["4.2", "4.3", "5.2", "8.1", "9.1", "9.2"] },
    { "id": 5, "tasks": ["8.2", "10.1", "10.2", "10.3", "10.4", "10.5", "10.6", "10.7"] },
    { "id": 6, "tasks": ["11.1", "11.2", "11.3"] }
  ]
}
```
