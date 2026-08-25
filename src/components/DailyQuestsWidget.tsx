import React from 'react';
import { motion } from 'motion/react';
import { UserStats, DailyQuest } from '../types';
import { claimDailyQuest } from '../services/storageService';
import { sound } from '../services/soundService';
import { CheckCircle2, Gift, Sparkles, Coins, Zap, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DailyQuestsWidgetProps {
  userStats: UserStats;
  onUpdateStats: (newStats: UserStats, newBadges?: string[]) => void;
}

export const DailyQuestsWidget: React.FC<DailyQuestsWidgetProps> = ({
  userStats,
  onUpdateStats,
}) => {
  const quests = userStats.dailyQuests || [];
  const completedCount = quests.filter((q) => q.completed).length;
  const allClaimed = quests.length > 0 && quests.every((q) => q.claimed);

  const handleClaim = (quest: DailyQuest) => {
    sound.playCoin();
    sound.playFanfare();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });

    const { updatedStats, newlyUnlockedBadges } = claimDailyQuest(userStats, quest.id);
    onUpdateStats(updatedStats, newlyUnlockedBadges);
  };

  return (
    <div className="w-full bg-zinc-900/90 border border-zinc-800/80 rounded-3xl p-5 shadow-xl relative overflow-hidden backdrop-blur-md">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              Günün Taktik Görevleri
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {completedCount}/{quests.length} Tamamlandı
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400">Her gün yenilenen görevleri tamamla, XP ve Jeton topla</p>
          </div>
        </div>

        {allClaimed ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Tüm Görevler Alındı!
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
            <Gift className="w-4 h-4 animate-bounce" />
            <span>Ödül Sandığı</span>
          </div>
        )}
      </div>

      {/* Quests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {quests.map((quest) => {
          const progressPercent = Math.min(100, Math.round((quest.currentCount / quest.targetCount) * 100));

          return (
            <div
              key={quest.id}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                quest.claimed
                  ? 'bg-zinc-950/40 border-zinc-800/60 opacity-60'
                  : quest.completed
                  ? 'bg-gradient-to-b from-amber-950/40 to-zinc-900/90 border-amber-500/50 shadow-lg shadow-amber-500/10'
                  : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{quest.icon}</span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[11px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      <Coins className="w-3 h-3" />
                      +{quest.rewardCoins}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      <Zap className="w-3 h-3" />
                      +{quest.rewardXp}
                    </span>
                  </div>
                </div>

                <h4 className="text-xs font-black text-white">{quest.title}</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2">{quest.description}</p>
              </div>

              {/* Progress & Action */}
              <div className="mt-3">
                <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 mb-1">
                  <span>İlerleme</span>
                  <span>
                    {quest.currentCount} / {quest.targetCount}
                  </span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mb-2.5">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      quest.completed ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {quest.claimed ? (
                  <div className="w-full py-1.5 text-center text-[11px] font-bold text-zinc-500 bg-zinc-900 rounded-xl">
                    ✓ Ödül Alındı
                  </div>
                ) : quest.completed ? (
                  <button
                    onClick={() => handleClaim(quest)}
                    className="w-full py-1.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/25 active:scale-95 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Ödülü Topla
                  </button>
                ) : (
                  <div className="w-full py-1.5 text-center text-[11px] font-bold text-zinc-400 bg-zinc-900/60 rounded-xl border border-zinc-800/60">
                    Devam Ediyor
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
