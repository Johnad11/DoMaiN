/**
 * DoMaiNiT - Application Coordinator & 50-Level Dispatcher
 * Modern, offline-ready, responsive game engine.
 */

// DOM Elements
const hudLevel = document.getElementById('hud-level');
const hudSector = document.getElementById('hud-sector');
const hudXp = document.getElementById('hud-xp');
const hudStreak = document.getElementById('hud-streak');
const hudRank = document.getElementById('hud-rank');
const badgeDomain = document.getElementById('badge-domain');
const stageTitle = document.getElementById('stage-title');
const stageObjective = document.getElementById('stage-objective');
const feedbackBar = document.getElementById('feedback-bar');
const gameContainer = document.getElementById('minigame-container');
const bossBanner = document.getElementById('boss-banner');
const bossTimerDisplay = document.getElementById('boss-timer-display');
const bossTimerBar = document.getElementById('boss-timer-bar');

// Roadmap Elements
const roadmapSectorTitle = document.getElementById('roadmap-sector-title');
const roadmapOverallPct = document.getElementById('roadmap-overall-pct');
const overallBarFill = document.getElementById('overall-bar-fill');
const labelRoadLogic = document.getElementById('label-road-logic');
const labelRoadMemory = document.getElementById('label-road-memory');
const labelRoadSpatial = document.getElementById('label-road-spatial');
const labelRoadBoss = document.getElementById('label-road-boss');

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

const modalVictory = document.getElementById('modal-victory');
const btnVictoryPrestige = document.getElementById('btn-victory-prestige');
const victoryFinalXp = document.getElementById('victory-final-xp');

/* ======================================================== */
/* 50-LEVEL ARCHITECTURE & METADATA                         */
/* ======================================================== */
const SECTORS = [
  { id: 1, name: "Calibration Grid", range: [1, 10], boss: 10, desc: "Foundational pattern deduction & sensory tuning" },
  { id: 2, name: "Synaptic Surge", range: [11, 20], boss: 20, desc: "Higher frequency memory & 5-color logic ciphers" },
  { id: 3, name: "Deep Cognition", range: [21, 30], boss: 30, desc: "6-color code deduction & 3D compound rotations" },
  { id: 4, name: "Quantum Core", range: [31, 40], boss: 40, desc: "Rapid synaptic recall & chiral spatial puzzles" },
  { id: 5, name: "The Singularity", range: [41, 50], boss: 50, desc: "The ultimate 50-level cognitive pinnacle" }
];

function getCurrentSector(level) {
  const boundedLevel = Math.max(1, Math.min(50, level));
  return Math.min(5, Math.floor((boundedLevel - 1) / 10) + 1);
}

function getOperativeRank(level) {
  if (level <= 5) return 'CADET OPERATIVE';
  if (level <= 10) return 'SPECIALIST OPERATIVE';
  if (level <= 15) return 'CYBER INFILTRATOR';
  if (level <= 20) return 'SYNAPTIC STRIKER';
  if (level <= 25) return 'CIPHER MASTER';
  if (level <= 30) return 'NEURAL ARCHITECT';
  if (level <= 35) return 'QUANTUM OPERATIVE';
  if (level <= 40) return 'CORTEX VANGUARD';
  if (level <= 45) return 'SINGULARITY MASTER';
  return 'NEURAL OVERLORD';
}

