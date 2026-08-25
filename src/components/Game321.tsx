import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Club, Player, UserStats } from '../types';
import { CLUBS, isPopularClub } from '../data/clubs';
import { PLAYERS, getCommonPlayers, validatePlayerGuess, normalizeString, getEligibleClubPairs } from '../data/players';
import { ClubEmblem } from './ClubEmblem';
import { sound } from '../services/soundService';
import { recordGamePlayed, useJoker } from '../services/storageService';
import { 
  Zap, 
  HelpCircle, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  Flame,
  Search,
  Clock,
  Lightbulb,
  ShieldCheck,
  Filter
} from 'lucide-react';

interface Game321Props {
  userStats: UserStats;
  onUpdateStats: (newStats: UserStats, newBadges: string[]) => void;
  onBackToHome: () => void;
  onOpenArchive: () => void;
  onOpenShop?: () => void;
}

export const Game321: React.FC<Game321Props> = ({
  userStats,
  onUpdateStats,
  onBackToHome,
  onOpenArchive,
}) => {
  // Game session states
  const [round, setRound] = useState(1);
  const [sessionScore, setSessionScore] = useState(0);
  const [sessionStreak, setSessionStreak] = useState(0);
  
  // Current question clubs & valid players
  const [club1, setClub1] = useState<Club | null>(null);
  const [club2, setClub2] = useState<Club | null>(null);
  const [validPlayers, setValidPlayers] = useState<Player[]>([]);
  
  // Interaction & Timer states
  const [guessInput, setGuessInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(20);
  const [isRoundActive, setIsRoundActive] = useState(false);
  const [roundResult, setRoundResult] = useState<'correct' | 'wrong' | 'timeout' | null>(null);
  const [guessedPlayer, setGuessedPlayer] = useState<Player | null>(null);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [usedHint, setUsedHint] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);
  const [jokerLetterText, setJokerLetterText] = useState<string | null>(null);
  const [jokerFilterText, setJokerFilterText] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<'standard' | 'hard'>('standard');

  // Pre-filter valid club pairs that actually share common players (Standard: only well-known clubs, Hard: all clubs)
  const validClubPairs = useMemo(() => {
    return getEligibleClubPairs(CLUBS, isPopularClub, difficulty);
  }, [difficulty]);

  // Generate new random club pair
  const generateNewRound = useCallback(() => {
    if (validClubPairs.length === 0) return;
    const randomIndex = Math.floor(Math.random() * validClubPairs.length);
    const [c1Key, c2Key] = validClubPairs[randomIndex];
    const c1 = CLUBS[c1Key];
    const c2 = CLUBS[c2Key];
    const players = getCommonPlayers(c1Key, c2Key);

    setClub1(c1);
    setClub2(c2);
    setValidPlayers(players);
    setGuessInput('');
    setTimeLeft(20);
    setRoundResult(null);
    setGuessedPlayer(null);
    setEarnedPoints(0);
    setUsedHint(false);
    setJokerLetterText(null);
    setJokerFilterText(null);
    setIsRoundActive(true);
    setTimeTaken(0);
  }, [validClubPairs]);

  // Initial load
  useEffect(() => {
    generateNewRound();
  }, [generateNewRound]);

  // Timer effect
  useEffect(() => {
    if (!isRoundActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
      setTimeTaken((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRoundActive]);

  // Auto-complete candidates based on user typing
  const searchSuggestions = useMemo(() => {
    if (!guessInput.trim() || guessInput.length < 2 || !isRoundActive) return [];
    const norm = normalizeString(guessInput);
    return PLAYERS.filter((p) => {
      const pNorm = normalizeString(p.name);
      return pNorm.includes(norm) || (p.fullName && normalizeString(p.fullName).includes(norm));
    }).slice(0, 4);
  }, [guessInput, isRoundActive]);

  // Handle timeout
  const handleTimeout = () => {
    setIsRoundActive(false);
    setRoundResult('timeout');
    setSessionStreak(0);
    sound.playWrong();

    const { updatedStats, newlyUnlockedBadges } = recordGamePlayed(
      userStats,
      0,
      false,
      20
    );
    onUpdateStats(updatedStats, newlyUnlockedBadges);
  };

  // Submit guess
  const handleSubmitGuess = (playerToTest?: Player) => {
    if (!isRoundActive) return;

    let matched: Player | null = null;
    if (playerToTest) {
      if (validPlayers.some((p) => p.id === playerToTest.id)) {
        matched = playerToTest;
      }
    } else {
      matched = validatePlayerGuess(guessInput, validPlayers);
    }

    const elapsed = 20 - timeLeft;

    if (matched) {
      // Calculate score based on speed and hint
      let points = Math.max(200, Math.round(1000 - elapsed * 35));
      if (usedHint) points = Math.round(points * 0.7);
      // Streak bonus
      const streakBonus = sessionStreak * 50;
      const totalRoundPoints = points + streakBonus;

      setIsRoundActive(false);
      setRoundResult('correct');
      setGuessedPlayer(matched);
      setEarnedPoints(totalRoundPoints);
      setSessionScore((prev) => prev + totalRoundPoints);
      setSessionStreak((prev) => prev + 1);

      sound.playCorrect();

      // Trigger Confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10B981', '#3B82F6', '#F59E0B', '#EC4899'],
      });

      // Update persistence and unlocked archive
      const { updatedStats, newlyUnlockedBadges } = recordGamePlayed(
        userStats,
        totalRoundPoints,
        true,
        elapsed,
        matched.id
      );
      onUpdateStats(updatedStats, newlyUnlockedBadges);
    } else {
      sound.playWrong();
      // Penalty of 3 seconds on wrong attempt
      setTimeLeft((prev) => Math.max(1, prev - 3));
      setGuessInput('');
    }
  };

  const handleNextRound = () => {
    sound.playClick();
    setRound((r) => r + 1);
    generateNewRound();
  };

  if (!club1 || !club2) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 flex flex-col items-center">
      {/* Header bar: Score, Round, Streak, Exit */}
      <div className="w-full flex items-center justify-between bg-zinc-900/70 border border-zinc-800/80 rounded-2xl px-4 py-2.5 mb-4 backdrop-blur-sm shadow-sm">
        <button
          onClick={onBackToHome}
          className="text-xs font-semibold text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-700/60 transition flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Ana Menü
        </button>

        <div className="flex items-center gap-4 text-xs font-medium">
          {/* Difficulty Level Toggle */}
          <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => {
                if (difficulty !== 'standard') {
                  sound.playClick();
                  setDifficulty('standard');
                }
              }}
              title="Sadece herkesin bildiği popüler ve büyük kulüpler gelir"
              className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition cursor-pointer flex items-center gap-1 ${
                difficulty === 'standard'
                  ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>🌟</span>
              <span>Popüler Kulüpler</span>
            </button>
            <button
              onClick={() => {
                if (difficulty !== 'hard') {
                  sound.playClick();
                  setDifficulty('hard');
                }
              }}
              title="Daha zor transferler ve az bilinen takımlar da dahil"
              className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition cursor-pointer flex items-center gap-1 ${
                difficulty === 'hard'
                  ? 'bg-amber-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>🔥</span>
              <span>Zor Seviye</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-zinc-300">
            <span className="text-zinc-500">Tur:</span>
            <span className="font-bold text-white bg-zinc-800 px-2 py-0.5 rounded-md">
              {round}
            </span>
          </div>

          <div className="flex items-center gap-1 text-amber-400 font-bold">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>{sessionStreak} Seri</span>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 px-2.5 py-1 rounded-lg font-bold">
            <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            <span>{sessionScore} Puan</span>
          </div>
        </div>
      </div>

      {/* Main Game Arena Card */}
      <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 md:p-7 flex flex-col items-center relative overflow-hidden shadow-xl">
        {/* Glow backdrop behind clubs */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Timer Bar */}
        <div className="w-full mb-6">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Kalan Süre
            </span>
            <span
              className={`text-sm font-black font-mono ${
                timeLeft <= 5 ? 'text-rose-400 animate-ping' : 'text-emerald-400'
              }`}
            >
              {timeLeft}s
            </span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full transition-all duration-300 ${
                timeLeft <= 5 ? 'bg-rose-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
              }`}
              style={{ width: `${(timeLeft / 20) * 100}%` }}
            />
          </div>
        </div>

        {/* Matchup Showcase (Club 1 vs Club 2) */}
        <div className="w-full flex items-center justify-around my-2 py-2">
          {/* Club 1 */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, x: -30 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            className="flex flex-col items-center text-center max-w-[130px]"
          >
            <div className="p-3 bg-zinc-800/80 rounded-2xl border border-zinc-700/60 shadow-lg mb-2">
              <ClubEmblem club={club1} size="lg" />
            </div>
            <span className="text-sm font-bold text-white leading-tight">{club1.name}</span>
            <span className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
              <span>{club1.country}</span>
            </span>
          </motion.div>

          {/* VS / Intersection Badge */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-zinc-950 font-black text-xs shadow-md">
              &amp;
            </div>
            <span className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-widest">
              Ortak Oyuncu
            </span>
          </div>

          {/* Club 2 */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, x: 30 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            className="flex flex-col items-center text-center max-w-[130px]"
          >
            <div className="p-3 bg-zinc-800/80 rounded-2xl border border-zinc-700/60 shadow-lg mb-2">
              <ClubEmblem club={club2} size="lg" />
            </div>
            <span className="text-sm font-bold text-white leading-tight">{club2.name}</span>
            <span className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
              <span>{club2.country}</span>
            </span>
          </motion.div>
        </div>

        {/* Question Prompt */}
        <p className="text-xs md:text-sm text-zinc-300 font-medium text-center my-4">
          Her iki kulüpte de forma giymiş ortak futbolcuyu yaz:
        </p>

        {/* Guess Input & Action Form */}
        {isRoundActive && (
          <div className="w-full relative">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitGuess();
              }}
              className="w-full flex gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={guessInput}
                  onChange={(e) => setGuessInput(e.target.value)}
                  placeholder="Futbolcu adı yaz (örn. Zlatan, Sneijder, Icardi)..."
                  autoFocus
                  className="w-full bg-zinc-800/90 border border-zinc-700 text-white placeholder-zinc-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium shadow-inner"
                />
                <Search className="absolute right-3.5 top-3.5 w-4 h-4 text-zinc-500 pointer-events-none" />
              </div>

              <button
                type="submit"
                disabled={!guessInput.trim()}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-40 text-zinc-950 font-bold px-5 py-3 rounded-xl text-sm transition flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer"
              >
                Tahmin Et
              </button>
            </form>

            {/* Smart autocomplete suggestions */}
            {searchSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden shadow-2xl z-20">
                {searchSuggestions.map((sug) => (
                  <button
                    key={sug.id}
                    onClick={() => handleSubmitGuess(sug)}
                    className="w-full text-left px-4 py-2.5 hover:bg-zinc-700/80 flex items-center justify-between text-xs font-semibold text-zinc-200 border-b border-zinc-700/50 last:border-0 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{sug.countryCode}</span>
                      <span>{sug.name}</span>
                    </span>
                    <span className="text-[10px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded">
                      {sug.position}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Hint & Jokers Bar */}
            <div className="flex flex-col gap-2 mt-3 text-xs">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setUsedHint(true);
                  }}
                  disabled={usedHint}
                  className="text-amber-400/90 hover:text-amber-300 disabled:opacity-40 flex items-center gap-1.5 font-medium px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 transition cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  {usedHint ? 'İpucu Açıldı' : 'Standart İpucu (-%30 Puan)'}
                </button>

                <span className="text-zinc-500 text-[11px]">
                  {validPlayers.length} olası ortak futbolcu var
                </span>
              </div>

              {/* Power-up Jokers row */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 font-bold uppercase mr-1">Jokerler:</span>
                
                {/* Harf Jokeri */}
                <button
                  type="button"
                  onClick={() => {
                    if (userStats.jokers?.hintLetters <= 0 || !validPlayers.length) return;
                    const { success, updatedStats } = useJoker(userStats, 'hintLetters');
                    if (success) {
                      sound.playPowerUp();
                      onUpdateStats(updatedStats, []);
                      const p = validPlayers[0];
                      setJokerLetterText(`Baş harfler: ${p.name.slice(0, 3)}... (${p.nationality})`);
                    }
                  }}
                  disabled={!userStats.jokers?.hintLetters || userStats.jokers.hintLetters <= 0 || !!jokerLetterText}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                >
                  <Lightbulb className="w-3 h-3 text-amber-400" />
                  <span>Harf ({userStats.jokers?.hintLetters || 0})</span>
                </button>

                {/* +10s Süre Jokeri */}
                <button
                  type="button"
                  onClick={() => {
                    if (userStats.jokers?.extraTime <= 0) return;
                    const { success, updatedStats } = useJoker(userStats, 'extraTime');
                    if (success) {
                      sound.playPowerUp();
                      setTimeLeft((prev) => prev + 10);
                      onUpdateStats(updatedStats, []);
                    }
                  }}
                  disabled={!userStats.jokers?.extraTime || userStats.jokers.extraTime <= 0}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-[11px] font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                >
                  <Clock className="w-3 h-3 text-sky-400" />
                  <span>+10s ({userStats.jokers?.extraTime || 0})</span>
                </button>

                {/* 50/50 Jokeri */}
                <button
                  type="button"
                  onClick={() => {
                    if (userStats.jokers?.fiftyFifty <= 0 || !validPlayers.length) return;
                    const { success, updatedStats } = useJoker(userStats, 'fiftyFifty');
                    if (success) {
                      sound.playPowerUp();
                      onUpdateStats(updatedStats, []);
                      const p = validPlayers[0];
                      setJokerFilterText(`Mevki: ${p.position} • Forma No: ${p.famousNumber || '?'}`);
                    }
                  }}
                  disabled={!userStats.jokers?.fiftyFifty || userStats.jokers.fiftyFifty <= 0 || !!jokerFilterText}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[11px] font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                >
                  <Filter className="w-3 h-3 text-purple-400" />
                  <span>50/50 ({userStats.jokers?.fiftyFifty || 0})</span>
                </button>
              </div>
            </div>

            {/* Joker Info alerts if activated */}
            {(jokerLetterText || jokerFilterText) && (
              <div className="mt-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-1">
                {jokerLetterText && <p>💡 {jokerLetterText}</p>}
                {jokerFilterText && <p>🎯 {jokerFilterText}</p>}
              </div>
            )}

            {/* Standard Hint Box if activated */}
            {usedHint && validPlayers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2.5 p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200"
              >
                <p className="font-semibold mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  İpucu:
                </p>
                <p className="text-amber-300/90 leading-relaxed">
                  {validPlayers[0].hint} (Mevki: {validPlayers[0].position}, Ülke: {validPlayers[0].nationality})
                </p>
              </motion.div>
            )}
          </div>
        )}

        {/* Round Result Reveal Screen */}
        <AnimatePresence>
          {roundResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full mt-4 flex flex-col items-center text-center p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800"
            >
              {roundResult === 'correct' ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <span className="text-lg font-black text-emerald-400">HARİKA TAHMİN!</span>
                  <span className="text-sm font-bold text-white mt-1">
                    {guessedPlayer?.name}
                  </span>
                  <span className="text-xs text-emerald-300 font-bold bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-full mt-2">
                    +{earnedPoints} Puan Kazanıldı!
                  </span>
                  <p className="text-xs text-zinc-400 mt-2 italic">
                    "{guessedPlayer?.hint}"
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-2">
                    <XCircle className="w-8 h-8" />
                  </div>
                  <span className="text-lg font-black text-rose-400">SÜRE DOLDU!</span>
                  <span className="text-xs text-zinc-400 mt-1">
                    Doğru cevaplardan biri olabilirdi:
                  </span>
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    {validPlayers.map((vp) => (
                      <span
                        key={vp.id}
                        className="text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40 px-2.5 py-1 rounded-lg"
                      >
                        {vp.name} ({vp.position})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Round Button */}
              <div className="flex items-center gap-3 mt-5 w-full">
                <button
                  onClick={onOpenArchive}
                  className="flex-1 text-xs font-semibold py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                >
                  Futbolcu Arşivi
                </button>
                <button
                  onClick={handleNextRound}
                  className="flex-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-zinc-950 font-black py-2.5 px-4 rounded-xl text-sm transition flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
                >
                  Sonraki Eşleşme <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
