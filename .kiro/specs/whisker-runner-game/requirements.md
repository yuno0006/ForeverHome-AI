# Requirements Document

## Introduction

Whisker Runner is a cat-themed endless runner mini-game added to ForeverHome AI as a small delight/retention feature. It appears exclusively inside the post-adoption-request congratulations card on the compatibility report page, giving adopters a brief, on-brand activity to enjoy while they wait for shelter follow-up, before being guided back toward the 14-Day Coach. This spec covers the game's placement, gameplay mechanics, scoring/persistence, and UI/UX/accessibility requirements. It replaces a previously removed mini-game (`CatMouseGame`) and is held to a materially higher UI/UX and code-quality bar, reusing the app's existing design tokens and UI primitives rather than introducing new styling patterns.

## Glossary

- **Game**: The Whisker Runner endless runner feature described in this spec
- **Report_Page**: `src/app/report/[matchId]/page.tsx`, specifically the `requestSent` branch shown after an adoption request is submitted
- **Congrats_Card**: The confirmation card within Report_Page displaying "Congrats on taking the next step with {cat.name}! 🎉", shelter contact info, and the "Continue to 14-Day Coach" button
- **Game_Dialog**: The modal/overlay that hosts the Game, launched from the Congrats_Card and dismissible back to it without navigation
- **Run**: A single play session from the moment the player starts until a collision ends it
- **Obstacle**: A procedurally spawned hazard the player must avoid; either a ground obstacle (avoided by jumping) or an air obstacle (avoided by ducking)
- **Best_Score**: The highest score ever achieved by the player on the current device/browser, persisted in `localStorage`
- **Results_Panel**: The lightweight, non-blocking panel shown immediately after a collision, displaying current score vs. Best_Score, with no traditional "game over" screen
- **Design_Palette**: The app's existing color tokens (coral, sage, honey, cocoa, cream, lavender, etc.) and UI primitives (`Button`, `Card`, `Dialog`, `StickerBadge`) defined in `globals.css` and `src/components/ui/`

## Requirements

### Requirement 1: Placement and Entry Point

**User Story:** As an adopter who just submitted an adoption request, I want an easy way to open a quick game from the congratulations screen, so that I have something light to do while I wait to hear from the shelter.

#### Acceptance Criteria

1. THE Game SHALL be accessible only from the Congrats_Card within the `requestSent` branch of Report_Page, and SHALL NOT be placed on the `/cats` page, the homepage, or any other route.
2. WHEN the Congrats_Card is displayed, THE Report_Page SHALL display a new secondary row containing the text "While you wait to hear back from the shelter, take a quick breather —" followed by two actions: a "Play: Whisker Runner 🐾" button and the existing "Continue to 14-Day Coach →" button.
3. THE "Continue to 14-Day Coach →" button SHALL retain its existing primary visual styling, position semantics, and `onClick` navigation behavior unchanged by the addition of the "Play: Whisker Runner 🐾" button.
4. THE "Play: Whisker Runner 🐾" button SHALL use secondary visual styling so it is visually subordinate to the "Continue to 14-Day Coach →" button.
5. WHEN the adopter clicks "Play: Whisker Runner 🐾", THE Game SHALL open in the Game_Dialog without navigating away from Report_Page and without altering the current URL.
6. THE Game SHALL be fully playable — including gameplay, scoring, and Best_Score persistence — without requiring the adopter to be logged in, and SHALL behave identically whether or not the adopter is logged in.
7. WHEN the adopter dismisses the Game_Dialog (via close button, Escape key, or backdrop click), THE Report_Page SHALL return to displaying the Congrats_Card exactly as it was before the Game_Dialog was opened, with no loss of shelter contact information or adoption request state.

### Requirement 2: Core Gameplay Mechanics

**User Story:** As a player, I want simple, responsive controls to jump over ground obstacles and duck under overhead obstacles, so that the game is easy to pick up and play in a short session.

#### Acceptance Criteria

1. WHILE a Run is active, THE Game SHALL automatically move the cat character left-to-right across the bottom of the track without additional player input required to advance.
2. WHEN the player presses a jump input (Space or Up arrow key on desktop; tap on the on-screen Jump control) while the cat is grounded and not ducking, THE Game SHALL apply upward velocity to the cat so it can clear ground obstacles.
3. WHEN the player presses and holds a duck input (Down arrow key on desktop; press-and-hold on the on-screen Duck control) THE Game SHALL reduce the cat's hurtbox height so it can pass under air obstacles.
4. WHILE the cat is airborne, THE Game SHALL apply continuous downward gravity acceleration until the cat returns to the ground line.
5. WHEN a jump input is received while the cat is already airborne or while ducking, THE Game SHALL ignore the input (no double-jump, no jump-while-ducking).
6. THE Game SHALL procedurally spawn Obstacles of both ground type (e.g., vacuum cleaner, laundry basket, broom) and air type (e.g., hanging string or bird toy swinging overhead) at varying, non-fixed intervals as the Run progresses.
7. WHILE a Run is active, THE Game SHALL gradually increase scroll speed over elapsed time/distance, up to a defined maximum speed, so difficulty rises the longer the Run continues.
8. WHEN the cat's hurtbox overlaps an Obstacle's hurtbox on both axes simultaneously, THE Game SHALL register a collision and end the Run.
9. THE Game SHALL treat tap, click, Space, or Up arrow as the primary jump input, mirroring the single-input, tap-to-jump interaction model of the Chrome Dino game, with duck functioning as a secondary input.
10. THE Game SHALL end the Run immediately upon any collision between the cat and an Obstacle, using collision detection as the sole game-ending mechanism rather than a timer or lives system.
11. WHEN a jump or duck input is received while the Run's status is "ended", THE Game SHALL ignore the input, and no jump or duck input SHALL have any gameplay effect until a new Run is started via the Results_Panel's "Play again" action.

