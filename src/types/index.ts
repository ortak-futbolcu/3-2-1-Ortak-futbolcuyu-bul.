export type League = 'turkey' | 'england' | 'spain' | 'italy' | 'germany' | 'france' | 'portugal' | 'netherlands' | 'world' | 'other';

export interface Club {
  id: string;
  name: string;
  shortName: string;
  league: League;
  country: string;
  countryCode: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  emblemStyle: {
    shape: 'shield' | 'circle' | 'crest' | 'oval' | 'diamond';
    symbol: string; // e.g. 'lion', 'eagle', 'cannon', 'crown', 'tower', 'stars', 'stripes', 'anchor', 'dragon'
    pattern: 'stripes-vertical' | 'half' | 'cross' | 'diagonal' | 'solid' | 'bavaria-check';
  };
}

export interface Player {
  id: string;
  name: string;
  fullName?: string;
  nationality: string;
  countryCode: string;
  position: 'Kaleci' | 'Defans' | 'Orta Saha' | 'Forvet';
  clubs: string[]; // Club IDs
  yearsActive?: string;
  famousNumber?: number;
  hint: string;
  avatarSeed?: string;
}

export interface PlayerArchiveEntry {
  playerId: string;
  guessCount: number;
  firstUnlockedAt: string;
  lastGuessedAt: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'daily' | 'speed' | 'career' | 'mastery' | 'collection';
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  tag: string;
  level: number;
  totalScore: number;
  streak: number;
  accuracy: number; // percentage
  avgSpeedSeconds: number;
  dailyChallengeScore: number;
  commonPlayersGuessed: number;
  leagueStrengths: {
    superLig: number;
    premierLeague: number;
    laLiga: number;
    serieA: number;
    bundesliga: number;
  };
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  icon: string;
  targetCount: number;
  currentCount: number;
  rewardXp: number;
  rewardCoins: number;
  completed: boolean;
  claimed: boolean;
}

export interface JokersInventory {
  hintLetters: number;
  extraTime: number;
  streakShield: number;
  fiftyFifty: number;
}

export interface UserStats {
  username: string;
  tag: string;
  avatar: string;
  level: number;
  xp: number;
  coins: number;
  jokers: JokersInventory;
  totalScore: number;
  totalGamesPlayed: number;
  correctGuesses: number;
  wrongGuesses: number;
  streak: number;
  lastPlayedDate: string; // YYYY-MM-DD
  bestFastGuessSeconds: number;
  blitzHighScore: number;
  dailyChallengeStreak: number;
  lastDailyDate: string;
  dailyScores: Record<string, number>; // date -> score
  unlockedBadges: string[]; // badge IDs
  archive: Record<string, PlayerArchiveEntry>; // playerId -> entry
  dailyQuestsDate: string;
  dailyQuests: DailyQuest[];
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  score: number;
  fastestTime?: number;
  streak: number;
  badge?: string;
  isCurrentUser?: boolean;
}
