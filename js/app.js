/**
 * DoMaiNiT - Application Lifecycle, HUD Coordinator & Game Dispatcher
 */

// DOM Elements
const hudCycle = document.getElementById('hud-cycle');
const hudLevel = document.getElementById('hud-level');
const hudXp = document.getElementById('hud-xp');
const hudStreak = document.getElementById('hud-streak');
const badgeDomain = document.getElementById('badge-domain');
const stageTitle = document.getElementById('stage-title');
const stageObjective = document.getElementById('stage-objective');
const feedbackBar = document.getElementById('feedback-bar');
const gameContainer = document.getElementById('minigame-container');
const bossBanner = document.getElementById('boss-banner');
const bossTimerDisplay = document.getElementById('boss-timer-display');
const bossTimerBar = document.getElementById('boss-timer-bar');

// Modals
const modalTutorial = document.getElementById('modal-tutorial');
const tutTitle = document.getElementById('tut-title');
const tutContent = document.getElementById('tut-content');
const btnDismissTut = document.getElementById('btn-dismiss-tut');

const modalStats = document.getElementById('modal-stats');
const btnStats = document.getElementById('btn-stats');
const btnCloseStats = document.getElementById('btn-close-stats');
const btnResetData = document.getElementById('btn-reset-data');
const btnSound = document.getElementById('btn-sound');
const btnHelp = document.getElementById('btn-help');

/* ======================================================== */
/* GAMER RANKS & ROADMAP TRACKER                            */
/* ======================================================== */
function getOperativeRank(cycle, level) {
  if (cycle === 1) {
    return level <= 5 ? 'CADET' : 'OPERATIVE';
  } else if (cycle === 2) {
    return 'CYBER SPECIALIST';
  } else if (cycle === 3) {
    return 'CIPHER MASTER';
  } else if (cycle === 4) {
    return 'QUANTUM OPERATIVE';
  } else {
    return 'NEURAL OVERLORD';
  }
}

function updateRoadmap(level) {
  const steps = {
    'road-logic': level >= 1 && level <= 3,
    'road-memory': level >= 4 && level <= 6,
    'road-spatial': level >= 7 && level <= 9,
    'road-boss': level === 10
  };
  for (const [id, isActive] of Object.entries(steps)) {
    const el = document.getElementById(id);
    if (el) {
      if (isActive) el.classList.add('active');
      else el.classList.remove('active');
    }
  }
}

function showComboPopup(streak) {
  const el = document.createElement('div');
  el.className = 'combo-popup';
  el.innerHTML = `🔥 ${streak}X STREAK COMBO!`;
  document.body.appendChild(el);
  setTimeout(() => {
    if (el.parentNode) el.parentNode.removeChild(el);
  }, 1200);
}

function updateHUD() {
  if (hudCycle) hudCycle.textContent = gameState.currentCycle;
  if (hudLevel) hudLevel.textContent = gameState.currentLevel;
  if (hudXp) hudXp.textContent = gameState.totalXP;
  if (hudStreak) hudStreak.textContent = gameState.streak;

  const rankEl = document.getElementById('hud-rank');
  if (rankEl) {
    rankEl.textContent = getOperativeRank(gameState.currentCycle, gameState.currentLevel);
  }

  const streakFlame = document.getElementById('streak-flame');
  if (streakFlame) {
    if (gameState.streak >= 2) {
      streakFlame.classList.add('active');
    } else {
      streakFlame.classList.remove('active');
    }
  }

  updateRoadmap(gameState.currentLevel);
}

let feedbackTimeout = null;
function setFeedback(message, type = 'normal') {
  if (!feedbackBar) return;
  if (feedbackTimeout) clearTimeout(feedbackTimeout);
  feedbackBar.textContent = message;
  feedbackBar.className = 'feedback-bar';

  if (type === 'success') {
    feedbackBar.classList.add('flash-green');
  } else if (type === 'error') {
    feedbackBar.classList.add('flash-red');
  } else if (type === 'accent') {
    feedbackBar.classList.add('flash-purple');
  }

  feedbackTimeout = setTimeout(() => {
    feedbackBar.className = 'feedback-bar';
  }, 2500);
}

