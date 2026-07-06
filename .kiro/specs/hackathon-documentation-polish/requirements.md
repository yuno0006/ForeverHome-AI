# Requirements Document

## Introduction

ForeverHome AI is being submitted to the #HackTheKitty hackathon. Judges will evaluate the project primarily through written documentation, in-app pages, screenshots, and video — not necessarily by running the code themselves. This feature covers a full documentation audit and polish pass across all existing documentation surfaces (root `README.md`, `docs/*.md`, the in-app `/about` and `/privacy` pages, and `firestore.rules` references) so that judges encounter zero factual errors, zero broken links, zero placeholder text, and can clearly evaluate the project against every stated judging criterion (Documentation 10%, Security 15%, Theme Relevance 15%, Technical Execution 25%, Innovation 20%, UX/UI 15%) without needing to ask the team questions.

This is a documentation-only feature. No application code, UI components, or business logic will be modified as part of this work, with the possible exception of adding new static documentation artifacts (e.g., a `LICENSE` file, a `CONTRIBUTING.md`, or a Terms of Service page) if confirmed as in-scope.

## Glossary

- **Documentation_Set**: The complete collection of documentation artifacts in scope for this feature: root `README.md`, `docs/README.md`, `docs/architecture.md`, `docs/api.md`, `docs/security.md`, the in-app `/about` page, and the in-app `/privacy` page.
- **Documentation_Auditor**: The role (human or agent) performing the accuracy and consistency review of the Documentation_Set against the actual implemented codebase.
- **Judge**: A hackathon evaluator who scores the project against the published #HackTheKitty judging rubric, who may or may not run the application locally.
- **User_Guide**: A step-by-step walkthrough of every core feature of the application, covering both the Adopter role and the Shelter_Staff role, referenced by exact route paths.
- **Differentiation_Section**: A documentation section that explains what makes ForeverHome AI distinct from generic AI pet-matching tools (e.g., the deterministic Compatibility_Engine and the Medical_Safety_Layer).
- **Compatibility_Engine**: The deterministic, rule-based scoring system (`src/lib/compatibilityEngine.ts`) that evaluates cat/adopter compatibility without using AI.
- **Medical_Safety_Layer**: The deterministic keyword-detection system (`src/lib/medicalEscalation.ts`) that intercepts messages before any AI call to detect potential medical emergencies.
- **Privacy_Policy**: The combined set of privacy-related content presented to end users, comprising the in-app `/privacy` page and any equivalent written policy content in the Documentation_Set.
- **Security_Report**: The security architecture and scan documentation for the project, comprising `docs/security.md` and any external scan artifact (e.g., an Aikido scan report) referenced from it.
- **Placeholder_Text**: Unresolved template text left in a document, such as `[your-vercel-domain]`, `[TBD]`, or similar bracketed placeholders that are not resolved to a concrete value or explicitly marked as an example.
- **Route_Reference**: A documented application URL path (e.g., `/coach/[adoptionId]`) that is claimed to exist and function within the deployed or local application.

## Requirements

### Requirement 1: Documentation Accuracy Audit

**User Story:** As a hackathon judge, I want every claim in the project documentation to match what the application actually does, so that I can trust the documentation without needing to independently verify each feature in code.

#### Acceptance Criteria

1. WHEN the Documentation_Auditor reviews a Feature_Claim (a claim expressed in prose, a bullet point, or a code/API example) in the Documentation_Set, THE Documentation_Auditor SHALL verify the claim against the corresponding implementation in `src/app` or `src/lib` before marking the claim as accurate.
2. IF a Feature_Claim in the Documentation_Set does not match the current implementation, THEN THE Documentation_Auditor SHALL correct the claim to match the implementation or remove the claim from the Documentation_Set, choosing whichever resolution is accurate on a case-by-case basis.
3. IF a Route_Reference in the Documentation_Set does not correspond to an existing page under `src/app`, THEN THE Documentation_Auditor SHALL correct the Route_Reference to match an existing route or remove the reference.
4. THE Documentation_Auditor SHALL NOT consider the audit complete WHILE any Route_Reference identified as invalid per Acceptance Criterion 3 remains unresolved in the Documentation_Set.
5. IF Placeholder_Text exists anywhere in the Documentation_Set, THEN THE Documentation_Auditor SHALL replace the Placeholder_Text with a concrete value or an explicit labeled example.
6. WHEN the Documentation_Auditor completes the audit of a document in the Documentation_Set, THE Documentation_Auditor SHALL check every internal and relative link in that document and correct or remove any link that does not resolve to an existing file, section, or route.
7. THE Documentation_Set SHALL use exactly one canonical name for each system component across all documents, including: `Compatibility_Engine` for the compatibility engine, `Medical_Safety_Layer` for the medical safety layer, and a single consistent name for the escalation ticket feature implemented at `/api/escalation`.
8. WHEN the Documentation_Auditor finds a spelling, grammar, or formatting error in the Documentation_Set, THE Documentation_Auditor SHALL correct the error.
9. THE `docs/api.md` file SHALL document each of the six route handlers under `src/app/api` (`adoption-request`, `assistant`, `coach`, `counselor`, `escalation`, and `saved`), and for each route SHALL include the HTTP method and path, a request example, and a response example.