function updateRoadmap(level) {
  const sectorNum = getCurrentSector(level);
  const sectorInfo = SECTORS[sectorNum - 1];
  const sectorStart = (sectorNum - 1) * 10 + 1;
  const withinSectorIdx = (level - 1) % 10; // 0 to 9

  // Update Sector Header
  if (roadmapSectorTitle) {
    roadmapSectorTitle.textContent = `SECTOR ${sectorNum}: ${sectorInfo.name.toUpperCase()}`;
  }

  // Update Overall Percentage
  const overallPercent = Math.min(100, Math.round((level / 50) * 100));
  if (roadmapOverallPct) {
    roadmapOverallPct.textContent = `Level ${level} of 50 • ${overallPercent}% Complete`;
  }
  if (overallBarFill) {
    overallBarFill.style.width = `${overallPercent}%`;
  }

  // Update Node Labels for Current Sector
  if (labelRoadLogic) labelRoadLogic.textContent = `${sectorStart}-${sectorStart + 2} LOGIC`;
  if (labelRoadMemory) labelRoadMemory.textContent = `${sectorStart + 3}-${sectorStart + 5} MEMORY`;
  if (labelRoadSpatial) labelRoadSpatial.textContent = `${sectorStart + 6}-${sectorStart + 8} SPATIAL`;
  if (labelRoadBoss) labelRoadBoss.textContent = `${sectorNum * 10} BOSS ⚠️`;

  // Highlight Active Step
  const stepLogic = document.getElementById('road-logic');
  const stepMemory = document.getElementById('road-memory');
  const stepSpatial = document.getElementById('road-spatial');
  const stepBoss = document.getElementById('road-boss');

  if (stepLogic) stepLogic.classList.toggle('active', withinSectorIdx >= 0 && withinSectorIdx <= 2);
  if (stepMemory) stepMemory.classList.toggle('active', withinSectorIdx >= 3 && withinSectorIdx <= 5);
  if (stepSpatial) stepSpatial.classList.toggle('active', withinSectorIdx >= 6 && withinSectorIdx <= 8);
  if (stepBoss) stepBoss.classList.toggle('active', withinSectorIdx === 9);
}

function updateHUD() {
  const lvl = gameState.currentLevel || 1;
  const sector = getCurrentSector(lvl);

  if (hudLevel) hudLevel.textContent = lvl;
  if (hudSector) hudSector.textContent = sector;
  if (hudXp) hudXp.textContent = (gameState.totalXP || 0).toLocaleString();
  if (hudStreak) hudStreak.textContent = gameState.streak || 0;

  if (hudRank) {
    hudRank.textContent = getOperativeRank(lvl);
  }

  const streakFlame = document.getElementById('streak-flame');
  if (streakFlame) {
    if ((gameState.streak || 0) >= 2) {
      streakFlame.classList.add('active');
    } else {
      streakFlame.classList.remove('active');
    }
  }

  updateRoadmap(lvl);
}

function showComboPopup(streak) {
  const el = document.createElement('div');
  el.className = 'combo-popup';
  el.innerHTML = `🔥 ${streak}X STREAK MULTIPLIER!`;
  document.body.appendChild(el);
  setTimeout(() => {
    if (el.parentNode) el.parentNode.removeChild(el);
  }, 1200);
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
  }, 3200);
}

/* ======================================================== */
/* BOSS TIMER CONTROLLER                                    */
/* ======================================================== */
let bossInterval = null;
let bossTimeRemaining = 0;
let bossTotalTime = 16;
let bossTimerPaused = false;

