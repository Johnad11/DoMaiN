import React, { useState, useEffect } from 'react';
import { ArrowRight, HelpCircle, Check, X, Monitor } from 'lucide-react';
import HexAvatar from '../components/HexAvatar';
import HowToPlayModal from '../components/HowToPlayModal';
import DomainLogo from '../components/DomainLogo';
import { sound } from '../audio/soundEngine';

const ALL_COLORS = [
  '#00E5FF', // Plasma Cyan
  '#FF6B35', // Magma Orange
  '#39FF88', // Bio Green
  '#FF2E63', // Blood Red
  '#D946EF', // Neon Violet
  '#FACC15', // Solar Yellow
  '#38BDF8', // Sky Pulse
  '#FB7185', // Coral Blade
  '#A855F7', // Deep Purple
  '#2DD4BF', // Emerald Teal
  '#F97316', // Sunset Orange
  '#4ADE80'  // Lime Green
];

export default function JoinPlayer({
  onJoin,
  onSwitchToHost,
  initialPin = '',
  isConnecting = false,
  errorMessage = '',
  takenColors = [],
  takenNames = []
}) {
  const [pin, setPin] = useState(initialPin);
  const [nickname, setNickname] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [localError, setLocalError] = useState('');

  // Auto-show help modal for first-time players if not dismissed
  useEffect(() => {
    try {
      const hideHelp = localStorage.getItem('domain_hide_help');
      if (hideHelp !== 'true') {
        setShowHelp(true);
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  useEffect(() => {
    if (initialPin) setPin(initialPin);
  }, [initialPin]);

  // Pick first untaken color as default
  useEffect(() => {
    const takenUpper = (takenColors || []).map(c => c.toUpperCase());
    if (!selectedColor || takenUpper.includes(selectedColor.toUpperCase())) {
      const available = ALL_COLORS.find(c => !takenUpper.includes(c.toUpperCase()));
      if (available) setSelectedColor(available);
    }
  }, [takenColors, selectedColor]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');

    const cleanPin = pin.replace(/\D/g, '').trim();
    if (cleanPin.length !== 6) {
      setLocalError('Please enter the 6-digit game PIN.');
      return;
    }

    const cleanName = nickname.trim();
    if (!cleanName) {
      setLocalError('Please enter your name.');
      return;
    }

    // Check taken names locally
    if (takenNames && takenNames.includes(cleanName.toLowerCase())) {
      setLocalError(`The name "${cleanName}" is already taken in this game. Please choose another!`);
      return;
    }

    // Check taken color
    const takenUpper = (takenColors || []).map(c => c.toUpperCase());
    if (selectedColor && takenUpper.includes(selectedColor.toUpperCase())) {
      setLocalError('That color is already taken by another player. Please pick an open color!');
      return;
    }

    sound.playClaimTile();
    onJoin({
      pin: cleanPin,
      nickname: cleanName,
      color: selectedColor
    });
  };

  const takenUpper = (takenColors || []).map(c => c.toUpperCase());

  return (
    <div className="min-h-screen bg-obsidian bg-cyber-grid text-bone flex flex-col justify-center items-center p-5 select-none">
      {/* Help Modal */}
      <HowToPlayModal isOpen={showHelp} onClose={() => setShowHelp(false)} />

      <div className="max-w-md w-full bg-slate border border-cyan-plasma/30 rounded-3xl p-6 sm:p-8 shadow-cyan-glow space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <DomainLogo size="md" showTagline={true} />

          <div className="flex items-center gap-2">
            {onSwitchToHost && (
              <button
                type="button"
                onClick={onSwitchToHost}
                className="px-3 py-2 rounded-xl bg-obsidian border border-steel/60 hover:border-orange-magma text-orange-magma transition-all flex items-center gap-1.5 text-xs font-bold font-heading"
                title="Switch to Host Board"
              >
                <Monitor className="w-4 h-4" />
                <span>Host Game</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowHelp(true)}
              className="p-2 rounded-xl bg-obsidian border border-steel/60 hover:border-cyan-plasma text-cyan-plasma transition-all"
              title="How to play"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* PIN Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ash mb-1.5">
              Game PIN
            </label>
            <input
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, ''));
                setLocalError('');
              }}
              placeholder="6-Digit PIN"
              className="w-full text-center px-4 py-3.5 bg-obsidian border-2 border-steel/60 focus:border-cyan-plasma rounded-2xl font-mono text-3xl tracking-widest text-cyan-plasma outline-none transition-colors"
            />
          </div>

          {/* Nickname Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ash mb-1.5">
              Your In-Game Name
            </label>
            <input
              type="text"
              maxLength={14}
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setLocalError('');
              }}
              placeholder="Enter your name"
              className="w-full text-center px-4 py-3 bg-obsidian border border-steel/60 focus:border-cyan-plasma rounded-2xl font-heading text-lg text-bone outline-none transition-colors"
            />
          </div>

          {/* Color & Avatar Picker */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-ash">
                Choose Your Color
              </label>
              <span className="text-[11px] text-ash">Colors are unique per game</span>
            </div>

            <div className="grid grid-cols-6 gap-2.5 justify-items-center">
              {ALL_COLORS.map((color) => {
                const isTaken = takenUpper.includes(color.toUpperCase());
                const isSelected = selectedColor.toUpperCase() === color.toUpperCase();

                return (
                  <button
                    type="button"
                    key={color}
                    disabled={isTaken}
                    onClick={() => {
                      if (!isTaken) {
                        setSelectedColor(color);
                        setLocalError('');
                      }
                    }}
                    className={`relative w-9 h-9 rounded-xl transition-all flex items-center justify-center ${
                      isSelected
                        ? 'scale-110 ring-2 ring-bone ring-offset-2 ring-offset-obsidian shadow-lg'
                        : isTaken
                        ? 'opacity-25 cursor-not-allowed'
                        : 'opacity-80 hover:opacity-100 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    title={isTaken ? 'Taken by another player' : 'Available'}
                  >
                    {isSelected && <Check className="w-4 h-4 text-obsidian stroke-[3]" />}
                    {isTaken && <X className="w-4 h-4 text-white stroke-[3]" />}
                  </button>
                );
              })}
            </div>

            {/* Avatar Preview */}
            <div className="mt-4 flex flex-col items-center justify-center">
              <HexAvatar
                name={nickname || 'P'}
                color={selectedColor || ALL_COLORS[0]}
                size="lg"
                showGlow={true}
              />
            </div>
          </div>

          {(localError || errorMessage) && (
            <div className="p-3 bg-red-blood/15 border border-red-blood text-red-blood text-xs font-medium text-center rounded-2xl">
              {localError || errorMessage}
            </div>
          )}

          {/* Join Button */}
          <button
            type="submit"
            disabled={isConnecting || pin.length !== 6 || !nickname.trim()}
            className="w-full py-4 bg-cyan-plasma hover:bg-cyan-plasma/90 text-obsidian font-heading font-extrabold text-base rounded-2xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-cyan-glow btn-tactile border-b-4 border-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>{isConnecting ? 'Connecting...' : 'Join Game'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="text-center text-[11px] text-ash space-y-1.5 pt-1">
          <div>Answer questions fast, claim your territory, and win!</div>
          <div>
            <a
              href="https://github.com/Johnad11/DoMaiN/releases/download/latest-apk/app-debug.apk"
              className="inline-flex items-center gap-1 text-cyan-plasma hover:underline font-semibold"
            >
              <span>📱 Download Android App (APK)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