/* ======================================================== */
/* BOSS TIMER CONTROLLER                                    */
/* ======================================================== */
let bossInterval = null;
let bossTimeRemaining = 0;
let bossTotalTime = 15;
let bossTimerPaused = false;

function startBossTimer(onTimeUp) {
  stopBossTimer();
  if (bossBanner) bossBanner.style.display = 'flex';
  
  // 15 seconds initially, 15 - (currentCycle - 1) for subsequent, minimum 8
  bossTotalTime = Math.max(8, 15 - (gameState.currentCycle - 1));
  bossTimeRemaining = bossTotalTime;
  bossTimerPaused = false;

  const updateVisuals = () => {
    if (bossTimerDisplay) bossTimerDisplay.textContent = bossTimeRemaining.toFixed(1) + 's';
    const pct = Math.max(0, (bossTimeRemaining / bossTotalTime) * 100);
    if (bossTimerBar) bossTimerBar.style.width = pct + '%';
    if (bossBanner) {
      if (bossTimeRemaining <= 4 && bossTimeRemaining > 0) {
        bossBanner.classList.add('critical');
      } else {
        bossBanner.classList.remove('critical');
      }
    }
  };

  updateVisuals();
  const intervalMs = 100;
  bossInterval = setInterval(() => {
    if (bossTimerPaused) return;

    bossTimeRemaining -= intervalMs / 1000;
    if (bossTimeRemaining <= 3 && bossTimeRemaining > 0) {
      sound.playTick();
    }
    if (bossTimeRemaining <= 0) {
      bossTimeRemaining = 0;
      updateVisuals();
      stopBossTimer();
      if (onTimeUp) onTimeUp();
    } else {
      updateVisuals();
    }
  }, intervalMs);
}

function pauseBossTimer() {
  bossTimerPaused = true;
}

function resumeBossTimer() {
  bossTimerPaused = false;
}

function stopBossTimer() {
  if (bossInterval) {
    clearInterval(bossInterval);
    bossInterval = null;
  }
  bossTimerPaused = false;
  if (bossBanner) {
    bossBanner.style.display = 'none';
    bossBanner.classList.remove('critical');
  }
}

/* ======================================================== */
/* PARTICLE FX, FLOATING XP & SCREEN SHAKE                  */
/* ======================================================== */
function showFloatingXP(amount, isBoss = false, streakBonus = 0) {
  const el = document.createElement('div');
  el.className = 'floating-xp';
  let txt = `+${amount} XP`;
  if (isBoss) txt += ' 🔥 2X BOSS!';
  else if (streakBonus > 0) txt += ` ⚡ +${streakBonus} STREAK`;
  el.textContent = txt;
  document.body.appendChild(el);
  setTimeout(() => {
    if (el.parentNode) el.parentNode.removeChild(el);
  }, 1300);
}

function triggerShake() {
  const card = document.querySelector('.stage-card');
  if (card) {
    card.classList.remove('shake-error');
    void card.offsetWidth; // trigger reflow
    card.classList.add('shake-error');
    setTimeout(() => {
      card.classList.remove('shake-error');
    }, 450);
  }
}

function triggerConfetti() {
  const canvas = document.getElementById('fx-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#00F0FF', '#7B2CBF', '#FF007F', '#00FFB2', '#FFD700', '#FFFFFF'];
  const count = 60;

  for (let i = 0; i < count; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 160,
      y: canvas.height * 0.45 + (Math.random() - 0.5) * 60,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 1.2) * 14 - 4,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.25
    });
  }

  let frames = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = 0;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.38; // gravity
      p.vx *= 0.98; // air drag
      p.rotation += p.rotSpeed;
      p.alpha -= 0.015;

      if (p.alpha > 0) {
        alive++;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
    });

    frames++;
    if (alive > 0 && frames < 130) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  requestAnimationFrame(animate);
}

