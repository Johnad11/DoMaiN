import React, { useState, useEffect } from 'react';
import { Flame, CheckCircle2, XCircle, Zap, Swords } from 'lucide-react';
import HexAvatar from '../components/HexAvatar';
import HexGridCanvas from '../components/HexGridCanvas';
import AntiCheatGuard from '../components/AntiCheatGuard';
import { sound } from '../audio/soundEngine';

export default function GamePlayer({
  player,
  question,
  questionIndex,
  totalQuestions,
  isSurgeRound,
  isLocked,
  isReveal,
  revealResult,
  map,
  actionPoints = 0,
  onSubmitAnswer,
  onTileAction,
  onAntiCheatEvent
}) {
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [viewMode, setViewMode] = useState('question'); // 'question' or 'tactical_map'
  const [actionNotice, setActionNotice] = useState('');

  // Reset answer selection on new question
  useEffect(() => {
    setSelectedOptionIndex(null);
    if (actionPoints > 0) {
      setViewMode('tactical_map');
    } else {
      setViewMode('question');
    }
  }, [questionIndex]);

  // When reveal comes in:
  useEffect(() => {
    if (isReveal) {
      if (revealResult?.isCorrect) {
        sound.playCorrect();
      } else {
        sound.playWrong();
      }
      if (actionPoints > 0) {
        setViewMode('tactical_map');
      }
    }
  }, [isReveal, revealResult, actionPoints]);

  const handleSelectOption = (idx) => {
    if (isLocked || isReveal || selectedOptionIndex !== null) return;
    setSelectedOptionIndex(idx);
    sound.playClaimTile();
    onSubmitAnswer(idx);
  };

  const handleTacticalTileClick = (targetKey) => {
    if (actionPoints <= 0) return;
    onTileAction(targetKey);
    setActionNotice(`Claiming tile ${targetKey}...`);
    setTimeout(() => setActionNotice(''), 2500);
  };

  return (
    <div className={`min-h-screen bg-obsidian bg-cyber-grid text-bone flex flex-col justify-between p-4 sm:p-6 select-none ${
      isReveal && !revealResult?.isCorrect && selectedOptionIndex !== null ? 'animate-shake' : ''
    }`}>
      {/* Anti-cheat tab guard */}
      <AntiCheatGuard
        isActive={!isReveal && !isLocked}
        onViolation={onAntiCheatEvent}
      />

      {/* Top Header: Player Avatar, Score & Streak */}
      <div className="flex items-center justify-between bg-slate/70 border border-steel/50 rounded-2xl p-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <HexAvatar
            name={player.nickname}
            color={player.color}
            size="md"
            rank={revealResult?.rank || player.rank}
          />
          <div className="flex flex-col">
            <span className="font-heading font-bold text-bone text-sm">{player.nickname}</span>
            <div className="flex items-center gap-1 font-mono text-xs text-ash">
              <span>#{revealResult?.rank || player.rank || 1} Place</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {player.streak >= 2 && (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-orange-magma/20 border border-orange-magma/50 rounded-xl text-orange-magma font-mono font-bold text-xs">
              <Flame className="w-3.5 h-3.5 fill-orange-magma" />
              <span>{player.streak} In a Row</span>
            </div>
          )}

          <div className="text-right">
            <div className="font-mono font-extrabold text-base sm:text-lg text-cyan-plasma">
              {(revealResult?.score ?? player.score).toLocaleString()}
            </div>
            <div className="text-[10px] font-mono text-ash tracking-wider">POINTS</div>
          </div>
        </div>
      </div>

      {/* Surge Indicator */}
      {isSurgeRound && (
        <div className="my-2 py-1.5 px-3 bg-orange-magma/20 border border-orange-magma rounded-xl text-orange-magma text-xs font-semibold flex items-center justify-center gap-1.5 animate-pulse">
          <Zap className="w-3.5 h-3.5 fill-orange-magma" />
          <span>Domain Surge: Correct answers give Double Action Points!</span>
        </div>
      )}

      {/* View Switcher if player has territory actions */}
      {map && (
        <div className="flex justify-center my-2">
          <div className="inline-flex p-1 bg-slate border border-steel/60 rounded-2xl">
            <button
              onClick={() => setViewMode('question')}
              className={`px-4 py-1.5 rounded-xl text-xs font-heading font-bold uppercase transition-all ${
                viewMode === 'question'
                  ? 'bg-cyan-plasma text-obsidian shadow-sm'
                  : 'text-ash hover:text-bone'
              }`}
            >
              Question
            </button>
            <button
              onClick={() => setViewMode('tactical_map')}
              className={`px-4 py-1.5 rounded-xl text-xs font-heading font-bold uppercase flex items-center gap-1.5 transition-all ${
                viewMode === 'tactical_map'
                  ? 'bg-orange-magma text-obsidian shadow-sm'
                  : 'text-ash hover:text-bone'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Territory Map</span>
              {actionPoints > 0 && (
                <span className="w-4 h-4 rounded-full bg-green-bio text-obsidian text-[10px] font-mono font-extrabold flex items-center justify-center">
                  {actionPoints}
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Main Hand Body */}
      <div className="my-auto py-2">
        {viewMode === 'tactical_map' && map ? (
          /* Tactical Hex Map View */
          <div className="bg-slate/60 border border-steel/50 rounded-3xl p-4 backdrop-blur-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Swords className="w-4 h-4 text-cyan-plasma" />
                <span className="font-heading font-bold text-xs uppercase text-bone">
                  Your Territory Map
                </span>
              </div>
              <span className="text-xs font-mono text-green-bio font-bold">
                {actionPoints} Actions Available
              </span>
            </div>

            <HexGridCanvas
              map={map}
              playerId={player.id}
              actionPoints={actionPoints}
              onTileClick={handleTacticalTileClick}
              interactive={true}
              height={300}
            />

            {actionNotice && (
              <div className="text-center text-xs text-cyan-plasma animate-pulse">
                {actionNotice}
              </div>
            )}
          </div>
        ) : (
          /* Active Question & Tactile Answer Options */
          <div className="space-y-4">
            {/* Question Text Box */}
            <div className="p-4 bg-slate/60 border border-steel/50 rounded-3xl text-center space-y-1 backdrop-blur-sm">
              <span className="text-[10px] font-semibold uppercase text-ash tracking-widest">
                Question {questionIndex + 1} of {totalQuestions}
              </span>
              <h2 className="font-heading font-bold text-lg sm:text-xl text-bone leading-snug">
                {question?.text}
              </h2>
            </div>

            {/* Answer Locked Status Banner */}
            {isLocked && !isReveal && (
              <div className="p-3 bg-cyan-plasma/15 border border-cyan-plasma rounded-2xl text-center font-heading font-bold text-xs text-cyan-plasma uppercase tracking-wider animate-pulse flex items-center justify-center gap-2">
                <span>✓ Answer submitted! Waiting for other players...</span>
              </div>
            )}

            {/* Reveal Result Banner */}
            {isReveal && (
              <div className={`p-4 rounded-2xl border text-center space-y-1.5 ${
                revealResult?.isCorrect
                  ? 'bg-green-bio/20 border-green-bio text-bone shadow-green-glow'
                  : 'bg-red-blood/20 border-red-blood text-bone shadow-red-glow'
              }`}>
                <div className="flex items-center justify-center gap-2 font-heading font-extrabold text-base">
                  {revealResult?.isCorrect ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-green-bio" />
                      <span>Nice! Correct answer (+{revealResult?.pointsEarned || 0} pts)</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-blood" />
                      <span>Not quite right!</span>
                    </>
                  )}
                </div>
                {revealResult?.explanation && (
                  <p className="text-xs text-bone/80 font-body">
                    {revealResult.explanation}
                  </p>
                )}
              </div>
            )}

            {/* Chunky Tactile Answer Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {question?.options?.map((optText, optIdx) => {
                const isSelected = selectedOptionIndex === optIdx;
                const letter = String.fromCharCode(65 + optIdx);

                const tileColors = [
                  'border-cyan-plasma/70 hover:border-cyan-plasma',
                  'border-orange-magma/70 hover:border-orange-magma',
                  'border-green-bio/70 hover:border-green-bio',
                  'border-yellow-400/70 hover:border-yellow-400'
                ];

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    disabled={isLocked || isReveal}
                    className={`w-full p-4 rounded-2xl border-2 text-left font-body text-sm font-semibold transition-all flex items-center gap-3 btn-tactile ${
                      isSelected
                        ? 'bg-cyan-plasma text-obsidian border-cyan-400 shadow-cyan-glow'
                        : isLocked || isReveal
                        ? 'bg-obsidian/60 border-steel/40 text-ash opacity-60 cursor-not-allowed'
                        : `bg-slate/90 ${tileColors[optIdx % tileColors.length]} text-bone shadow-md active:bg-slate-light`
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-extrabold text-xs ${
                      isSelected ? 'bg-obsidian text-cyan-plasma' : 'bg-obsidian/80 text-bone border border-steel/50'
                    }`}>
                      {letter}
                    </span>
                    <span className="flex-1 leading-snug">{optText}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Clean Bottom Bar */}
      <div className="py-2 text-center text-xs text-ash">
        DO-MAIN-IT
      </div>
    </div>
  );
}
