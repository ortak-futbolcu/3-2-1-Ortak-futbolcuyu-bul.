import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserStats, Friend } from './types';
import { loadUserStats, saveUserStats, loadFriends, saveFriends } from './services/storageService';
import { sound } from './services/soundService';
import { BADGES } from './data/badges';

// Components
import { Navbar } from './components/Navbar';
import { HomeDashboard } from './components/HomeDashboard';
import { Game321 } from './components/Game321';
import { DailyChallenge } from './components/DailyChallenge';
import { CareerTreeGame } from './components/CareerTreeGame';
import { NationClubGame } from './components/NationClubGame';
import { BlitzGame } from './components/BlitzGame';
import { MysteryPlayerGame } from './components/MysteryPlayerGame';
import { PlayerArchiveModal } from './components/PlayerArchiveModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { FriendsAndAnalysisModal } from './components/FriendsAndAnalysisModal';
import { ProfileModal } from './components/ProfileModal';
import { JokerShopModal } from './components/JokerShopModal';
import { CreatorSignature } from './components/CreatorSignature';
import { Award, X } from 'lucide-react';

export default function App() {
  const [userStats, setUserStats] = useState<UserStats>(() => loadUserStats());
  const [friends, setFriends] = useState<Friend[]>(() => loadFriends());
  const [isMuted, setIsMuted] = useState(false);

  // Active view router
  const [currentView, setCurrentView] = useState<
    'home' | 'game_321' | 'daily_challenge' | 'career_tree' | 'nation_club' | 'blitz' | 'mystery'
  >('home');

  // Active modals
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [analysisFriend, setAnalysisFriend] = useState<Friend | null>(null);

  // Badge notification toast
  const [newBadgeNotification, setNewBadgeNotification] = useState<{
    id: string;
    title: string;
    description: string;
    icon: string;
  } | null>(null);

  const handleUpdateStats = (newStats: UserStats, newBadgeIds: string[] = []) => {
    setUserStats(newStats);
    saveUserStats(newStats);

    if (newBadgeIds && newBadgeIds.length > 0) {
      const bId = newBadgeIds[0];
      const badgeObj = BADGES.find((b) => b.id === bId);
      if (badgeObj) {
        sound.playFanfare();
        setNewBadgeNotification({
          id: badgeObj.id,
          title: badgeObj.title,
          description: badgeObj.description,
          icon: badgeObj.icon,
        });

        setTimeout(() => {
          setNewBadgeNotification(null);
        }, 5000);
      }
    }
  };

  const handleUpdateFriends = (newFriends: Friend[]) => {
    setFriends(newFriends);
    saveFriends(newFriends);
  };

  const toggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-emerald-500 selection:text-zinc-950 font-sans">
      {/* Top Navbar */}
      <Navbar
        userStats={userStats}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onOpenArchive={() => setIsArchiveOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenFriends={() => {
          setAnalysisFriend(null);
          setIsFriendsOpen(true);
        }}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenShop={() => setIsShopOpen(true)}
        onGoHome={() => {
          sound.playClick();
          setCurrentView('home');
        }}
      />

      {/* Main Content Arena */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4">
        {currentView === 'home' && (
          <HomeDashboard
            userStats={userStats}
            onUpdateStats={handleUpdateStats}
            onStart321Game={() => setCurrentView('game_321')}
            onStartDailyChallenge={() => setCurrentView('daily_challenge')}
            onStartCareerTree={() => setCurrentView('career_tree')}
            onStartNationClub={() => setCurrentView('nation_club')}
            onStartBlitz={() => setCurrentView('blitz')}
            onStartMystery={() => setCurrentView('mystery')}
            onOpenArchive={() => setIsArchiveOpen(true)}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            onOpenFriends={() => {
              setAnalysisFriend(null);
              setIsFriendsOpen(true);
            }}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenShop={() => setIsShopOpen(true)}
          />
        )}

        {currentView === 'game_321' && (
          <Game321
            userStats={userStats}
            onUpdateStats={handleUpdateStats}
            onBackToHome={() => setCurrentView('home')}
            onOpenArchive={() => setIsArchiveOpen(true)}
            onOpenShop={() => setIsShopOpen(true)}
          />
        )}

        {currentView === 'daily_challenge' && (
          <DailyChallenge
            userStats={userStats}
            onUpdateStats={handleUpdateStats}
            onBackToHome={() => setCurrentView('home')}
            onOpenProfile={() => {
              setCurrentView('home');
              setIsProfileOpen(true);
            }}
          />
        )}

        {currentView === 'career_tree' && (
          <CareerTreeGame
            userStats={userStats}
            onUpdateStats={handleUpdateStats}
            onBackToHome={() => setCurrentView('home')}
          />
        )}

        {currentView === 'nation_club' && (
          <NationClubGame
            userStats={userStats}
            onUpdateStats={handleUpdateStats}
            onBackToHome={() => setCurrentView('home')}
          />
        )}

        {currentView === 'blitz' && (
          <BlitzGame
            userStats={userStats}
            onUpdateStats={handleUpdateStats}
            onBackToHome={() => setCurrentView('home')}
            onOpenShop={() => setIsShopOpen(true)}
          />
        )}

        {currentView === 'mystery' && (
          <MysteryPlayerGame
            userStats={userStats}
            onUpdateStats={handleUpdateStats}
            onBackToHome={() => setCurrentView('home')}
          />
        )}
      </main>

      {/* Aesthetic Creator Signature Footer */}
      <CreatorSignature variant="footer" />

      {/* Modals */}
      <AnimatePresence>
        {isArchiveOpen && (
          <PlayerArchiveModal
            userStats={userStats}
            onClose={() => setIsArchiveOpen(false)}
          />
        )}

        {isLeaderboardOpen && (
          <LeaderboardModal
            userStats={userStats}
            friends={friends}
            onClose={() => setIsLeaderboardOpen(false)}
            onOpenAnalysisWithFriend={(fr) => {
              setIsLeaderboardOpen(false);
              setAnalysisFriend(fr);
              setIsFriendsOpen(true);
            }}
          />
        )}

        {isFriendsOpen && (
          <FriendsAndAnalysisModal
            userStats={userStats}
            friends={friends}
            onUpdateFriends={handleUpdateFriends}
            initialSelectedFriend={analysisFriend}
            onClose={() => {
              setIsFriendsOpen(false);
              setAnalysisFriend(null);
            }}
          />
        )}

        {isProfileOpen && (
          <ProfileModal
            userStats={userStats}
            onUpdateStats={handleUpdateStats}
            onClose={() => setIsProfileOpen(false)}
          />
        )}

        {isShopOpen && (
          <JokerShopModal
            userStats={userStats}
            onUpdateStats={handleUpdateStats}
            onClose={() => setIsShopOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Unlocked Badge Toast Notification */}
      <AnimatePresence>
        {newBadgeNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm bg-gradient-to-r from-amber-950/90 to-zinc-900 border border-amber-500/60 rounded-2xl p-4 shadow-2xl flex items-center gap-3.5 backdrop-blur-md"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-2xl shrink-0">
              {newBadgeNotification.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 text-[10px] uppercase font-black tracking-wider text-amber-400">
                <Award className="w-3 h-3" />
                Yeni Rozet Kazanıldı!
              </div>
              <p className="text-sm font-black text-white truncate">
                {newBadgeNotification.title}
              </p>
              <p className="text-[11px] text-zinc-300 line-clamp-1">
                {newBadgeNotification.description}
              </p>
            </div>
            <button
              onClick={() => setNewBadgeNotification(null)}
              className="text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
