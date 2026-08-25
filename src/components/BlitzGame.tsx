import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Club, Player, UserStats } from '../types';
import { CLUBS, isPopularClub } from '../data/clubs';
import { PLAYERS, getCommonPlayers, matchesPlayer, normalizeString, getEligibleClubPairs } from '../data/players';
import { ClubEmblem } from './ClubEmblem';
import { sound } from '../services/soundService';
import { recordBlitzResult, useJoker } from '../services/storageService';
import {
  Flame,
  Zap,
  RotateCcw,
  ArrowRight,
  Clock,
  Lightbulb,
  Sparkles,
  Search,
  SkipForward,
  Trophy,
  Filter,
} from 'lucide-react';

interface BlitzGameProps {
  userStats: UserStats;
  onUpdateStats: (newStats: UserStats, newBadges?: string[]) => void;
  onBackToHome: () => void;
  onOpenShop: () => void;
}

export const BlitzGame: React.FC<BlitzGameProps> = ({
  userStats,
  onUpdateStats,
  onBackToHome,
  onOpenShop,
}) => {
  // Game session states
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [correctCount, setCorrectCount] = useState(0);
  const [skipsRemaining, setSkipsRemaining] = useState(3);

  // Current pair
  const [club1, setClub1] = useState<Club | null>(null);
  const [club2, setClub2] = useState<Club | null>(null);
  const [validPlayers, setValidPlayers] = useState<Player[]>([]);

  // Input & Hints
  const [guessInput, setGuessInput] = useState('');
  const [feedback, setFeedback] = useState<{ text: string; type: 'correct' | 'wrong' | 'bonus' } | null>(null);
  const [letterHint, setLetterHint] = useState<string | null>(null);
  const [filteredHint, setFilteredHint] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<'standard' | 'hard'>('standard');

  // Pre-filter valid club pairs that share common players (Standard: only well-known clubs, Hard: all clubs)
  const validClubPairs = useMemo(() => {
    return getEligibleClubPairs(CLUBS, isPopularClub, difficulty);
  }, [difficulty]);

  const generateNewPair = useCallback(() => {
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
    setLetterHint(null);
    setFilteredHint(null);
  }, [validClubPairs]);

  // Start game
  const startGame = useCallback(() => {
    setTimeLeft(60);
    setScore(0);
    setCombo(1);
    setCorrectCount(0);
    setSkipsRemaining(3);
    setIsGameOver(false);
    setFeedback(null);
    generateNewPair();
    sound.playStartWhistle();
  }, [generateNewPair]);

  useEffect(() => {
    startGame();
  }, [startGame]);

  // Countdown timer
  useEffect(() => {
    if (isGameOver || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleGameOver();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameOver, timeLeft]);

  const handleGameOver = () => {
    setIsGameOver(true);
    sound.playFanfare();
    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.5 },
    });

    const { updatedStats, newlyUnlockedBadges } = recordBlitzResult(userStats, score);
    onUpdateStats(updatedStats, newlyUnlockedBadges);
  };

  // Submit guess
  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guessInput.trim() || !club1 || !club2 || isGameOver) return;

    const normalizedGuess = normalizeString(guessInput);
    const matched = validPlayers.find((p) => matchesPlayer(p, normalizedGuess));

    if (matched) {
      // Correct!
      const points = 100 * combo;
      const newScore = score + points;
      const newCombo = Math.min(5, combo + 1);

      setScore(newScore);
      setCombo(newCombo);
      setCorrectCount((prev) => prev + 1);
      setTimeLeft((prev) => Math.min(90, prev + 2)); // +2 seconds bonus!

      sound.playCorrect();
      if (newCombo >= 3) {
        sound.playCombo(newCombo);
      }

      setFeedback({
        text: `+${points} Puan! (${matched.name}) +2 Sn! 🔥`,
        type: 'correct',
      });

      setTimeout(() => {
        setFeedback(null);
        generateNewPair();
      }, 700);
    } else {
      // Wrong guess
      sound.playWrong();
      setCombo(1); // reset combo
      setFeedback({
        text: `Yanlış! Seri Sıfırlandı ❌`,
        type: 'wrong',
      });

      setTimeout(() => {
        setFeedback(null);
      }, 700);
    }
  };

  // Skip question
  const handleSkip = () => {
    if (skipsRemaining <= 0 || isGameOver) return;
    sound.playClick();
    setSkipsRemaining((prev) => prev - 1);
    setCombo(1);
    generateNewPair();
  };

  // Joker 1: Letter hint
  const handleUseLetterHint = () => {
    if (userStats.jokers?.hintLetters <= 0 || !validPlayers.length) return;
    const { success, updatedStats } = useJoker(userStats, 'hintLetters');
    if (success) {
      sound.playPowerUp();
      onUpdateStats(updatedStats);
      const target = validPlayers[0];
      setLetterHint(`Baş harfler: ${target.name.slice(0, 3)}... • Ülke: ${target.nationality}`);
    }
  };

  // Joker 2: Extra Time (+10 sn)
  const handleUseExtraTime = () => {
    if (userStats.jokers?.extraTime <= 0) return;
    const { success, updatedStats } = useJoker(userStats, 'extraTime');
    if (success) {
      sound.playPowerUp();
      setTimeLeft((prev) => prev + 10);
      onUpdateStats(updatedStats);
      setFeedback({ text: '+10 Saniye Eklendi! ⏱️', type: 'bonus' });
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  // Joker 3: 50/50 Filter
  const handleUseFiftyFifty = () => {
    if (userStats.jokers?.fiftyFifty <= 0 || !validPlayers.length) return;
    const { success, updatedStats } = useJoker(userStats, 'fiftyFifty');
    if (success) {
      sound.playPowerUp();
      onUpdateStats(updatedStats);
      const target = validPlayers[0];
      setFilteredHint(`Mevki: ${target.position} • Yaş/Dönem: ${target.yearsActive || 'Bilinmiyor'}`);
    }
  };

  // Suggestions for autocomplete
  const suggestions = useMemo(() => {
    if (!guessInput.trim() || guessInput.length < 2) return [];
    const query = normalizeString(guessInput);
    return PLAYERS.filter((p) => {
      const pName = normalizeString(p.name);
      return pName.includes(query);
    }).slice(0, 4);
  }, [guessInput]);

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

        {/* Difficulty Selector */}
        <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => {
              if (difficulty !== 'standard') {
                sound.playClick();
                setDifficulty('standard');
                generateNewPair();
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
            <span>Popüler</span>
          </button>
          <button
            onClick={() => {
              if (difficulty !== 'hard') {
                sound.playClick();
                setDifficulty('hard');
                generateNewPair();
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
            <span>Zor</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 font-black text-sm border border-amber-500/30">
            <Flame className="w-4 h-4 animate-pulse text-amber-400" />
            <span>x{combo} Kombo</span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-black text-sm border transition-colors ${
              timeLeft <= 10
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-bounce'
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{timeLeft}s</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-zinc-500 block">Skor</span>
          <span className="text-base font-black text-amber-400">{score}</span>
        </div>
      </div>

      {!isGameOver ? (
        <div className="w-full space-y-4">
          {/* Active Club Pair Cards */}
          <div className="grid grid-cols-2 gap-3 relative">
            <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center text-center shadow-xl">
              {club1 && (
                <>
                  <ClubEmblem club={club1} size="lg" />
                  <h3 className="font-black text-base text-white mt-3">{club1.name}</h3>
                  <span className="text-[11px] text-zinc-400 mt-0.5">{club1.country}</span>
                </>
              )}
            </div>

            <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center text-center shadow-xl">
              {club2 && (
                <>
                  <ClubEmblem club={club2} size="lg" />
                  <h3 className="font-black text-base text-white mt-3">{club2.name}</h3>
                  <span className="text-[11px] text-zinc-400 mt-0.5">{club2.country}</span>
                </>
              )}
            </div>

            {/* Middle Badge */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-amber-500 text-zinc-950 font-black text-xs flex items-center justify-center shadow-2xl border-4 border-zinc-950">
              ⚡
            </div>
          </div>

          {/* Feedback Pill */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`w-full py-2.5 px-4 rounded-2xl text-center text-xs font-black shadow-lg ${
                  feedback.type === 'correct'
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                    : feedback.type === 'bonus'
                    ? 'bg-sky-500/20 border border-sky-500/40 text-sky-300'
                    : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
                }`}
              >
                {feedback.text}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hint boxes if activated */}
          {(letterHint || filteredHint) && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-300 space-y-1">
              {letterHint && <p>💡 {letterHint}</p>}
              {filteredHint && <p>🎯 {filteredHint}</p>}
            </div>
          )}

          {/* Input form */}
          <form onSubmit={handleGuessSubmit} className="relative">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-zinc-500 pointer-events-none" />
              <input
                type="text"
                value={guessInput}
                onChange={(e) => setGuessInput(e.target.value)}
                placeholder="İki kulüpte de oynamış futbolcuyu yaz..."
                autoFocus
                className="w-full bg-zinc-900 border-2 border-zinc-700 focus:border-amber-500 rounded-2xl py-3.5 pl-12 pr-28 text-white font-bold placeholder-zinc-500 outline-none transition text-sm shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs shadow-md transition cursor-pointer active:scale-95"
              >
                Gönder
              </button>
            </div>

            {/* Autocomplete suggestions */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900/95 border border-zinc-700 rounded-2xl overflow-hidden shadow-2xl z-30 divide-y divide-zinc-800">
                {suggestions.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setGuessInput(p.name);
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-bold text-white hover:bg-zinc-800 flex items-center justify-between cursor-pointer"
                  >
                    <span>{p.name}</span>
                    <span className="text-[10px] text-zinc-400">{p.nationality} • {p.position}</span>
                  </button>
                ))}
              </div>
            )}
          </form>

          {/* Action Bar (Skip & In-Game Jokers) */}
          <div className="flex items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleUseLetterHint}
                disabled={userStats.jokers?.hintLetters <= 0}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 text-xs font-bold text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Harf ({userStats.jokers?.hintLetters || 0})</span>
              </button>

              <button
                type="button"
                onClick={handleUseExtraTime}
                disabled={userStats.jokers?.extraTime <= 0}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-sky-500/50 text-xs font-bold text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
              >
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>+10s ({userStats.jokers?.extraTime || 0})</span>
              </button>

              <button
                type="button"
                onClick={handleUseFiftyFifty}
                disabled={userStats.jokers?.fiftyFifty <= 0}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-purple-500/50 text-xs font-bold text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
              >
                <Filter className="w-3.5 h-3.5 text-purple-400" />
                <span>50/50 ({userStats.jokers?.fiftyFifty || 0})</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleSkip}
              disabled={skipsRemaining <= 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
            >
              <SkipForward className="w-3.5 h-3.5 text-amber-400" />
              <span>Pas ({skipsRemaining})</span>
            </button>
          </div>
        </div>
      ) : (
        /* Game Over Summary Screen */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-center space-y-5 shadow-2xl"
        >
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto text-3xl">
            🏆
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">Süre Doldu!</h2>
            <p className="text-xs text-zinc-400 mt-1">Harika bir 60 saniyelik seri performansı!</p>
          </div>

          {/* Stats Box */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
              <span className="text-[10px] font-bold text-zinc-500 uppercase block">Toplam Skor</span>
              <span className="text-lg font-black text-amber-400">{score}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
              <span className="text-[10px] font-bold text-zinc-500 uppercase block">Doğru Sayısı</span>
              <span className="text-lg font-black text-emerald-400">{correctCount}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
              <span className="text-[10px] font-bold text-zinc-500 uppercase block">En Yüksek Rekor</span>
              <span className="text-lg font-black text-purple-400">
                {Math.max(score, userStats.blitzHighScore || 0)}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={startGame}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Tekrar Oyna
            </button>

            <button
              onClick={onBackToHome}
              className="py-3.5 px-5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-black text-sm transition cursor-pointer"
            >
              Ana Menüye Dön
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
