"use client";

// Pixel-art obstacle sprites for the Whisker Runner mini-game.
//
// Deliberate, scoped visual exception (see design.md "Component 3: WhiskerRunnerGame"):
// obstacles are rendered as a blocky, low-resolution "pixel" grid — one <rect> per
// grid cell, with shapeRendering="crispEdges" — evoking the Chrome Dino game, but
// using the app's warm Design_Palette tokens (coral/sage/honey/cocoa/cream) instead
// of the original's grayscale sprites. This mirrors the technique used by CatSprite.
//
// Self-contained: takes no dependency on gameEngine/GameState. The caller
// (WhiskerRunnerGame) is responsible for positioning this component in world space;
// this component only knows how to draw itself at a given pixel size.

import { useMemo } from "react";
import type { ObstacleType } from "@/types/whiskerRunner";

interface ObstacleSpriteProps {
  type: ObstacleType;
  /** Selects a concrete design within `type` (e.g. 0 = vacuum cleaner). Omit for a stable random pick. */
  variant?: number;
  /** Rendered height in px; width is derived from the sprite's native aspect ratio. Defaults to 48. */
  size?: number;
  className?: string;
}

// Design token palette — see globals.css `--color-*` custom properties.
// Referencing the CSS variables (rather than hard-coded hex) keeps sprite fills
// tied directly to the Design_Palette tokens.
const PALETTE = {
  K: "var(--color-cocoa)", // outline / dark detail
  C: "var(--color-coral)", // primary body accents
  S: "var(--color-sage)", // basket weave / bird body
  H: "var(--color-honey)", // highlights / bristles / accents
  W: "var(--color-cream)", // light base / highlights
} as const;

type PixelChar = keyof typeof PALETTE | ".";

interface SpriteDef {
  name: string;
  rows: string[]; // each string is one row; each character is a PixelChar
}

// --- Ground obstacles (avoided by jumping): vacuum cleaner, laundry basket, broom ---

const VACUUM_CLEANER: SpriteDef = {
  name: "vacuum cleaner",
  rows: [
    "....KK....",
    "....KK....",
    "...KKKK...",
    "..KCCCCK..",
    "..KCCCCK..",
    "..KCHHCK..",
    "..KCCCCK..",
    "..KCCCCK..",
    "..KCCCCK..",
    "..KKKKKK..",
    ".KWWWWWWK.",
    ".KWWWWWWK.",
    "..K.KK.K..",
    "..KK..KK..",
  ],
};

const LAUNDRY_BASKET: SpriteDef = {
  name: "laundry basket",
  rows: [
    "..H......C..",
    ".HHH....CCC.",
    "SSSSSSSSSSSS",
    "SWSWSWSWSWSW",
    "SSSSSSSSSSSS",
    "SWSWSWSWSWSW",
    "SSSSSSSSSSSS",
    ".SSSSSSSSSS.",
    "..SSSSSSSS..",
  ],
};

const BROOM: SpriteDef = {
  name: "broom",
  rows: [
    "...KK...",
    "...KK...",
    "...KK...",
    "...KK...",
    "...KK...",
    "...KK...",
    "...KK...",
    "...KK...",
    "..KKKK..",
    ".HHHHHH.",
    "HHHHHHHH",
    "HHHHHHHH",
    "H.HH.HH.",
    "H.HH.HH.",
  ],
};

const GROUND_VARIANTS: SpriteDef[] = [VACUUM_CLEANER, LAUNDRY_BASKET, BROOM];

// --- Air obstacles (avoided by ducking): hanging string toy, bird toy ---

const HANGING_STRING_TOY: SpriteDef = {
  name: "hanging string toy",
  rows: [
    "..K...",
    "..K...",
    "..K...",
    "..K...",
    "..K...",
    "..K...",
    "..K...",
    ".KKK..",
    "KCCCCK",
    "KCHHCK",
    "KCCCCK",
    ".KKKK.",
  ],
};

const BIRD_TOY: SpriteDef = {
  name: "bird toy",
  rows: [
    "...K....",
    "...K....",
    "...K....",
    "...K....",
    "...K....",
    "...K....",
    "..SSSS..",
    ".SSSSSS.",
    "HSSSSSSH",
    "HHSSSSHH",
    ".H.SS.H.",
    "..H..H..",
  ],
};

const AIR_VARIANTS: SpriteDef[] = [HANGING_STRING_TOY, BIRD_TOY];

function getVariants(type: ObstacleType): SpriteDef[] {
  return type === "ground" ? GROUND_VARIANTS : AIR_VARIANTS;
}

export function ObstacleSprite({ type, variant, size = 48, className }: ObstacleSpriteProps) {
  const variants = getVariants(type);

  // Stable random pick when no explicit variant is given, so a mounted obstacle
  // instance doesn't change its design frame-to-frame (the parent re-renders this
  // component on every frame purely to reposition it via CSS transform).
  const randomVariant = useMemo(
    () => Math.floor(Math.random() * variants.length),
    [variants.length]
  );

  const resolvedIndex =
    variant !== undefined
      ? ((variant % variants.length) + variants.length) % variants.length
      : randomVariant;

  const sprite = variants[resolvedIndex];
  const rows = sprite.rows;
  const rowCount = rows.length;
  const colCount = rows[0]?.length ?? 0;

  const width = colCount > 0 && rowCount > 0 ? size * (colCount / rowCount) : size;

  return (
    <svg
      width={width}
      height={size}
      viewBox={`0 0 ${colCount} ${rowCount}`}
      shapeRendering="crispEdges"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={sprite.name}
      className={className}
    >
      {rows.map((row, rowIndex) =>
        row.split("").map((char, colIndex) => {
          if (char === ".") return null;
          const fill = PALETTE[char as keyof typeof PALETTE];
          if (!fill) return null;
          return (
            <rect
              key={`${rowIndex}-${colIndex}`}
              x={colIndex}
              y={rowIndex}
              width={1}
              height={1}
              fill={fill}
            />
          );
        })
      )}
    </svg>
  );
}

export default ObstacleSprite;
