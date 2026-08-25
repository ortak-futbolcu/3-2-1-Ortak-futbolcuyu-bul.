import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../services/soundService';

interface CountdownOverlayProps {
  onComplete: () => void;
  title?: string;
}

export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({
  onComplete,
  title = 'HAZIR OL!',
}) => {
  const [count, setCount] = useState<number | string>(3);

  useEffect(() => {
    sound.playCountdownTick(0.9);

    const timer1 = setTimeout(() => {
      setCount(2);
      sound.playCountdownTick(1.0);
    }, 850);

    const timer2 = setTimeout(() => {
      setCount(1);
      sound.playCountdownTick(1.15);
    }, 1700);

    const timer3 = setTimeout(() => {
      setCount('BAŞLA!');
      sound.playStartWhistle();
    }, 2550);

    const timer4 = setTimeout(() => {
      onComplete();
    }, 3200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-md">
      <div className="text-center px-4">
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-emerald-400 font-bold uppercase tracking-widest text-sm md:text-base mb-4"
        >
          {title}
        </motion.p>

        <div className="relative h-36 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={String(count)}
              initial={{ scale: 0.2, opacity: 0, rotate: -15 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 1.8, opacity: 0, filter: 'blur(8px)' }}
              transition={{ type: 'spring', damping: 12, stiffness: 200 }}
              className="text-7xl md:text-9xl font-black tracking-tight"
            >
              {typeof count === 'number' ? (
                <span className="text-white drop-shadow-[0_0_35px_rgba(16,185,129,0.7)]">
                  {count}
                </span>
              ) : (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 drop-shadow-[0_0_40px_rgba(16,185,129,0.9)]">
                  {count}
                </span>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 flex items-center justify-center gap-2 text-zinc-400 text-xs md:text-sm font-medium"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Rastgele iki dev kulüp eşleştiriliyor...
        </motion.div>
      </div>
    </div>
  );
};
