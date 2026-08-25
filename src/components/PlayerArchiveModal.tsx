import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Player, UserStats } from '../types';
import { PLAYERS } from '../data/players';
import { CLUBS } from '../data/clubs';
import { ClubEmblem } from './ClubEmblem';
import { sound } from '../services/soundService';
import { 
  X, 
  Search, 
  Lock, 
  Sparkles, 
  Flame, 
  ArrowUpDown, 
  BookOpen, 
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface PlayerArchiveModalProps {
  userStats: UserStats;
  onClose: () => void;
}

export const PlayerArchiveModal: React.FC<PlayerArchiveModalProps> = ({
  userStats,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [sortBy, setSortBy] = useState<'most_guessed' | 'recent' | 'name'>('most_guessed');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const archive = userStats.archive || {};
  const unlockedCount = Object.keys(archive).length;
  const totalPlayersCount = PLAYERS.length;

  const processedPlayers = useMemo(() => {
    return PLAYERS.filter((player) => {
      const entry = archive[player.id];
      const isUnlocked = Boolean(entry);

      // Status filter
      if (statusFilter === 'unlocked' && !isUnlocked) return false;
      if (statusFilter === 'locked' && isUnlocked) return false;

      // Position filter
      if (positionFilter !== 'all' && player.position !== positionFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = player.name.toLowerCase().includes(query);
        const matchesNation = player.nationality.toLowerCase().includes(query);
        if (!matchesName && !matchesNation) return false;
      }

      return true;
    }).sort((a, b) => {
      const entryA = archive[a.id];
      const entryB = archive[b.id];
      const countA = entryA ? entryA.guessCount : 0;
      const countB = entryB ? entryB.guessCount : 0;

      if (sortBy === 'most_guessed') {
        if (countA !== countB) return countB - countA;
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'recent') {
        const dateA = entryA ? entryA.lastGuessedAt : '';
        const dateB = entryB ? entryB.lastGuessedAt : '';
        return dateB.localeCompare(dateA);
      } else {
        return a.name.localeCompare(b.name);
      }
    });
  }, [archive, statusFilter, positionFilter, searchQuery, sortBy]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-4xl h-[90vh] bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                Futbolcu Arşivi
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  {unlockedCount} / {totalPlayersCount} Açık
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Doğru bildiğin futbolcuların kilidi açılır ve burada arşivlenir.
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

        {/* Filter & Search Bar */}
        <div className="p-3 sm:p-4 border-b border-zinc-800/80 bg-zinc-950/50 flex flex-col md:flex-row gap-3 shrink-0">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="İsim veya ülke ara..."
              className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-emerald-500"
            />
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          </div>

          {/* Status & Position Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'unlocked' | 'locked')}
              className="bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="unlocked">Sadece Açıklar (Kilidi Çözülen)</option>
              <option value="locked">Sadece Kilitliler</option>
            </select>

            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">Tüm Mevkiler</option>
              <option value="Forvet">Forvet</option>
              <option value="Orta Saha">Orta Saha</option>
              <option value="Defans">Defans</option>
              <option value="Kaleci">Kaleci</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'most_guessed' | 'recent' | 'name')}
              className="bg-zinc-900 border border-zinc-800 text-xs font-bold text-amber-400 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="most_guessed">🔥 En Çok Tahmin Edilen</option>
              <option value="recent">⏱️ En Son Bilinenler</option>
              <option value="name">🔤 İsim (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Players Card Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {processedPlayers.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-zinc-500 text-center">
              <Search className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-sm font-semibold">Aradığın kritere uygun futbolcu bulunamadı.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {processedPlayers.map((player) => {
                const entry = archive[player.id];
                const isUnlocked = Boolean(entry);
                const guessCount = entry ? entry.guessCount : 0;

                return (
                  <motion.div
                    key={player.id}
                    onClick={() => {
                      if (isUnlocked) {
                        sound.playClick();
                        setSelectedPlayer(player);
                      }
                    }}
                    className={`relative p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isUnlocked
                        ? 'bg-zinc-800/80 hover:bg-zinc-800 border-zinc-700/80 hover:border-emerald-500/60 shadow-md cursor-pointer hover:scale-[1.02]'
                        : 'bg-zinc-950/60 border-zinc-800/50 opacity-60'
                    }`}
                  >
                    {/* Top Row: Country / Position / Guess Count */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
                        <span>{player.countryCode}</span>
                        <span>{player.nationality}</span>
                      </span>

                      {isUnlocked ? (
                        <div className="flex items-center gap-1 text-[11px] font-black text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-md">
                          <Flame className="w-3 h-3 fill-amber-400" />
                          <span>{guessCount} kez</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded">
                          <Lock className="w-3 h-3" />
                          <span>Kilitli</span>
                        </div>
                      )}
                    </div>

                    {/* Middle: Player Name & Position */}
                    <div className="my-1.5">
                      <h3 className={`text-base font-black truncate ${isUnlocked ? 'text-white' : 'text-zinc-500'}`}>
                        {isUnlocked ? player.name : '??? ??????'}
                      </h3>
                      <span className="text-[11px] font-semibold text-emerald-400/90">
                        {player.position}
                      </span>
                    </div>

                    {/* Bottom: Clubs Played (Micro badges) */}
                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                      <div className="flex items-center -space-x-1.5 overflow-hidden">
                        {player.clubs.map((cId) => {
                          const club = CLUBS[cId];
                          if (!club) return null;
                          return isUnlocked ? (
                            <div key={cId} title={club.name} className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 p-0.5 shrink-0">
                              <ClubEmblem club={club} size="sm" />
                            </div>
                          ) : (
                            <div key={cId} className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[9px] text-zinc-600 font-bold shrink-0">
                              ?
                            </div>
                          );
                        })}
                      </div>

                      <span className="text-[10px] font-medium text-zinc-500">
                        {player.clubs.length} Kulüp
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Player Detail Modal */}
        <AnimatePresence>
          {selectedPlayer && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 relative shadow-2xl"
              >
                <button
                  onClick={() => setSelectedPlayer(null)}
                  className="absolute right-4 top-4 w-8 h-8 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl font-black">
                    ⚽
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">{selectedPlayer.name}</h3>
                    <p className="text-xs text-zinc-400">
                      {selectedPlayer.nationality} ({selectedPlayer.countryCode}) • {selectedPlayer.position}
                    </p>
                  </div>
                </div>

                <div className="bg-zinc-950/60 rounded-2xl p-3.5 border border-zinc-800 mb-4 text-xs text-zinc-300 italic">
                  "{selectedPlayer.hint}"
                </div>

                {/* Archive Stats */}
                <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                  <div className="bg-zinc-800/80 p-3 rounded-xl">
                    <span className="text-zinc-400 text-[10px] uppercase font-bold block">Toplam Bilinme</span>
                    <span className="text-base font-black text-amber-400">
                      {archive[selectedPlayer.id]?.guessCount || 1} Kez
                    </span>
                  </div>
                  <div className="bg-zinc-800/80 p-3 rounded-xl">
                    <span className="text-zinc-400 text-[10px] uppercase font-bold block">İlk Keşif</span>
                    <span className="text-xs font-bold text-zinc-200">
                      {archive[selectedPlayer.id]?.firstUnlockedAt || 'Bugün'}
                    </span>
                  </div>
                </div>

                {/* All Clubs in Career */}
                <div>
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                    Formasını Giydiği Kulüpler:
                  </h4>
                  <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                    {selectedPlayer.clubs.map((cId) => {
                      const club = CLUBS[cId];
                      if (!club) return null;
                      return (
                        <div key={cId} className="flex items-center gap-2 p-2 rounded-xl bg-zinc-800/60 border border-zinc-700/60">
                          <ClubEmblem club={club} size="sm" />
                          <span className="text-[11px] font-bold text-zinc-200 truncate">
                            {club.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
