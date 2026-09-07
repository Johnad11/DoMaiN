/**
 * DoMaiNiT - Global State & Persistence Management
 */
const STORAGE_KEY = 'domainit_state';
const LEGACY_KEYS = ['domain_state', 'cognicycle_state'];

const defaultGameState = {
  currentCycle: 1,
  currentLevel: 1,
  totalXP: 0,
  streak: 0,
  domainStats: {
    logic: { wins: 0, losses: 0 },
    memory: { wins: 0, losses: 0 },
    spatial: { wins: 0, losses: 0 }
  },
  seenTutorials: {
    level1: false,
    level4: false,
    level7: false,
    level10: false
  }
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
          ...(parsed.seenTutorials || {})
        }
      };
    }
  } catch (e) {
    console.error('Failed to load gameState, initializing defaults:', e);
    gameState = { ...defaultGameState };
  }
  if (typeof updateHUD === 'function') {
    updateHUD();
  }
}
