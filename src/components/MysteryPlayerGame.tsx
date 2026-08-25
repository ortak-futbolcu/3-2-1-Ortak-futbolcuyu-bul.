import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Player, UserStats } from '../types';
import { PLAYERS, normalizeString, matchesPlayer } from '../data/players';
import { CLUBS } from '../data/clubs';
import { sound } from '../services/soundService';
import { recordMysteryResult } from '../services/storageService';
import {
  HelpCircle,
  RotateCcw,
  ArrowRight,
  Search,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Shield,
  Flag,
  Award,
} from 'lucide-react';

interface MysteryPlayerGameProps {
  userStats: UserStats;
  onUpdateStats: (newStats: UserStats, newBadges?: string[]) => void;
  onBackToHome: () => void;
}

interface GuessRowComparison {
  player: Player;
  isCorrect: boolean;
  nationalityMatch: 'exact' | 'same_continent' | 'different';
  positionMatch: boolean;
  sharedClubsCount: number;
  sharedClubNames: string[];
  numberComparison: 'exact' | 'higher' | 'lower' | 'unknown';
}

const CONTINENT_MAP: Record<string, string[]> = {
  europe: ['TR', 'DE', 'FR', 'ES', 'IT', 'GB', 'ENG', 'PT', 'NL', 'HR', 'RS', 'BE', 'NO', 'SE', 'DK', 'PL', 'CH', 'AT', 'GR', 'CZ', 'RO', 'UA', 'BA', 'GE', 'HU', 'SK', 'IE', 'WAL', 'SCO'],
  south_america: ['BR', 'AR', 'UY', 'CO', 'CL', 'PY', 'PE', 'EC', 'VE'],
  north_america: ['US', 'MX', 'CA', 'JM', 'CR'],
  africa: ['NG', 'SN', 'CI', 'GH', 'EG', 'MA', 'DZ', 'CM', 'ZA', 'ML', 'CD', 'AO'],
  asia_oceania: ['JP', 'KR', 'AU', 'IR', 'SA', 'UZ', 'NZ'],
};

function getContinent(countryCode: string): string {
  const code = countryCode.toUpperCase();
  for (const [continent, list] of Object.entries(CONTINENT_MAP)) {
    if (list.includes(code)) return continent;
  }
  return 'other';
}

