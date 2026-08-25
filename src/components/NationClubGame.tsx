import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Club, Player, UserStats } from '../types';
import { PLAYERS, validatePlayerGuess, normalizeString } from '../data/players';
import { CLUBS, isPopularClub } from '../data/clubs';
import { ClubEmblem } from './ClubEmblem';
import { sound } from '../services/soundService';
import { recordGamePlayed } from '../services/storageService';
import { RotateCcw, Flag, CheckCircle2, XCircle, ArrowRight, Search, Zap, HelpCircle } from 'lucide-react';

interface NationClubGameProps {
  userStats: UserStats;
  onUpdateStats: (newStats: UserStats, newBadges: string[]) => void;
  onBackToHome: () => void;
}

interface NationClubMatch {
  nationality: string;
  countryCode: string;
  club: Club;
  validPlayers: Player[];
}

export const NationClubGame: React.FC<NationClubGameProps> = ({
  userStats,
  onUpdateStats,
  onBackToHome,
}) => {
  const [currentMatch, setCurrentMatch] = useState<NationClubMatch | null>(null);
  const [guessInput, setGuessInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(20);
  const [isRoundActive, setIsRoundActive] = useState(false);
  const [roundResult, setRoundResult] = useState<'correct' | 'wrong' | 'timeout' | null>(null);
  const [guessedPlayer, setGuessedPlayer] = useState<Player | null>(null);
  const [usedHint, setUsedHint] = useState(false);
  const [score, setScore] = useState(0);

  // Compute all valid (nationality, club) pairs
  const validPairs = useMemo(() => {
    const pairsMap = new Map<string, { nationality: string; countryCode: string; clubId: string; players: Player[] }>();

    PLAYERS.forEach((player) => {
      player.clubs.forEach((cId) => {
        const key = `${player.nationality}_${cId}`;
        if (!pairsMap.has(key)) {
          pairsMap.set(key, {
            nationality: player.nationality,
            countryCode: player.countryCode,
            clubId: cId,
            players: [],
          });
        }
        pairsMap.get(key)!.players.push(player);
      });
    });

    return Array.from(pairsMap.values()).filter((item) => CLUBS[item.clubId] && isPopularClub(item.clubId));
  }, []);

  const generateNewRound = useCallback(() => {
    if (validPairs.length === 0) return;
    const random = validPairs[Math.floor(Math.random() * validPairs.length)];
    const club = CLUBS[random.clubId];

    setCurrentMatch({
      nationality: random.nationality,
      countryCode: random.countryCode,
      club,
      validPlayers: random.players,
    });
    setGuessInput('');
    setTimeLeft(20);
    setRoundResult(null);
    setGuessedPlayer(null);
    setUsedHint(false);
    setIsRoundActive(true);
  }, [validPairs]);

  useEffect(() => {
    generateNewRound();
  }, [generateNewRound]);

  // Timer
  useEffect(() => {
    if (!isRoundActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRoundActive]);

  const handleTimeout = () => {
    setIsRoundActive(false);
    setRoundResult('timeout');
    sound.playWrong();
  };

  // Search suggestions
  const searchSuggestions = useMemo(() => {
    if (!guessInput.trim() || guessInput.length < 2 || !isRoundActive) return [];
    const norm = normalizeString(guessInput);
    return PLAYERS.filter((p) => {
      const pNorm = normalizeString(p.name);
      return pNorm.includes(norm) || (p.fullName && normalizeString(p.fullName).includes(norm));
    }).slice(0, 4);
  }, [guessInput, isRoundActive]);

  const handleSubmitGuess = (playerToTest?: Player) => {
    if (!isRoundActive || !currentMatch) return;

    let matched: Player | null = null;
    if (playerToTest) {
      if (currentMatch.validPlayers.some((p) => p.id === playerToTest.id)) {
        matched = playerToTest;
      }
    } else {
      matched = validatePlayerGuess(guessInput, currentMatch.validPlayers);
    }

    const elapsed = 20 - timeLeft;

    if (matched) {
      let points = Math.max(200, Math.round(1000 - elapsed * 35));
      if (usedHint) points = Math.round(points * 0.7);

      setIsRoundActive(false);
      setRoundResult('correct');
      setGuessedPlayer(matched);
      setScore((prev) => prev + points);

      sound.playCorrect();

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
      });

      const { updatedStats, newlyUnlockedBadges } = recordGamePlayed(
        userStats,
        points,
        true,
        elapsed,
        matched.id
      );
      onUpdateStats(updatedStats, newlyUnlockedBadges);
    } else {
      sound.playWrong();
      setTimeLeft((prev) => Math.max(1, prev - 3));
      setGuessInput('');
    }
  };

  if (!currentMatch) return null;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 flex flex-col items-center">
      {/* Header Bar */}
      <div className="w-full flex items-center justify-between bg-zinc-900/70 border border-zinc-800 rounded-2xl px-4 py-2.5 mb-4 shadow-sm">
        <button
          onClick={onBackToHome}
          className="text-xs font-semibold text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-700/60 transition flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Ana Menü
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
          <Flag className="w-4 h-4" />
          <span>Ülke &amp; Kulüp Tahmini</span>
        </div>

        <div className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-lg">
          {score} Puan
        </div>
      </div>

      {/* Main Game Arena */}
      <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 md:p-7 flex flex-col items-center relative overflow-hidden shadow-xl">
        {/* Timer Bar */}
        <div className="w-full mb-5">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-sky-400" /> Kalan Süre
            </span>
            <span className="text-sm font-black font-mono text-sky-400">{timeLeft}s</span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-indigo-400 rounded-full transition-all duration-300"
              style={{ width: `${(timeLeft / 20) * 100}%` }}
            />
          </div>
        </div>

        {/* Pairing Display: Flag Card + Club Emblem Card */}
        <div className="w-full flex items-center justify-around my-3 py-2">
          {/* Nationality Box */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, x: -20 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            className="flex flex-col items-center text-center"
          >
            <div className="w-20 h-20 bg-zinc-800/90 rounded-2xl border border-zinc-700/80 flex items-center justify-center text-3xl shadow-lg mb-2">
              <span className="font-mono text-lg font-bold text-white px-2 text-center">
                {currentMatch.countryCode}
              </span>
            </div>
            <span className="text-sm font-bold text-white">{currentMatch.nationality}</span>
            <span className="text-[11px] text-zinc-400">Milliyet</span>
          </motion.div>

          {/* Plus symbol */}
          <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 font-black text-sm">
            +
          </div>

          {/* Club Box */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, x: 20 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            className="flex flex-col items-center text-center max-w-[120px]"
          >
            <div className="p-3 bg-zinc-800/90 rounded-2xl border border-zinc-700/80 shadow-lg mb-2">
              <ClubEmblem club={currentMatch.club} size="lg" />
            </div>
            <span className="text-sm font-bold text-white leading-tight">{currentMatch.club.name}</span>
            <span className="text-[11px] text-zinc-400">Kulüp</span>
          </motion.div>
        </div>

        <p className="text-xs md:text-sm text-zinc-300 font-medium text-center my-3">
          <strong className="text-sky-400">{currentMatch.nationality}</strong> vatandaşı olup{' '}
          <strong className="text-white">{currentMatch.club.name}</strong> forması giymiş bir
          futbolcu yaz:
        </p>

        {/* Input Form */}
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
                  placeholder="Futbolcu adı yaz..."
                  autoFocus
                  className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500 font-medium shadow-inner"
                />
                <Search className="absolute right-3.5 top-3.5 w-4 h-4 text-zinc-500 pointer-events-none" />
              </div>

              <button
                type="submit"
                disabled={!guessInput.trim()}
                className="bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-500 hover:to-indigo-600 disabled:opacity-40 text-white font-bold px-5 py-3 rounded-xl text-sm transition shadow-md shrink-0 cursor-pointer"
              >
                Gönder
              </button>
            </form>

            {/* Suggestions */}
            {searchSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden shadow-2xl z-20">
                {searchSuggestions.map((sug) => (
                  <button
                    key={sug.id}
                    onClick={() => handleSubmitGuess(sug)}
                    className="w-full text-left px-4 py-2.5 hover:bg-zinc-700 flex items-center justify-between text-xs font-semibold text-zinc-200 border-b border-zinc-700/50 last:border-0 cursor-pointer"
                  >
                    <span>{sug.name}</span>
                    <span className="text-[10px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded">
                      {sug.nationality} • {sug.position}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Hint Button */}
            <div className="flex items-center justify-between mt-3 text-xs">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setUsedHint(true);
                }}
                disabled={usedHint}
                className="text-amber-400 hover:text-amber-300 disabled:opacity-40 flex items-center gap-1 font-medium px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 transition cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                {usedHint ? 'İpucu Açıldı' : 'İpucu Al (-%30)'}
              </button>

              <span className="text-zinc-500 text-[11px]">
                {currentMatch.validPlayers.length} olası futbolcu
              </span>
            </div>

            {usedHint && currentMatch.validPlayers.length > 0 && (
              <div className="mt-2.5 p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200">
                {currentMatch.validPlayers[0].hint} (Mevki: {currentMatch.validPlayers[0].position})
              </div>
            )}
          </div>
        )}

        {/* Reveal Result Screen */}
        <AnimatePresence>
          {roundResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full mt-4 flex flex-col items-center text-center p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800"
            >
              {roundResult === 'correct' ? (
                <div className="flex flex-col items-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-1" />
                  <span className="text-sm font-bold text-white">{guessedPlayer?.name}</span>
                  <span className="text-xs text-emerald-400 font-bold mt-1">Doğru Tahmin!</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <XCircle className="w-8 h-8 text-rose-400 mb-1" />
                  <span className="text-xs text-zinc-400">Doğru cevaplar:</span>
                  <div className="flex flex-wrap gap-1.5 justify-center mt-1.5">
                    {currentMatch.validPlayers.map((vp) => (
                      <span
                        key={vp.id}
                        className="text-xs font-semibold text-sky-300 bg-sky-950/40 px-2 py-0.5 rounded border border-sky-500/30"
                      >
                        {vp.name} ({vp.position})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  sound.playClick();
                  generateNewRound();
                }}
                className="mt-4 w-full bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-500 text-white font-black py-2.5 px-4 rounded-xl text-sm transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
              >
                Sonraki Eşleşme <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
