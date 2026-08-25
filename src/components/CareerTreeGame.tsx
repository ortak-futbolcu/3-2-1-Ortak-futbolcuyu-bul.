import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Player, UserStats } from '../types';
import { PLAYERS } from '../data/players';
import { CLUBS } from '../data/clubs';
import { ClubEmblem } from './ClubEmblem';
import { sound } from '../services/soundService';
import { recordGamePlayed, saveUserStats } from '../services/storageService';
import { RotateCcw, Sparkles, CheckCircle2, ArrowRight, GitFork, HelpCircle } from 'lucide-react';

interface CareerTreeGameProps {
  userStats: UserStats;
  onUpdateStats: (newStats: UserStats, newBadges: string[]) => void;
  onBackToHome: () => void;
}

export const CareerTreeGame: React.FC<CareerTreeGameProps> = ({
  userStats,
  onUpdateStats,
  onBackToHome,
}) => {
  // Players with at least 3 clubs in the dataset
  const eligiblePlayers = useMemo(() => {
    return PLAYERS.filter((p) => p.clubs.length >= 3);
  }, []);

  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [discoveredClubs, setDiscoveredClubs] = useState<string[]>([]);
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const startNewPlayer = () => {
    const random = eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)];
    setCurrentPlayer(random);
    setDiscoveredClubs([]);
    setSelectedClubId(null);
    setIsCompleted(false);
    setAttempts(0);
    setShowHint(false);
  };

  useEffect(() => {
    startNewPlayer();
  }, []);

  if (!currentPlayer) return null;

  const totalClubsCount = currentPlayer.clubs.length;
  const isAllDiscovered = discoveredClubs.length === totalClubsCount;

  // Available club choices to pick from (all clubs)
  const allClubList = Object.values(CLUBS);

  const handleSelectClub = (clubId: string) => {
    if (discoveredClubs.includes(clubId) || isCompleted) return;

    setAttempts((prev) => prev + 1);

    if (currentPlayer.clubs.includes(clubId)) {
      sound.playCorrect();
      const updated = [...discoveredClubs, clubId];
      setDiscoveredClubs(updated);

      if (updated.length === totalClubsCount) {
        setIsCompleted(true);
        sound.playFanfare();

        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });

        // Award points and unlock Career Detective badge
        const points = 500 + totalClubsCount * 150;
        const statsCopy = { ...userStats };
        if (!statsCopy.unlockedBadges.includes('career_detective')) {
          statsCopy.unlockedBadges.push('career_detective');
        }
        const { updatedStats } = recordGamePlayed(
          statsCopy,
          points,
          true,
          undefined,
          currentPlayer.id
        );
        saveUserStats(updatedStats);
        onUpdateStats(updatedStats, ['career_detective']);
      }
    } else {
      sound.playWrong();
    }
  };

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

        <div className="flex items-center gap-2 text-xs font-bold text-teal-400">
          <GitFork className="w-4 h-4" />
          <span>Kariyer Ağacı</span>
        </div>

        <div className="text-xs font-bold text-zinc-300 bg-zinc-800 px-3 py-1 rounded-lg">
          {discoveredClubs.length} / {totalClubsCount} Kulüp Bulundu
        </div>
      </div>

      {/* Main Career Tree Arena */}
      <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 md:p-7 flex flex-col items-center relative overflow-hidden shadow-xl">
        {/* Star Player Badge */}
        <div className="w-full flex flex-col items-center text-center pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              {currentPlayer.nationality} • {currentPlayer.position}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white">{currentPlayer.name}</h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-md italic">
            "{showHint ? currentPlayer.hint : 'Bu futbolcunun kariyerinde forma giydiği kulüpleri tahmin et!'}"
          </p>

          {!showHint && (
            <button
              onClick={() => {
                sound.playClick();
                setShowHint(true);
              }}
              className="mt-2 text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3 h-3" /> İpucu Göster
            </button>
          )}
        </div>

        {/* Tree Nodes (Discovered / Unknown) */}
        <div className="w-full my-6">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider text-center mb-3">
            Kariyer Durakları
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {currentPlayer.clubs.map((cId, idx) => {
              const isFound = discoveredClubs.includes(cId);
              const club = CLUBS[cId];

              return (
                <motion.div
                  key={cId}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`w-24 h-32 rounded-2xl flex flex-col items-center justify-center p-2 text-center transition-all ${
                    isFound
                      ? 'bg-emerald-950/60 border-2 border-emerald-500/80 shadow-lg shadow-emerald-950'
                      : 'bg-zinc-800/80 border border-zinc-700/80'
                  }`}
                >
                  {isFound ? (
                    <>
                      <ClubEmblem club={club} size="md" />
                      <span className="text-[11px] font-bold text-emerald-300 mt-1 leading-tight line-clamp-2">
                        {club.name}
                      </span>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-zinc-500">
                      <div className="w-10 h-10 rounded-full bg-zinc-700/50 flex items-center justify-center text-zinc-400 font-black text-lg mb-1">
                        ?
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                        Kulüp {idx + 1}
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Club Selection Grid (Pick from all major clubs) */}
        {!isCompleted ? (
          <div className="w-full">
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 text-center">
              Kulüpler Listesinden Seç:
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-56 overflow-y-auto pr-1 p-1 bg-zinc-950/50 rounded-2xl border border-zinc-800/80">
              {allClubList.map((club) => {
                const alreadyFound = discoveredClubs.includes(club.id);
                return (
                  <button
                    key={club.id}
                    onClick={() => handleSelectClub(club.id)}
                    disabled={alreadyFound}
                    className={`flex flex-col items-center p-2 rounded-xl border transition-all cursor-pointer ${
                      alreadyFound
                        ? 'opacity-30 bg-zinc-900 border-zinc-800'
                        : 'bg-zinc-800 hover:bg-zinc-700/90 border-zinc-700/80 hover:border-teal-500'
                    }`}
                  >
                    <ClubEmblem club={club} size="sm" />
                    <span className="text-[10px] font-bold text-zinc-300 mt-1 truncate max-w-[65px]">
                      {club.shortName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Completion Box */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full p-5 rounded-2xl bg-gradient-to-br from-emerald-950/70 to-teal-950/40 border border-emerald-500/50 flex flex-col items-center text-center mt-2"
          >
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2" />
            <h3 className="text-xl font-black text-white">TÜM KARİYERİ ÇÖZDÜN!</h3>
            <p className="text-xs text-emerald-300 mt-1">
              {currentPlayer.name} adlı yıldızın {totalClubsCount} kulübünü de eksiksiz buldun.
            </p>

            <button
              onClick={() => {
                sound.playClick();
                startNewPlayer();
              }}
              className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 text-zinc-950 font-black py-2.5 px-6 rounded-xl text-xs transition flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              Yeni Futbolcuya Geç <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
