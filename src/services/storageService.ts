import { UserStats, Friend, PlayerArchiveEntry, DailyQuest, JokersInventory } from '../types';
import { INITIAL_FRIENDS } from '../data/initialFriends';
import { BADGES } from '../data/badges';
import { PLAYERS } from '../data/players';

const STORAGE_KEY_STATS = '321_user_stats';
const STORAGE_KEY_FRIENDS = '321_friends_list';

export function getTodayDateStr(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

export function generateDailyQuests(dateStr: string): DailyQuest[] {
  // Deterministic or daily set of 3 quests
  return [
    {
      id: `quest_superlig_${dateStr}`,
      title: 'Süper Lig Dedektifi',
      description: 'Türk kulüplerinde oynamış 3 futbolcuyu doğru tahmin et.',
      icon: '🇹🇷',
      targetCount: 3,
      currentCount: 0,
      rewardXp: 300,
      rewardCoins: 60,
      completed: false,
      claimed: false,
    },
    {
      id: `quest_streak_${dateStr}`,
      title: 'Alevli Seri',
      description: 'Herhangi bir modda 3 doğru cevabı art arda ver.',
      icon: '🔥',
      targetCount: 3,
      currentCount: 0,
      rewardXp: 250,
      rewardCoins: 50,
      completed: false,
      claimed: false,
    },
    {
      id: `quest_speed_${dateStr}`,
      title: 'Şimşek Refleks',
      description: '10 saniyenin altında 2 kez doğru tahmin yap.',
      icon: '⚡',
      targetCount: 2,
      currentCount: 0,
      rewardXp: 350,
      rewardCoins: 75,
      completed: false,
      claimed: false,
    },
  ];
}

export function getDefaultUserStats(): UserStats {
  const today = getTodayDateStr();
  return {
    username: 'Futbolcu Avcısı',
    tag: 'player#' + Math.floor(1000 + Math.random() * 9000),
    avatar: '⚡',
    level: 1,
    xp: 0,
    coins: 200,
    jokers: {
      hintLetters: 2,
      extraTime: 2,
      streakShield: 1,
      fiftyFifty: 2,
    },
    totalScore: 0,
    totalGamesPlayed: 0,
    correctGuesses: 0,
    wrongGuesses: 0,
    streak: 0,
    lastPlayedDate: '',
    bestFastGuessSeconds: 99.9,
    blitzHighScore: 0,
    dailyChallengeStreak: 0,
    lastDailyDate: '',
    dailyScores: {},
    unlockedBadges: [],
    archive: {},
    dailyQuestsDate: today,
    dailyQuests: generateDailyQuests(today),
  };
}

export function loadUserStats(): UserStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STATS);
    const today = getTodayDateStr();
    if (!raw) return getDefaultUserStats();
    const parsed = JSON.parse(raw);
    const stats: UserStats = { ...getDefaultUserStats(), ...parsed };

    // Ensure jokers exist
    if (!stats.jokers) {
      stats.jokers = { hintLetters: 2, extraTime: 2, streakShield: 1, fiftyFifty: 2 };
    }
    if (stats.coins === undefined) {
      stats.coins = 200;
    }
    if (stats.blitzHighScore === undefined) {
      stats.blitzHighScore = 0;
    }

    // Refresh daily quests if day changed
    if (stats.dailyQuestsDate !== today || !stats.dailyQuests || stats.dailyQuests.length === 0) {
      stats.dailyQuestsDate = today;
      stats.dailyQuests = generateDailyQuests(today);
      saveUserStats(stats);
    }

    return stats;
  } catch {
    return getDefaultUserStats();
  }
}

export function saveUserStats(stats: UserStats): void {
  try {
    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save user stats', e);
  }
}

export function loadFriends(): Friend[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FRIENDS);
    if (!raw) return INITIAL_FRIENDS;
    return JSON.parse(raw);
  } catch {
    return INITIAL_FRIENDS;
  }
}

export function saveFriends(friends: Friend[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_FRIENDS, JSON.stringify(friends));
  } catch (e) {
    console.error('Failed to save friends', e);
  }
}

// XP to Level formula: Level = Math.floor(Math.sqrt(XP / 100)) + 1
export function calculateLevel(xp: number): { level: number; currentXp: number; nextLevelXp: number; progressPercent: number } {
  let level = 1;
  while ((level * level) * 100 <= xp) {
    level++;
  }
  const prevThreshold = ((level - 1) * (level - 1)) * 100;
  const nextThreshold = (level * level) * 100;
  const currentLevelXp = xp - prevThreshold;
  const xpRequiredForNext = nextThreshold - prevThreshold;
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentLevelXp / xpRequiredForNext) * 100)));

  return {
    level,
    currentXp: currentLevelXp,
    nextLevelXp: xpRequiredForNext,
    progressPercent,
  };
}

