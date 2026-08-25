import React from 'react';
import { motion } from 'motion/react';
import { UserStats } from '../types';
import { CLUBS, LEAGUES } from '../data/clubs';
import { PLAYERS } from '../data/players';
import { ClubEmblem } from './ClubEmblem';
import { DailyQuestsWidget } from './DailyQuestsWidget';
import { sound } from '../services/soundService';
import { getTodayDateStr } from '../services/storageService';
import { 
  Play, 
  Trophy, 
  Calendar, 
  GitFork, 
  Flag, 
  BookOpen, 
  Users, 
  Flame, 
  Sparkles, 
  ArrowRight,
  ShieldAlert,
  Zap,
  Timer,
  Search,
  ShoppingBag,
  Coins
} from 'lucide-react';

interface HomeDashboardProps {
  userStats: UserStats;
  onUpdateStats: (newStats: UserStats, newBadges?: string[]) => void;
  onStart321Game: () => void;
  onStartDailyChallenge: () => void;
  onStartCareerTree: () => void;
  onStartNationClub: () => void;
  onStartBlitz: () => void;
  onStartMystery: () => void;
  onOpenArchive: () => void;
  onOpenLeaderboard: () => void;
  onOpenFriends: () => void;
  onOpenProfile: () => void;
  onOpenShop: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  userStats,
  onUpdateStats,
  onStart321Game,
  onStartDailyChallenge,
  onStartCareerTree,
  onStartNationClub,
  onStartBlitz,
  onStartMystery,
  onOpenArchive,
  onOpenLeaderboard,
  onOpenFriends,
  onOpenProfile,
  onOpenShop,
}) => {
  const todayStr = getTodayDateStr();
  const isDailyDone = Boolean(userStats.dailyScores[todayStr]);
  const archiveCount = Object.keys(userStats.archive || {}).length;

  const sampleClubKeys = [
    'galatasaray',
    'fenerbahce',
    'besiktas',
    'real_madrid',
    'barcelona',
    'manchester_city',
    'arsenal',
    'liverpool',
    'inter',
    'milan',
    'bayern_munchen',
    'paris_saint_germain',
    'benfica',
    'porto'
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-7">
      {/* Daily Quests Mission Bar */}
      <DailyQuestsWidget userStats={userStats} onUpdateStats={onUpdateStats} />

      {/* Daily Streak Active Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md"
      >
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center text-2xl shrink-0">
            🔥
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-sm font-black text-amber-400">
                {userStats.streak} GÜNLÜK SERİ
              </span>
              <span className="text-[10px] font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full">
                {userStats.lastPlayedDate === todayStr ? 'Bugün Tamamlandı ✓' : 'Günün oyununu oyna!'}
              </span>
            </div>
            <p className="text-xs text-zinc-300 mt-0.5">
              Her gün en az 1 oyun tamamlayarak serini yükselt ve seri rozetlerinin kilidini aç!
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onOpenProfile();
          }}
          className="text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 px-3.5 py-2 rounded-xl transition cursor-pointer shrink-0"
        >
          Rozetlerimi Gör
        </button>
      </motion.div>

      {/* Main Hero: "3 2 1" Instant Start Button */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-emerald-500/40 p-6 md:p-10 flex flex-col items-center text-center shadow-2xl">
        {/* Glow ambient background */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 fill-emerald-400" />
          Ana Oyun Modu
        </span>

        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          3 2 1: Ortak Futbolcu Tahmini
        </h1>

        <p className="text-xs md:text-sm text-zinc-300 max-w-xl mt-2.5 mb-7 leading-relaxed">
          3-2-1 geri sayımından sonra ekrana gelen 2 rastgele dev kulüpte oynamış ortak futbolcuyu
          zamana karşı tahmin et, puanları topla ve arşive kaydet!
        </p>

        {/* Big Start Button */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            sound.playClick();
            onStart321Game();
          }}
          className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-black text-base md:text-lg px-8 py-4 rounded-2xl shadow-[0_0_35px_rgba(16,185,129,0.5)] flex items-center gap-3 transition-all cursor-pointer"
        >
          <Play className="w-5 h-5 fill-zinc-950" />
          HEMEN OYNA (3-2-1 BAŞLA)
        </motion.button>
      </div>

      {/* Featured Daily Challenge 10-Question Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-7 flex flex-col md:flex-row items-center justify-between gap-5 shadow-xl">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-3xl shrink-0 shadow-inner">
            👑
          </div>
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <h2 className="text-lg md:text-xl font-black text-white">Günün 10'lu Challenge'ı</h2>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 border border-amber-500/30 px-2 py-0.5 rounded-md">
                {todayStr}
              </span>
            </div>
            <p className="text-xs text-zinc-300 mt-1 max-w-lg">
              Tüm kullanıcılar için her gün özel olarak belirlenmiş 10 ortak futbolcu sorusu. Tamamla,
              günün liderlik tablosuna yerleş ve <strong>"Günün Fatihi"</strong> rozetini kazan!
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onStartDailyChallenge();
          }}
          className={`px-6 py-3.5 rounded-2xl font-black text-xs md:text-sm transition flex items-center gap-2 shrink-0 cursor-pointer shadow-lg ${
            isDailyDone
              ? 'bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-amber-500/30'
              : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 text-zinc-950'
          }`}
        >
          <Calendar className="w-4 h-4" />
          {isDailyDone ? 'Tekrar Çöz (Skorun: ' + userStats.dailyScores[todayStr] + ')' : 'Challenge’a Başla'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* All Game Modes Grid (4 distinct modes) */}
      <div>
        <h2 className="text-base font-black text-white uppercase tracking-wider mb-3.5 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Tüm Özel Oyun Modları
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mode 1: 60 Sn Seri Avcısı (Blitz Attack) */}
          <div className="bg-zinc-900/90 border border-amber-500/30 hover:border-amber-500/60 rounded-3xl p-5 flex flex-col justify-between transition-all group shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Timer className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Yeni Mod • Kombo
                </span>
              </div>
              <h3 className="text-base font-black text-white group-hover:text-amber-400 transition flex items-center gap-2">
                60 Sn Seri Avcısı (Blitz)
              </h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                60 saniyede durmaksızın gelen ortak takımları bil! Doğru cevaplar +2 sn süre ve x5'e kadar çarpan puanı kazandırır.
              </p>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onStartBlitz();
              }}
              className="mt-4 bg-zinc-800 group-hover:bg-amber-500 text-zinc-200 group-hover:text-zinc-950 font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-between cursor-pointer"
            >
              <span>Seri Avcısını Başlat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mode 2: Kim Bu Futbolcu? (Mystery Player) */}
          <div className="bg-zinc-900/90 border border-purple-500/30 hover:border-purple-500/60 rounded-3xl p-5 flex flex-col justify-between transition-all group shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Search className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Yeni Mod • Dedektif
                </span>
              </div>
              <h3 className="text-base font-black text-white group-hover:text-purple-400 transition">
                Kim Bu Futbolcu? (Dedektif)
              </h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                6 hakta gizli futbolcuyu bul! Ülke, mevki, forma numarası ve ortak kulüp eşleşmelerinden yola çıkarak doğru tahmin yap.
              </p>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onStartMystery();
              }}
              className="mt-4 bg-zinc-800 group-hover:bg-purple-600 text-zinc-200 group-hover:text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-between cursor-pointer"
            >
              <span>Gizli Oyuncuyu Bul</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mode 3: Kariyer Ağacı */}
          <div className="bg-zinc-900/90 border border-zinc-800 hover:border-teal-500/50 rounded-3xl p-5 flex flex-col justify-between transition-all group shadow-md">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-3">
                <GitFork className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white group-hover:text-teal-400 transition">
                Kariyer Ağacı
              </h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Zlatan, Ronaldo, Anelka veya Morata gibi en az 3-4-5 büyük kulüpte oynamış yıldızın
                forma giydiği takımları keşfet ve kariyer haritasını tamamla!
              </p>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onStartCareerTree();
              }}
              className="mt-4 bg-zinc-800 group-hover:bg-teal-600 text-zinc-200 group-hover:text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-between cursor-pointer"
            >
              <span>Kariyer Ağacını Oyna</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mode 4: Milliyet & Kulüp */}
          <div className="bg-zinc-900/90 border border-zinc-800 hover:border-sky-500/50 rounded-3xl p-5 flex flex-col justify-between transition-all group shadow-md">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-3">
                <Flag className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white group-hover:text-sky-400 transition">
                Ülke &amp; Kulüp Tahmini
              </h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Rastgele bir milliyet (örn. Brezilya 🇧🇷) ve bir kulüp (örn. Real Madrid) verilir. Bu
                ülkeden o kulüpte oynamış yıldız futbolcuları tahmin et!
              </p>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onStartNationClub();
              }}
              className="mt-4 bg-zinc-800 group-hover:bg-sky-600 text-zinc-200 group-hover:text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-between cursor-pointer"
            >
              <span>Ülke &amp; Kulübü Oyna</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Joker Market Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-900 border border-amber-500/40 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              Taktik Dükkanı &amp; Joker Marketi
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                {userStats.coins || 0} Jetonun Var
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Oyunlardan ve görevlerden kazandığın jetonlarla Harf İpucu, +10s Süre ve Seri Kalkanı satın al!
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onOpenShop();
          }}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs shadow-md transition cursor-pointer shrink-0"
        >
          Dükkana Git
        </button>
      </div>

      {/* Archive & Friends Quick Launch Banner Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Futbolcu Arşivi Card */}
        <div
          onClick={() => {
            sound.playClick();
            onOpenArchive();
          }}
          className="bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 hover:border-emerald-500/50 p-5 rounded-3xl flex items-center justify-between cursor-pointer transition-all shadow-md group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white group-hover:text-emerald-400 transition">
                Futbolcu Arşivi
              </h3>
              <p className="text-xs text-zinc-400">
                {archiveCount} / {PLAYERS.length} futbolcu keşfedildi • 1000+ Oyuncu Veritabanı
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 transition" />
        </div>

        {/* Arkadaşlar & Birebir Analiz Card */}
        <div
          onClick={() => {
            sound.playClick();
            onOpenFriends();
          }}
          className="bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 hover:border-indigo-500/50 p-5 rounded-3xl flex items-center justify-between cursor-pointer transition-all shadow-md group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white group-hover:text-indigo-400 transition">
                Arkadaşlar &amp; Analiz
              </h3>
              <p className="text-xs text-zinc-400">
                Karşılaştırmalı analiz ve arkadaş sıralaması
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400 transition" />
        </div>
      </div>

      {/* Featured Stylized Licence-Safe Club Showcase */}
      <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-3xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Oyunda Yer Alan Büyük Kulüpler &amp; Özel Logolar
          </h3>
          <span className="text-[11px] text-zinc-500">
            Türkiye • İngiltere • İspanya • İtalya • Almanya • Fransa • Portekiz
          </span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto py-2 scrollbar-none">
          {sampleClubKeys.map((cId) => {
            const club = CLUBS[cId];
            if (!club) return null;
            return (
              <div
                key={cId}
                title={`${club.name} (${club.country})`}
                className="flex flex-col items-center bg-zinc-900/90 border border-zinc-800 p-2.5 rounded-2xl min-w-[72px] shrink-0 hover:scale-105 transition-transform"
              >
                <ClubEmblem club={club} size="md" />
                <span className="text-[10px] font-bold text-zinc-300 mt-1 truncate max-w-[65px]">
                  {club.shortName}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