/* ======================================================== */
/* LEVEL CYCLE DISPATCHER                                   */
/* ======================================================== */
let activeMiniGameInstance = null;

function initCurrentLevel() {
  stopBossTimer();
  if (activeMiniGameInstance && typeof activeMiniGameInstance.destroy === 'function') {
    activeMiniGameInstance.destroy();
  }
  if (gameContainer) gameContainer.innerHTML = '';

  const lvl = gameState.currentLevel;

  // Trigger stage card entrance animation
  const stageCard = document.getElementById('active-stage-card');
  if (stageCard) {
    stageCard.classList.remove('stage-enter');
    void stageCard.offsetWidth;
    stageCard.classList.add('stage-enter');
  }

  // Tactical Briefings on first encounter of each domain
  if (lvl === 1 && !gameState.seenTutorials.level1) {
    showTutorial(1);
  } else if (lvl === 4 && !gameState.seenTutorials.level4) {
    showTutorial(4);
  } else if (lvl === 7 && !gameState.seenTutorials.level7) {
    showTutorial(7);
  } else if (lvl === 10 && !gameState.seenTutorials.level10) {
    showTutorial(10);
  }

  if (lvl >= 1 && lvl <= 3) {
    // Logic (Codebreaker)
    if (badgeDomain) {
      badgeDomain.textContent = 'Logic Protocol';
      badgeDomain.style.color = '#00F0FF';
    }
    if (stageTitle) stageTitle.textContent = `Codebreaker (Stage ${lvl}/3)`;
    if (stageObjective) stageObjective.textContent = 'Crack the 4-color security cipher';
    activeMiniGameInstance = new CodebreakerGame(false);
  } else if (lvl >= 4 && lvl <= 6) {
    // Memory (Sequence Recall)
    if (badgeDomain) {
      badgeDomain.textContent = 'Memory Protocol';
      badgeDomain.style.color = '#38BDF8';
    }
    if (stageTitle) stageTitle.textContent = `Sequence Recall (Stage ${lvl - 3}/3)`;
    if (stageObjective) stageObjective.textContent = 'Retain & reproduce neural sequence';
    activeMiniGameInstance = new SequenceRecallGame(false);
  } else if (lvl >= 7 && lvl <= 9) {
    // Spatial (Mental Rotation)
    if (badgeDomain) {
      badgeDomain.textContent = 'Spatial Protocol';
      badgeDomain.style.color = '#00FFB2';
    }
    if (stageTitle) stageTitle.textContent = `Mental Rotation (Stage ${lvl - 6}/3)`;
    if (stageObjective) stageObjective.textContent = 'Evaluate 3D rotational symmetry';
    activeMiniGameInstance = new MentalRotationGame(false);
  } else if (lvl === 10) {
    // Level 10: Boss Fight
    if (badgeDomain) {
      badgeDomain.textContent = '⚠️ BOSS OVERRIDE';
      badgeDomain.style.color = 'var(--error)';
    }
    if (stageTitle) stageTitle.textContent = `Boss Challenge - Cycle ${gameState.currentCycle}`;
    if (stageObjective) stageObjective.textContent = 'Neutralize before the breach countdown';

    // Random pick from the 3 mechanics
    const choices = ['logic', 'memory', 'spatial'];
    const chosen = choices[Math.floor(Math.random() * choices.length)];

    if (chosen === 'logic') {
      activeMiniGameInstance = new CodebreakerGame(true);
    } else if (chosen === 'memory') {
      activeMiniGameInstance = new SequenceRecallGame(true);
    } else {
      activeMiniGameInstance = new MentalRotationGame(true);
    }
  }

  updateHUD();
}

