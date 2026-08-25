import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserStats, Badge } from '../types';
import { BADGES } from '../data/badges';
import { calculateLevel, saveUserStats } from '../services/storageService';
import { sound } from '../services/soundService';
import { CreatorSignature } from './CreatorSignature';
import { 
  X, 
  User, 
  Award, 
  Flame, 
  Zap, 
  Trophy, 
  CheckCircle2, 
  Lock, 
  Sparkles,
  Edit2
} from 'lucide-react';

interface ProfileModalProps {
  userStats: UserStats;
  onUpdateStats: (newStats: UserStats, newBadges: string[]) => void;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  userStats,
  onUpdateStats,
  onClose,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userStats.username);
  const [selectedAvatar, setSelectedAvatar] = useState(userStats.avatar || '⚡');

  const { level, currentXp, nextLevelXp, progressPercent } = calculateLevel(userStats.xp);
  const totalGuesses = userStats.correctGuesses + userStats.wrongGuesses;
  const accuracy = totalGuesses > 0 ? Math.round((userStats.correctGuesses / totalGuesses) * 100) : 100;
  const unlockedBadgesCount = userStats.unlockedBadges.length;

  const availableAvatars = ['⚡', '⚽', '👑', '🦁', '🦅', '🎯', '🔥', '🏆', '💎', '🚀', '🧙‍♂️', '🌟'];

  const handleSaveProfile = () => {
    sound.playClick();
    const updated = {
      ...userStats,
      username: nameInput.trim() || userStats.username,
      avatar: selectedAvatar,
    };
    saveUserStats(updated);
    onUpdateStats(updated, []);
    setIsEditingName(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl h-[88vh] bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">Oyuncu Profili &amp; Rozetler</h2>
              <p className="text-xs text-zinc-400">Kazanılan unvanlar ve başarım vitrini</p>
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

        {/* Profile Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* User Hero Card */}
          <div className="bg-zinc-950/70 border border-zinc-800/90 rounded-3xl p-5 flex flex-col sm:flex-row items-center gap-4">
            {/* Avatar picker */}
            <div className="relative group">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-4xl shadow-inner">
                {selectedAvatar}
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              {isEditingName ? (
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    maxLength={20}
                    className="bg-zinc-900 border border-zinc-700 text-white rounded-xl px-3 py-1 text-sm font-bold focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={handleSaveProfile}
                    className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold px-3 py-1 rounded-xl text-xs cursor-pointer"
                  >
                    Kaydet
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-lg font-black text-white">{userStats.username}</h3>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <p className="text-xs text-zinc-500 font-mono">{userStats.tag}</p>

              {/* Level & XP Progress Bar */}
              <div className="mt-2.5 max-w-sm">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-emerald-400">Seviye {level}</span>
                  <span className="text-zinc-400">
                    {currentXp} / {nextLevelXp} XP
                  </span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Streak & Score Counter */}
            <div className="flex sm:flex-col gap-2 shrink-0">
              <div className="bg-amber-950/40 border border-amber-500/30 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block">Aktif Seri</span>
                  <span className="text-xs font-black text-white">{userStats.streak} Gün</span>
                </div>
              </div>

              <div className="bg-emerald-950/40 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
                <Trophy className="w-4 h-4 text-emerald-400" />
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block">Toplam Puan</span>
                  <span className="text-xs font-black text-white">{userStats.totalScore} P</span>
                </div>
              </div>
            </div>
          </div>

          {/* Avatar Selector Tray */}
          <div className="bg-zinc-950/40 border border-zinc-800/80 p-3 rounded-2xl">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">
              Avatarını Seç:
            </span>
            <div className="flex flex-wrap gap-2">
              {availableAvatars.map((av) => (
                <button
                  key={av}
                  onClick={() => {
                    setSelectedAvatar(av);
                    const updated = { ...userStats, avatar: av };
                    saveUserStats(updated);
                    onUpdateStats(updated, []);
                  }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all cursor-pointer ${
                    selectedAvatar === av
                      ? 'bg-emerald-500/30 border-2 border-emerald-500 scale-110'
                      : 'bg-zinc-800 hover:bg-zinc-700 border border-zinc-700'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Statistics Cards */}
          <div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5">
              İstatistik Özeti
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="p-3 bg-zinc-800/60 border border-zinc-700/60 rounded-2xl">
                <span className="text-[10px] font-bold text-zinc-400 uppercase block">Toplam Oyun</span>
                <span className="text-base font-black text-white mt-0.5 block">{userStats.totalGamesPlayed}</span>
              </div>
              <div className="p-3 bg-zinc-800/60 border border-zinc-700/60 rounded-2xl">
                <span className="text-[10px] font-bold text-zinc-400 uppercase block">Doğru Tahmin</span>
                <span className="text-base font-black text-emerald-400 mt-0.5 block">{userStats.correctGuesses}</span>
              </div>
              <div className="p-3 bg-zinc-800/60 border border-zinc-700/60 rounded-2xl">
                <span className="text-[10px] font-bold text-zinc-400 uppercase block">İsabet Oranı</span>
                <span className="text-base font-black text-teal-400 mt-0.5 block">%{accuracy}</span>
              </div>
              <div className="p-3 bg-zinc-800/60 border border-zinc-700/60 rounded-2xl">
                <span className="text-[10px] font-bold text-zinc-400 uppercase block">En Hızlı Cevap</span>
                <span className="text-base font-black text-amber-400 mt-0.5 block">
                  {userStats.bestFastGuessSeconds < 90 ? `${userStats.bestFastGuessSeconds}s` : '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Badges Showcase Grid */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                Kazanılan Rozetler ({unlockedBadgesCount} / {BADGES.length})
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BADGES.map((badge) => {
                const isUnlocked = userStats.unlockedBadges.includes(badge.id);

                return (
                  <div
                    key={badge.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                      isUnlocked
                        ? 'bg-gradient-to-r from-zinc-800 to-zinc-800/80 border-amber-500/40 shadow-md ring-1 ring-amber-500/20'
                        : 'bg-zinc-950/40 border-zinc-800/60 opacity-50'
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                        isUnlocked
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-zinc-900 text-zinc-600 border border-zinc-800'
                      }`}
                    >
                      {isUnlocked ? badge.icon : <Lock className="w-4 h-4 text-zinc-600" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold truncate ${
                            isUnlocked ? 'text-white' : 'text-zinc-500'
                          }`}
                        >
                          {badge.title}
                        </span>
                        {isUnlocked && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                        {badge.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Creator Signature Badge */}
          <div className="pt-2 pb-1 flex justify-center">
            <CreatorSignature variant="badge" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
