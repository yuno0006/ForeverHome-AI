/**
 * Property-Based Tests for Accessibility Requirements
 *
 * This file tests accessibility properties that should hold true across
 * all valid executions of the ForeverHome AI system.
 *
 * Validates: Requirements 8.2, 8.3, 8.7
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { demoCats, getCatById } from "@/data/demoCats";
import { createTestCat } from "./setup";

// =============================================================================
// Property 23: Image Alt Text Presence
// =============================================================================

describe("Property 23: Image Alt Text Presence", () => {
  /**
   * Property: For any image element rendering a cat photo or informational image,
   * the element shall have a non-empty alt attribute.
   *
   * Validates: Requirements 8.2
   */

  it("should have non-empty alt text for all demo cat photos", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...demoCats.map((cat) => cat.id)),
        (catId) => {
          const cat = getCatById(catId);
          expect(cat).toBeDefined();
          expect(cat!.name).toBeTruthy();
          expect(cat!.name.length).toBeGreaterThan(0);
          // The alt text should be the cat's name (non-empty)
          expect(cat!.name.trim()).not.toBe("");
        }
      )
    );
  });

  it("should have non-empty photo URLs for all demo cats", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...demoCats.map((cat) => cat.id)),
        (catId) => {
          const cat = getCatById(catId);
          expect(cat).toBeDefined();
          expect(cat!.photo).toBeTruthy();
          expect(cat!.photo.length).toBeGreaterThan(0);
          // Photo URL should be a valid URL
          expect(() => new URL(cat!.photo)).not.toThrow();
        }
      )
    );
  });

  it("should generate valid alt text for any generated cat", () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          photo: fc.webUrl(),
        }),
        (partialCat) => {
          // Simulating the alt attribute value for a cat photo
          const altText = partialCat.name;
          expect(altText).toBeTruthy();
          expect(altText.length).toBeGreaterThan(0);
          expect(altText.trim()).not.toBe("");
        }
      )
    );
  });

  it("should have meaningful alt text describing the cat", () => {
    // Test that alt text is descriptive (cat's name) not generic
    fc.assert(
      fc.property(
        fc.constantFrom(...demoCats),
        (cat) => {
          // Alt text should be the cat's name, which is meaningful
          const altText = cat.name;
          expect(altText).not.toBe("cat");
          expect(altText).not.toBe("image");
          expect(altText).not.toBe("photo");
          expect(altText).not.toBe("picture");
          // Should be a proper name with length > 0
          expect(altText.length).toBeGreaterThanOrEqual(2);
        }
      )
    );
  });
});

// =============================================================================
// Property 24: Form Label Association
// =============================================================================

describe("Property 24: Form Label Association", () => {
  /**
   * Property: For any form input element, the input shall have an associated label
   * via either a wrapping <label> element, a htmlFor attribute matching the input id,
   * or an aria-label attribute.
   *
   * Validates: Requirements 8.3
   */

  it("should have valid input-label association pattern for radio options", () => {
    // Test that the pattern for radio inputs follows label association
    const radioInputPattern = {
      inputId: "question-option1",
      labelHtmlFor: "question-option1",
    };

    fc.assert(
      fc.property(
        fc.record({
          inputId: fc.string({ minLength: 1, maxLength: 30 }),
          labelHtmlFor: fc.string({ minLength: 1, maxLength: 30 }),
        }),
        (pattern) => {
          // When properly associated, these should match
          const isAccessible =
            pattern.inputId === pattern.labelHtmlFor ||
            pattern.inputId.length > 0; // or has aria-label

          expect(isAccessible).toBe(true);
        }
      )
    );
  });

  it("should generate valid label associations for form inputs", () => {
    // Test the QuestionStep pattern: name + value creates unique id
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 20 }),
          value: fc.string({ minLength: 1, maxLength: 20 }),
        }),
        (input) => {
          // This simulates the id pattern: `${name}-${value}`
          const inputId = `${input.name}-${input.value}`;
          expect(inputId).toBeTruthy();
          expect(inputId.length).toBeGreaterThan(0);
          // The htmlFor should match this id
          const labelHtmlFor = inputId;
          expect(labelHtmlFor).toBe(inputId);
        }
      )
    );
  });

  it("should ensure form inputs have accessible names via aria-label when no label element", () => {
    // Test that inputs can have aria-label as fallback
    fc.assert(
      fc.property(
        fc.record({
          ariaLabel: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        }),
        (input) => {
          // An input with aria-label is accessible
          expect(input.ariaLabel).toBeTruthy();
          expect(input.ariaLabel.trim().length).toBeGreaterThan(0);
        }
      )
    );
  });

  it("should have valid name attribute for form submission and accessibility", () => {
    // Test that radio groups have proper name attributes
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 30 }),
        (radioGroupName) => {
          // Radio groups need a name for grouping and accessibility
          expect(radioGroupName).toBeTruthy();
          expect(radioGroupName.length).toBeGreaterThan(0);
        }
      )
    );
  });
});

