/**
 * Unit tests for `ObstacleSprite`.
 *
 * Verifies:
 * - Every obstacle type ("ground", "air"), for each explicit `variant` index,
 *   renders an `<svg>` with the pixelated rendering technique applied
 *   (`shapeRendering="crispEdges"`).
 * - Every rendered `<rect>` fill is one of the five Design_Palette CSS variable
 *   tokens (coral/sage/honey/cocoa/cream) — no other fill values appear.
 *
 * _Requirements: 5.1, 5.5_
 */

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ObstacleSprite } from "./ObstacleSprite";
import type { ObstacleType } from "@/types/whiskerRunner";

const ALLOWED_FILLS = new Set([
  "var(--color-coral)",
  "var(--color-sage)",
  "var(--color-honey)",
  "var(--color-cocoa)",
  "var(--color-cream)",
]);

// Matches GROUND_VARIANTS (3 designs) / AIR_VARIANTS (2 designs) in ObstacleSprite.tsx.
const VARIANTS_BY_TYPE: Record<ObstacleType, number[]> = {
  ground: [0, 1, 2],
  air: [0, 1],
};

describe("ObstacleSprite", () => {
  (Object.keys(VARIANTS_BY_TYPE) as ObstacleType[]).forEach((type) => {
    VARIANTS_BY_TYPE[type].forEach((variant) => {
      it(`renders type="${type}" variant=${variant} with crispEdges shapeRendering`, () => {
        const { container } = render(<ObstacleSprite type={type} variant={variant} />);
        const svg = container.querySelector("svg");

        expect(svg).not.toBeNull();
        // React renders the `shapeRendering` JSX prop as the kebab-case SVG
        // presentation attribute `shape-rendering` in the DOM.
        expect(svg?.getAttribute("shape-rendering")).toBe("crispEdges");
      });

      it(`renders type="${type}" variant=${variant} using only design-palette fill tokens`, () => {
        const { container } = render(<ObstacleSprite type={type} variant={variant} />);
        const rects = container.querySelectorAll("rect");

        expect(rects.length).toBeGreaterThan(0);

        rects.forEach((rect) => {
          const fill = rect.getAttribute("fill");
          expect(fill).not.toBeNull();
          expect(ALLOWED_FILLS.has(fill as string)).toBe(true);
        });
      });
    });
  });
});
