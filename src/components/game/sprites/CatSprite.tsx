// Blocky, low-resolution "pixel" sprite for the Whisker Runner cat character.
//
// Deliberate, scoped visual exception to the app's usual soft/rounded illustration
// style (see .kiro/specs/whisker-runner-game/design.md, "Why this game" +
// Requirement 5.5): evokes the Chrome Dino game's retro blocky look, but built
// entirely from inline SVG <rect> elements on a fixed low-res grid (no raster
// assets, no new asset pipeline/dependency) and colored using only this app's
// existing coral/sage/honey/cocoa/cream design tokens (see src/app/globals.css)
// instead of grayscale.
//
// Each pose (standing/jumping/ducking) is authored as a list of grid-aligned
// rects on a fixed GRID_SIZE x GRID_SIZE unit grid. Some rects span multiple
// grid units (a common "chunky pixel" retro-art technique for grouping
// same-colored cells) but every rect's x/y/width/height stays aligned to the
// grid unit, preserving the blocky/pixelated look. `shapeRendering="crispEdges"`
// on the <svg> ensures the browser never anti-aliases the scaled-up edges.

export type CatPose = "standing" | "jumping" | "ducking";

interface CatSpriteProps {
  pose: CatPose;
  /** Rendered width/height in px (sprite is always square). Defaults to 48 (CAT_WIDTH). */
  size?: number;
  className?: string;
}

/** Fixed low-res "pixel" grid resolution the cat is authored on (16x16 units). */
const GRID_SIZE = 16;

/**
 * Design-token colors for pixel fills. These are CSS custom properties defined
 * in src/app/globals.css (`@theme inline` block) — using `var(--color-*)` here
 * (rather than a Tailwind class, which inline SVG `fill` attributes can't
 * consume) keeps the sprite's palette identical to the rest of the app and
 * automatically in sync with any future token value changes.
 */
const TOKEN = {
  coral: "var(--color-coral)",
  sage: "var(--color-sage)",
  honey: "var(--color-honey)",
  cocoa: "var(--color-cocoa)",
  cream: "var(--color-cream)",
} as const;

interface Pixel {
  x: number;
  y: number;
  w?: number;
  h?: number;
  fill: string;
}

// Standing pose: full 16-unit-tall cat, sitting/standing upright, tail trailing
// on the left, head on the right, both legs planted on the ground line (row 15).
const STANDING_PIXELS: Pixel[] = [
  // ears
  { x: 4, y: 0, w: 2, h: 2, fill: TOKEN.coral },
  { x: 9, y: 0, w: 2, h: 2, fill: TOKEN.coral },
  { x: 4, y: 0, w: 1, h: 1, fill: TOKEN.honey },
  { x: 10, y: 0, w: 1, h: 1, fill: TOKEN.honey },
  // head
  { x: 3, y: 2, w: 9, h: 5, fill: TOKEN.coral },
  { x: 7, y: 5, w: 3, h: 2, fill: TOKEN.cream }, // muzzle
  { x: 5, y: 4, w: 1, h: 1, fill: TOKEN.cocoa }, // eye
  { x: 9, y: 4, w: 1, h: 1, fill: TOKEN.cocoa }, // eye
  { x: 10, y: 6, w: 1, h: 1, fill: TOKEN.cocoa }, // nose
  // tail
  { x: 0, y: 5, w: 2, h: 2, fill: TOKEN.coral },
  { x: 0, y: 7, w: 2, h: 2, fill: TOKEN.coral },
  // body
  { x: 1, y: 7, w: 12, h: 5, fill: TOKEN.coral },
  { x: 3, y: 9, w: 6, h: 3, fill: TOKEN.cream }, // belly patch
  { x: 1, y: 7, w: 12, h: 1, fill: TOKEN.sage }, // collar band
  // legs, planted on the ground line
  { x: 3, y: 12, w: 2, h: 4, fill: TOKEN.coral },
  { x: 9, y: 12, w: 2, h: 4, fill: TOKEN.coral },
  { x: 3, y: 15, w: 2, h: 1, fill: TOKEN.cream }, // paw
  { x: 9, y: 15, w: 2, h: 1, fill: TOKEN.cream }, // paw
];

