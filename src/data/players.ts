import { Player } from '../types';
import { TURKISH_AND_SUPERLIG_PLAYERS } from './players/turkishStars';
import { CLASSIC_LEGENDS_PLAYERS } from './players/classicLegends';
import { MODERN_SUPERSTARS_PLAYERS } from './players/modernSuperstars';
import { JOURNEYMEN_AND_MULTI_CLUB_PLAYERS } from './players/journeymenStars';
import { PREMIER_LEAGUE_STARS_PLAYERS } from './players/premierLeagueStars';
import { LA_LIGA_STARS_PLAYERS } from './players/laLigaStars';
import { SERIE_A_STARS_PLAYERS } from './players/serieAStars';
import { BUNDESLIGA_STARS_PLAYERS } from './players/bundesligaStars';
import { LIGUE1_AND_WORLD_STARS_PLAYERS } from './players/ligue1AndWorldStars';
import { TURKISH_STARS_2_PLAYERS } from './players/turkishStars2';
import { SUPERLIG_EXPANDED_PLAYERS } from './players/superLigExpanded';
import { MASTER_GLOBAL_PLAYERS } from './players/masterPlayerDatabase';
import { BULK_EXPANSION_PLAYERS } from './players/bulkExpansionDatabase';
import { HUGE_MEGA_PLAYERS } from './players/hugeMegaDatabase';
import { CLUB_ROSTERS_EXTENDED } from './players/clubRostersExtended';
import { INTERNATIONAL_LEGENDS_PACK } from './players/internationalLegendsPack';
import { MASSIVE_PLAYER_POOL } from './players/massivePlayerPool';
import { MASTER_PLAYER_DATABASE_PART_2 } from './players/masterPlayerDatabasePart2';

// Combine and deduplicate players by their unique ID
const RAW_PLAYERS: Player[] = [
  ...JOURNEYMEN_AND_MULTI_CLUB_PLAYERS,
  ...CLASSIC_LEGENDS_PLAYERS,
  ...MODERN_SUPERSTARS_PLAYERS,
  ...TURKISH_AND_SUPERLIG_PLAYERS,
  ...PREMIER_LEAGUE_STARS_PLAYERS,
  ...LA_LIGA_STARS_PLAYERS,
  ...SERIE_A_STARS_PLAYERS,
  ...BUNDESLIGA_STARS_PLAYERS,
  ...LIGUE1_AND_WORLD_STARS_PLAYERS,
  ...TURKISH_STARS_2_PLAYERS,
  ...SUPERLIG_EXPANDED_PLAYERS,
  ...MASTER_GLOBAL_PLAYERS,
  ...BULK_EXPANSION_PLAYERS,
  ...HUGE_MEGA_PLAYERS,
  ...CLUB_ROSTERS_EXTENDED,
  ...INTERNATIONAL_LEGENDS_PACK,
  ...MASSIVE_PLAYER_POOL,
  ...MASTER_PLAYER_DATABASE_PART_2,
];

// Deduplicate by ID
const seenIds = new Set<string>();
export const PLAYERS: Player[] = RAW_PLAYERS.filter((player) => {
  if (seenIds.has(player.id)) {
    return false;
  }
  seenIds.add(player.id);
  return true;
});

// Helper to normalize search strings for robust matching (e.g. "Icardi" == "icardi" == "Mauro Icardi")
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '');
}

// Find all common players between two clubs
export function getCommonPlayers(clubId1: string, clubId2: string): Player[] {
  if (clubId1 === clubId2) return [];
  return PLAYERS.filter(
    (p) => p.clubs.includes(clubId1) && p.clubs.includes(clubId2)
  );
}

// Check if a query matches a specific player
export function matchesPlayer(player: Player, query: string): boolean {
  const normInput = normalizeString(query);
  if (!normInput || normInput.length < 2) return false;

  const normName = normalizeString(player.name);
  const normFull = player.fullName ? normalizeString(player.fullName) : '';
  const nameParts = player.name.split(' ').map(normalizeString);

  return (
    normName === normInput ||
    normFull === normInput ||
    normName.includes(normInput) ||
    normInput.includes(normName) ||
    nameParts.some((part) => part.length >= 3 && (part === normInput || normInput === part))
  );
}

// Check if a user input matches any of the valid players
export function validatePlayerGuess(
  inputOrPlayer: string | Player,
  validPlayersOrInput: Player[] | string
): Player | null {
  if (typeof inputOrPlayer === 'string' && Array.isArray(validPlayersOrInput)) {
    const matched = validPlayersOrInput.find((p) => matchesPlayer(p, inputOrPlayer));
    return matched || null;
  }
  if (typeof inputOrPlayer === 'object' && typeof validPlayersOrInput === 'string') {
    return matchesPlayer(inputOrPlayer, validPlayersOrInput) ? inputOrPlayer : null;
  }
  return null;
}
