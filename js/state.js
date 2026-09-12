/**
 * DoMaiNiT - Global State & Persistence Management
 */
const STORAGE_KEY = 'domainit_state';
const LEGACY_KEYS = ['domain_state', 'cognicycle_state'];

const defaultGameState = {
  currentCycle: 1, // Prestige cycle after beating level 50
  currentLevel: 1, // Progression from Level 1 to 50
  totalXP: 0,
  streak: 0,
  domainStats: {
    logic: { wins: 0, losses: 0 },
    memory: { wins: 0, losses: 0 },
    spatial: { wins: 0, losses: 0 }
  },
  seenTutorials: {
    logic: false,
    memory: false,
    spatial: false,
    boss: false
  },
  sectorsUnlocked: 1,
  highestLevelReached: 1
};

let gameState = { ...defaultGameState };

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  } catch (e) {
    console.error('Failed to save gameState to localStorage:', e);
  }
  if (typeof updateHUD === 'function') {
    updateHUD();
  }
  if (typeof cloudSync !== 'undefined' && typeof cloudSync.pushSave === 'function') {
    cloudSync.pushSave(gameState);
  }
}

function loadState() {
  try {
    let stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      for (const legKey of LEGACY_KEYS) {
        stored = localStorage.getItem(legKey);
        if (stored) break;
      }
    }

    if (stored) {
      const parsed = JSON.parse(stored);
      gameState = {
        ...defaultGameState,
        ...parsed,
        domainStats: {
          logic: { ...defaultGameState.domainStats.logic, ...(parsed.domainStats?.logic || {}) },
          memory: { ...defaultGameState.domainStats.memory, ...(parsed.domainStats?.memory || {}) },
          spatial: { ...defaultGameState.domainStats.spatial, ...(parsed.domainStats?.spatial || {}) }
        },
        seenTutorials: {
          ...defaultGameState.seenTutorials,
          ...(parsed.seenTutorials || {}),
          logic: parsed.seenTutorials?.logic ?? parsed.seenTutorials?.level1 ?? false,
          memory: parsed.seenTutorials?.memory ?? parsed.seenTutorials?.level4 ?? false,
          spatial: parsed.seenTutorials?.spatial ?? parsed.seenTutorials?.level7 ?? false,
          boss: parsed.seenTutorials?.boss ?? parsed.seenTutorials?.level10 ?? false
        },
        sectorsUnlocked: Math.max(1, Math.min(5, parsed.sectorsUnlocked || Math.floor(((parsed.currentLevel || 1) - 1) / 10) + 1)),
        highestLevelReached: Math.max(parsed.highestLevelReached || 1, parsed.currentLevel || 1)
      };
      if (typeof gameState.currentLevel !== 'number' || isNaN(gameState.currentLevel) || gameState.currentLevel < 1) {
        gameState.currentLevel = 1;
      }
      if (gameState.currentLevel > 50) {
        gameState.currentLevel = 50;
      }
    }
  } catch (e) {
    console.error('Failed to load gameState, initializing defaults:', e);
    gameState = { ...defaultGameState };
  }
  if (typeof updateHUD === 'function') {
    updateHUD();
  }
}
