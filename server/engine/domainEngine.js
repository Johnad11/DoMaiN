/**
 * DO-MAIN-IT — Domain Battles Hex Grid Conquest Engine
 * PRD Section 5: The Namesake Feature
 */

const HEX_DIRECTIONS = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 }
];

function getTileKey(q, r) {
  return `${q},${r}`;
}

function parseTileKey(key) {
  const [q, r] = key.split(',').map(Number);
  return { q, r };
}

/**
 * Creates a hexagonal grid of given radius.
 * radius 3 = 37 tiles, radius 4 = 61 tiles.
 */
function createHexMap(radius = 3) {
  const tiles = {};

  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    for (let r = r1; r <= r2; r++) {
      const key = getTileKey(q, r);
      tiles[key] = {
        key,
        q,
        r,
        ownerId: null, // neutral
        ownerColor: null,
        ownerName: null,
        isSpawn: false,
        defense: 100,
        conquestTime: null
      };
    }
  }

  return {
    radius,
    tiles
  };
}

/**
 * Gets adjacent neighbors for a tile in axial coordinates
 */
function getNeighbors(q, r, map) {
  const neighbors = [];
  for (const dir of HEX_DIRECTIONS) {
    const nq = q + dir.q;
    const nr = r + dir.r;
    const key = getTileKey(nq, nr);
    if (map.tiles[key]) {
      neighbors.push(map.tiles[key]);
    }
  }
  return neighbors;
}

/**
 * Checks if a tile is adjacent to any tile owned by the player
 */
function isAdjacentToOwned(playerKey, tileKey, map) {
  const { q, r } = parseTileKey(tileKey);
  const neighbors = getNeighbors(q, r, map);
  return neighbors.some(n => n.ownerId === playerKey);
}

/**
 * Assigns spawn tiles to joined players on the outer perimeter
 */
function assignSpawnPoints(map, players) {
  const playerList = Object.values(players);
  if (playerList.length === 0) return;

  const perimeterKeys = Object.keys(map.tiles).filter(key => {
    const { q, r } = parseTileKey(key);
    return Math.max(Math.abs(q), Math.abs(r), Math.abs(-q - r)) === map.radius;
  });

  const step = Math.max(1, Math.floor(perimeterKeys.length / playerList.length));

  playerList.forEach((player, idx) => {
    const chosenIndex = (idx * step) % perimeterKeys.length;
    const spawnKey = perimeterKeys[chosenIndex];
    const tile = map.tiles[spawnKey];
    if (tile) {
      tile.ownerId = player.id;
      tile.ownerColor = player.color;
      tile.ownerName = player.nickname;
      tile.isSpawn = true;
      tile.defense = 200;
    }
  });
}

/**
 * Resolves a Claim or Attack action from a player
 */
function executeTileAction({
  map,
  player,
  targetKey,
  allPlayers
}) {
  const tile = map.tiles[targetKey];
  if (!tile) {
    return { success: false, reason: 'Tile does not exist' };
  }

  // Already owned by this player
  if (tile.ownerId === player.id) {
    return { success: false, reason: 'Tile already owned' };
  }

  // Check adjacency to player's territory
  const adjacent = isAdjacentToOwned(player.id, targetKey, map);
  if (!adjacent) {
    return { success: false, reason: 'Must target a tile adjacent to your territory' };
  }

  // Case 1: Claim Neutral Tile
  if (!tile.ownerId) {
    tile.ownerId = player.id;
    tile.ownerColor = player.color;
    tile.ownerName = player.nickname;
    tile.conquestTime = Date.now();
    return {
      success: true,
      actionType: 'claim',
      targetKey,
      tile
    };
  }

  // Case 2: Attack Enemy Tile
  const defender = allPlayers[tile.ownerId];
  const defenderStreak = defender ? (defender.streak || 0) : 0;
  const attackerStreak = player.streak || 0;

  // PRD Rule: Attacker wins if streak >= defender streak
  if (attackerStreak >= defenderStreak) {
    const oldOwner = tile.ownerName;
    tile.ownerId = player.id;
    tile.ownerColor = player.color;
    tile.ownerName = player.nickname;
    tile.conquestTime = Date.now();
    return {
      success: true,
      actionType: 'attack_win',
      targetKey,
      oldOwner,
      tile
    };
  } else {
    return {
      success: false,
      actionType: 'attack_repelled',
      reason: `Attack repelled! Your streak (${attackerStreak}) was lower than defender streak (${defenderStreak}).`,
      targetKey
    };
  }
}

/**
 * Wrong answer penalty: lose 1 weakest perimeter tile (reverts to neutral)
 */
function penalizeWrongAnswer(map, playerId) {
  const ownedKeys = Object.keys(map.tiles).filter(k => {
    const t = map.tiles[k];
    return t.ownerId === playerId && !t.isSpawn; // keep spawn tile protected
  });

  if (ownedKeys.length === 0) return null;

  // Find a tile with the most neutral/enemy neighbors (weakest edge)
  let weakestKey = ownedKeys[0];
  let maxExposedNeighbors = -1;

  for (const key of ownedKeys) {
    const { q, r } = parseTileKey(key);
    const neighbors = getNeighbors(q, r, map);
    const exposed = neighbors.filter(n => n.ownerId !== playerId).length;
    if (exposed > maxExposedNeighbors) {
      maxExposedNeighbors = exposed;
      weakestKey = key;
    }
  }

  const lostTile = map.tiles[weakestKey];
  lostTile.ownerId = null;
  lostTile.ownerColor = null;
  lostTile.ownerName = null;
  lostTile.conquestTime = null;

  return lostTile;
}

/**
 * Compute territory counts and percentages
 */
function getTerritoryStats(map) {
  const counts = {};
  const totalTiles = Object.keys(map.tiles).length;

  for (const key of Object.keys(map.tiles)) {
    const owner = map.tiles[key].ownerId || 'neutral';
    counts[owner] = (counts[owner] || 0) + 1;
  }

  return {
    totalTiles,
    counts
  };
}

module.exports = {
  createHexMap,
  getNeighbors,
  assignSpawnPoints,
  executeTileAction,
  penalizeWrongAnswer,
  getTerritoryStats,
  getTileKey,
  parseTileKey
};
