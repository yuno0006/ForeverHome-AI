/**
 * The 9 Lives Protocol™ — First 14 Days Coach
 * 
 * A gamified behavioral support system that guides new adopters through
 * the critical adjustment period. Each "Life" represents a common challenge
 * that cats and their new families face during the first two weeks.
 * 
 * HOW IT WORKS:
 * • Days 1-9: Unlock one new "Life" (challenge) each day
 * • Days 10-14: Consolidation phase — continue using what you learned
 * 
 * WHY "9 LIVES"?
 * Cats are famously said to have 9 lives. We flipped this concept:
 * instead of losing lives, adopters and cats SURVIVE each challenge
 * together, building trust and forming their bond.
 * 
 * This is the core curriculum for the First 14 Days Coach.
 */

export interface NineLife {
  life: number;           // 1-9
  day: number;            // Which day this unlocks (1-9)
  title: string;          // e.g., "The Ghost"
  subtitle: string;       // e.g., "Day 1: Surviving the Hiding Phase"
  emoji: string;          // Visual identifier for quick recognition
  problem: string;        // What the adopter is experiencing
  teaches: string;        // What this Life teaches them
  tips: string[];         // Actionable steps
  warning?: string;       // Optional red flag to watch for
  catBehavior?: string;   // Which cat behavior this relates to
  completed?: boolean;    // Track progress
}

