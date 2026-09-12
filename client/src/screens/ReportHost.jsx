import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Swords, Flame } from 'lucide-react';
import HexAvatar from '../components/HexAvatar';
import HexGridCanvas from '../components/HexGridCanvas';
import { sound } from '../audio/soundEngine';

export default function ReportHost({
  winner,
  leaderboard = [],
  map,
  territoryStats,
  onPlayAgain
}) {
  useEffect(() => {
    sound.playSurge();
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
  }, []);

  const totalTiles = territoryStats?.totalTiles || 37;

  return (
    <div className="min-h-screen bg-obsidian bg-cyber-grid text-bone flex flex-col justify-between p-6 sm:p-10 select-none pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-steel/40 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-plasma/20 border border-cyan-plasma rounded-2xl flex items-center justify-center text-cyan-plasma shadow-cyan-glow">
            <Trophy className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-xl tracking-wider text-bone">
              FINAL GAME RESULTS
            </h1>
            <p className="text-xs text-ash">Congratulations to all players!</p>
          </div>
        </div>

        <button
          onClick={onPlayAgain}
          className="px-6 py-2.5 bg-cyan-plasma hover:bg-cyan-plasma/90 text-obsidian font-heading font-extrabold text-xs rounded-2xl uppercase tracking-wider flex items-center gap-2 shadow-cyan-glow btn-tactile border-b-4 border-cyan-400"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Play Again</span>
        </button>
      </div>

      {/* Center Podium & Territory Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto py-6 items-center">
        {/* Left (6 cols): Champion & Top 3 Podium */}
        <div className="lg:col-span-6 space-y-6">
          {winner && (
            <div className="p-6 bg-slate/70 border-2 border-yellow-400/80 rounded-3xl shadow-yellow-500/20 shadow-2xl text-center space-y-4">
              <div className="relative inline-block">
                <HexAvatar
                  name={winner.nickname}
                  color={winner.color}
                  size="xl"
                  showGlow={true}
                />
                <div className="absolute -top-3 -right-2 text-2xl">👑</div>
              </div>

              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-yellow-400 font-bold">
                  Game Champion
                </span>
                <h2 className="font-heading font-extrabold text-3xl text-bone">
                  {winner.nickname}
                </h2>
                <div className="text-xl font-mono font-bold text-cyan-plasma mt-1">
                  {winner.score.toLocaleString()} Points
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-steel/40 text-center">
                <div className="p-2.5 bg-obsidian/60 rounded-2xl">
                  <div className="text-[10px] font-mono text-ash">ACCURACY</div>
                  <div className="text-xs font-mono font-bold text-green-bio">
                    {winner.totalAnswered > 0 ? Math.round((winner.totalCorrect / winner.totalAnswered) * 100) : 0}%
                  </div>
                </div>
                <div className="p-2.5 bg-obsidian/60 rounded-2xl">
                  <div className="text-[10px] font-mono text-ash">BEST STREAK</div>
                  <div className="text-xs font-mono font-bold text-orange-magma flex items-center justify-center gap-1">
                    <Flame className="w-3 h-3 fill-orange-magma" /> {winner.streak}
                  </div>
                </div>
                <div className="p-2.5 bg-obsidian/60 rounded-2xl">
                  <div className="text-[10px] font-mono text-ash">TILES CLAIMED</div>
                  <div className="text-xs font-mono font-bold text-cyan-plasma">
                    {territoryStats?.counts[winner.id] || 1}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Full Rank Table */}
          <div className="bg-slate/50 border border-steel/40 rounded-3xl p-4 space-y-2">
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-ash mb-2">
              Leaderboard
            </h3>
            {leaderboard.slice(0, 5).map((player, idx) => (
              <div
                key={player.id || idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-obsidian/60 border border-steel/30"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-xs w-4 text-ash">#{idx + 1}</span>
                  <HexAvatar name={player.nickname} color={player.color} size="sm" />
                  <span className="font-heading font-semibold text-xs text-bone">{player.nickname}</span>
                </div>
                <span className="font-mono font-bold text-xs text-cyan-plasma">
                  {player.score.toLocaleString()} PTS
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right (6 cols): Final Hex Conquest Map */}
        <div className="lg:col-span-6 bg-slate/50 border border-steel/40 rounded-3xl p-6 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-cyan-plasma" />
              <h3 className="font-heading font-bold text-base text-bone uppercase tracking-wider">
                Final Map Conquest
              </h3>
            </div>
            <span className="text-xs font-mono text-ash">{totalTiles} Sectors</span>
          </div>

          {map && (
            <div className="p-3 bg-obsidian/80 border border-steel/50 rounded-2xl">
              <HexGridCanvas map={map} interactive={false} height={340} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
