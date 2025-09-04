// XP and Leveling System
export interface LevelInfo {
  level: number;
  xpRequired: number;
  xpForNextLevel: number;
  progress: number; // 0-100 percentage to next level
}

// XP required for each level (exponential growth)
const XP_PER_LEVEL = [
  0,    // Level 1 (starting)
  100,  // Level 2
  250,  // Level 3
  450,  // Level 4
  700,  // Level 5
  1000, // Level 6
  1350, // Level 7
  1750, // Level 8
  2200, // Level 9
  2700, // Level 10
  3250, // Level 11
  3850, // Level 12
  4500, // Level 13
  5200, // Level 14
  5950, // Level 15
  6750, // Level 16
  7600, // Level 17
  8500, // Level 18
  9450, // Level 19
  10450, // Level 20
  11500, // Level 21
  12600, // Level 22
  13750, // Level 23
  14950, // Level 24
  16200, // Level 25
  17500, // Level 26
  18850, // Level 27
  20250, // Level 28
  21700, // Level 29
  23200, // Level 30
];

// XP rewards for different actions
export const XP_REWARDS = {
  POST_HELP_REQUEST: 10,      // Posting a help request
  PROVIDE_HELPFUL_RESPONSE: 25, // Providing a response
  RESPONSE_MARKED_HELPFUL: 50,  // Response marked as helpful
  RESOLVE_HELP_REQUEST: 30,   // Marking your request as resolved
  COMPLETE_PAY_IT_FORWARD: 75, // Completing pay-it-forward
  DAILY_LOGIN: 5,             // Daily login bonus
  SEED_GROWS_TO_SPROUT: 15,   // Seed grows to sprout
  SEED_GROWS_TO_PLANT: 25,    // Seed grows to plant
  SEED_GROWS_TO_FLOWER: 50,   // Seed grows to flower
} as const;

// Calculate level info for a given XP amount
export function calculateLevelInfo(xp: number): LevelInfo {
  let level = 1;
  let xpRequired = 0;
  
  // Find current level by checking which level threshold the XP meets
  for (let i = 0; i < XP_PER_LEVEL.length; i++) {
    if (xp >= XP_PER_LEVEL[i]) {
      level = i + 1;
      xpRequired = XP_PER_LEVEL[i];
    } else {
      break;
    }
  }
  
  // If we're at max level, return 100% progress
  if (level >= XP_PER_LEVEL.length) {
    return {
      level: XP_PER_LEVEL.length,
      xpRequired: XP_PER_LEVEL[XP_PER_LEVEL.length - 1],
      xpForNextLevel: XP_PER_LEVEL[XP_PER_LEVEL.length - 1],
      progress: 100
    };
  }
  
  // Calculate XP needed for next level
  const xpForNextLevel = XP_PER_LEVEL[level]; // XP needed for the next level
  const xpInCurrentLevel = xp - xpRequired; // XP earned in current level
  const xpNeededForNextLevel = xpForNextLevel - xpRequired; // Total XP needed to reach next level
  const progress = xpNeededForNextLevel > 0 ? (xpInCurrentLevel / xpNeededForNextLevel) * 100 : 0;
  
  return {
    level,
    xpRequired,
    xpForNextLevel,
    progress: Math.min(Math.max(progress, 0), 100)
  };
}

// Calculate XP needed for a specific level
export function getXpForLevel(targetLevel: number): number {
  if (targetLevel <= 0 || targetLevel > XP_PER_LEVEL.length) {
    return XP_PER_LEVEL[XP_PER_LEVEL.length - 1];
  }
  return XP_PER_LEVEL[targetLevel - 1];
}

// Get level title/badge based on level
export function getLevelTitle(level: number): string {
  if (level >= 30) return "Legendary Gardener 🌟";
  if (level >= 25) return "Master Gardener 👑";
  if (level >= 20) return "Expert Gardener 🌺";
  if (level >= 15) return "Advanced Gardener 🌿";
  if (level >= 10) return "Skilled Gardener 🌱";
  if (level >= 5) return "Growing Gardener 🌷";
  return "New Gardener 🌱";
}

// Get level color based on level
export function getLevelColor(level: number): string {
  if (level >= 30) return "text-purple-600";
  if (level >= 25) return "text-yellow-600";
  if (level >= 20) return "text-red-600";
  if (level >= 15) return "text-blue-600";
  if (level >= 10) return "text-green-600";
  if (level >= 5) return "text-orange-600";
  return "text-gray-600";
}

// Get level emoji based on level
export function getLevelEmoji(level: number): string {
  if (level >= 30) return "🌟";
  if (level >= 25) return "👑";
  if (level >= 20) return "🌺";
  if (level >= 15) return "🌿";
  if (level >= 10) return "🌱";
  if (level >= 5) return "🌷";
  return "🌱";
}
