import React from 'react';
import HexAvatar from './HexAvatar';
import { Flame, ShieldAlert, Award } from 'lucide-react';

export default function LeaderBoard({ players = [], compact = false, highlightPlayerId = null }) {
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className={`w-full bg-slate border border-steel/50 rounded-xl p-4 flex flex-col ${compact ? 'max-h-72' : 'max-h-[500px]'}`}>
      <div className="flex items-center justify-between pb-3 border-b border-steel/40 mb-3">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-cyan-plasma" />
          <h3 className="font-heading font-bold text-bone tracking-wide text-sm uppercase">Live Standings</h3>
        </div>
        <span className="text-xs font-mono text-ash">{sorted.length} Competitors</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {sorted.map((player, idx) => {
          const rank = idx + 1;
          const isHighlight = player.id === highlightPlayerId;

          return (
            <div
              key={player.id || idx}
              className={`flex items-center justify-between p-2.5 rounded-lg border transition-all duration-200 ${
                isHighlight
                  ? 'bg-cyan-plasma/10 border-cyan-plasma shadow-cyan-glow'
                  : 'bg-obsidian/60 border-steel/30 hover:border-steel/80'
              }`}
            >
              {/* Left: Rank + Avatar + Name */}
              <div className="flex items-center gap-3 min-w-0">
                <span className={`font-mono font-extrabold text-sm w-5 text-center ${
                  rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-slate-300' : rank === 3 ? 'text-amber-600' : 'text-ash'
                }`}>
                  {rank}
                </span>

                <HexAvatar
                  name={player.nickname}
                  color={player.color}
                  size="sm"
                  showGlow={rank === 1}
                />

                <div className="flex flex-col min-w-0">
                  <span className="font-heading font-semibold text-bone text-sm truncate max-w-[120px] sm:max-w-[160px]">
                    {player.nickname} {isHighlight && '(You)'}
                  </span>
                  {player.cheatFlags > 0 && (
                    <span className="flex items-center gap-1 text-[10px] text-red-blood font-mono">
                      <ShieldAlert className="w-3 h-3" /> Flagged ({player.cheatFlags})
                    </span>
                  )}
                </div>
              </div>

              {/* Right: Streak + Score */}
              <div className="flex items-center gap-3">
                {player.streak >= 2 && (
                  <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-orange-magma/15 border border-orange-magma/40 rounded text-orange-magma text-xs font-mono font-bold">
                    <Flame className="w-3.5 h-3.5 fill-orange-magma text-orange-magma" />
                    <span>{player.streak}</span>
                  </div>
                )}

                <div className="text-right">
                  <span className="font-mono font-extrabold text-bone text-sm tracking-tight">
                    {player.score.toLocaleString()}
                  </span>
                  <div className="text-[10px] font-mono text-ash">PTS</div>
                </div>
              </div>
            </div>
          );
        })}

        {sorted.length === 0 && (
          <div className="text-center py-6 text-ash font-mono text-xs">
            Waiting for competitors...
          </div>
        )}
      </div>
    </div>
  );
}
