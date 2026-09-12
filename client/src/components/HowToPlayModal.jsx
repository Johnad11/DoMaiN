import React, { useState } from 'react';
import { HelpCircle, X, Zap, Swords, Flame, ShieldAlert, Check } from 'lucide-react';
import { sound } from '../audio/soundEngine';

export default function HowToPlayModal({ isOpen, onClose }) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem('domain_hide_help', 'true');
      } catch (e) {
        // Ignore localStorage restrictions
      }
    }
    sound.playClaimTile();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-obsidian/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-md w-full bg-slate border-2 border-cyan-plasma/40 rounded-3xl p-6 sm:p-7 shadow-cyan-glow space-y-6 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-steel/40 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-plasma/15 border border-cyan-plasma flex items-center justify-center text-cyan-plasma">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-lg text-bone">
                How to Play
              </h2>
              <p className="text-xs text-ash">
                Quick guide to winning your game
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-ash hover:text-bone hover:bg-steel/40 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Game Rules in Simple Human Language */}
        <div className="space-y-4 text-xs font-body text-bone">
          {/* Rule 1 */}
          <div className="flex items-start gap-3 p-3 bg-obsidian/70 rounded-2xl border border-steel/40">
            <div className="w-8 h-8 rounded-xl bg-cyan-plasma/15 text-cyan-plasma flex items-center justify-center font-bold shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="font-heading font-bold text-sm text-bone">1. Speed and Streaks Count</div>
              <p className="text-ash mt-0.5">
                Answer quickly to earn extra speed points. Keep getting questions right in a row to boost your streak multiplier!
              </p>
            </div>
          </div>

          {/* Rule 2 */}
          <div className="flex items-start gap-3 p-3 bg-obsidian/70 rounded-2xl border border-steel/40">
            <div className="w-8 h-8 rounded-xl bg-green-bio/15 text-green-bio flex items-center justify-center font-bold shrink-0">
              <Swords className="w-4 h-4" />
            </div>
            <div>
              <div className="font-heading font-bold text-sm text-bone">2. Conquer the Hex Map</div>
              <p className="text-ash mt-0.5">
                Every right answer gives you an action point. Tap any empty tile next to your land to claim it, or attack a neighbor's tile!
              </p>
            </div>
          </div>

          {/* Rule 3 */}
          <div className="flex items-start gap-3 p-3 bg-obsidian/70 rounded-2xl border border-steel/40">
            <div className="w-8 h-8 rounded-xl bg-orange-magma/15 text-orange-magma flex items-center justify-center font-bold shrink-0">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="font-heading font-bold text-sm text-bone">3. Winning Battles</div>
              <p className="text-ash mt-0.5">
                When you attack someone else's tile, you win if your current answer streak is equal to or higher than theirs.
              </p>
            </div>
          </div>

          {/* Rule 4 */}
          <div className="flex items-start gap-3 p-3 bg-obsidian/70 rounded-2xl border border-steel/40">
            <div className="w-8 h-8 rounded-xl bg-red-blood/15 text-red-blood flex items-center justify-center font-bold shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="font-heading font-bold text-sm text-bone">4. Fair Play Matters</div>
              <p className="text-ash mt-0.5">
                Wrong answers cost you one tile. Also, please keep this screen open—switching apps or tabs during a question triggers a fair-play warning.
              </p>
            </div>
          </div>
        </div>

        {/* Don't show again checkbox */}
        <div className="flex items-center gap-2 pt-1">
          <label className="flex items-center gap-2 text-xs text-ash cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded bg-obsidian border-steel text-cyan-plasma focus:ring-0 cursor-pointer"
            />
            <span>Don't show this guide again</span>
          </label>
        </div>

        {/* CTA */}
        <button
          onClick={handleClose}
          className="w-full py-3.5 bg-cyan-plasma hover:bg-cyan-plasma/90 text-obsidian font-heading font-extrabold text-sm rounded-2xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-cyan-glow btn-tactile border-b-4 border-cyan-400"
        >
          <span>Got It, Let's Play!</span>
        </button>
      </div>
    </div>
  );
}