### Requirement 3: Scoring and Best-Score Persistence

**User Story:** As a player, I want my score to reflect how long I survived and to see how I compare against my personal best, so that I feel a sense of progress across sessions.

#### Acceptance Criteria

1. WHILE a Run is active, THE Game SHALL increase the player's score as a monotonically non-decreasing function of distance traveled/time survived.
2. THE Game SHALL persist the Best_Score across browser sessions using `localStorage`, keyed independently of any user account.
3. WHEN a Run ends with a score exceeding the previously persisted Best_Score, THE Game SHALL update the persisted Best_Score to the new value and mark the Run as a new high score.
4. WHEN a Run ends with a score that does not exceed the previously persisted Best_Score, THE Game SHALL leave the persisted Best_Score unchanged.
5. IF `localStorage` is unavailable or throws an error when reading or writing the Best_Score, THEN THE Game SHALL track and update the Best_Score in memory for the current session, and THE Results_Panel and all current-session Best_Score comparisons SHALL reflect that in-memory Best_Score, without throwing an error or blocking gameplay.
6. WHILE a Run is active or in the Results_Panel, THE Game SHALL display the current score and the Best_Score simultaneously.

### Requirement 4: Run End Behavior (No Traditional Game Over)

**User Story:** As a player, I want the end of a run to feel light and encouraging rather than punishing, so that the tone matches the supportive, bonding-focused feel of the rest of the app.

#### Acceptance Criteria

1. WHEN a collision ends a Run, THE Game SHALL display the Results_Panel immediately within the same Game_Dialog, without a separate "Game Over" screen, fail graphic, or blocking dead-end state.
2. THE Results_Panel SHALL display the Run's final score and the current Best_Score.
3. IF the Run's final score is a new high score, THEN THE Results_Panel SHALL display a "new high score" celebration (visual and textual) distinct from a non-record run's Results_Panel.
4. THE Results_Panel SHALL provide a "Play again" action that starts a new Run while preserving the Best_Score.
5. THE Results_Panel SHALL provide an action that closes the Game_Dialog and returns to the Congrats_Card.
6. IF the Run's final score is strictly greater than the Best_Score value recorded immediately before the Run began, THEN THE Results_Panel SHALL display the "new high score" celebration, treating this score comparison as an equivalent, redundant trigger for the celebration alongside the primary new-high-score detection signal, regardless of whether that primary signal reported success.

### Requirement 5: Visual Design, Branding, and Component Reuse

**User Story:** As a product owner, I want the game to look and feel like a native part of ForeverHome AI, so that it raises the bar over the previously removed low-quality game rather than looking like a bolted-on arcade widget.

#### Acceptance Criteria

1. THE Game SHALL use the existing Design_Palette color tokens (e.g., coral, sage, honey, cocoa, cream) rather than introducing new colors outside that palette.
2. THE Game SHALL reuse existing UI primitives — `Dialog`, `Button`, `Card`, and `StickerBadge` — for its modal chrome, controls, and celebratory badge rather than introducing new bespoke component patterns for these purposes.
3. THE Game SHALL render a background with subtle parallax or day/night visual treatment consistent with the app's warm aesthetic.
4. THE Game SHALL use smooth, animated transitions (via CSS transitions, Framer Motion, or `requestAnimationFrame`-driven rendering) for gameplay motion and for the Game_Dialog's open/close and Results_Panel transitions.
5. THE Game SHALL render the cat character and Obstacles using a pixel-art (blocky, retro, low-resolution-styled) sprite aesthetic evoking the Chrome Dino game, while using the app's existing Design_Palette colors instead of grayscale.

### Requirement 6: Responsive and Accessible Controls

**User Story:** As a player on any device, I want controls that work naturally whether I'm on a phone or a laptop, so that I don't need special knowledge to play.

#### Acceptance Criteria

1. THE Game SHALL support desktop keyboard controls: Space or Up arrow for jump, Down arrow for duck.
2. THE Game SHALL display always-visible on-screen touch buttons for jump and duck, regardless of device type, so that controls are not exposed exclusively via keyboard.
3. THE Game SHALL support tap input for jump and press-and-hold input for duck on touch devices.
4. THE Game SHALL render and remain playable across mobile and desktop viewport widths without requiring horizontal scrolling within the Game_Dialog.
5. WHEN the operating system or browser reports a `prefers-reduced-motion: reduce` preference, THE Game SHALL disable or reduce decorative background motion (e.g., parallax drift) while keeping core gameplay (jump, duck, scroll, collision) fully functional.
6. IF the viewport is too narrow to render the Game fully without breaking layout or gameplay functionality, THEN THE Game SHALL allow horizontal scrolling within the Game_Dialog as a fallback rather than breaking layout or gameplay.

### Requirement 7: Lightweight Implementation Constraints

**User Story:** As a developer maintaining this codebase, I want the game built with the same lightweight tools used elsewhere in the app, so that it doesn't introduce new dependencies or a heavier maintenance burden.

#### Acceptance Criteria

1. THE Game SHALL be implemented using plain React state and `requestAnimationFrame`-driven or CSS/Framer-Motion-driven rendering, without introducing a physics engine or third-party game framework dependency.
2. THE Game SHALL be implemented using the project's existing technology stack (Next.js, TypeScript, Tailwind CSS, Framer Motion, lucide-react) without adding new runtime dependencies.
3. THE Game's core gameplay logic (movement, spawning, collision, scoring) SHALL be implemented as pure, framework-independent functions separate from rendering code, so that gameplay logic can be tested independently of the DOM.
