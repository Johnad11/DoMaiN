import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Swords, Flame, RotateCcw, Map as MapIcon, Users, Check, Crown, Target } from 'lucide-react';
import HexAvatar from '../components/HexAvatar';
import HexGridCanvas from '../components/HexGridCanvas';
import { sound } from '../audio/soundEngine';

export default function ReportPlayer({
  player,
  winner,
  leaderboard = [],
  map,
  territoryStats,
  onJoinAnother
}) {
  const [activeTab, setActiveTab] = useState('map'); // 'map' | 'leaderboard'

  const myIndex = leaderboard.findIndex((p) => p.id === player?.id);
  const myRank = myIndex !== -1 ? myIndex + 1 : null;
  const isMeWinner = myRank === 1 || (winner && winner.id === player?.id);
  const myPlayer = myIndex !== -1 ? leaderboard[myIndex] : player;

  useEffect(() => {
    sound.playSurge();
    confetti({
      particleCount: isMeWinner ? 160 : 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, [isMeWinner]);

  const totalTiles = territoryStats?.totalTiles || (map?.tiles ? Object.keys(map.tiles).length : 37);
  const myTiles = territoryStats?.counts?.[player?.id] || 0;

  return (
    <div className="min-h-screen bg-obsidian bg-cyber-grid text-bone flex flex-col justify-between p-4 sm:p-8 select-none max-w-2xl mx-auto space-y-5 pb-10">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-steel/40 pb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-md ${
            isMeWinner
              ? 'bg-yellow-500/20 border-yellow-400 text-yellow-400 shadow-yellow-500/30'
              : 'bg-cyan-plasma/20 border-cyan-plasma text-cyan-plasma shadow-cyan-glow'
          }`}>
            {isMeWinner ? <Crown className="w-5 h-5 text-yellow-400" /> : <Trophy className="w-5 h-5 text-cyan-plasma" />}
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-lg text-bone uppercase tracking-wider">
              Game Results
            </h1>
            <p className="text-xs text-ash">Domain Quiz Battle Finished</p>
          </div>
        </div>

        <button
          onClick={onJoinAnother}
          className="px-4 py-2 bg-cyan-plasma hover:bg-cyan-plasma/90 text-obsidian font-heading font-bold text-xs rounded-xl uppercase tracking-wider flex items-center gap-1.5 shadow-cyan-glow btn-tactile border-b-2 border-cyan-400"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Game</span>
        </button>
      </div>

      {/* Your Personal Result Banner */}
      <div className={`p-5 rounded-3xl border-2 text-center space-y-3 relative overflow-hidden ${
        isMeWinner
          ? 'bg-yellow-500/10 border-yellow-400 shadow-yellow-500/20 shadow-2xl'
          : 'bg-slate/80 border-cyan-plasma/40 shadow-lg'
      }`}>
        <div className="flex items-center justify-center gap-2">
          {isMeWinner ? (
            <span className="px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-400 font-heading font-extrabold text-xs uppercase tracking-widest border border-yellow-400/50 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5" /> VICTORY CHAMPION
            </span>
          ) : myRank ? (
            <span className="px-3 py-1 rounded-full bg-cyan-plasma/20 text-cyan-plasma font-heading font-extrabold text-xs uppercase tracking-widest border border-cyan-plasma/50">
              {myRank === 2 ? '🥈 2ND PLACE' : myRank === 3 ? '🥉 3RD PLACE' : `🎖️ RANK #${myRank} OF ${leaderboard.length}`}
            </span>
          ) : (
            <span className="text-xs font-mono text-ash uppercase">Match Completed</span>
          )}
        </div>

        <div className="flex flex-col items-center">
          <div className="relative mb-2">
            <HexAvatar
              name={myPlayer?.nickname || 'Player'}
              color={myPlayer?.color || '#00E5FF'}
              size="lg"
              showGlow={true}
            />
            {isMeWinner && (
              <div className="absolute -top-3 -right-2 text-2xl animate-bounce">👑</div>
            )}
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-bone">
            {myPlayer?.nickname}
          </h2>
          <div className="text-xl font-mono font-extrabold text-cyan-plasma mt-0.5">
            {(myPlayer?.score || 0).toLocaleString()} <span className="text-xs font-sans text-ash uppercase">Points</span>
          </div>
        </div>

        {/* Player Stats Row */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-steel/40 text-center">
          <div className="p-2 bg-obsidian/60 rounded-xl">
            <div className="text-[10px] font-mono text-ash uppercase">Accuracy</div>
            <div className="text-xs font-mono font-bold text-green-bio">
              {myPlayer?.totalAnswered > 0
                ? Math.round(((myPlayer?.totalCorrect || 0) / myPlayer.totalAnswered) * 100)
                : 0}%
            </div>
          </div>
          <div className="p-2 bg-obsidian/60 rounded-xl">
            <div className="text-[10px] font-mono text-ash uppercase">Streak</div>
            <div className="text-xs font-mono font-bold text-orange-magma flex items-center justify-center gap-1">
              <Flame className="w-3 h-3 fill-orange-magma" /> {myPlayer?.streak || 0}
            </div>
          </div>
          <div className="p-2 bg-obsidian/60 rounded-xl">
            <div className="text-[10px] font-mono text-ash uppercase">Tiles</div>
            <div className="text-xs font-mono font-bold text-cyan-plasma">
              {myTiles}
            </div>
          </div>
        </div>
      </div>

      {/* Champion Card (If someone else won) */}
      {!isMeWinner && winner && (
        <div className="p-3.5 bg-obsidian/90 border border-yellow-400/50 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <HexAvatar name={winner.nickname} color={winner.color} size="sm" />
              <span className="absolute -top-1.5 -right-1.5 text-xs">👑</span>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-yellow-400 font-bold">
                1st Place Champion
              </div>
              <div className="font-heading font-bold text-sm text-bone">{winner.nickname}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono font-bold text-sm text-cyan-plasma">
              {winner.score.toLocaleString()} PTS
            </div>
            <div className="text-[10px] font-mono text-ash">
              {territoryStats?.counts?.[winner.id] || 0} Sectors
            </div>
          </div>
        </div>
      )}

      {/* Tab Selector: Final Map vs Leaderboard */}
      <div className="flex bg-slate/80 p-1 rounded-2xl border border-steel/50">
        <button
          type="button"
          onClick={() => setActiveTab('map')}
          className={`flex-1 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            activeTab === 'map'
              ? 'bg-cyan-plasma text-obsidian shadow-cyan-glow'
              : 'text-ash hover:text-bone'
          }`}
        >
          <MapIcon className="w-4 h-4" />
          <span>Territory Map</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            activeTab === 'leaderboard'
              ? 'bg-cyan-plasma text-obsidian shadow-cyan-glow'
              : 'text-ash hover:text-bone'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Leaderboard ({leaderboard.length})</span>
        </button>
      </div>

      {/* Tab Content 1: Territory Map */}
      {activeTab === 'map' && (
        <div className="bg-slate/60 border border-steel/40 rounded-3xl p-4 space-y-3 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Swords className="w-4 h-4 text-cyan-plasma" />
              <h3 className="font-heading font-bold text-xs text-bone uppercase tracking-wider">
                Final Sector Map
              </h3>
            </div>
            <span className="text-[11px] font-mono text-ash">{totalTiles} Sectors</span>
          </div>

          {map && (
            <div className="p-2 bg-obsidian/90 border border-steel/50 rounded-2xl overflow-hidden flex items-center justify-center">
              <HexGridCanvas
                map={map}
                playerId={player?.id}
                actionPoints={0}
                interactive={false}
                height={280}
              />
            </div>
          )}

          {/* Mini Legend */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-[11px] text-ash">
            {leaderboard.slice(0, 4).map((p) => (
              <div key={p.id} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="font-semibold text-bone">{p.nickname}</span>
                <span className="font-mono text-cyan-plasma">({territoryStats?.counts?.[p.id] || 0})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 2: Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="bg-slate/60 border border-steel/40 rounded-3xl p-4 space-y-2.5 backdrop-blur-sm">
          <h3 className="font-heading font-bold text-xs text-bone uppercase tracking-wider mb-2">
            Final Standings
          </h3>
          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {leaderboard.map((p, idx) => {
              const isMe = p.id === player?.id;
              return (
                <div
                  key={p.id || idx}
                  className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                    isMe
                      ? 'bg-cyan-plasma/15 border-2 border-cyan-plasma shadow-cyan-glow'
                      : 'bg-obsidian/70 border border-steel/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-mono font-bold text-xs w-5 ${idx === 0 ? 'text-yellow-400' : 'text-ash'}`}>
                      {idx === 0 ? '👑' : `#${idx + 1}`}
                    </span>
                    <HexAvatar name={p.nickname} color={p.color} size="sm" />
                    <div>
                      <div className="font-heading font-bold text-xs text-bone flex items-center gap-1.5">
                        <span>{p.nickname}</span>
                        {isMe && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-plasma text-obsidian font-extrabold uppercase">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-ash">
                        {territoryStats?.counts?.[p.id] || 0} Sectors claimed
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-xs font-bold text-cyan-plasma">
                      {p.score.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-ash block">PTS</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Action */}
      <button
        type="button"
        onClick={onJoinAnother}
        className="w-full py-4 bg-cyan-plasma hover:bg-cyan-plasma/90 text-obsidian font-heading font-extrabold text-sm rounded-2xl uppercase tracking-wider flex items-center justify-center gap-2 shadow-cyan-glow btn-tactile border-b-4 border-cyan-400"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Join Another Game</span>
      </button>
    </div>
  );
}