### Requirement 2: Judging Criteria Alignment

**User Story:** As a hackathon judge who may not run the code, I want the documentation to explicitly address each published judging category, so that I can fairly score the project from the README, screenshots, and video alone.

#### Acceptance Criteria

1. THE root `README.md` SHALL contain, for each of the following judging categories — Documentation, Security, Theme Relevance, Technical Execution, Innovation, and UX/UI — a Markdown heading (## or ###) whose text includes the category name, so that a Judge scanning the document's headings can locate each category.
2. IF a judging category listed in Criterion 1 lacks a Markdown heading (## or ###) whose text includes the category name (i.e., the category is not addressed explicitly), THEN THE Documentation_Auditor SHALL add such a heading to the content addressing that category so a Judge scanning the document can locate it without inference.
3. THE root `README.md` SHALL contain a Markdown heading (## or ###) whose text includes "Theme" or "#HackTheKitty", under which the project's connection to the "#HackTheKitty — World Cat Domination Day" hackathon theme is stated.
4. IF screenshots, a demo video, or a live deployment link exist, THEN THE root `README.md` SHALL include, under an identifying Markdown heading (## or ###), a reference consisting of a direct link (URL) or file path to each such artifact.
5. THE root `README.md` SHALL contain at least 3 embedded screenshots, or a written walkthrough covering at least 3 distinct screens or interactions, so that a Judge can assess the UX/UI criterion without running the application.

### Requirement 3: How to Use the App (User Guide)

**User Story:** As a hackathon judge or new user, I want a clear step-by-step guide to every core feature, so that I can understand and evaluate the application without needing to ask the team how to use it.

#### Acceptance Criteria

1. THE Documentation_Set SHALL contain a User_Guide section, either within the root `README.md` or as a new `docs/user-guide.md` file, that is linked from `docs/README.md`.
2. THE User_Guide SHALL describe the guest/demo flow that requires no account setup, listing the exact Route_Reference for each step in the order a user would navigate them, where a Route_Reference SHALL be a user-navigable page route corresponding to a `page.tsx` file under `src/app`, excluding any route under `src/app/api`.
3. THE User_Guide SHALL describe the Adopter role flow covering account registration or login, cat browsing, the assessment quiz, the compatibility report, the 14-Day AI Coach, and the escalation flow, with the exact Route_Reference for each step in the order a user would navigate them; because no dedicated escalation page exists, the escalation flow step SHALL reference the AI Coach page (Route_Reference) from which escalation is triggered.
4. THE User_Guide SHALL describe the Shelter_Staff role flow covering the shelter dashboard, cat inventory management, adoption tracking, and shelter insights, with the exact Route_Reference for each step in the order a user would navigate them.
5. IF a core feature exists in the codebase under `src/app` but has no corresponding step in the User_Guide, THEN THE Documentation_Auditor SHALL add a step covering that feature, where a core feature SHALL be defined as any distinct routable segment under `src/app` that contains a `page.tsx` file (including dynamic segments denoted by square-bracket folder names), explicitly excluding `layout.tsx`, `error.tsx`, `not-found.tsx`, and any route under `src/app/api`.
6. THE User_Guide SHALL cover every core feature present under `src/app`, as defined in Criterion 5; a core feature without a corresponding User_Guide step SHALL be considered a non-compliant documentation state regardless of whether the Documentation_Auditor has acted on it yet.
7. THE User_Guide SHALL state which demo credentials or guest access method a Judge can use to reach the authenticated views described in the Adopter role flow (Criterion 3) and the Shelter_Staff role flow (Criterion 4) without creating a real account.

### Requirement 4: Why We're Different (Competitive Differentiation)

**User Story:** As a hackathon judge comparing many submissions, I want a clear explanation of what makes ForeverHome AI unique, so that I can assess Innovation and Technical Execution without needing to infer differentiation myself.

#### Acceptance Criteria

1. THE root `README.md` SHALL contain a Differentiation_Section identifiable by a dedicated heading, and the Differentiation_Section SHALL contain at least 3 named contrast points, each explicitly contrasting a specific ForeverHome AI capability against generic AI-driven pet-matching or adoption tools.
2. THE Differentiation_Section SHALL state that the Compatibility_Engine is deterministic and rule-based rather than a black-box AI model, grounded in a fixed, named set of compatibility rules, and SHALL state at least one observable adopter-facing benefit resulting from this design, such as the ability for adopters to view which specific rules were triggered for a given match.
3. THE Differentiation_Section SHALL describe the Medical_Safety_Layer as a keyword-based detection mechanism that runs before the AI Coach generates a response, and SHALL state that this detection is not bypassed when the AI Coach fails or is unavailable.
4. THE Differentiation_Section SHALL use the terms Compatibility_Engine, Medical_Safety_Layer, and AI Coach identically to their usage in the "How ForeverHome AI Works" content on the in-app `/about` page, with no contradicting claims between the two.
5. WHEN the Differentiation_Section in `README.md` is updated, THE "How ForeverHome AI Works" content on the in-app `/about` page SHALL be updated in the same change so that the terminology and claims in both locations remain identical and non-contradictory.

### Requirement 5: Privacy Policy Completeness and Consistency

**User Story:** As a user or judge reviewing data handling practices, I want the privacy policy to be complete, accurate, and consistent everywhere it appears, so that I can trust the project's responsible data handling claims.

#### Acceptance Criteria

1. THE Privacy_Policy SHALL describe, at minimum, what data is collected, how the data is used, how the data is protected, user rights over the data, data retention behavior, and a contact method for privacy questions.
2. THE in-app `/privacy` page and any written Privacy_Policy content in the Documentation_Set SHALL state an identical data retention duration value for assessment records, and SHALL NOT contain any conflicting statement regarding the data-sharing stance (e.g., whether data is sold to third parties) between the two locations.
3. IF the in-app `/privacy` page displays a "Last updated" date, THEN THE Documentation_Auditor SHALL set that date to a value within 3 calendar days of the date of the most recent substantive edit to the Privacy_Policy content, and THE displayed date SHALL NOT be later than the current date.
4. WHERE the Documentation_Set includes a written policy document separate from the in-app `/privacy` page, THE written policy document SHALL link to the in-app `/privacy` page and vice versa; THIS cross-linking requirement SHALL NOT apply when no such separate written policy document exists.
5. THE Privacy_Policy SHALL disclose that AI Coach conversations and compatibility assessment answers are transmitted to a third-party AI provider (Google Gemini) for processing.

### Requirement 6: Terms of Service Scope (Confirmed Out of Scope)

**User Story:** As the project owner, I have decided that a separate Terms of Service is not needed for this hackathon submission, so that documentation effort stays focused on what judges actually expect.

#### Acceptance Criteria

1. THE Documentation_Auditor SHALL NOT create a Terms of Service page or document as part of this feature.
2. THE Privacy_Policy SHALL remain the single user-facing policy document for this feature.
3. THE in-app `/privacy` page SHALL continue to exist and contain the Privacy_Policy content, and the Disclaimer sections of the root `README.md` and the in-app `/about` page SHALL continue to exist and contain the disclaimer content that would otherwise live in a Terms of Service (acceptable use, non-veterinary/non-professional-advice disclaimer, account termination), for the duration of this feature.
4. WHEN new disclaimer content relevant to acceptable use, non-veterinary/non-professional-advice disclaimers, or account termination is identified during this feature, THE Documentation_Auditor SHALL add that content to the existing Disclaimer sections of the root `README.md` and the in-app `/about` page rather than creating a new document.
5. IF an existing reference to a Terms of Service page exists elsewhere in the application, THEN THE Documentation_Auditor SHALL remove that reference or redirect it to the in-app `/privacy` page.

### Requirement 7: Security Documentation and Aikido Scan Reporting

**User Story:** As a hackathon judge scoring the Security criterion, I want current, accurate security documentation and a real Aikido scan report referenced in the documentation, so that I can award security-related points including the Aikido scan bonus with confidence.

#### Acceptance Criteria

1. THE Documentation_Auditor SHALL verify every claim in `docs/security.md` by tracing it to a corresponding artifact in `firestore.rules`, `src/lib/verifyAuthToken.ts`, `src/lib/medicalEscalation.ts`, or `src/lib/aiLoggingService.ts`, and SHALL correct any claim for which no matching artifact exists or whose described behavior no longer matches that artifact.
2. THE user SHALL run an Aikido (or equivalent) automated security scan against the codebase before this feature is considered complete.
3. WHEN the Aikido scan results are available, THE Security_Report SHALL reference the scan results as either a "no issues found" statement or a findings report classifying each finding by severity (Critical/High/Medium/Low/Informational) with a count of findings per severity level, together with a link to the report artifact or an embedded summary, rather than only mentioning Aikido as a future recommendation.
4. IF the Aikido scan surfaces findings, THEN THE Security_Report SHALL state, for each finding, its severity and a remediated-or-open status, and SHALL include a rationale for any finding left open.
5. THE `docs/security.md` file (within the Documentation_Set, defined for this requirement as the files in the `docs/` directory) SHALL NOT list an item under "Recommendations for Production" that has already been implemented elsewhere in the Documentation_Set or codebase, and SHALL remove "Integrate Aikido security scanning" from that list once the scan has been run and its results are documented.

### Requirement 8: Project Hygiene Documentation (LICENSE and CONTRIBUTING Confirmed Out of Scope)

**User Story:** As a hackathon judge browsing the repository, I want accurate setup instructions, so that I can run the project without confusion, even though the project owner has decided not to add a LICENSE or CONTRIBUTING file for this submission.

#### Acceptance Criteria

1. THE Documentation_Auditor SHALL NOT create a `LICENSE` file as part of this feature.
2. THE Documentation_Auditor SHALL NOT create a `CONTRIBUTING.md` file as part of this feature.
3. THE "Getting Started" section of the root `README.md` SHALL list environment variables that exactly match the set of environment variables read by the application source code (excluding test files, `node_modules`, and build output directories), with no environment variable missing from the README that is read by the source code and no environment variable listed in the README that is not read by the source code.
4. THE "Getting Started" section of the root `README.md` SHALL list, for each `npm` script defined in `package.json` that is relevant to setting up or running the application (excluding test files, `node_modules`, and build output directories), a runnable invocation command (e.g., `npm run <script-name>`) that a reader can copy and execute, with no relevant script missing from the README and no listed command referencing a script that is not defined in `package.json`.

### Requirement 9: Final Consistency Verification Pass

**User Story:** As the project owner preparing for judging, I want a final verification pass across all documentation, so that judges find no errors, dead links, or contradictions anywhere in the submission.

#### Acceptance Criteria

1. WHEN all documentation edits from Requirements 1 through 8 are complete, THE Documentation_Auditor SHALL perform a final pass that identifies the features listed in the root `README.md`, the in-app `/about` page, and `docs/architecture.md`, and checks each listed feature for presence and correspondence against the actual routes and components under `src/app`.
2. IF the final pass finds a feature listed in one document but absent from another, THEN THE Documentation_Auditor SHALL reconcile the documents using the actual routes and components under `src/app` as the source of truth, updating each document's feature list to match what exists in `src/app`.
3. IF the final pass finds any remaining Placeholder_Text, THEN THE Documentation_Auditor SHALL resolve it by replacing the Placeholder_Text with content derived from the corresponding implementation in `src/app`.
4. IF the final pass finds any remaining broken Route_Reference, THEN THE Documentation_Auditor SHALL resolve it by correcting the Route_Reference to match an existing route under `src/app`, or removing the Route_Reference if no corresponding route exists.
5. WHEN a correction is made under criteria 2, 3, or 4, THE Documentation_Auditor SHALL re-verify the corrected item against `src/app` to confirm the reported inconsistency, Placeholder_Text, or broken Route_Reference no longer exists before considering that correction complete.
6. WHEN the final pass and all corrections are complete, THE Documentation_Auditor SHALL produce a summary list of every correction made, where each entry states the document corrected, the location within the document, and a description of the correction.

## Scope Decisions (Confirmed)

The following decisions were ambiguous in the original request and have been confirmed directly with the user:

1. **Terms of Service** — Confirmed out of scope. Privacy Policy alone is sufficient; see Requirement 6.
2. **Aikido Security Scan** — Confirmed in scope. The user will run the scan and its results will be documented in `docs/security.md`; see Requirement 7.
3. **LICENSE file** — Confirmed out of scope. No `LICENSE` file will be added; see Requirement 8.
4. **CONTRIBUTING.md** — Confirmed out of scope. No `CONTRIBUTING.md` will be added; see Requirement 8.

## Open Questions Requiring User Confirmation

1. **Demo video / screenshots / live deployment link** — Do these assets already exist and simply need to be referenced/linked in the README, or do they still need to be created (outside the scope of this documentation feature)?