// Joker Pricing
export const JOKER_PRICES: Record<keyof JokersInventory, number> = {
  hintLetters: 40,
  extraTime: 30,
  streakShield: 60,
  fiftyFifty: 50,
};

export function buyJoker(stats: UserStats, jokerType: keyof JokersInventory): { success: boolean; updatedStats: UserStats } {
  const price = JOKER_PRICES[jokerType];
  if (stats.coins < price) {
    return { success: false, updatedStats: stats };
  }
  const updated = {
    ...stats,
    coins: stats.coins - price,
    jokers: {
      ...stats.jokers,
      [jokerType]: (stats.jokers[jokerType] || 0) + 1,
    },
  };
  saveUserStats(updated);
  return { success: true, updatedStats: updated };
}

export function useJoker(stats: UserStats, jokerType: keyof JokersInventory): { success: boolean; updatedStats: UserStats } {
  if (!stats.jokers || stats.jokers[jokerType] <= 0) {
    return { success: false, updatedStats: stats };
  }
  const updated = {
    ...stats,
    jokers: {
      ...stats.jokers,
      [jokerType]: Math.max(0, stats.jokers[jokerType] - 1),
    },
  };
  saveUserStats(updated);
  return { success: true, updatedStats: updated };
}

export function claimDailyQuest(stats: UserStats, questId: string): { updatedStats: UserStats; newlyUnlockedBadges: string[] } {
  const updated = { ...stats };
  const quest = updated.dailyQuests.find(q => q.id === questId);
  if (!quest || !quest.completed || quest.claimed) {
    return { updatedStats: stats, newlyUnlockedBadges: [] };
  }

  quest.claimed = true;
  updated.coins += quest.rewardCoins;
  updated.xp += quest.rewardXp;
  const { level } = calculateLevel(updated.xp);
  updated.level = level;

  // Check if all quests claimed
  const allClaimed = updated.dailyQuests.every(q => q.claimed);
  const newlyUnlocked: string[] = [];
  if (allClaimed && !updated.unlockedBadges.includes('quest_legend')) {
    newlyUnlocked.push('quest_legend');
    updated.unlockedBadges.push('quest_legend');
  }

  saveUserStats(updated);
  return { updatedStats: updated, newlyUnlockedBadges: newlyUnlocked };
}

