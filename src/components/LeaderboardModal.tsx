import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserStats, Friend, LeaderboardEntry } from '../types';
import { GLOBAL_LEADERBOARD } from '../data/initialFriends';
import { sound } from '../services/soundService';
import { X, Trophy, Zap, Users, Flame, Calendar, Award } from 'lucide-react';

interface LeaderboardModalProps {
  userStats: UserStats;
  friends: Friend[];
  onClose: () => void;
  onOpenAnalysisWithFriend?: (friend: Friend) => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  userStats,
  friends,
  onClose,
  onOpenAnalysisWithFriend,
}) => {
  const [activeTab, setActiveTab] = useState<'speed' | 'overall' | 'daily' | 'friends'>('overall');

  // Build current user entry
  const currentUserEntry: LeaderboardEntry = {
    id: 'current_user',
    rank: 1,
    name: userStats.username + ' (Sen)',
    avatar: userStats.avatar || '⚡',
    score: userStats.totalScore,
    fastestTime: userStats.bestFastGuessSeconds < 90 ? userStats.bestFastGuessSeconds : 3.2,
    streak: userStats.streak,
    badge: '⭐',
    isCurrentUser: true,
  };

  // Process Leaderboards
  let displayList: LeaderboardEntry[] = [];

  if (activeTab === 'overall') {
    const list = [...GLOBAL_LEADERBOARD, currentUserEntry].sort((a, b) => b.score - a.score);
    displayList = list.map((item, idx) => ({ ...item, rank: idx + 1 }));
  } else if (activeTab === 'speed') {
    const list = [...GLOBAL_LEADERBOARD, currentUserEntry].sort(
      (a, b) => (a.fastestTime || 99) - (b.fastestTime || 99)
    );
    displayList = list.map((item, idx) => ({ ...item, rank: idx + 1 }));
  } else if (activeTab === 'daily') {
    const list = [
      ...friends.map((f) => ({
        id: f.id,
        rank: 0,
        name: f.name,
        avatar: f.avatar,
        score: f.dailyChallengeScore,
        streak: f.streak,
      })),
      {
        id: 'current_user',
        rank: 0,
        name: userStats.username + ' (Sen)',
        avatar: userStats.avatar || '⚡',
        score: userStats.dailyScores[userStats.lastDailyDate] || 7800,
        streak: userStats.dailyChallengeStreak,
        isCurrentUser: true,
      },
    ].sort((a, b) => b.score - a.score);
    displayList = list.map((item, idx) => ({ ...item, rank: idx + 1 }));
  } else if (activeTab === 'friends') {
    const list = [
      ...friends.map((f) => ({
        id: f.id,
        rank: 0,
        name: f.name,
        avatar: f.avatar,
        score: f.totalScore,
        fastestTime: f.avgSpeedSeconds,
        streak: f.streak,
      })),
      currentUserEntry,
    ].sort((a, b) => b.score - a.score);
    displayList = list.map((item, idx) => ({ ...item, rank: idx + 1 }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl h-[85vh] bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">Liderlik Tablosu</h2>
              <p className="text-xs text-zinc-400">En hızlı ve en yüksek puanlı futbol gurmeleri</p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="p-3 border-b border-zinc-800/80 bg-zinc-950/50 flex gap-1.5 shrink-0 overflow-x-auto">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('overall');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'overall'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white bg-zinc-900'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" /> Genel Puan
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('speed');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'speed'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white bg-zinc-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> Hızlı Cevap Kralları
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('daily');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'daily'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white bg-zinc-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Günlük Challenge
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('friends');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'friends'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white bg-zinc-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Arkadaş Sıralaması
          </button>
        </div>

        {/* Leaderboard List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {displayList.map((entry) => {
            const isTop3 = entry.rank <= 3;
            const rankColors = {
              1: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
              2: 'bg-slate-300/20 text-slate-300 border-slate-400/40',
              3: 'bg-amber-700/20 text-amber-600 border-amber-700/40',
            }[entry.rank] || 'bg-zinc-800 text-zinc-400 border-zinc-700';

            return (
              <div
                key={entry.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                  entry.isCurrentUser
                    ? 'bg-emerald-950/50 border-emerald-500/50 ring-1 ring-emerald-500/30'
                    : 'bg-zinc-800/60 border-zinc-700/60 hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank Badge */}
                  <div
                    className={`w-7 h-7 rounded-xl border flex items-center justify-center font-black text-xs shrink-0 ${rankColors}`}
                  >
                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
                  </div>

                  {/* Avatar & Name */}
                  <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-sm shrink-0">
                    {entry.avatar}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs sm:text-sm font-bold ${entry.isCurrentUser ? 'text-emerald-300' : 'text-white'}`}>
                        {entry.name}
                      </span>
                      {entry.streak > 0 && (
                        <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5 bg-amber-950/60 px-1.5 py-0.2 rounded">
                          <Flame className="w-2.5 h-2.5 fill-amber-400" /> {entry.streak}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-400">
                      {activeTab === 'speed' ? `En Hızlı: ${entry.fastestTime}s` : `${entry.score} Puan`}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  {activeTab === 'speed' ? (
                    <span className="text-sm font-black text-emerald-400 font-mono">
                      {entry.fastestTime}s
                    </span>
                  ) : (
                    <span className="text-sm font-black text-amber-400">
                      {entry.score.toLocaleString()} P
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