function startBossTimer(onTimeUp) {
  stopBossTimer();
  if (bossBanner) bossBanner.style.display = 'flex';

  const sector = getCurrentSector(gameState.currentLevel);
  // Sector 1: 16s, Sector 2: 14s, Sector 3: 12s, Sector 4: 10s, Sector 5: 8.5s
  const timesBySector = [16, 14, 12, 10, 8.5];
  bossTotalTime = timesBySector[sector - 1] || 10;
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
      if (typeof sound !== 'undefined') sound.playTick();
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
/* VISUAL EFFECTS & CELEBRATIONS                            */
/* ======================================================== */
function showFloatingXP(amount, isBoss = false, streakBonus = 0) {
  const el = document.createElement('div');
  el.className = 'floating-xp';
  let txt = `+${amount} XP`;
  if (isBoss) txt += ' 👑 2X BOSS!';
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
    void card.offsetWidth;
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
  const count = 65;

  for (let i = 0; i < count; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 180,
      y: canvas.height * 0.45 + (Math.random() - 0.5) * 80,
      vx: (Math.random() - 0.5) * 18,
      vy: (Math.random() - 1.2) * 15 - 4,
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
      p.vy += 0.38;
      p.vx *= 0.98;
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
/* 50-LEVEL DISPATCHER                                      */
/* ======================================================== */
let activeMiniGameInstance = null;

function initCurrentLevel() {
  stopBossTimer();
  if (activeMiniGameInstance && typeof activeMiniGameInstance.destroy === 'function') {
    activeMiniGameInstance.destroy();
  }
  if (gameContainer) gameContainer.innerHTML = '';

  const lvl = Math.max(1, Math.min(50, gameState.currentLevel || 1));
  const sector = getCurrentSector(lvl);
  const withinSectorIdx = (lvl - 1) % 10; // 0 to 9

  // Stage card entrance animation
  const stageCard = document.getElementById('active-stage-card');
  if (stageCard) {
    stageCard.classList.remove('stage-enter');
    void stageCard.offsetWidth;
    stageCard.classList.add('stage-enter');
  }

  // Show human onboarding tutorial on first encounter of each mechanic
  if (withinSectorIdx >= 0 && withinSectorIdx <= 2 && !gameState.seenTutorials.logic) {
    showTutorial('logic');
  } else if (withinSectorIdx >= 3 && withinSectorIdx <= 5 && !gameState.seenTutorials.memory) {
    showTutorial('memory');
  } else if (withinSectorIdx >= 6 && withinSectorIdx <= 8 && !gameState.seenTutorials.spatial) {
    showTutorial('spatial');
  } else if (withinSectorIdx === 9 && !gameState.seenTutorials.boss) {
    showTutorial('boss');
  }

  // Dispatch game according to level structure
  if (withinSectorIdx >= 0 && withinSectorIdx <= 2) {
    // Logic (Codebreaker)
    const stageInDomain = withinSectorIdx + 1;
    if (badgeDomain) {
      badgeDomain.textContent = 'Logic Protocol';
      badgeDomain.style.color = '#00F0FF';
    }
    if (stageTitle) stageTitle.textContent = `Codebreaker (Level ${lvl} of 50)`;
    if (stageObjective) stageObjective.textContent = 'Crack the secret 4-color code';
    activeMiniGameInstance = new CodebreakerGame(false);

  } else if (withinSectorIdx >= 3 && withinSectorIdx <= 5) {
    // Memory (Sequence Recall)
    const stageInDomain = withinSectorIdx - 2;
    if (badgeDomain) {
      badgeDomain.textContent = 'Memory Protocol';
      badgeDomain.style.color = '#38BDF8';
    }
    if (stageTitle) stageTitle.textContent = `Sequence Recall (Level ${lvl} of 50)`;
    if (stageObjective) stageObjective.textContent = 'Remember & repeat the light pattern';
    activeMiniGameInstance = new SequenceRecallGame(false);

  } else if (withinSectorIdx >= 6 && withinSectorIdx <= 8) {
    // Spatial (Mental Rotation)
    const stageInDomain = withinSectorIdx - 5;
    if (badgeDomain) {
      badgeDomain.textContent = 'Spatial Protocol';
      badgeDomain.style.color = '#00FFB2';
    }
    if (stageTitle) stageTitle.textContent = `Mental Rotation (Level ${lvl} of 50)`;
    if (stageObjective) stageObjective.textContent = 'Check if 3D shapes match';
    activeMiniGameInstance = new MentalRotationGame(false);

  } else if (withinSectorIdx === 9) {
    // Boss Battle (Levels 10, 20, 30, 40, 50)
    const sectorInfo = SECTORS[sector - 1];
    if (badgeDomain) {
      badgeDomain.textContent = `⚠️ SECTOR ${sector} BOSS OVERRIDE`;
      badgeDomain.style.color = 'var(--error)';
    }
    if (stageTitle) stageTitle.textContent = `Boss Challenge: ${sectorInfo.name} (Level ${lvl}/50)`;
    if (stageObjective) stageObjective.textContent = 'Clear the challenge before the countdown hits 0!';

    // Randomize domain for boss fight
    const domains = ['logic', 'memory', 'spatial'];
    const chosenDomain = domains[Math.floor(Math.random() * domains.length)];

    if (chosenDomain === 'logic') {
      activeMiniGameInstance = new CodebreakerGame(true);
    } else if (chosenDomain === 'memory') {
      activeMiniGameInstance = new SequenceRecallGame(true);
    } else {
      activeMiniGameInstance = new MentalRotationGame(true);
    }
  }

  updateHUD();
}

function handleLevelPassed(domain, xpEarned) {
  stopBossTimer();
  if (typeof sound !== 'undefined') sound.playSuccess();

  const lvl = gameState.currentLevel || 1;
  const isBoss = (lvl % 10 === 0);
  const streakBonus = (gameState.streak || 0) >= 2 ? (gameState.streak - 1) * 20 : 0;
  const finalXP = (isBoss ? xpEarned * 2 : xpEarned) + streakBonus;

  gameState.totalXP = (gameState.totalXP || 0) + finalXP;
  gameState.streak = (gameState.streak || 0) + 1;

  if (domain && gameState.domainStats && gameState.domainStats[domain]) {
    gameState.domainStats[domain].wins += 1;
  }

  if (gameState.streak >= 2) {
    showComboPopup(gameState.streak);
  }

  showFloatingXP(finalXP, isBoss, streakBonus);
  triggerConfetti();

  setFeedback(`LEVEL ${lvl} CLEARED! +${finalXP} XP ${isBoss ? '👑 (2x Boss Bonus!)' : ''}`, 'success');

  setTimeout(() => {
    if (lvl === 50) {
      // Game Beaten!
      showGrandVictoryModal();
    } else if (lvl % 10 === 0) {
      // Sector Boss Cleared!
      gameState.currentLevel += 1;
      gameState.sectorsUnlocked = Math.max(gameState.sectorsUnlocked || 1, getCurrentSector(gameState.currentLevel));
      saveState();
      showSectorClearModal(Math.floor(lvl / 10));
    } else {
      gameState.currentLevel += 1;
      saveState();
      initCurrentLevel();
    }
  }, 1600);
}

function handleLevelFailed(domain, failureReason = 'Challenge incomplete') {
  stopBossTimer();
  if (typeof sound !== 'undefined') sound.playFailure();
  triggerShake();

  gameState.streak = 0;
  if (domain && gameState.domainStats && gameState.domainStats[domain]) {
    gameState.domainStats[domain].losses += 1;
  }
  saveState();

  setFeedback(`${failureReason}. Take a breath and try again!`, 'error');

  setTimeout(() => {
    initCurrentLevel();
  }, 1900);
}

/* ======================================================== */
/* HUMAN-CENTERED INSTRUCTIONS & BRIEFINGS                  */
/* ======================================================== */
function showTutorial(domainOrLevel) {
  if (!modalTutorial) return;

  if (domainOrLevel === 'logic' || domainOrLevel === 1) {
    tutTitle.innerHTML = '<span>🧩</span> How to Play: Crack the Code';
    tutContent.innerHTML = `
      <p style="font-size: 0.95rem; margin-bottom: 12px;">
        A hidden combination of <strong>4 colors</strong> has been chosen. Use logic and deduction to crack it!
      </p>
      <div class="tut-guide-box">
        <strong>Simple Steps:</strong>
        <ol>
          <li>Click colors (or press keys <strong>1 to 6</strong>) to fill the 4 empty slots.</li>
          <li>Hit <strong>Submit</strong> (or press <strong>Enter</strong>).</li>
          <li>Look at your clue pegs to see how you did:
            <ul>
              <li>⚫ <strong>Black Peg</strong>: Right color in the <em>exact right spot</em>!</li>
              <li>⚪ <strong>White Peg</strong>: Right color, but it’s in the <em>wrong spot</em>.</li>
              <li>Empty: That color is not in the secret combination at all.</li>
            </ul>
          </li>
        </ol>
      </div>
      <p class="tut-tip-banner">
        💡 <strong>Pro Tip:</strong> On your first guess, try 4 completely different colors to quickly see which ones are part of the secret code!
      </p>
    `;
    gameState.seenTutorials.logic = true;

  } else if (domainOrLevel === 'memory' || domainOrLevel === 4) {
    tutTitle.innerHTML = '<span>⚡</span> How to Play: Pattern Recall';
    tutContent.innerHTML = `
      <p style="font-size: 0.95rem; margin-bottom: 12px;">
        Test and strengthen your memory by repeating light and sound sequences!
      </p>
      <div class="tut-guide-box">
        <strong>Simple Steps:</strong>
        <ol>
          <li>Watch the pads carefully while the hub says <strong>WATCH</strong>.</li>
          <li>Memorize the exact order the pads light up and chime.</li>
          <li>When it switches to <strong>YOUR TURN</strong>, tap the pads in that exact same order (or press keys <strong>1, 2, 3, 4</strong>).</li>
          <li>Clear the target pattern length to unlock the next level!</li>
        </ol>
      </div>
      <p class="tut-tip-banner">
        💡 <strong>Pro Tip:</strong> Say the colors or numbers quietly to yourself in rhythm (e.g., "Red, Blue, Yellow") to lock them into your memory!
      </p>
    `;
    gameState.seenTutorials.memory = true;

  } else if (domainOrLevel === 'spatial' || domainOrLevel === 7) {
    tutTitle.innerHTML = '<span>📐</span> How to Play: 3D Shape Match';
    tutContent.innerHTML = `
      <p style="font-size: 0.95rem; margin-bottom: 12px;">
        Train your spatial reasoning with 3D isometric structures!
      </p>
      <div class="tut-guide-box">
        <strong>Simple Steps:</strong>
        <ol>
          <li>Look at <strong>Shape A</strong> on the left, then examine <strong>Shape B</strong> on the right.</li>
          <li>Mentally rotate Shape A in your mind. Is Shape B the <em>exact same object</em> turned around in 3D?</li>
          <li>Click <strong>YES (Same Shape)</strong> or press <strong>← Left Arrow</strong> if it matches.</li>
          <li>Click <strong>NO (Different)</strong> or press <strong>→ Right Arrow</strong> if it was altered or mirrored.</li>
        </ol>
      </div>
      <p class="tut-tip-banner">
        💡 <strong>Pro Tip:</strong> Pick one distinctive colored corner or tip block and imagine where it would land if you rotated the shape!
      </p>
    `;
    gameState.seenTutorials.spatial = true;

  } else if (domainOrLevel === 'boss' || domainOrLevel === 10) {
    tutTitle.innerHTML = '<span>🚨</span> SECTOR BOSS PROTOCOL!';
    tutContent.innerHTML = `
      <p style="font-size: 0.95rem; margin-bottom: 12px;">
        You've reached the Sector Boss! This is your milestone exam.
      </p>
      <div class="tut-guide-box">
        <ul>
          <li>A randomized test from Logic, Memory, or Spatial will be deployed.</li>
          <li>A live countdown timer will be running at the top!</li>
          <li>Beat the challenge before the countdown expires to earn <strong>DOUBLE XP</strong> and unlock the next Sector!</li>
        </ul>
      </div>
    `;
    gameState.seenTutorials.boss = true;
  }

  saveState();
  pauseBossTimer();
  if (btnDismissTut) btnDismissTut.textContent = 'Return';
  modalTutorial.classList.add('show');
}

function showSectorClearModal(completedSectorNum) {
  if (!modalTutorial) return;
  pauseBossTimer();
  const nextSector = SECTORS[completedSectorNum]; // 0-indexed next
  tutTitle.innerHTML = '<span>🏆</span> SECTOR CONQUERED!';
  tutContent.innerHTML = `
    <div style="text-align: center; margin: 10px 0;">
      <div style="font-size: 2.4rem;">🎉</div>
      <h3 style="color: var(--accent); margin: 6px 0;">SECTOR ${completedSectorNum} COMPLETE!</h3>
      <p style="font-size: 0.95rem; color: var(--text-muted); margin-bottom: 12px;">
        You conquered all 10 levels of Sector ${completedSectorNum}. Outstanding cognitive endurance!
      </p>
      ${nextSector ? `
        <div style="background: rgba(0, 240, 255, 0.08); padding: 12px; border-radius: 8px; border: 1px solid var(--surface-border); text-align: left;">
          <div style="font-weight: 700; color: #FFF; font-size: 0.9rem;">ENTERING SECTOR ${nextSector.id}: ${nextSector.name.toUpperCase()}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">${nextSector.desc}</div>
          <div style="font-size: 0.8rem; color: var(--success); margin-top: 6px;">Rank Status: ${getOperativeRank(gameState.currentLevel)}</div>
        </div>
      ` : ''}
    </div>
  `;
  if (btnDismissTut) btnDismissTut.textContent = 'Continue to Next Sector ⚡';
  modalTutorial.classList.add('show');
}

function showGrandVictoryModal() {
  if (modalVictory) {
    if (victoryFinalXp) victoryFinalXp.textContent = (gameState.totalXP || 0).toLocaleString() + ' XP';
    modalVictory.classList.add('show');
    triggerConfetti();
  }
}

if (btnVictoryPrestige) {
  btnVictoryPrestige.addEventListener('click', () => {
    modalVictory.classList.remove('show');
    gameState.currentLevel = 1;
    gameState.currentCycle = (gameState.currentCycle || 1) + 1;
    saveState();
    setFeedback(`Prestige Cycle ${gameState.currentCycle} Engaged! Good luck, Overlord!`, 'accent');
    initCurrentLevel();
  });
}

if (btnDismissTut) {
  btnDismissTut.addEventListener('click', () => {
    modalTutorial.classList.remove('show');
    btnDismissTut.textContent = 'Return';
    resumeBossTimer();
    if (typeof sound !== 'undefined') sound.playTone(520, 'sine', 0.1, 0.12);
  });
}

if (btnHelp) {
  btnHelp.addEventListener('click', () => {
    const lvl = gameState.currentLevel || 1;
    const withinSectorIdx = (lvl - 1) % 10;
    if (withinSectorIdx >= 0 && withinSectorIdx <= 2) showTutorial('logic');
    else if (withinSectorIdx >= 3 && withinSectorIdx <= 5) showTutorial('memory');
    else if (withinSectorIdx >= 6 && withinSectorIdx <= 8) showTutorial('spatial');
    else showTutorial('boss');
  });
}

/* ======================================================== */
/* OPERATIVE DOSSIER & 50-LEVEL METRICS                     */
/* ======================================================== */
function updateStatsModal() {
  const lvl = gameState.currentLevel || 1;
  const sector = getCurrentSector(lvl);

  const dossierRank = document.getElementById('dossier-rank');
  const dossierStatus = document.getElementById('dossier-status');
  if (dossierRank) {
    dossierRank.textContent = getOperativeRank(lvl);
  }
  if (dossierStatus) {
    dossierStatus.textContent = `Level ${lvl} of 50 • Sector ${sector}/5 • ${(gameState.totalXP || 0).toLocaleString()} Total XP`;
  }

  // Render 5-Sector Grid in Dossier
  const sectorsGrid = document.getElementById('dossier-sectors-grid');
  if (sectorsGrid) {
    sectorsGrid.innerHTML = SECTORS.map(s => {
      const isCompleted = lvl > s.boss;
      const isCurrent = sector === s.id;
      const isLocked = lvl < s.range[0];

      let statusBadge = isCompleted ? '✅ CLEARED' : (isCurrent ? '⚡ CURRENT' : '🔒 LOCKED');
      return `
        <div class="dossier-sector-card ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''}">
          <div class="sector-card-num">SECTOR ${s.id}</div>
          <div class="sector-card-name">${s.name}</div>
          <div class="sector-card-levels">Levels ${s.range[0]}-${s.range[1]}</div>
          <div class="sector-card-status">${statusBadge}</div>
        </div>
      `;
    }).join('');
  }

  // Domain Win Rates
  const { logic, memory, spatial } = gameState.domainStats || {
    logic: { wins: 0, losses: 0 },
    memory: { wins: 0, losses: 0 },
    spatial: { wins: 0, losses: 0 }
  };

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
    if (confirm('Are you sure you want to reset all progress back to Level 1?')) {
      localStorage.removeItem(STORAGE_KEY);
      for (const k of LEGACY_KEYS) localStorage.removeItem(k);
      gameState = { ...defaultGameState };
      saveState();
      if (modalStats) modalStats.classList.remove('show');
      setFeedback('Progress reset to Level 1 baseline.', 'accent');
      initCurrentLevel();
    }
  });
}

if (btnSound) {
  btnSound.addEventListener('click', () => {
    if (typeof sound !== 'undefined') {
      sound.muted = !sound.muted;
      btnSound.textContent = sound.muted ? '🔇' : '🔊';
      setFeedback(sound.muted ? 'Audio Muted' : 'Audio Active', 'normal');
      if (!sound.muted) sound.playTone(440, 'sine', 0.1, 0.1);
    }
  });
}

/* ======================================================== */
/* SERVICE WORKER REGISTRATION (OFFLINE CACHING)            */
/* ======================================================== */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      console.log('DoMaiNiT Service Worker registered for offline play:', reg.scope);
    }).catch((err) => {
      console.warn('Service Worker note:', err);
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
});
