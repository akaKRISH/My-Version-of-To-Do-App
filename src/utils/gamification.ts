/**
 * Gamification & Progression Engine
 * Tracks XP, Leveling, Combo Streaks, and Badges.
 */

export interface UserGameStats {
  xp: number;
  level: number;
  levelTitle: string;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
  streak: number;
  tasksCompletedTotal: number;
  lastCompletedAt: number | null;
}

const LEVEL_THRESHOLDS = [
  { level: 1, xpRequired: 0, title: 'Draftsman' },
  { level: 2, xpRequired: 120, title: 'Vector Hunter' },
  { level: 3, xpRequired: 300, title: 'Component Master' },
  { level: 4, xpRequired: 600, title: 'Design System Architect' },
  { level: 5, xpRequired: 1000, title: 'Sprint Grandmaster' },
  { level: 6, xpRequired: 1600, title: 'Zen Flow Ascendant' },
];

const STORAGE_KEY_PREFIX = 'figma_game_stats_';

export function getStoredStats(userId: string): UserGameStats {
  if (typeof window === 'undefined') {
    return computeLevelStats(0, 0, 0, null);
  }

  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${userId}`);
    if (raw) {
      const data = JSON.parse(raw);
      const now = Date.now();
      let currentStreak = data.streak || 0;

      // Combo cooldown: if last completion was more than 4 hours ago, combo decays gracefully
      if (data.lastCompletedAt && now - data.lastCompletedAt > 4 * 60 * 60 * 1000) {
        currentStreak = 0;
      }

      return computeLevelStats(
        data.xp || 0,
        currentStreak,
        data.tasksCompletedTotal || 0,
        data.lastCompletedAt || null
      );
    }
  } catch (err) {
    console.error('Failed to parse game stats from localStorage', err);
  }

  return computeLevelStats(0, 0, 0, null);
}

export function awardTaskCompletion(
  userId: string
): { stats: UserGameStats; gainedXp: number; combo: number; leveledUp: boolean } {
  const current = getStoredStats(userId);
  const now = Date.now();

  const newCombo = current.streak + 1;
  // 50 base XP + (streak * 10) bonus XP (max +50 bonus)
  const streakBonus = Math.min(50, newCombo * 10);
  const gainedXp = 50 + streakBonus;
  const newTotalXp = current.xp + gainedXp;
  const newTotalCompleted = current.tasksCompletedTotal + 1;

  const prevLevel = current.level;
  const updatedStats = computeLevelStats(newTotalXp, newCombo, newTotalCompleted, now);
  const leveledUp = updatedStats.level > prevLevel;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(
        `${STORAGE_KEY_PREFIX}${userId}`,
        JSON.stringify({
          xp: newTotalXp,
          streak: newCombo,
          tasksCompletedTotal: newTotalCompleted,
          lastCompletedAt: now,
        })
      );
    } catch (err) {
      console.error('Failed to save game stats to localStorage', err);
    }
  }

  return {
    stats: updatedStats,
    gainedXp,
    combo: newCombo,
    leveledUp,
  };
}

function computeLevelStats(
  totalXp: number,
  streak: number,
  totalCompleted: number,
  lastCompletedAt: number | null
): UserGameStats {
  let currentLevelObj = LEVEL_THRESHOLDS[0];
  let nextLevelObj = LEVEL_THRESHOLDS[1];

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i].xpRequired) {
      currentLevelObj = LEVEL_THRESHOLDS[i];
      nextLevelObj = LEVEL_THRESHOLDS[i + 1] || {
        level: currentLevelObj.level + 1,
        xpRequired: currentLevelObj.xpRequired + 800,
        title: 'Mythic Pioneer',
      };
      break;
    }
  }

  const xpIntoCurrentLevel = totalXp - currentLevelObj.xpRequired;
  const xpNeededForNext = nextLevelObj.xpRequired - currentLevelObj.xpRequired;
  const progressPercent = Math.min(100, Math.max(0, Math.round((xpIntoCurrentLevel / xpNeededForNext) * 100)));

  return {
    xp: totalXp,
    level: currentLevelObj.level,
    levelTitle: currentLevelObj.title,
    currentLevelXp: xpIntoCurrentLevel,
    nextLevelXp: xpNeededForNext,
    progressPercent,
    streak,
    tasksCompletedTotal: totalCompleted,
    lastCompletedAt,
  };
}
