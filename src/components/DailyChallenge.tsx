import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Club, Player, UserStats } from '../types';
import { CLUBS, isPopularClub } from '../data/clubs';
import { PLAYERS, getCommonPlayers, validatePlayerGuess, normalizeString, getEligibleClubPairs } from '../data/players';
import { ClubEmblem } from './ClubEmblem';
import { sound } from '../services/soundService';
import { recordGamePlayed, getTodayDateStr, saveUserStats } from '../services/storageService';
import { 
  Trophy, 
  Calendar, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Flame, 
  Search, 
  HelpCircle,
  Award
} from 'lucide-react';

interface DailyChallengeProps {
  userStats: UserStats;
  onUpdateStats: (newStats: UserStats, newBadges: string[]) => void;
  onBackToHome: () => void;
  onOpenProfile: () => void;
}

interface DailyQuestion {
  id: number;
  club1: Club;
  club2: Club;
  validPlayers: Player[];
}

export const DailyChallenge: React.FC<DailyChallengeProps> = ({
  userStats,
  onUpdateStats,
  onBackToHome,
  onOpenProfile,
}) => {
  const todayStr = getTodayDateStr();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [dailyScore, setDailyScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  
  const [guessInput, setGuessInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(20);
  const [isQuestionActive, setIsQuestionActive] = useState(false);
  const [questionResult, setQuestionResult] = useState<'correct' | 'wrong' | 'timeout' | null>(null);
  const [guessedPlayer, setGuessedPlayer] = useState<Player | null>(null);
  const [usedHint, setUsedHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Generate 10 deterministic daily questions based on today's date (Popular clubs only)
  const dailyQuestions: DailyQuestion[] = useMemo(() => {
    const validPairs = getEligibleClubPairs(CLUBS, isPopularClub, 'standard');

    // Hash today's date string into a deterministic number
    let hash = 0;
    for (let i = 0; i < todayStr.length; i++) {
      hash = (hash << 5) - hash + todayStr.charCodeAt(i);
      hash |= 0;
    }
    const seed = Math.abs(hash);

    const questions: DailyQuestion[] = [];
    const usedPairIndices = new Set<number>();

    for (let q = 0; q < 10; q++) {
      let pairIndex = (seed + q * 17) % validPairs.length;
      while (usedPairIndices.has(pairIndex)) {
        pairIndex = (pairIndex + 1) % validPairs.length;
      }
      usedPairIndices.add(pairIndex);

      const [c1Key, c2Key] = validPairs[pairIndex];
      questions.push({
        id: q + 1,
        club1: CLUBS[c1Key],
        club2: CLUBS[c2Key],
        validPlayers: getCommonPlayers(c1Key, c2Key),
      });
    }

    return questions;
  }, [todayStr]);

  const currentQ = dailyQuestions[currentIdx];

  const startCurrentQuestion = useCallback(() => {
    setGuessInput('');
    setTimeLeft(20);
    setQuestionResult(null);
    setGuessedPlayer(null);
    setUsedHint(false);
    setIsQuestionActive(true);
  }, []);

  useEffect(() => {
    startCurrentQuestion();
  }, [currentIdx, startCurrentQuestion]);

  // Timer effect
  useEffect(() => {
    if (!isQuestionActive || isCompleted) return;

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
  }, [isQuestionActive, isCompleted]);

  // Autocomplete suggestions
  const searchSuggestions = useMemo(() => {
    if (!guessInput.trim() || guessInput.length < 2 || !isQuestionActive) return [];
    const norm = normalizeString(guessInput);
    return PLAYERS.filter((p) => {
      const pNorm = normalizeString(p.name);
      return pNorm.includes(norm) || (p.fullName && normalizeString(p.fullName).includes(norm));
    }).slice(0, 4);
  }, [guessInput, isQuestionActive]);

  const handleTimeout = () => {
    setIsQuestionActive(false);
    setQuestionResult('timeout');
    sound.playWrong();
  };

  const handleSubmitGuess = (playerToTest?: Player) => {
    if (!isQuestionActive || !currentQ) return;

    let matched: Player | null = null;
    if (playerToTest) {
      if (currentQ.validPlayers.some((p) => p.id === playerToTest.id)) {
        matched = playerToTest;
      }
    } else {
      matched = validatePlayerGuess(guessInput, currentQ.validPlayers);
    }

    const elapsed = 20 - timeLeft;

    if (matched) {
      let points = Math.max(250, Math.round(1000 - elapsed * 35));
      if (usedHint) points = Math.round(points * 0.7);

      setIsQuestionActive(false);
      setQuestionResult('correct');
      setGuessedPlayer(matched);
      setDailyScore((prev) => prev + points);
      setCorrectCount((prev) => prev + 1);

      sound.playCorrect();

      // Record player unlock
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

  const handleNextOrFinish = () => {
    sound.playClick();
    if (currentIdx < 9) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Completed full 10 questions!
      setIsCompleted(true);
      sound.playFanfare();

      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.5 },
      });

      // Award Daily Champion Badge
      const updated = { ...userStats };
      if (!updated.unlockedBadges.includes('daily_champion')) {
        updated.unlockedBadges.push('daily_champion');
      }
      updated.lastDailyDate = todayStr;
      updated.dailyScores[todayStr] = dailyScore;
      updated.dailyChallengeStreak += 1;

      saveUserStats(updated);
      onUpdateStats(updated, ['daily_champion']);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 flex flex-col items-center">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between bg-zinc-900/70 border border-zinc-800 rounded-2xl px-4 py-2.5 mb-4 shadow-sm">
        <button
          onClick={onBackToHome}
          className="text-xs font-semibold text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-700/60 transition flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Ana Menü
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
          <Calendar className="w-4 h-4" />
          <span>Günün 10'lusu ({todayStr})</span>
        </div>

        <div className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-lg">
          {dailyScore} Puan
        </div>
      </div>

      {!isCompleted ? (
        <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 md:p-7 flex flex-col items-center relative overflow-hidden shadow-xl">
          {/* Progress Indicator 1/10 */}
          <div className="w-full mb-4">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-400 mb-2">
              <span className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" /> Soru {currentIdx + 1} / 10
              </span>
              <span className="font-mono text-emerald-400">{timeLeft}s</span>
            </div>

            {/* 10 Step Dots */}
            <div className="grid grid-cols-10 gap-1.5 w-full">
              {dailyQuestions.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i < currentIdx
                      ? 'bg-emerald-500'
                      : i === currentIdx
                      ? 'bg-amber-400 ring-2 ring-amber-400/40'
                      : 'bg-zinc-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Matchup */}
          <div className="w-full flex items-center justify-around my-3 py-2">
            <div className="flex flex-col items-center text-center max-w-[120px]">
              <div className="p-3 bg-zinc-800/80 rounded-2xl border border-zinc-700/60 shadow-lg mb-2">
                <ClubEmblem club={currentQ.club1} size="lg" />
              </div>
              <span className="text-sm font-bold text-white leading-tight">{currentQ.club1.name}</span>
            </div>

            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-zinc-950 font-black text-xs shadow-md">
              &amp;
            </div>

            <div className="flex flex-col items-center text-center max-w-[120px]">
              <div className="p-3 bg-zinc-800/80 rounded-2xl border border-zinc-700/60 shadow-lg mb-2">
                <ClubEmblem club={currentQ.club2} size="lg" />
              </div>
              <span className="text-sm font-bold text-white leading-tight">{currentQ.club2.name}</span>
            </div>
          </div>

          <p className="text-xs md:text-sm text-zinc-300 font-medium text-center my-3">
            Günün bu iki kulübünde de oynamış ortak futbolcuyu tahmin et:
          </p>

          {/* Guess Input Form */}
          {isQuestionActive && (
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
                    className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 font-medium shadow-inner"
                  />
                  <Search className="absolute right-3.5 top-3.5 w-4 h-4 text-zinc-500 pointer-events-none" />
                </div>

                <button
                  type="submit"
                  disabled={!guessInput.trim()}
                  className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 disabled:opacity-40 text-zinc-950 font-black px-5 py-3 rounded-xl text-sm transition shadow-md shrink-0 cursor-pointer"
                >
                  Onayla
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
                      <span className="flex items-center gap-2">
                        <span>{sug.countryCode}</span>
                        <span>{sug.name}</span>
                      </span>
                      <span className="text-[10px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded">
                        {sug.position}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Hint button */}
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
                  {usedHint ? 'İpucu Açık' : 'İpucu Al'}
                </button>
              </div>

              {usedHint && currentQ.validPlayers.length > 0 && (
                <div className="mt-2.5 p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200">
                  {currentQ.validPlayers[0].hint} ({currentQ.validPlayers[0].position} - {currentQ.validPlayers[0].nationality})
                </div>
              )}
            </div>
          )}

          {/* Reveal Result Box */}
          <AnimatePresence>
            {questionResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full mt-4 flex flex-col items-center text-center p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800"
              >
                {questionResult === 'correct' ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-1" />
                    <span className="text-sm font-bold text-white">{guessedPlayer?.name}</span>
                    <span className="text-xs text-emerald-400 font-bold mt-1">Doğru Cevap!</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <XCircle className="w-8 h-8 text-rose-400 mb-1" />
                    <span className="text-xs text-zinc-400">Doğru cevaplar:</span>
                    <div className="flex flex-wrap gap-1.5 justify-center mt-1.5">
                      {currentQ.validPlayers.map((vp) => (
                        <span
                          key={vp.id}
                          className="text-xs font-semibold text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30"
                        >
                          {vp.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleNextOrFinish}
                  className="mt-4 w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-zinc-950 font-black py-2.5 px-4 rounded-xl text-sm transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
                >
                  {currentIdx < 9 ? 'Sonraki Soruya Geç' : 'Meydan Okumayı Tamamla'}{' '}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* Summary & Badge Award Completion Screen */
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 flex flex-col items-center text-center shadow-2xl"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl mb-3 shadow-inner">
            👑
          </div>

          <h2 className="text-2xl font-black text-white">GÜNLÜK MEYDAN OKUMA TAMAMLANDI!</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Günün 10 soruluk özel mücadelesini başarıyla bitirdin.
          </p>

          <div className="grid grid-cols-2 gap-3 w-full my-6">
            <div className="bg-zinc-800/80 border border-zinc-700/60 p-3.5 rounded-2xl flex flex-col items-center">
              <span className="text-[11px] text-zinc-400 uppercase font-bold">Toplam Skor</span>
              <span className="text-2xl font-black text-amber-400 mt-0.5">{dailyScore}</span>
            </div>
            <div className="bg-zinc-800/80 border border-zinc-700/60 p-3.5 rounded-2xl flex flex-col items-center">
              <span className="text-[11px] text-zinc-400 uppercase font-bold">İsabet Oranı</span>
              <span className="text-2xl font-black text-emerald-400 mt-0.5">{correctCount} / 10</span>
            </div>
          </div>

          {/* Awarded Badge Highlight */}
          <div className="w-full bg-gradient-to-r from-amber-950/40 to-amber-900/20 border border-amber-500/40 rounded-2xl p-4 flex items-center gap-3.5 text-left mb-6">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-2xl shrink-0">
              👑
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Yeni Rozet Kazanıldı!
                </span>
                <Award className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <p className="text-sm font-black text-white">Günün Fatihi</p>
              <p className="text-[11px] text-zinc-300">Profilinde rozet olarak sergilendi.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full">
            <button
              onClick={onOpenProfile}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold py-3 px-4 rounded-xl text-xs transition cursor-pointer"
            >
              Rozetleri ve Profili Gör
            </button>
            <button
              onClick={onBackToHome}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 text-zinc-950 font-black py-3 px-4 rounded-xl text-xs transition cursor-pointer shadow-lg"
            >
              Ana Sayfaya Dön
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
