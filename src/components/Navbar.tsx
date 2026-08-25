import React from 'react';
import { UserStats } from '../types';
import { calculateLevel } from '../services/storageService';
import { sound } from '../services/soundService';
import { CreatorSignature } from './CreatorSignature';
import { 
  Flame, 
  Trophy, 
  Users, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  User,
  Zap,
  Coins,
  ShoppingBag
} from 'lucide-react';

interface NavbarProps {
  userStats: UserStats;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenArchive: () => void;
  onOpenLeaderboard: () => void;
  onOpenFriends: () => void;
  onOpenProfile: () => void;
  onOpenShop: () => void;
  onGoHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userStats,
  isMuted,
  onToggleMute,
  onOpenArchive,
  onOpenLeaderboard,
  onOpenFriends,
  onOpenProfile,
  onOpenShop,
  onGoHome,
}) => {
  const { level } = calculateLevel(userStats.xp);
  const archiveCount = Object.keys(userStats.archive || {}).length;

  return (
    <header className="w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 sticky top-0 z-40 px-3 sm:px-6 py-2.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2.5 group cursor-pointer text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-amber-300 p-0.5 shadow-lg group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center font-black text-xs text-white">
              321
            </div>
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-white flex items-center gap-1.5 leading-none">
              3 2 1
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                Futbol
              </span>
            </span>
            <span className="text-[10px] text-zinc-400 font-medium hidden sm:block">
              Ortak Futbolcu &amp; Bilgi Oyunu
            </span>
          </div>
        </button>

        {/* Action Buttons & Status Indicators */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Coins / Joker Market Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenShop();
            }}
            className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 text-amber-300 px-2.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer shadow-sm"
            title="Taktik Dükkanı & Jokerler"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{userStats.coins ?? 0}</span>
          </button>

          {/* Streak Badge */}
          <div
            title="Günlük Oyun Serisi (Her gün 1 oyun bitirerek artır)"
            className="hidden sm:flex items-center gap-1 bg-amber-950/50 border border-amber-500/40 text-amber-300 px-2.5 py-1.5 rounded-xl text-xs font-bold shadow-sm"
          >
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
            <span>{userStats.streak} Gün</span>
          </div>

          {/* Futbolcu Arşivi Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenArchive();
            }}
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/50 text-zinc-200 hover:text-white px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Futbolcu Arşivi"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Arşiv</span>
            <span className="text-[10px] text-emerald-400 font-extrabold bg-emerald-950 px-1.5 py-0.2 rounded-md">
              {archiveCount}
            </span>
          </button>

          {/* Liderlik Tablosu Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenLeaderboard();
            }}
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/50 text-zinc-200 hover:text-white p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            title="Liderlik Tablosu"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Liderlik</span>
          </button>

          {/* Arkadaşlar Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenFriends();
            }}
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-indigo-500/50 text-zinc-200 hover:text-white p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            title="Arkadaşlar & Analiz"
          >
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Arkadaşlar</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleMute();
            }}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
            title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Profile Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenProfile();
            }}
            className="flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition cursor-pointer"
          >
            <span className="text-base">{userStats.avatar || '⚡'}</span>
            <span className="hidden sm:inline">Lv.{level}</span>
          </button>

          {/* Creator Signature (HAG) */}
          <CreatorSignature variant="navbar" />
        </div>
      </div>
    </header>
  );
};
