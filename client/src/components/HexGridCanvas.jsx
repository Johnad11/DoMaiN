import React, { useRef, useEffect, useState } from 'react';
import { sound } from '../audio/soundEngine';

/**
 * Pointy-topped Hexagon calculations in Axial Coordinates (q, r)
 */
function hexToPixel(q, r, size, originX, originY) {
  const x = size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r) + originX;
  const y = size * ((3 / 2) * r) + originY;
  return { x, y };
}

function getHexCorners(centerX, centerY, size) {
  const corners = [];
  for (let i = 0; i < 6; i++) {
    const angle_deg = 60 * i - 30; // pointy-topped
    const angle_rad = (Math.PI / 180) * angle_deg;
    corners.push({
      x: centerX + size * Math.cos(angle_rad),
      y: centerY + size * Math.sin(angle_rad)
    });
  }
  return corners;
}

export default function HexGridCanvas({
  map,
  playerId = null,
  actionPoints = 0,
  onTileClick = null,
  interactive = true,
  className = '',
  height = 420
}) {
  const canvasRef = useRef(null);
  const [hoveredKey, setHoveredKey] = useState(null);
  const [clickNotice, setClickNotice] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !map || !map.tiles) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const canvasHeight = canvas.height;

    ctx.clearRect(0, 0, width, canvasHeight);

    // Dynamic sizing based on grid radius and canvas dimensions
    const radius = map.radius || 3;
    const hexSize = Math.min(width, canvasHeight) / ((radius * 2 + 1) * 1.85);
    const originX = width / 2;
    const originY = canvasHeight / 2;

    const tiles = Object.values(map.tiles);

    // Helper to check if tile is adjacent to player's territory
    const isAdjacentToPlayer = (q, r) => {
      if (!playerId) return false;
      const dirs = [
        { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
        { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
      ];
      return dirs.some(d => {
        const nKey = `${q + d.q},${r + d.r}`;
        return map.tiles[nKey] && map.tiles[nKey].ownerId === playerId;
      });
    };

    // Draw grid tiles
    tiles.forEach(tile => {
      const { x, y } = hexToPixel(tile.q, tile.r, hexSize, originX, originY);
      const corners = getHexCorners(x, y, hexSize - 2); // 2px gap between tiles

      const isOwned = Boolean(tile.ownerId);
      const isMine = tile.ownerId === playerId;
      const isTargetable = actionPoints > 0 && !isMine && isAdjacentToPlayer(tile.q, tile.r);
      const isHovered = hoveredKey === tile.key;

      ctx.save();
      ctx.beginPath();
      corners.forEach((c, i) => {
        if (i === 0) ctx.moveTo(c.x, c.y);
        else ctx.lineTo(c.x, c.y);
      });
      ctx.closePath();

      // Tile fill
      if (isOwned) {
        ctx.fillStyle = tile.ownerColor || '#00E5FF';
        ctx.shadowColor = tile.ownerColor;
        ctx.shadowBlur = isHovered ? 18 : 6;
      } else {
        ctx.fillStyle = '#1c2438';
        ctx.shadowBlur = 0;
      }
      ctx.fill();

      // Border styling
      ctx.lineWidth = isHovered ? 3 : (isTargetable ? 2.5 : 1.2);
      if (isTargetable) {
        ctx.strokeStyle = '#39FF88'; // Targetable highlight in Bio Green
        ctx.shadowColor = '#39FF88';
        ctx.shadowBlur = 10;
      } else if (isOwned) {
        ctx.strokeStyle = '#F2F5FF';
      } else {
        ctx.strokeStyle = '#2A3350';
      }
      ctx.stroke();
      ctx.restore();

      // Inner tile indicator: Owner Initial or Spawn Crown
      if (isOwned) {
        ctx.save();
        ctx.fillStyle = '#0A0E1A';
        ctx.font = `bold ${Math.max(10, Math.floor(hexSize * 0.55))}px 'Space Grotesk'`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const label = tile.isSpawn ? '👑' : (tile.ownerName ? tile.ownerName.charAt(0).toUpperCase() : '★');
        ctx.fillText(label, x, y);
        ctx.restore();
      } else if (isTargetable) {
        // Subtle + marker for available conquest
        ctx.save();
        ctx.fillStyle = '#39FF88';
        ctx.font = `bold ${Math.max(10, Math.floor(hexSize * 0.5))}px 'Inter'`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('+', x, y);
        ctx.restore();
      }
    });

  }, [map, hoveredKey, playerId, actionPoints]);

  // Click & hover detection
  const handlePointer = (e, isClick = false) => {
    if (!interactive || !map || !map.tiles) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

    const mouseX = (clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (clientY - rect.top) * (canvas.height / rect.height);

    const radius = map.radius || 3;
    const hexSize = Math.min(canvas.width, canvas.height) / ((radius * 2 + 1) * 1.85);
    const originX = canvas.width / 2;
    const originY = canvas.height / 2;

    // Find closest hex center
    let closestKey = null;
    let minDist = hexSize * 0.9;

    Object.values(map.tiles).forEach(tile => {
      const { x, y } = hexToPixel(tile.q, tile.r, hexSize, originX, originY);
      const dist = Math.hypot(mouseX - x, mouseY - y);
      if (dist < minDist) {
        minDist = dist;
        closestKey = tile.key;
      }
    });

    if (isClick && closestKey) {
      if (onTileClick) {
        const targetTile = map.tiles[closestKey];
        if (targetTile.ownerId && targetTile.ownerId !== playerId) {
          sound.playAttack();
        } else {
          sound.playClaimTile();
        }
        onTileClick(closestKey);
      }
    } else {
      setHoveredKey(closestKey);
    }
  };

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {actionPoints > 0 && (
        <div className="absolute top-2 z-10 bg-green-bio/20 border border-green-bio text-green-bio px-3 py-1 rounded-full text-xs font-mono font-bold animate-pulse flex items-center gap-2">
          <span>⚡ {actionPoints} ACTION POINTS AVAILABLE — TAP ADJACENT TILE TO EXPAND</span>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={720}
        height={height}
        className="w-full max-w-full h-auto cursor-pointer touch-none"
        onMouseMove={(e) => handlePointer(e, false)}
        onMouseLeave={() => setHoveredKey(null)}
        onClick={(e) => handlePointer(e, true)}
        onTouchStart={(e) => handlePointer(e, true)}
      />
    </div>
  );
}
