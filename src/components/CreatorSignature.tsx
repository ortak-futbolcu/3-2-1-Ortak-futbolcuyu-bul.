import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Code2, Heart, X, Award, ShieldCheck } from 'lucide-react';
import { sound } from '../services/soundService';

interface CreatorSignatureProps {
  variant?: 'navbar' | 'footer' | 'badge';
}

export const CreatorSignature: React.FC<CreatorSignatureProps> = ({ variant = 'footer' }) => {
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    sound.playClick();
    setShowModal(true);
  };

  if (variant === 'navbar') {
    return (
      <>
        <button
          onClick={handleClick}
          title="Tasarım & Geliştirme: H.A.G"
          className="group relative flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 hover:from-amber-500/20 hover:to-emerald-500/20 border border-amber-500/30 hover:border-amber-500/50 transition-all cursor-pointer shadow-sm"
        >
          {/* Stylized HAG Monogram */}
          <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-amber-500 to-emerald-400 p-[1px] shadow-sm flex items-center justify-center">
            <div className="w-full h-full bg-zinc-950 rounded-[5px] flex items-center justify-center">
              <span className="text-[9px] font-black tracking-tighter text-amber-300 group-hover:text-white transition">
                HAG
              </span>
            </div>
          </div>
          <span className="text-[11px] font-black text-zinc-300 group-hover:text-amber-300 transition hidden sm:inline">
            H.A.G
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        </button>

        {/* Info Modal */}
        <AnimatePresence>
          {showModal && <CreatorModal onClose={() => setShowModal(false)} />}
        </AnimatePresence>
      </>
    );
  }

  if (variant === 'badge') {
    return (
      <>
        <div
          onClick={handleClick}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-850 border border-amber-500/30 hover:border-amber-500/60 cursor-pointer transition shadow-md group"
        >
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 to-emerald-400 p-[1px] flex items-center justify-center shadow-sm">
            <div className="w-full h-full bg-zinc-950 rounded-[7px] flex items-center justify-center">
              <span className="text-[10px] font-black tracking-tighter text-amber-300">
                HAG
              </span>
            </div>
          </div>
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase text-zinc-500 block leading-none">
              Geliştirici İmzası
            </span>
            <span className="text-xs font-black text-zinc-200 group-hover:text-amber-400 transition">
              H.A.G
            </span>
          </div>
        </div>

        <AnimatePresence>
          {showModal && <CreatorModal onClose={() => setShowModal(false)} />}
        </AnimatePresence>
      </>
    );
  }

  // Default: Footer style
  return (
    <>
      <footer className="w-full py-6 mt-8 border-t border-zinc-850/80 bg-zinc-950/40 text-center">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* App title note */}
          <div className="text-xs text-zinc-500 font-medium">
            3 2 1 Futbol • Ortak Kulüp &amp; Taktik Futbol Bilgi Oyunu
          </div>

          {/* HAG Signature Button */}
          <button
            onClick={handleClick}
            className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 hover:border-amber-500/40 transition-all cursor-pointer"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-emerald-400 p-[1px] flex items-center justify-center">
              <div className="w-full h-full bg-zinc-950 rounded-full flex items-center justify-center">
                <span className="text-[8px] font-black tracking-tighter text-amber-300">
                  HAG
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-zinc-400 group-hover:text-zinc-200 transition">
              Designed by <span className="text-amber-300 font-black">H.A.G</span>
            </span>
            <Sparkles className="w-3 h-3 text-amber-400 opacity-60 group-hover:opacity-100 transition" />
          </button>
        </div>
      </footer>

      <AnimatePresence>
        {showModal && <CreatorModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </>
  );
};

// Aesthetic Creator Detail Card
const CreatorModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-sm bg-zinc-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-center"
      >
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Stylized Monogram Insignia */}
        <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-tr from-amber-500 via-emerald-400 to-teal-300 p-0.5 shadow-xl shadow-amber-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-zinc-950 rounded-[22px] flex flex-col items-center justify-center">
            <span className="text-2xl font-black tracking-wider bg-gradient-to-r from-amber-300 to-emerald-300 bg-clip-text text-transparent">
              HAG
            </span>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-zinc-500">
              ORIGINAL
            </span>
          </div>
        </div>

        {/* Author info */}
        <h3 className="text-lg font-black text-white flex items-center justify-center gap-1.5">
          H.A.G
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
        </h3>
        <p className="text-xs text-amber-400 font-bold mt-0.5">
          Konsept, Tasarım &amp; Geliştirme
        </p>

        {/* Message */}
        <div className="mt-4 p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 text-xs text-zinc-300 text-left space-y-2 leading-relaxed">
          <p>
            ⚽ <strong className="text-white">3 2 1 Futbol</strong> oyunu, futbolun zengin tarihini, transfer hikayelerini ve taktik bilgisini eğlenceli bir deneyime dönüştürmek amacıyla geliştirildi.
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400">
            <span>İmza Sürümü</span>
            <span className="font-black text-emerald-400">HAG Edition • v2.0</span>
          </div>
        </div>

        {/* Close CTA */}
        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition cursor-pointer"
        >
          Anladım &amp; Oyuna Dön
        </button>
      </motion.div>
    </div>
  );
};