// Jumping pose: same head/body/tail silhouette as standing, but legs are
// tucked up under the body and the ground-line rows (13-15) are left
// deliberately empty, giving a visible "airborne" gap beneath the cat.
const JUMPING_PIXELS: Pixel[] = [
  // ears
  { x: 4, y: 0, w: 2, h: 2, fill: TOKEN.coral },
  { x: 9, y: 0, w: 2, h: 2, fill: TOKEN.coral },
  { x: 4, y: 0, w: 1, h: 1, fill: TOKEN.honey },
  { x: 10, y: 0, w: 1, h: 1, fill: TOKEN.honey },
  // head
  { x: 3, y: 2, w: 9, h: 5, fill: TOKEN.coral },
  { x: 7, y: 5, w: 3, h: 2, fill: TOKEN.cream }, // muzzle
  { x: 5, y: 4, w: 1, h: 1, fill: TOKEN.cocoa }, // eye
  { x: 9, y: 4, w: 1, h: 1, fill: TOKEN.cocoa }, // eye
  { x: 10, y: 6, w: 1, h: 1, fill: TOKEN.cocoa }, // nose
  // tail, flared out an extra segment for a mid-air motion feel
  { x: 0, y: 5, w: 2, h: 2, fill: TOKEN.coral },
  { x: 0, y: 7, w: 2, h: 2, fill: TOKEN.coral },
  { x: 0, y: 9, w: 2, h: 1, fill: TOKEN.coral },
  // body
  { x: 1, y: 7, w: 12, h: 4, fill: TOKEN.coral },
  { x: 3, y: 9, w: 6, h: 2, fill: TOKEN.cream }, // belly patch
  { x: 1, y: 7, w: 12, h: 1, fill: TOKEN.sage }, // collar band
  // legs tucked up under the body — nothing rendered below row 12,
  // leaving an empty gap that reads as mid-air
  { x: 3, y: 11, w: 2, h: 2, fill: TOKEN.coral },
  { x: 9, y: 11, w: 2, h: 2, fill: TOKEN.coral },
  { x: 3, y: 13, w: 2, h: 1, fill: TOKEN.cream }, // paw
  { x: 9, y: 13, w: 2, h: 1, fill: TOKEN.cream }, // paw
];

// Ducking pose: deliberately compressed into the bottom ~7 rows of the grid
// (vs. standing/jumping's full 16), with ears flattened into the head instead
// of sticking up, so the pose is visibly shorter and flatter at a glance.
const DUCKING_PIXELS: Pixel[] = [
  // low, wide, flattened head (no upright ears)
  { x: 8, y: 9, w: 6, h: 2, fill: TOKEN.coral },
  { x: 12, y: 9, w: 1, h: 1, fill: TOKEN.cocoa }, // eye
  { x: 13, y: 10, w: 1, h: 1, fill: TOKEN.cocoa }, // nose
  { x: 9, y: 9, w: 1, h: 1, fill: TOKEN.honey }, // ear-fold highlight
  // low, flattened trailing tail
  { x: 0, y: 12, w: 2, h: 1, fill: TOKEN.coral },
  { x: 0, y: 13, w: 1, h: 1, fill: TOKEN.coral },
  // flattened, wide body
  { x: 1, y: 11, w: 12, h: 3, fill: TOKEN.coral },
  { x: 3, y: 12, w: 6, h: 2, fill: TOKEN.cream }, // belly patch
  { x: 1, y: 11, w: 12, h: 1, fill: TOKEN.sage }, // collar band
  // short crouched leg stubs
  { x: 3, y: 14, w: 2, h: 2, fill: TOKEN.coral },
  { x: 9, y: 14, w: 2, h: 2, fill: TOKEN.coral },
  { x: 3, y: 15, w: 2, h: 1, fill: TOKEN.cream }, // paw
  { x: 9, y: 15, w: 2, h: 1, fill: TOKEN.cream }, // paw
];

function getPixelsForPose(pose: CatPose): Pixel[] {
  switch (pose) {
    case "jumping":
      return JUMPING_PIXELS;
    case "ducking":
      return DUCKING_PIXELS;
    case "standing":
    default:
      return STANDING_PIXELS;
  }
}

/**
 * Renders the Whisker Runner cat character as a blocky, retro "pixel-art"
 * sprite built from a grid of inline SVG `<rect>`s, using only the app's
 * coral/sage/honey/cocoa/cream design tokens. Self-contained: callers only
 * need to know which pose to render (no dependency on gameEngine state).
 */
export function CatSprite({ pose, size = 48, className }: CatSpriteProps) {
  const pixels = getPixelsForPose(pose);

  return (
    <svg
      viewBox={`0 0 ${GRID_SIZE} ${GRID_SIZE}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      role="img"
      aria-hidden="true"
      className={className}
      style={{ display: "block", imageRendering: "pixelated" }}
    >
      {pixels.map((pixel, index) => (
        <rect
          key={index}
          x={pixel.x}
          y={pixel.y}
          width={pixel.w ?? 1}
          height={pixel.h ?? 1}
          fill={pixel.fill}
        />
      ))}
    </svg>
  );
}