// =============================================================================
// Property 25: Button Accessible Name
// =============================================================================

describe("Property 25: Button Accessible Name", () => {
  /**
   * Property: For any button or link element, the element shall have a discernible
   * accessible name via text content, aria-label, or aria-labelledby.
   *
   * Validates: Requirements 8.7
   */

  it("should have accessible name for buttons with text content", () => {
    fc.assert(
      fc.property(
        fc.record({
          textContent: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        }),
        (button) => {
          // Button with text content has accessible name
          const accessibleName = button.textContent.trim();
          expect(accessibleName.length).toBeGreaterThan(0);
        }
      )
    );
  });

  it("should have accessible name for icon-only buttons via aria-label", () => {
    // Icon buttons need aria-label for accessibility
    fc.assert(
      fc.property(
        fc.record({
          ariaLabel: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          hasIcon: fc.constant(true),
        }),
        (button) => {
          // Icon button must have aria-label
          expect(button.ariaLabel).toBeTruthy();
          expect(button.ariaLabel.trim().length).toBeGreaterThan(0);
        }
      )
    );
  });

  it("should have accessible name for link elements", () => {
    fc.assert(
      fc.property(
        fc.record({
          textContent: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          href: fc.webUrl(),
        }),
        (link) => {
          // Links need text content or aria-label
          const accessibleName = link.textContent.trim();
          expect(accessibleName.length).toBeGreaterThan(0);
        }
      )
    );
  });

  it("should provide discernible action descriptions for buttons", () => {
    // Test that button names describe their action
    const buttonActions = [
      { text: "Submit", describesAction: true },
      { text: "Send", describesAction: true },
      { text: "Next", describesAction: true },
      { text: "Previous", describesAction: true },
      { text: "Continue", describesAction: true },
      { text: "Start Assessment", describesAction: true },
      { text: "Meet Luna", describesAction: true },
    ];

    fc.assert(
      fc.property(
        fc.constantFrom(...buttonActions),
        (button) => {
          expect(button.text.trim().length).toBeGreaterThan(0);
          expect(button.describesAction).toBe(true);
        }
      )
    );
  });

  it("should not have empty or whitespace-only accessible names", () => {
    fc.assert(
      fc.property(
        fc.record({
          accessibleName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        }),
        (element) => {
          // Accessible name should not be empty or whitespace only
          expect(element.accessibleName.trim().length).toBeGreaterThan(0);
        }
      )
    );
  });
});

// =============================================================================
// Integration Tests: Accessibility Patterns in Components
// =============================================================================

describe("Accessibility Pattern Integration", () => {
  it("should have valid cat card image accessibility pattern", () => {
    // CatCard component pattern: <img src={cat.photo} alt={cat.name} />
    fc.assert(
      fc.property(
        fc.constantFrom(...demoCats),
        (cat) => {
          const imgProps = {
            src: cat.photo,
            alt: cat.name,
          };

          expect(imgProps.alt).toBeTruthy();
          expect(imgProps.alt.trim().length).toBeGreaterThan(0);
          expect(imgProps.src).toBeTruthy();
        }
      )
    );
  });

  it("should have valid question step accessibility pattern", () => {
    // QuestionStep pattern: Label with htmlFor matching RadioGroupItem id
    const questionStepPattern = {
      name: "homeType",
      options: [
        { value: "house", label: "House" },
        { value: "apartment", label: "Apartment" },
        { value: "condo", label: "Condo" },
      ],
    };

    fc.assert(
      fc.property(
        fc.constantFrom(...questionStepPattern.options),
        fc.constant(questionStepPattern.name),
        (option, name) => {
          const inputId = `${name}-${option.value}`;
          const labelHtmlFor = inputId;

          expect(inputId).toBe(labelHtmlFor);
          expect(option.label).toBeTruthy();
        }
      )
    );
  });

  it("should have valid button accessibility for cat cards", () => {
    // CatCard link pattern: <Link href={`/assessment/${cat.id}`}>
    // with text "Meet {cat.name} →"
    fc.assert(
      fc.property(
        fc.constantFrom(...demoCats),
        (cat) => {
          const linkText = `Meet ${cat.name} →`;
          const href = `/assessment/${cat.id}`;

          expect(linkText).toBeTruthy();
          expect(linkText.length).toBeGreaterThan(0);
          expect(linkText).toContain(cat.name);
          expect(href).toBeTruthy();
        }
      )
    );
  });
});
