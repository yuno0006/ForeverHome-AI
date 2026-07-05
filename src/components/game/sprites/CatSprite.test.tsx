/**
 * Unit tests for `CatSprite`.
 *
 * Verifies:
 * - Every pose ("standing", "jumping", "ducking") renders an `<svg>` with the
 *   pixelated rendering technique applied (`shapeRendering="crispEdges"`).
 * - Every rendered `<rect>` fill is one of the five Design_Palette CSS variable
 *   tokens (coral/sage/honey/cocoa/cream) — no other fill values appear.
 *
 * _Requirements: 5.1, 5.5_
 */

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { CatSprite, type CatPose } from "./CatSprite";

const ALLOWED_FILLS = new Set([
  "var(--color-coral)",
  "var(--color-sage)",
  "var(--color-honey)",
  "var(--color-cocoa)",
  "var(--color-cream)",
]);

const POSES: CatPose[] = ["standing", "jumping", "ducking"];

describe("CatSprite", () => {
  it.each(POSES)("renders the %s pose with crispEdges shapeRendering", (pose) => {
    const { container } = render(<CatSprite pose={pose} />);
    const svg = container.querySelector("svg");

    expect(svg).not.toBeNull();
    // React renders the `shapeRendering` JSX prop as the kebab-case SVG
    // presentation attribute `shape-rendering` in the DOM.
    expect(svg?.getAttribute("shape-rendering")).toBe("crispEdges");
  });

  it.each(POSES)("renders the %s pose using only design-palette fill tokens", (pose) => {
    const { container } = render(<CatSprite pose={pose} />);
    const rects = container.querySelectorAll("rect");

    expect(rects.length).toBeGreaterThan(0);

    rects.forEach((rect) => {
      const fill = rect.getAttribute("fill");
      expect(fill).not.toBeNull();
      expect(ALLOWED_FILLS.has(fill as string)).toBe(true);
    });
  });
});