export const nineLives: NineLife[] = [
  {
    life: 1,
    day: 1,
    title: "The Ghost",
    subtitle: "Day 1: Surviving the Hiding Phase",
    emoji: "👻",
    problem: "The cat hides under the bed and won't come out.",
    teaches: "Do not drag them out. They are decompressing. Set up a 'safe room' with food and litter nearby. Let them initiate contact.",
    tips: [
      "Create a quiet 'safe room' with food, water, litter, and a hiding spot",
      "Keep the room dimly lit and peaceful",
      "Sit quietly in the room — let them get used to your presence",
      "Don't force interaction — let the cat come to you",
      "Place essentials within a few feet of their hiding spot",
    ],
    warning: "If the cat doesn't eat within 24-48 hours, contact the shelter.",
    catBehavior: "stressSensitivity",
  },
  {
    life: 2,
    day: 2,
    title: "The Hunger Strike",
    subtitle: "Day 2: Encouraging the First Meal",
    emoji: "🍗",
    problem: "The cat hasn't eaten in 24 hours because of stress.",
    teaches: "Stress kills appetite. Try warming up wet food or offering plain boiled chicken. If they still refuse by Day 3, contact the vet.",
    tips: [
      "Warm up wet food slightly — it smells more appealing",
      "Try offering plain boiled chicken or tuna juice",
      "Place food near their hiding spot, not in the open",
      "Feed at the same times each day to build routine",
      "Leave them alone to eat — some cats are shy eaters",
    ],
    warning: "48 hours without eating is the limit. Contact the shelter or vet immediately.",
    catBehavior: "stressSensitivity",
  },
  {
    life: 3,
    day: 3,
    title: "The 3 AM Zoomies",
    subtitle: "Day 3: Surviving the Night Activity",
    emoji: "🌙",
    problem: "The cat is screaming and running around while you're trying to sleep.",
    teaches: "Cats are crepuscular (active at dawn/dusk). Do not yell. Play with them for 15 minutes before bed to drain their battery, then feed a heavy meal.",
    tips: [
      "Schedule 15 minutes of active play before bed",
      "Use wand toys or laser pointers to tire them out",
      "Feed a larger meal after play — they'll naturally sleep after eating",
      "Ignore nighttime noise — reacting teaches them it gets attention",
      "Consider a second play session at dawn if they wake early",
    ],
    catBehavior: "energy",
  },
  {
    life: 4,
    day: 4,
    title: "The Litterbox Rebellion",
    subtitle: "Day 4: Solving Bathroom Issues",
    emoji: "🚽",
    problem: "The cat peed on the laundry pile.",
    teaches: "Never punish a cat for this; they'll just learn to hide when they pee. Clean with enzymatic cleaner. Is the box too small? Is it near their food? Let's troubleshoot.",
    tips: [
      "Clean accidents with enzymatic cleaner — regular cleaners leave scent",
      "Check litter box size — it should be 1.5x the cat's length",
      "Move the box away from food and water",
      "Try different litter types if they're avoiding the box",
      "Have one box per cat, plus one extra",
    ],
    warning: "Urinating outside the box can indicate medical issues. Contact vet if it continues.",
    catBehavior: "stressSensitivity",
  },
  {
    life: 5,
    day: 5,
    title: "The Furniture Test",
    subtitle: "Day 5: Protecting Your Couch",
    emoji: "🛋️",
    problem: "The cat is scratching your favorite chair.",
    teaches: "They aren't being bad; they're marking territory and stretching. Place a sisal scratching post directly next to the chair. Rub catnip on the post.",
    tips: [
      "Place scratching posts near furniture they target",
      "Use sisal or cardboard scratchers — most cats prefer these",
      "Rub catnip or silvervine on the post to attract them",
      "Never declaw — it's painful and can cause behavior issues",
      "Trim their claws regularly to minimize damage",
    ],
    catBehavior: "playNeeds",
  },
  {
    life: 6,
    day: 6,
    title: "The Belly Trap",
    subtitle: "Day 6: Learning Cat Body Language",
    emoji: "😺",
    problem: "You pet their belly and they bit you.",
    teaches: "Unlike dogs, a cat showing their belly is a sign of trust, not an invitation to pet. Watch their tail. If it twitches, stop petting immediately.",
    tips: [
      "A exposed belly means trust — not 'pet me here'",
      "Watch for warning signs: twitching tail, flattened ears, dilated pupils",
      "Stick to safe zones: head, chin, cheeks, base of tail",
      "Let the cat guide interaction — if they leave, let them",
      "Slow blinks from your cat mean 'I trust you' — blink back!",
    ],
    catBehavior: "handlingTolerance",
  },
  {
    life: 7,
    day: 7,
    title: "The Window Watcher",
    subtitle: "Day 7: Managing Barrier Frustration",
    emoji: "🪟",
    problem: "The cat is staring out the window and chattering at birds, looking frustrated.",
    teaches: "This is 'barrier frustration.' Put a bird feeder outside the window, or play 'cat TV' videos on YouTube for them to watch.",
    tips: [
      "Set up a bird feeder outside a window for 'cat TV'",
      "Create a comfortable perch near the window",
      "Play YouTube videos made for cats (birds, squirrels, fish)",
      "Rotate toys to keep them mentally stimulated",
      "Puzzle feeders provide mental enrichment",
    ],
    catBehavior: "playNeeds",
  },
  {
    life: 8,
    day: 8,
    title: "The Scent Swap",
    subtitle: "Day 8: Expanding Territory",
    emoji: "🏠",
    problem: "Introducing the cat to the rest of the house (or other pets).",
    teaches: "Don't just throw them together. Swap their bedding so they get used to each other's scent first. Keep initial meetings under 5 minutes.",
    tips: [
      "Swap bedding between rooms/pets for a few days before introduction",
      "Feed pets on opposite sides of a closed door",
      "First meetings should be brief (under 5 minutes)",
      "Use a baby gate or cracked door for visual introductions",
      "Never leave new pets alone together until you're confident",
    ],
    catBehavior: "sociability",
  },
  {
    life: 9,
    day: 9,
    title: "The Commander Ascends",
    subtitle: "Day 9: Establishing Permanent Dominion",
    emoji: "👑",
    problem: "Establishing the permanent routine.",
    teaches: "You have survived the critical decompression phase. The base is secure. World domination is imminent.",
    tips: [
      "Maintain consistent feeding and play schedules",
      "Continue daily check-ins through Day 14",
      "Contact the shelter about any unresolved concerns",
      "Schedule a vet checkup within the first month",
      "Consider microchipping if not already done",
    ],
  },
];

/**
 * Get the current Life based on the day number
 */
export function getCurrentLife(day: number): NineLife | undefined {
  // Days 1-9 map directly to Lives 1-9
  // Days 10-14 are "post-protocol" maintenance
  if (day >= 1 && day <= 9) {
    return nineLives.find(l => l.day === day);
  }
  return undefined;
}

/**
 * Get progress through the 9 Lives
 */
export function getLivesProgress(completedDays: number): {
  livesCompleted: number;
  livesRemaining: number;
  currentLife: number;
  progressPercent: number;
} {
  const livesCompleted = Math.min(completedDays, 9);
  const livesRemaining = Math.max(0, 9 - completedDays);
  const currentLife = Math.min(completedDays + 1, 9);
  const progressPercent = Math.round((livesCompleted / 9) * 100);

  return { livesCompleted, livesRemaining, currentLife, progressPercent };
}

/**
 * Completion message for Day 9
 */
export const protocolCompletionMessage = {
  title: "World Domination Complete",
  subtitle: "Barnaby has used all 9 Lives to secure his permanent base.",
  message: "The critical decompression phase is over. Your cat now has a secure territory, a trusted human, and a routine. The foundation for a lifetime of companionship has been built.",
  nextStep: "While your cat naps in their sunbeam, why not play a quick game?",
};