// Record a completed game and manage daily streak
export function recordGamePlayed(
  stats: UserStats,
  pointsWon: number,
  isCorrect: boolean,
  secondsTaken?: number,
  unlockedPlayerId?: string
): { updatedStats: UserStats; newlyUnlockedBadges: string[] } {
  const today = getTodayDateStr();
  const updated = { ...stats };

  // Calculate XP (points / 2 + bonus) and Coins
  const earnedXp = Math.max(10, Math.round(pointsWon / 2));
  const earnedCoins = isCorrect ? Math.max(5, Math.round(pointsWon / 25)) : 2;
  
  updated.xp += earnedXp;
  updated.coins += earnedCoins;
  updated.totalScore += pointsWon;
  updated.totalGamesPlayed += 1;

  if (isCorrect) {
    updated.correctGuesses += 1;
    if (secondsTaken && secondsTaken < updated.bestFastGuessSeconds) {
      updated.bestFastGuessSeconds = Number(secondsTaken.toFixed(2));
    }
  } else {
    updated.wrongGuesses += 1;
  }

  // Update Level
  const { level } = calculateLevel(updated.xp);
  updated.level = level;

  // Streak calculation
  if (updated.lastPlayedDate !== today) {
    if (!updated.lastPlayedDate) {
      updated.streak = 1;
    } else {
      const last = new Date(updated.lastPlayedDate);
      const cur = new Date(today);
      const diffDays = Math.round((cur.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        updated.streak += 1;
      } else if (diffDays > 1) {
        updated.streak = 1;
      }
    }
    updated.lastPlayedDate = today;
  }

  // Archive update
  let isTurkishPlayer = false;
  if (unlockedPlayerId && isCorrect) {
    const existing = updated.archive[unlockedPlayerId];
    if (existing) {
      updated.archive[unlockedPlayerId] = {
        ...existing,
        guessCount: existing.guessCount + 1,
        lastGuessedAt: today,
      };
    } else {
      updated.archive[unlockedPlayerId] = {
        playerId: unlockedPlayerId,
        guessCount: 1,
        firstUnlockedAt: today,
        lastGuessedAt: today,
      };
    }

    const playerObj = PLAYERS.find(p => p.id === unlockedPlayerId);
    if (playerObj && playerObj.clubs.some(c => ['galatasaray', 'fenerbahce', 'besiktas', 'trabzonspor', 'basaksehir'].includes(c))) {
      isTurkishPlayer = true;
    }
  }

  // Update Quests
  if (updated.dailyQuests) {
    updated.dailyQuests = updated.dailyQuests.map(q => {
      if (q.completed) return q;
      let newCount = q.currentCount;

      if (q.id.startsWith('quest_superlig') && isTurkishPlayer) {
        newCount += 1;
      } else if (q.id.startsWith('quest_speed') && isCorrect && secondsTaken && secondsTaken <= 10) {
        newCount += 1;
      } else if (q.id.startsWith('quest_streak') && isCorrect) {
        newCount = Math.min(q.targetCount, newCount + 1);
      }

      const completed = newCount >= q.targetCount;
      return { ...q, currentCount: Math.min(q.targetCount, newCount), completed };
    });
  }

  // Check Badge Unlocks
  const newlyUnlocked: string[] = [];
  const currentBadges = new Set(updated.unlockedBadges);
  const archiveCount = Object.keys(updated.archive).length;

  if (!currentBadges.has('first_goal') && updated.correctGuesses >= 1) {
    newlyUnlocked.push('first_goal');
  }
  if (!currentBadges.has('speed_demon') && updated.bestFastGuessSeconds <= 3.0) {
    newlyUnlocked.push('speed_demon');
  }
  if (!currentBadges.has('streak_fire_3') && updated.streak >= 3) {
    newlyUnlocked.push('streak_fire_3');
  }
  if (!currentBadges.has('streak_fire_7') && updated.streak >= 7) {
    newlyUnlocked.push('streak_fire_7');
  }
  if (!currentBadges.has('collector_bronze') && archiveCount >= 10) {
    newlyUnlocked.push('collector_bronze');
  }
  if (!currentBadges.has('collector_gold') && archiveCount >= 30) {
    newlyUnlocked.push('collector_gold');
  }
  if (!currentBadges.has('century_club') && archiveCount >= 100) {
    newlyUnlocked.push('century_club');
  }

  // Check Turkish club count in archive
  if (!currentBadges.has('super_lig_guru')) {
    const trClubPlayers = Object.keys(updated.archive).filter(pid => {
      const p = PLAYERS.find(pl => pl.id === pid);
      return p && p.clubs.some(c => ['galatasaray', 'fenerbahce', 'besiktas', 'trabzonspor'].includes(c));
    });
    if (trClubPlayers.length >= 5) {
      newlyUnlocked.push('super_lig_guru');
    }
  }

  // Check El Clasico count in archive
  if (!currentBadges.has('el_clasico_expert')) {
    const clasicoPlayers = Object.keys(updated.archive).filter(pid => {
      const p = PLAYERS.find(pl => pl.id === pid);
      return p && p.clubs.some(c => ['real_madrid', 'barcelona'].includes(c));
    });
    if (clasicoPlayers.length >= 5) {
      newlyUnlocked.push('el_clasico_expert');
    }
  }

  if (newlyUnlocked.length > 0) {
    updated.unlockedBadges = [...updated.unlockedBadges, ...newlyUnlocked];
  }

  saveUserStats(updated);
  return { updatedStats: updated, newlyUnlockedBadges: newlyUnlocked };
}

export function recordBlitzResult(
  stats: UserStats,
  blitzScore: number
): { updatedStats: UserStats; newlyUnlockedBadges: string[] } {
  const updated = { ...stats };
  const earnedCoins = Math.max(15, Math.round(blitzScore / 20));
  const earnedXp = Math.max(50, Math.round(blitzScore / 2));

  updated.coins += earnedCoins;
  updated.xp += earnedXp;
  updated.totalScore += blitzScore;
  updated.totalGamesPlayed += 1;

  if (blitzScore > (updated.blitzHighScore || 0)) {
    updated.blitzHighScore = blitzScore;
  }

  const { level } = calculateLevel(updated.xp);
  updated.level = level;

  const newlyUnlocked: string[] = [];
  if (blitzScore >= 2000 && !updated.unlockedBadges.includes('blitz_master')) {
    newlyUnlocked.push('blitz_master');
    updated.unlockedBadges.push('blitz_master');
  }

  saveUserStats(updated);
  return { updatedStats: updated, newlyUnlockedBadges: newlyUnlocked };
}

export function recordMysteryResult(
  stats: UserStats,
  attempts: number,
  playerId: string
): { updatedStats: UserStats; newlyUnlockedBadges: string[] } {
  const pointsWon = Math.max(300, 1200 - (attempts - 1) * 200);
  const result = recordGamePlayed(stats, pointsWon, true, 15, playerId);
  const updated = result.updatedStats;
  const newlyUnlocked = [...result.newlyUnlockedBadges];

  if (attempts <= 3 && !updated.unlockedBadges.includes('mystery_detective')) {
    newlyUnlocked.push('mystery_detective');
    updated.unlockedBadges.push('mystery_detective');
  }

  saveUserStats(updated);
  return { updatedStats: updated, newlyUnlockedBadges: newlyUnlocked };
}
