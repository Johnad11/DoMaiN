import React, { useEffect } from 'react';
import { Clock, Users, ArrowRight, Eye, Zap, Swords } from 'lucide-react';
import HexGridCanvas from '../components/HexGridCanvas';
import LeaderBoard from '../components/LeaderBoard';
import { sound } from '../audio/soundEngine';

export default function GameHost({
  question,
  questionIndex,
  totalQuestions,
  timeLeft,
  totalTime,
  answeredCount,
  totalPlayers,
  isReveal,
  revealData,
  map,
  players = [],
  onNextQuestion,
  onRevealNow,
  isSurgeRound
}) {
  const timeProgress = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0;
  const isTimeCritical = timeLeft <= 5 && timeLeft > 0;

  useEffect(() => {
    if (isSurgeRound && !isReveal) {
      sound.playSurge();
    }
  }, [isSurgeRound, isReveal]);

  return (
    <div className="min-h-screen bg-obsidian bg-cyber-grid text-bone flex flex-col justify-between p-5 sm:p-8 select-none pb-12">
      {/* Top Header & Status */}
      <div className="flex items-center justify-between border-b border-steel/40 pb-4">
        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 bg-cyan-plasma/20 border border-cyan-plasma text-cyan-plasma font-mono font-bold text-xs rounded-xl">
            QUESTION {questionIndex + 1} OF {totalQuestions}
          </span>
          {isSurgeRound && (
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-magma/20 border border-orange-magma text-orange-magma font-heading font-extrabold text-xs rounded-xl animate-pulse">
              <Zap className="w-3.5 h-3.5 fill-orange-magma" />
              <span>DOMAIN SURGE (DOUBLE ACTION POINTS)</span>
            </div>
          )}
        </div>

        {/* Timer Bar & Counter */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-mono text-sm">
            <Users className="w-4 h-4 text-cyan-plasma" />
            <span>{answeredCount} of {totalPlayers} Answered</span>
          </div>

          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-extrabold text-base ${
            isTimeCritical
              ? 'bg-red-blood/20 border-red-blood text-red-blood animate-bounce'
              : 'bg-slate border-steel text-bone'
          }`}>
            <Clock className="w-4 h-4" />
            <span>{timeLeft}s</span>
          </div>
        </div>
      </div>

      {/* Dynamic Timer Line */}
      <div className="w-full h-1.5 bg-steel/30 rounded-full overflow-hidden my-3">
        <div
          className={`h-full transition-all duration-1000 ${
            isTimeCritical ? 'bg-red-blood' : 'bg-cyan-plasma'
          }`}
          style={{ width: `${timeProgress}%` }}
        />
      </div>

      {/* Main Board Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto items-stretch">
        {/* Left / Center (8 cols): Question & Hex Battle Map */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-5 bg-slate/50 border border-steel/40 rounded-3xl p-6 backdrop-blur-sm">
          {/* Question Text */}
          <div className="text-center space-y-2 py-2">
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-bone leading-tight">
              {question?.text}
            </h2>
            {isReveal && revealData?.explanation && (
              <p className="text-xs sm:text-sm text-green-bio font-body max-w-2xl mx-auto bg-green-bio/10 border border-green-bio/30 p-3 rounded-2xl">
                💡 {revealData.explanation}
              </p>
            )}
          </div>

          {/* Hex Conquest Map Arena */}
          {map ? (
            <div className="relative border border-steel/50 rounded-2xl bg-obsidian/70 p-3 overflow-hidden">
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                <Swords className="w-4 h-4 text-cyan-plasma" />
                <span className="text-xs font-semibold uppercase tracking-wider text-ash">
                  Live Territory Map
                </span>
              </div>
              <HexGridCanvas
                map={map}
                interactive={false}
                height={320}
              />
            </div>
          ) : null}

          {/* Options Display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {question?.options?.map((opt, idx) => {
              const isCorrect = isReveal && idx === revealData?.correctIndex;
              const letter = String.fromCharCode(65 + idx);

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
                    isCorrect
                      ? 'bg-green-bio/20 border-green-bio text-bone shadow-green-glow'
                      : isReveal
                      ? 'bg-obsidian/40 border-steel/30 text-ash opacity-50'
                      : 'bg-obsidian/80 border-steel/60 text-bone'
                  }`}
                >
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                    isCorrect ? 'bg-green-bio text-obsidian' : 'bg-steel/60 text-bone'
                  }`}>
                    {letter}
                  </span>
                  <span className="font-body text-sm font-medium">{opt}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Rail (4 cols): Live Leaderboard */}
        <div className="lg:col-span-4 flex flex-col">
          <LeaderBoard players={players} />
        </div>
      </div>

      {/* Host Controls Bar - Clean, spacious, and prominent */}
      <div className="flex items-center justify-between border-t border-steel/40 pt-4 mt-3">
        <div className="text-xs text-ash flex items-center gap-3">
          <span>Question {questionIndex + 1} of {totalQuestions}</span>
          <span>•</span>
          <span>{answeredCount} players answered</span>
        </div>

        <div className="flex items-center gap-3">
          {!isReveal ? (
            <button
              onClick={onRevealNow}
              className="px-6 py-3 bg-slate border border-steel hover:border-cyan-plasma text-bone rounded-2xl font-heading font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all hover:shadow-cyan-glow"
            >
              <Eye className="w-4 h-4 text-cyan-plasma" />
              <span>Reveal Answers Now</span>
            </button>
          ) : (
            <button
              onClick={onNextQuestion}
              className="px-8 py-3.5 bg-cyan-plasma hover:bg-cyan-plasma/90 text-obsidian font-heading font-extrabold text-sm rounded-2xl uppercase tracking-wider flex items-center gap-2 shadow-cyan-glow btn-tactile border-b-4 border-cyan-400"
            >
              <span>{questionIndex + 1 >= totalQuestions ? 'View Final Results' : 'Next Question'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