export const MysteryPlayerGame: React.FC<MysteryPlayerGameProps> = ({
  userStats,
  onUpdateStats,
  onBackToHome,
}) => {
  const [targetPlayer, setTargetPlayer] = useState<Player | null>(null);
  const [guesses, setGuesses] = useState<GuessRowComparison[]>([]);
  const [guessInput, setGuessInput] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const maxGuesses = 6;

  // Filter eligible players with well-known clubs
  const mysteryCandidates = useMemo(() => {
    return PLAYERS.filter((p) => p.clubs.length >= 2 && p.famousNumber);
  }, []);

  const startNewGame = () => {
    const random = mysteryCandidates[Math.floor(Math.random() * mysteryCandidates.length)];
    setTargetPlayer(random);
    setGuesses([]);
    setGuessInput('');
    setIsGameOver(false);
    setIsWon(false);
  };

  useEffect(() => {
    startNewGame();
  }, []);

  // Autocomplete suggestions
  const suggestions = useMemo(() => {
    if (!guessInput.trim() || guessInput.length < 2 || isGameOver) return [];
    const query = normalizeString(guessInput);
    const guessedIds = new Set(guesses.map((g) => g.player.id));

    return PLAYERS.filter((p) => {
      if (guessedIds.has(p.id)) return false;
      const pName = normalizeString(p.name);
      return pName.includes(query);
    }).slice(0, 5);
  }, [guessInput, guesses, isGameOver]);

  const handleMakeGuess = (guessedPlayerObj: Player) => {
    if (isGameOver || !targetPlayer) return;

    const isCorrect = guessedPlayerObj.id === targetPlayer.id;

    // Compare nationality
    let nationalityMatch: 'exact' | 'same_continent' | 'different' = 'different';
    if (guessedPlayerObj.nationality === targetPlayer.nationality) {
      nationalityMatch = 'exact';
    } else {
      const gCont = getContinent(guessedPlayerObj.countryCode);
      const tCont = getContinent(targetPlayer.countryCode);
      if (gCont !== 'other' && gCont === tCont) {
        nationalityMatch = 'same_continent';
      }
    }

    // Compare position
    const positionMatch = guessedPlayerObj.position === targetPlayer.position;

    // Compare shared clubs
    const sharedClubIds = guessedPlayerObj.clubs.filter((c) => targetPlayer.clubs.includes(c));
    const sharedClubNames = sharedClubIds.map((cId) => CLUBS[cId]?.name || cId);
    const sharedClubsCount = sharedClubIds.length;

    // Compare famous number
    let numberComparison: 'exact' | 'higher' | 'lower' | 'unknown' = 'unknown';
    if (guessedPlayerObj.famousNumber && targetPlayer.famousNumber) {
      if (guessedPlayerObj.famousNumber === targetPlayer.famousNumber) {
        numberComparison = 'exact';
      } else if (targetPlayer.famousNumber > guessedPlayerObj.famousNumber) {
        numberComparison = 'higher';
      } else {
        numberComparison = 'lower';
      }
    }

    const newComparison: GuessRowComparison = {
      player: guessedPlayerObj,
      isCorrect,
      nationalityMatch,
      positionMatch,
      sharedClubsCount,
      sharedClubNames,
      numberComparison,
    };

    const newGuesses = [...guesses, newComparison];
    setGuesses(newGuesses);
    setGuessInput('');

    if (isCorrect) {
      setIsGameOver(true);
      setIsWon(true);
      sound.playFanfare();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      const { updatedStats, newlyUnlockedBadges } = recordMysteryResult(
        userStats,
        newGuesses.length,
        targetPlayer.id
      );
      onUpdateStats(updatedStats, newlyUnlockedBadges);
    } else {
      sound.playWrong();
      if (newGuesses.length >= maxGuesses) {
        setIsGameOver(true);
        setIsWon(false);
      }
    }
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guessInput.trim()) return;

    const normalized = normalizeString(guessInput);
    const found = PLAYERS.find((p) => matchesPlayer(p, normalized));

    if (found) {
      handleMakeGuess(found);
    }
  };

  if (!targetPlayer) return null;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 flex flex-col items-center">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between mb-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3.5 backdrop-blur-md">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 text-xs font-black text-zinc-400 hover:text-white transition cursor-pointer px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          Menü
        </button>

        <div className="text-center">
          <h2 className="text-sm font-black text-white flex items-center justify-center gap-1.5">
            🕵️ Kim Bu Futbolcu?
          </h2>
          <span className="text-[11px] text-zinc-400">
            Kalan Hak: {maxGuesses - guesses.length} / {maxGuesses}
          </span>
        </div>

        <button
          onClick={startNewGame}
          className="flex items-center gap-1 text-xs font-bold text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Yenile
        </button>
      </div>

      {/* Main Game Arena */}
      <div className="w-full space-y-4">
        {/* Hint Unlocks */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex items-center gap-2.5">
            <span className="text-base">📍</span>
            <div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase block">Kulüp Sayısı</span>
              <span className="font-bold text-zinc-200">
                Kariyerinde {targetPlayer.clubs.length} farklı takımda oynadı
              </span>
            </div>
          </div>

          <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex items-center gap-2.5">
            <span className="text-base">💡</span>
            <div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase block">Özel İpucu</span>
              <span className="font-bold text-amber-300 line-clamp-1">
                {guesses.length >= 2 ? targetPlayer.hint : '2 tahminden sonra açılır'}
              </span>
            </div>
          </div>
        </div>

        {/* Guess Search Input */}
        {!isGameOver && (
          <form onSubmit={handleInputSubmit} className="relative">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-zinc-500 pointer-events-none" />
              <input
                type="text"
                value={guessInput}
                onChange={(e) => setGuessInput(e.target.value)}
                placeholder="Bir futbolcu ismi yaz ve seç..."
                autoFocus
                className="w-full bg-zinc-900 border-2 border-zinc-700 focus:border-amber-500 rounded-2xl py-3.5 pl-12 pr-28 text-white font-bold placeholder-zinc-500 outline-none transition text-sm shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs shadow-md transition cursor-pointer active:scale-95"
              >
                Tahmin Et
              </button>
            </div>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900/95 border border-zinc-700 rounded-2xl overflow-hidden shadow-2xl z-30 divide-y divide-zinc-800">
                {suggestions.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleMakeGuess(p)}
                    className="w-full px-4 py-2.5 text-left text-xs font-bold text-white hover:bg-zinc-800 flex items-center justify-between cursor-pointer"
                  >
                    <span>{p.name}</span>
                    <span className="text-[10px] text-zinc-400">
                      {p.nationality} • {p.position} • No: {p.famousNumber || '-'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </form>
        )}

        {/* Guesses Table */}
        {guesses.length > 0 && (
          <div className="space-y-2">
            {/* Header labels */}
            <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] font-black text-zinc-500 uppercase px-2">
              <span className="text-left col-span-2">Futbolcu</span>
              <span>Ülke</span>
              <span>Mevki</span>
              <span>Forma</span>
            </div>

            {guesses.map((row, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-5 gap-1.5 items-center p-2 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-center"
              >
                {/* Name & Shared Clubs */}
                <div className="col-span-2 text-left pl-2">
                  <span className="text-white font-black block truncate">{row.player.name}</span>
                  <span className="text-[10px] text-zinc-400 block truncate">
                    {row.sharedClubsCount > 0
                      ? `🟢 Ortak: ${row.sharedClubNames.join(', ')}`
                      : '⚪ Ortak kulüp yok'}
                  </span>
                </div>

                {/* Country match */}
                <div
                  className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center ${
                    row.nationalityMatch === 'exact'
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                      : row.nationalityMatch === 'same_continent'
                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                      : 'bg-zinc-800/80 text-zinc-400'
                  }`}
                >
                  <span className="text-[10px] truncate">{row.player.countryCode}</span>
                </div>

                {/* Position match */}
                <div
                  className={`py-2 px-1 rounded-xl flex items-center justify-center text-[11px] truncate ${
                    row.positionMatch
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                      : 'bg-zinc-800/80 text-zinc-400'
                  }`}
                >
                  {row.player.position}
                </div>

                {/* Number match */}
                <div
                  className={`py-2 px-1 rounded-xl flex items-center justify-center gap-0.5 font-black ${
                    row.numberComparison === 'exact'
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                      : 'bg-zinc-800/80 text-zinc-400'
                  }`}
                >
                  <span>{row.player.famousNumber || '?'}</span>
                  {row.numberComparison === 'higher' && <ArrowUp className="w-3.5 h-3.5 text-amber-400" />}
                  {row.numberComparison === 'lower' && <ArrowDown className="w-3.5 h-3.5 text-amber-400" />}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Game End Result Card */}
        {isGameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full rounded-3xl p-6 text-center space-y-4 shadow-2xl border ${
              isWon
                ? 'bg-gradient-to-b from-emerald-950/40 to-zinc-900 border-emerald-500/40'
                : 'bg-gradient-to-b from-rose-950/40 to-zinc-900 border-rose-500/40'
            }`}
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto text-2xl border ${
                isWon
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
              }`}
            >
              {isWon ? '🎯' : '❌'}
            </div>

            <div>
              <h3 className="text-xl font-black text-white">
                {isWon ? `Tebrikler! ${guesses.length}. Tahminde Buldun!` : 'Hakların Tükendi!'}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Gizli Futbolcu:{' '}
                <span className="font-black text-amber-400 text-sm">{targetPlayer.name}</span>
              </p>
            </div>

            {/* Target Player Card Info */}
            <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-left space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Ülke:</span>
                <span className="font-bold text-white">
                  {targetPlayer.nationality} ({targetPlayer.countryCode})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Mevki & Forma:</span>
                <span className="font-bold text-white">
                  {targetPlayer.position} • #{targetPlayer.famousNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Oynadığı Kulüpler:</span>
                <span className="font-bold text-amber-300 truncate max-w-[240px]">
                  {targetPlayer.clubs.map((c) => CLUBS[c]?.name || c).join(', ')}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={startNewGame}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-sm active:scale-95 transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <RotateCcw className="w-4 h-4" />
                Yeni Futbolcu
              </button>
              <button
                onClick={onBackToHome}
                className="py-3 px-5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-black text-sm transition cursor-pointer"
              >
                Menü
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
