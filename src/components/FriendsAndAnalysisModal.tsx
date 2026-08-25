import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserStats, Friend } from '../types';
import { sound } from '../services/soundService';
import { 
  X, 
  Users, 
  UserPlus, 
  BarChart3, 
  Flame, 
  Zap, 
  Target, 
  ShieldCheck, 
  Swords, 
  TrendingUp,
  Sparkles
} from 'lucide-react';

interface FriendsAndAnalysisModalProps {
  userStats: UserStats;
  friends: Friend[];
  onUpdateFriends: (newFriends: Friend[]) => void;
  onClose: () => void;
  initialSelectedFriend?: Friend | null;
}

export const FriendsAndAnalysisModal: React.FC<FriendsAndAnalysisModalProps> = ({
  userStats,
  friends,
  onUpdateFriends,
  onClose,
  initialSelectedFriend,
}) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'analysis'>(
    initialSelectedFriend ? 'analysis' : 'friends'
  );
  const [selectedFriend, setSelectedFriend] = useState<Friend>(
    initialSelectedFriend || friends[0] || null
  );
  const [newFriendTag, setNewFriendTag] = useState('');
  const [addMessage, setAddMessage] = useState<string | null>(null);

  // User stats calculated
  const totalGuesses = userStats.correctGuesses + userStats.wrongGuesses;
  const userAccuracy = totalGuesses > 0 ? Math.round((userStats.correctGuesses / totalGuesses) * 100) : 85;
  const userSpeed = userStats.bestFastGuessSeconds < 90 ? userStats.bestFastGuessSeconds : 3.8;
  const userCommonGuessed = Object.keys(userStats.archive || {}).length;

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendTag.trim()) return;

    sound.playClick();
    const tag = newFriendTag.trim();
    const avatars = ['👨‍💼', '👩‍🔬', '🧔', '🧑‍🚀', '⚽', '🎯', '🦁', '🦅'];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

    const cleanName = tag.split('#')[0] || 'Arkadaş';
    const newFriend: Friend = {
      id: 'friend_' + Date.now(),
      name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
      avatar: randomAvatar,
      tag: tag.includes('#') ? tag : `${tag}#${Math.floor(1000 + Math.random() * 9000)}`,
      level: Math.floor(5 + Math.random() * 12),
      totalScore: Math.floor(8000 + Math.random() * 15000),
      streak: Math.floor(1 + Math.random() * 6),
      accuracy: Math.floor(75 + Math.random() * 20),
      avgSpeedSeconds: Number((3.0 + Math.random() * 4.0).toFixed(1)),
      dailyChallengeScore: Math.floor(6000 + Math.random() * 3500),
      commonPlayersGuessed: Math.floor(15 + Math.random() * 40),
      leagueStrengths: {
        superLig: Math.floor(70 + Math.random() * 28),
        premierLeague: Math.floor(70 + Math.random() * 28),
        laLiga: Math.floor(70 + Math.random() * 28),
        serieA: Math.floor(65 + Math.random() * 30),
        bundesliga: Math.floor(60 + Math.random() * 35),
      },
    };

    const updated = [newFriend, ...friends];
    onUpdateFriends(updated);
    setSelectedFriend(newFriend);
    setNewFriendTag('');
    setAddMessage(`"${newFriend.name}" arkadaş listene eklendi! 🎉`);
    setTimeout(() => setAddMessage(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-3xl h-[88vh] bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">Arkadaşlar &amp; Analiz</h2>
              <p className="text-xs text-zinc-400">
                Arkadaşlarınla rekabet et ve istatistiklerini karşılaştır
              </p>
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

        {/* Tab Controls */}
        <div className="p-3 border-b border-zinc-800/80 bg-zinc-950/50 flex gap-2 shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('friends');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'friends'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white bg-zinc-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Arkadaş Listesi ({friends.length})
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('analysis');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'analysis'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white bg-zinc-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Karşılaştırmalı Analiz
          </button>
        </div>

        {/* Tab 1: Friends List */}
        {activeTab === 'friends' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4">
            {/* Add Friend Form */}
            <div className="bg-zinc-950/60 border border-zinc-800 p-4 rounded-2xl">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-indigo-400" /> Yeni Arkadaş Ekle
              </h3>
              <form onSubmit={handleAddFriend} className="flex gap-2">
                <input
                  type="text"
                  value={newFriendTag}
                  onChange={(e) => setNewFriendTag(e.target.value)}
                  placeholder="Arkadaşının adı veya etiketi (örn. Ahmet#1905)..."
                  className="flex-1 bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!newFriendTag.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer shrink-0"
                >
                  Ekle
                </button>
              </form>
              {addMessage && (
                <p className="text-xs font-semibold text-emerald-400 mt-2">{addMessage}</p>
              )}
            </div>

            {/* Friends Cards */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Kayıtlı Arkadaşlar
              </h3>

              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="p-3.5 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-between hover:bg-zinc-800 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-zinc-700 flex items-center justify-center text-xl shrink-0">
                      {friend.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{friend.name}</span>
                        <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-950/80 px-1.5 py-0.5 rounded">
                          Lv.{friend.level}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                        <span className="text-zinc-500">{friend.tag}</span>
                        <span>•</span>
                        <span className="text-amber-400 font-bold">{friend.totalScore} Puan</span>
                        <span>•</span>
                        <span className="text-emerald-400">{friend.accuracy}% İsabet</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setSelectedFriend(friend);
                      setActiveTab('analysis');
                    }}
                    className="bg-zinc-700/60 hover:bg-indigo-600 text-zinc-200 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <BarChart3 className="w-3.5 h-3.5" /> Analiz Et
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Comparative Analysis (Head-to-Head) */}
        {activeTab === 'analysis' && selectedFriend && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Friend Selector Bar */}
            <div className="flex items-center justify-between bg-zinc-950/60 border border-zinc-800 p-3 rounded-2xl">
              <span className="text-xs font-bold text-zinc-400">Karşılaştırılan Rakip:</span>
              <select
                value={selectedFriend.id}
                onChange={(e) => {
                  const f = friends.find((fr) => fr.id === e.target.value);
                  if (f) setSelectedFriend(f);
                }}
                className="bg-zinc-900 border border-zinc-700 text-xs font-bold text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {friends.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.avatar} {f.name} ({f.tag})
                  </option>
                ))}
              </select>
            </div>

            {/* Head-to-Head Banner */}
            <div className="bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-indigo-950/40 border border-zinc-800 rounded-3xl p-5 flex items-center justify-between">
              {/* User Side */}
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-2xl mb-1.5 shadow-md">
                  {userStats.avatar || '⚡'}
                </div>
                <span className="text-sm font-black text-emerald-400">Sen</span>
                <span className="text-[11px] text-zinc-400 font-semibold">{userStats.username}</span>
                <span className="text-xs font-black text-white mt-1">{userStats.totalScore} P</span>
              </div>

              {/* Center VS Swords */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
                  <Swords className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                  Birebir
                </span>
              </div>

              {/* Friend Side */}
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center text-2xl mb-1.5 shadow-md">
                  {selectedFriend.avatar}
                </div>
                <span className="text-sm font-black text-indigo-400">{selectedFriend.name}</span>
                <span className="text-[11px] text-zinc-400 font-semibold">Lv.{selectedFriend.level}</span>
                <span className="text-xs font-black text-white mt-1">{selectedFriend.totalScore} P</span>
              </div>
            </div>

            {/* Metric Comparison Rows */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Karşılaştırmalı İstatistikler
              </h3>

              {/* 1. Score Comparison */}
              <div className="bg-zinc-800/70 border border-zinc-700/60 p-3.5 rounded-2xl">
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-emerald-400">{userStats.totalScore} Puan</span>
                  <span className="text-zinc-400 uppercase">Toplam Skor</span>
                  <span className="text-indigo-400">{selectedFriend.totalScore} Puan</span>
                </div>
                <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full"
                    style={{
                      width: `${
                        (userStats.totalScore / (userStats.totalScore + selectedFriend.totalScore || 1)) * 100
                      }%`,
                    }}
                  />
                  <div
                    className="bg-indigo-500 h-full"
                    style={{
                      width: `${
                        (selectedFriend.totalScore / (userStats.totalScore + selectedFriend.totalScore || 1)) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* 2. Speed (Cevap Hızı) */}
              <div className="bg-zinc-800/70 border border-zinc-700/60 p-3.5 rounded-2xl">
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-emerald-400">{userSpeed} saniye</span>
                  <span className="text-zinc-400 uppercase">Cevap Hızı (Düşük = İyi)</span>
                  <span className="text-indigo-400">{selectedFriend.avgSpeedSeconds} saniye</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>{userSpeed < selectedFriend.avgSpeedSeconds ? '⚡ Sen daha hızlısın!' : 'Rakip daha hızlı'}</span>
                  <span>{selectedFriend.avgSpeedSeconds < userSpeed ? '⚡ Rakip önde' : ''}</span>
                </div>
              </div>

              {/* 3. Accuracy (%) */}
              <div className="bg-zinc-800/70 border border-zinc-700/60 p-3.5 rounded-2xl">
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-emerald-400">%{userAccuracy}</span>
                  <span className="text-zinc-400 uppercase">Doğruluk Oranı</span>
                  <span className="text-indigo-400">%{selectedFriend.accuracy}</span>
                </div>
                <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden flex gap-1">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${userAccuracy}%` }} />
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${selectedFriend.accuracy}%` }} />
                </div>
              </div>

              {/* 4. Discovered Common Players Count */}
              <div className="bg-zinc-800/70 border border-zinc-700/60 p-3.5 rounded-2xl">
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-emerald-400">{userCommonGuessed} Futbolcu</span>
                  <span className="text-zinc-400 uppercase">Arşivdeki Ortak Futbolcular</span>
                  <span className="text-indigo-400">{selectedFriend.commonPlayersGuessed} Futbolcu</span>
                </div>
              </div>
            </div>

            {/* League Knowledge Comparison Bars */}
            <div className="bg-zinc-950/60 border border-zinc-800 p-4 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Lig Bilgi Gücü Kıyaslaması
              </h4>

              <div className="space-y-2 text-xs">
                {[
                  { name: 'Süper Lig (TR)', user: 92, friend: selectedFriend.leagueStrengths.superLig },
                  { name: 'Premier League (ENG)', user: 88, friend: selectedFriend.leagueStrengths.premierLeague },
                  { name: 'La Liga (ESP)', user: 90, friend: selectedFriend.leagueStrengths.laLiga },
                  { name: 'Serie A (ITA)', user: 82, friend: selectedFriend.leagueStrengths.serieA },
                  { name: 'Bundesliga (GER)', user: 78, friend: selectedFriend.leagueStrengths.bundesliga },
                ].map((item) => (
                  <div key={item.name} className="flex flex-col gap-1">
                    <div className="flex justify-between font-semibold text-[11px]">
                      <span className="text-zinc-300">{item.name}</span>
                      <div className="flex gap-2">
                        <span className="text-emerald-400">Sen: %{item.user}</span>
                        <span className="text-indigo-400">{selectedFriend.name}: %{item.friend}</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden flex gap-1">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${item.user}%` }} />
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${item.friend}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
