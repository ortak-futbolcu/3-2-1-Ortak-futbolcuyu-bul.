import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserStats, JokersInventory } from '../types';
import { JOKER_PRICES, buyJoker } from '../services/storageService';
import { sound } from '../services/soundService';
import { Coins, X, Lightbulb, Clock, ShieldCheck, Filter, ShoppingBag, Sparkles } from 'lucide-react';

interface JokerShopModalProps {
  userStats: UserStats;
  onUpdateStats: (newStats: UserStats, newBadges?: string[]) => void;
  onClose: () => void;
}

interface JokerItemConfig {
  key: keyof JokersInventory;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  badgeBg: string;
}

const JOKER_ITEMS: JokerItemConfig[] = [
  {
    key: 'hintLetters',
    title: 'Harf İpucu',
    description: 'Aranan futbolcunun isminin ilk 2 harfini ve ipucunu açar.',
    icon: <Lightbulb className="w-6 h-6" />,
    color: 'text-amber-400',
    badgeBg: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
  },
  {
    key: 'extraTime',
    title: '+10 Saniye Süre',
    description: 'Zamanı anında 10 saniye uzatarak düşünme payı kazandırır.',
    icon: <Clock className="w-6 h-6" />,
    color: 'text-sky-400',
    badgeBg: 'bg-sky-500/20 border-sky-500/40 text-sky-300',
  },
  {
    key: 'streakShield',
    title: 'Seri Koruma Kalkanı',
    description: 'Yanlış cevap versen bile galibiyet serinin bozulmasını engeller.',
    icon: <ShieldCheck className="w-6 h-6" />,
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
  },
  {
    key: 'fiftyFifty',
    title: '50/50 Filtresi',
    description: 'Aday listesindeki seçenekleri eleyerek doğru cevaba yaklaştırır.',
    icon: <Filter className="w-6 h-6" />,
    color: 'text-purple-400',
    badgeBg: 'bg-purple-500/20 border-purple-500/40 text-purple-300',
  },
];

export const JokerShopModal: React.FC<JokerShopModalProps> = ({
  userStats,
  onUpdateStats,
  onClose,
}) => {
  const handleBuy = (key: keyof JokersInventory) => {
    const price = JOKER_PRICES[key];
    if (userStats.coins < price) {
      sound.playWrong();
      return;
    }

    const { success, updatedStats } = buyJoker(userStats, key);
    if (success) {
      sound.playCoin();
      sound.playPowerUp();
      onUpdateStats(updatedStats);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                Taktik Dükkanı
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Joker & Güçler
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Oyunlarda kritik anlarda avantaj sağlayan özel güçlendiriciler
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Coins indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-black text-sm">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{userStats.coins ?? 0}</span>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Shop Items List */}
        <div className="p-5 space-y-3.5 max-h-[65vh] overflow-y-auto">
          {JOKER_ITEMS.map((item) => {
            const currentOwned = userStats.jokers?.[item.key] || 0;
            const price = JOKER_PRICES[item.key];
            const canAfford = (userStats.coins ?? 0) >= price;

            return (
              <div
                key={item.key}
                className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${item.badgeBg}`}>
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-white">{item.title}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300">
                        Sahip: {currentOwned}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{item.description}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleBuy(item.key)}
                  disabled={!canAfford}
                  className={`shrink-0 px-3.5 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer transition shadow-lg ${
                    canAfford
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 active:scale-95 shadow-amber-500/20'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-60'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>{price}</span>
                  <span className="hidden sm:inline">Al</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/80 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1.5 text-amber-400 font-medium">
            <Sparkles className="w-4 h-4" />
            <span>Her doğru tahminde ve görev tamamlamada jeton kazanırsın!</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