function handleLevelPassed(domain, xpEarned) {
  stopBossTimer();
  sound.playSuccess();

  const isBoss = gameState.currentLevel === 10;
  const streakBonus = gameState.streak >= 2 ? (gameState.streak - 1) * 15 : 0;
  const finalXP = (isBoss ? xpEarned * 2 : xpEarned) + streakBonus;

  gameState.totalXP += finalXP;
  gameState.streak += 1;
  if (domain && gameState.domainStats[domain]) {
    gameState.domainStats[domain].wins += 1;
  }

  // Trigger floating combo if on a streak
  if (gameState.streak >= 2) {
    showComboPopup(gameState.streak);
  }

  // Trigger floating XP and celebratory particle confetti
  showFloatingXP(finalXP, isBoss, streakBonus);
  triggerConfetti();

  setFeedback(`STAGE CLEARED! +${finalXP} XP ${isBoss ? '(2x Boss Bonus!)' : ''}`, 'success');

  setTimeout(() => {
    if (gameState.currentLevel === 10) {
      gameState.currentLevel = 1;
      gameState.currentCycle += 1;
      saveState();
      showCyclePromotionModal();
    } else {
      gameState.currentLevel += 1;
      saveState();
      initCurrentLevel();
    }
  }, 1500);
}

function handleLevelFailed(domain, failureReason = 'Breach Detected') {
  stopBossTimer();
  sound.playFailure();
  triggerShake();

  gameState.streak = 0;
  if (domain && gameState.domainStats[domain]) {
    gameState.domainStats[domain].losses += 1;
  }
  saveState();

  setFeedback(`${failureReason}. Streak Reset.`, 'error');

  setTimeout(() => {
    initCurrentLevel();
  }, 1800);
}

/* ======================================================== */
/* TACTICAL BRIEFINGS & ONBOARDING MODALS                   */
/* ======================================================== */
function showTutorial(level) {
  if (!modalTutorial) return;

  if (level === 1) {
    tutTitle.innerHTML = '<span>🧩</span> Logic: Codebreaker Protocol';
    tutContent.innerHTML = `
      <p>Deduce the hidden 4-color security cipher within the attempt limit.</p>
      <ul>
        <li>Select color tokens into the 4 slots and click <strong>Submit Guess</strong>.</li>
        <li><strong>Black Peg (⚫)</strong>: Correct color in the exact correct position.</li>
        <li><strong>White Peg (⚪)</strong>: Correct color present, but wrong position.</li>
        <li>Attempts allowed: <strong>${Math.max(6, 9 - gameState.currentCycle)}</strong>.</li>
      </ul>
    `;
    gameState.seenTutorials.level1 = true;
  } else if (level === 4) {
    tutTitle.innerHTML = '<span>⚡</span> Memory: Sequence Recall Protocol';
    tutContent.innerHTML = `
      <p>Observe the flashing circular pads and memorize the exact sequence pattern.</p>
      <ul>
        <li>Wait for the demonstration to finish playing.</li>
        <li>Tap the circular colored pads in the exact matching order.</li>
        <li>Each correct sequence increases length by 1.</li>
        <li>Reach target length <strong>${6 + gameState.currentCycle}</strong> to clear!</li>
      </ul>
    `;
    gameState.seenTutorials.level4 = true;
  } else if (level === 7) {
    tutTitle.innerHTML = '<span>📐</span> Spatial: Mental Rotation Protocol';
    tutContent.innerHTML = `
      <p>Inspect two isometric 3D block structures side-by-side.</p>
      <ul>
        <li>Determine if <strong>Structure B</strong> is an identical shape rotated in 3D space, or a different / mirrored shape.</li>
        <li>Click <strong>Yes (Same)</strong> or <strong>No (Different)</strong>.</li>
        <li>Achieve <strong>5 correct</strong> out of 7 trials to advance!</li>
      </ul>
    `;
    gameState.seenTutorials.level7 = true;
  } else if (level === 10) {
    tutTitle.innerHTML = '<span>🚨</span> LEVEL 10: BOSS PROTOCOL';
    tutContent.innerHTML = `
      <p>You have reached the cycle culmination combat test!</p>
      <ul>
        <li>A randomized cognitive domain mechanic will be deployed.</li>
        <li>A countdown timer is active (<strong>${Math.max(8, 15 - (gameState.currentCycle - 1))}s</strong>).</li>
        <li>Clear the challenge before the timer strikes zero for <strong>2x XP</strong> and cycle advancement!</li>
      </ul>
    `;
    gameState.seenTutorials.level10 = true;
  }
  saveState();
  pauseBossTimer();
  modalTutorial.classList.add('show');
}

