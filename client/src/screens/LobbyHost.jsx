import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Users, Play, Bot, Sparkles, Copy, Check, Smartphone, HelpCircle, Swords, PlusCircle } from 'lucide-react';
import HexAvatar from '../components/HexAvatar';
import { sound } from '../audio/soundEngine';

import DomainLogo from '../components/DomainLogo';
import { getServerUrl, isNativeApp } from '../utils/serverUrl';

export default function LobbyHost({
  pin,
  quizTitle,
  players = [],
  onStartGame,
  onAddBot,
  enableDomainBattles,
  onOpenForge,
  onOpenCustomCreator,
  onSwitchToPlayer,
  onOpenHelp
}) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const prevCountRef = useRef(players.length);

  // Generate QR Code for Mobile Scanning
  useEffect(() => {
    if (!pin) return;
    const baseUrl = getServerUrl() || window.location.origin;
    const joinUrl = `${baseUrl}/?pin=${pin}`;
    QRCode.toDataURL(joinUrl, {
      width: 180,
      margin: 1,
      color: {
        dark: '#00E5FF',
        light: '#0A0E1A'
      }
    }).then(setQrDataUrl).catch(console.error);
  }, [pin]);

  // Audio chime when a new player connects
  useEffect(() => {
    if (players.length > prevCountRef.current) {
      sound.playJoin();
    }
    prevCountRef.current = players.length;
  }, [players.length]);

  const copyPin = () => {
    navigator.clipboard.writeText(pin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-obsidian bg-cyber-grid text-bone flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden select-none">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 z-10 border-b border-steel/40 pb-5">
        <div className="flex items-center gap-4">
          <DomainLogo size="md" />
          <div className="hidden sm:block border-l border-steel/60 pl-4">
            <span className="text-xs text-ash">Active Quiz:</span>
            <span className="text-xs text-bone font-semibold ml-1.5">{quizTitle}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenForge}
            className="px-3.5 py-2 bg-slate border border-cyan-plasma/50 hover:border-cyan-plasma text-cyan-plasma rounded-2xl font-heading text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all hover:shadow-cyan-glow"
          >
            <Sparkles className="w-4 h-4" />
            <span>Quiz Suggestions</span>
          </button>

          {onOpenCustomCreator && (
            <button
              onClick={onOpenCustomCreator}
              className="px-3.5 py-2 bg-slate border border-green-bio/50 hover:border-green-bio text-green-bio rounded-2xl font-heading text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all hover:shadow-green-glow"
              title="Create your own personal questions"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Own Questions</span>
            </button>
          )}

          <button
            onClick={onAddBot}
            className="px-3.5 py-2 bg-slate border border-steel hover:border-bone/50 text-ash hover:text-bone rounded-2xl font-heading text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
            title="Add a player to test"
          >
            <Bot className="w-4 h-4 text-orange-magma" />
            <span>+ Add Player</span>
          </button>

          {onSwitchToPlayer && (
            <button
              onClick={onSwitchToPlayer}
              className="px-3.5 py-2 bg-obsidian border border-steel/80 hover:border-cyan-plasma text-ash hover:text-cyan-plasma rounded-2xl font-heading text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
              title="Switch to Player Hand"
            >
              <Smartphone className="w-4 h-4" />
              <span>Play as Player</span>
            </button>
          )}

          {onOpenHelp && (
            <button
              onClick={onOpenHelp}
              className="p-2 bg-obsidian border border-steel/80 hover:border-cyan-plasma text-cyan-plasma rounded-2xl transition-all"
              title="How to Play"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Centerpiece: PIN & QR Code */}
      <div className="my-auto py-8 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16 z-10">
        {/* Left / Center: Room PIN Display */}
        <div className="text-center space-y-4 max-w-md">
          <span className="text-xs font-semibold uppercase tracking-widest text-ash">
            Join on phone or browser with game pin:
          </span>

          <div
            onClick={copyPin}
            className="cursor-pointer group relative inline-flex items-center justify-center px-8 py-5 bg-slate/90 border-2 border-cyan-plasma rounded-3xl shadow-cyan-glow hover:scale-105 transition-transform"
          >
            <span className="font-mono font-extrabold text-5xl sm:text-6xl tracking-widest text-cyan-plasma">
              {pin}
            </span>
            <div className="absolute -top-3 -right-3 p-2 bg-obsidian border border-cyan-plasma rounded-full text-cyan-plasma text-xs">
              {copied ? <Check className="w-4 h-4 text-green-bio" /> : <Copy className="w-4 h-4" />}
            </div>
          </div>

          <div className="text-xs text-ash flex items-center justify-center gap-2">
            <span>Direct link:</span>
            <span className="text-bone underline truncate max-w-[240px]">
              {(getServerUrl() || window.location.origin)}/?pin={pin}
            </span>
          </div>

          {enableDomainBattles && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-magma/15 border border-orange-magma/40 text-orange-magma text-xs font-semibold">
              <Swords className="w-3.5 h-3.5" />
              <span>Domain Battles Enabled — Conquer Hex Territory</span>
            </div>
          )}
        </div>

        {/* Right: QR Code */}
        {qrDataUrl && (
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 bg-obsidian border-2 border-cyan-plasma/50 rounded-2xl shadow-cyan-glow">
              <img src={qrDataUrl} alt="Game QR Code" className="w-40 h-40 rounded-xl" />
            </div>
            <span className="text-xs text-ash">
              Scan with phone camera to join
            </span>
            {!isNativeApp() && (
              <div className="flex items-center gap-1.5 text-xs text-ash">
                <span>Prefer app?</span>
                <a
                  href="/download"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-plasma hover:underline font-semibold"
                >
                  Download Android APK
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Players in Lobby */}
      <div className="z-10 bg-slate/60 border border-steel/40 rounded-3xl p-5 backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-plasma" />
            <h2 className="font-heading font-bold text-sm text-bone uppercase tracking-wider">
              Players in Room ({players.length})
            </h2>
          </div>

          {players.length > 0 && (
            <button
              onClick={onStartGame}
              className="px-8 py-3.5 bg-green-bio hover:bg-green-bio/90 text-obsidian font-heading font-extrabold text-sm rounded-2xl uppercase tracking-wider flex items-center gap-2 shadow-green-glow btn-tactile border-b-4 border-green-400"
            >
              <Play className="w-4 h-4 fill-obsidian" />
              <span>Start Game ({players.length} Players)</span>
            </button>
          )}
        </div>

        {players.length === 0 ? (
          <div className="py-8 text-center text-ash text-xs border border-dashed border-steel/50 rounded-2xl">
            Waiting for players to join... Scan the QR code or enter PIN on another tab. Click <span className="text-orange-magma font-bold">+ Add Player</span> above to test anytime!
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 items-center">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-3 px-3.5 py-2 bg-obsidian/80 border border-steel/50 rounded-2xl hover:border-cyan-plasma transition-all shadow-sm"
              >
                <HexAvatar name={player.nickname} color={player.color} size="sm" />
                <div className="flex flex-col">
                  <span className="font-heading font-semibold text-bone text-xs">{player.nickname}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