function showCyclePromotionModal() {
  if (!modalTutorial) return;
  pauseBossTimer();
  tutTitle.innerHTML = '<span>🏆</span> CYCLE CONQUERED!';
  tutContent.innerHTML = `
    <p>Incredible performance! You have conquered <strong>Cycle ${gameState.currentCycle - 1}</strong>.</p>
    <p style="margin-top: 10px;">Cycle <strong>${gameState.currentCycle}</strong> is now engaged:</p>
    <ul>
      <li>Operative Rank upgraded to: <strong>${getOperativeRank(gameState.currentCycle, 1)}</strong>.</li>
      <li>Codebreaker palette expanded to <strong>${Math.min(6, 4 + gameState.currentCycle)}</strong> colors with tighter attempts.</li>
      <li>Memory sequence target raised to length <strong>${6 + gameState.currentCycle}</strong>.</li>
      <li>Boss countdown tightened.</li>
    </ul>
  `;
  modalTutorial.classList.add('show');
}

if (btnDismissTut) {
  btnDismissTut.addEventListener('click', () => {
    modalTutorial.classList.remove('show');
    resumeBossTimer();
    sound.playTone(520, 'sine', 0.1, 0.12);
    if (gameState.currentLevel === 1 && stageTitle && stageTitle.textContent.includes('Boss Challenge')) {
      initCurrentLevel();
    }
  });
}

if (btnHelp) {
  btnHelp.addEventListener('click', () => {
    showTutorial(gameState.currentLevel);
  });
}

/* ======================================================== */
/* OPERATIVE DOSSIER & COGNITIVE METRICS MODAL              */
/* ======================================================== */
function updateStatsModal() {
  const dossierRank = document.getElementById('dossier-rank');
  const dossierStatus = document.getElementById('dossier-status');
  if (dossierRank) {
    dossierRank.textContent = `${getOperativeRank(gameState.currentCycle, gameState.currentLevel)} OPERATIVE`;
  }
  if (dossierStatus) {
    dossierStatus.textContent = `Cycle ${gameState.currentCycle} • Level ${gameState.currentLevel} • ${gameState.totalXP} Total XP`;
  }

  const { logic, memory, spatial } = gameState.domainStats;
  const calcRate = (w, l) => {
    const total = w + l;
    if (total === 0) return '0%';
    return `${Math.round((w / total) * 100)}%`;
  };

  const rateLogic = document.getElementById('stat-rate-logic');
  const subLogic = document.getElementById('stat-sub-logic');
  if (rateLogic) rateLogic.textContent = calcRate(logic.wins, logic.losses);
  if (subLogic) subLogic.textContent = `${logic.wins}W / ${logic.losses}L`;

  const rateMemory = document.getElementById('stat-rate-memory');
  const subMemory = document.getElementById('stat-sub-memory');
  if (rateMemory) rateMemory.textContent = calcRate(memory.wins, memory.losses);
  if (subMemory) subMemory.textContent = `${memory.wins}W / ${memory.losses}L`;

  const rateSpatial = document.getElementById('stat-rate-spatial');
  const subSpatial = document.getElementById('stat-sub-spatial');
  if (rateSpatial) rateSpatial.textContent = calcRate(spatial.wins, spatial.losses);
  if (subSpatial) subSpatial.textContent = `${spatial.wins}W / ${spatial.losses}L`;
}

if (btnStats) {
  btnStats.addEventListener('click', () => {
    updateStatsModal();
    if (modalStats) modalStats.classList.add('show');
  });
}

if (btnCloseStats) {
  btnCloseStats.addEventListener('click', () => {
    if (modalStats) modalStats.classList.remove('show');
  });
}

if (btnResetData) {
  btnResetData.addEventListener('click', () => {
    if (confirm('Reset all DoMaiNiT operative dossier stats, levels, and progress to baseline?')) {
      localStorage.removeItem(STORAGE_KEY);
      for (const k of LEGACY_KEYS) localStorage.removeItem(k);
      gameState = { ...defaultGameState };
      saveState();
      if (modalStats) modalStats.classList.remove('show');
      setFeedback('Operative progress reset to baseline.', 'accent');
      initCurrentLevel();
    }
  });
}

if (btnSound) {
  btnSound.addEventListener('click', () => {
    sound.muted = !sound.muted;
    btnSound.textContent = sound.muted ? '🔇' : '🔊';
    setFeedback(sound.muted ? 'Audio Muted' : 'Audio Active', 'normal');
    if (!sound.muted) sound.playTone(440, 'sine', 0.1, 0.1);
  });
}

/* ======================================================== */
/* CLOUD ACCOUNT & DEVICE TRANSFER HANDLERS                 */
/* ======================================================== */
const cloudStatusEl = document.getElementById('cloud-status');
if (cloudStatusEl) {
  cloudStatusEl.addEventListener('click', () => {
    if (typeof cloudSync !== 'undefined') {
      cloudSync.pullSave();
      setFeedback('Checking Cloud Sync...', 'accent');
    }
  });
}

const btnCopyId = document.getElementById('btn-copy-id');
if (btnCopyId) {
  btnCopyId.addEventListener('click', () => {
    const idText = document.getElementById('player-cloud-id')?.textContent;
    if (idText && idText !== 'Connecting...') {
      navigator.clipboard.writeText(idText).then(() => {
        setFeedback('Operative ID copied to clipboard!', 'success');
        btnCopyId.textContent = 'Copied!';
        setTimeout(() => { btnCopyId.textContent = 'Copy'; }, 1800);
      }).catch(() => {
        prompt('Copy your Operative ID:', idText);
      });
    }
  });
}

const btnRestoreSave = document.getElementById('btn-restore-save');
const inputTransferId = document.getElementById('input-transfer-id');
if (btnRestoreSave && inputTransferId) {
  btnRestoreSave.addEventListener('click', () => {
    const targetId = inputTransferId.value.trim();
    if (!targetId) {
      alert('Please enter a valid Operative ID to restore.');
      return;
    }
    if (confirm(`Restore save data from Operative ID: ${targetId}? This will replace your current local progress.`)) {
      if (typeof cloudSync !== 'undefined') {
        cloudSync.restoreFromPlayerId(targetId);
      }
    }
  });
}

/* ======================================================== */
/* PWA SERVICE WORKER REGISTRATION                          */
/* ======================================================== */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      console.log('DoMaiNiT Service Worker registered:', reg.scope);
    }).catch((err) => {
      console.warn('Service Worker registration bypassed in local context:', err);
    });
  }
}

/* ======================================================== */
/* INITIALIZATION BOOTSTRAP                                 */
/* ======================================================== */
window.addEventListener('DOMContentLoaded', () => {
  loadState();
  initCurrentLevel();
  registerServiceWorker();

  // Initialize Cloud Sync in background
  if (typeof cloudSync !== 'undefined' && typeof cloudSync.init === 'function') {
    cloudSync.init();
  }
});
