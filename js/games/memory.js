/**
 * DoMaiNiT - Memory Protocol: Sequence Recall
 * Four vibrant colored pads with progressive pattern retention.
 * Scaled smoothly across 50 levels with tactile keyboard controls and human cues.
 */
class SequenceRecallGame {
  constructor(isBoss = false) {
    this.isBoss = isBoss;
    const lvl = gameState.currentLevel || 1;
    const sector = Math.min(5, Math.floor((lvl - 1) / 10) + 1);

    // Sequence length progression by Sector (Levels 1 to 50)
    if (sector === 1) {
      this.currentSequenceLength = 3;
      this.targetSequenceLength = 5;
      this.flashDuration = 360;
      this.stepInterval = 520;
    } else if (sector === 2) {
      this.currentSequenceLength = 3;
      this.targetSequenceLength = 6;
      this.flashDuration = 320;
      this.stepInterval = 460;
    } else if (sector === 3) {
      this.currentSequenceLength = 4;
      this.targetSequenceLength = 7;
      this.flashDuration = 280;
      this.stepInterval = 400;
    } else if (sector === 4) {
      this.currentSequenceLength = 4;
      this.targetSequenceLength = 8;
      this.flashDuration = 240;
      this.stepInterval = 350;
    } else {
      // Sector 5: Singularity Mastery
      this.currentSequenceLength = 5;
      this.targetSequenceLength = 9;
      this.flashDuration = 210;
      this.stepInterval = 310;
    }

    if (this.isBoss) {
      this.flashDuration = Math.max(180, this.flashDuration - 60);
      this.stepInterval = Math.max(260, this.stepInterval - 80);
    }

    this.sequence = [];
    this.playerInputIndex = 0;
    this.isDemonstrating = false;

    this.handleKeyDown = this.handleKeyDown.bind(this);
    window.addEventListener('keydown', this.handleKeyDown);

    this.render();
    this.generateAndPlaySequence();

    if (this.isBoss) {
      startBossTimer(() => {
        handleLevelFailed('memory', 'Time expired before completing the sequence!');
      });
    }
  }

  handleKeyDown(e) {
    if (this.isDemonstrating) return;
    // Map keys 1-4 or Q, W, A, S
    let padIndex = -1;
    if (e.key === '1' || e.key.toLowerCase() === 'q') padIndex = 0;
    else if (e.key === '2' || e.key.toLowerCase() === 'w') padIndex = 1;
    else if (e.key === '3' || e.key.toLowerCase() === 'a') padIndex = 2;
    else if (e.key === '4' || e.key.toLowerCase() === 's') padIndex = 3;

    if (padIndex !== -1) {
      this.handlePadClick(padIndex);
    }
  }

  render() {
    const container = document.getElementById('minigame-container');
    if (!container) return;

    container.innerHTML = `
      <div class="memory-area">
        <!-- Progress Row -->
        <div class="game-meta-row">
          <span>Pattern Length: <strong style="color: var(--accent);">${this.currentSequenceLength}</strong></span>
          <span>Goal to Clear: <strong>${this.targetSequenceLength} Steps</strong></span>
        </div>

        <!-- 4-Pad Grid -->
        <div class="memory-pad-grid">
          <button class="memory-pad pad-red" data-pad="0" title="Red (Press 1 or Q)">
            <span class="pad-num-hint">1</span>
          </button>
          <button class="memory-pad pad-blue" data-pad="1" title="Blue (Press 2 or W)">
            <span class="pad-num-hint">2</span>
          </button>
          <button class="memory-pad pad-green" data-pad="2" title="Green (Press 3 or A)">
            <span class="pad-num-hint">3</span>
          </button>
          <button class="memory-pad pad-yellow" data-pad="3" title="Yellow (Press 4 or S)">
            <span class="pad-num-hint">4</span>
          </button>
          <div class="memory-center-hub" id="memory-hub-text">
            <span>👀</span>
            <span class="hub-label">WATCH</span>
          </div>
        </div>

        <!-- Human instructions banner -->
        <div class="memory-prompt-box" id="memory-instruction">
          👀 Watch closely as the pads light up in order...
        </div>

        <!-- Progress step dots -->
        <div class="memory-steps-indicator" id="memory-step-dots">
          ${Array(this.currentSequenceLength).fill(0).map((_, i) => `
            <span class="step-circle ${i < this.playerInputIndex ? 'done' : ''}"></span>
          `).join('')}
        </div>
      </div>
    `;

    document.querySelectorAll('.memory-pad').forEach(pad => {
      pad.addEventListener('click', () => {
        const padIndex = parseInt(pad.getAttribute('data-pad'), 10);
        this.handlePadClick(padIndex);
      });
    });
  }

  generateAndPlaySequence() {
    this.isDemonstrating = true;
    if (this.isBoss && typeof pauseBossTimer === 'function') {
      pauseBossTimer();
    }
    this.playerInputIndex = 0;
    this.updateHub('👀', 'WATCH');
    this.updateInstruction('Watch the pattern carefully and memorize the order.');

    // Build random sequence of current length
    this.sequence = [];
    for (let i = 0; i < this.currentSequenceLength; i++) {
      this.sequence.push(Math.floor(Math.random() * 4));
    }

    let step = 0;
    const playNextStep = () => {
      if (step >= this.sequence.length) {
        setTimeout(() => {
          this.isDemonstrating = false;
          if (this.isBoss && typeof resumeBossTimer === 'function') {
            resumeBossTimer();
          }
          this.updateHub('👉', 'YOUR TURN');
          this.updateInstruction('Your turn! Tap the pads in the exact same order.');
          setFeedback('Your turn! Replicate the sequence.', 'accent');
          this.updateDots();
        }, 300);
        return;
      }

      const padIndex = this.sequence[step];
      this.flashPad(padIndex, this.flashDuration);
      step++;
      setTimeout(playNextStep, this.stepInterval);
    };

    setTimeout(playNextStep, 500);
  }

  flashPad(padIndex, duration = 300) {
    if (typeof sound !== 'undefined') sound.playMemoryPad(padIndex);
    const padEl = document.querySelector(`.memory-pad[data-pad="${padIndex}"]`);
    if (padEl) {
      padEl.classList.add('lit');
      setTimeout(() => {
        padEl.classList.remove('lit');
      }, duration);
    }
  }

  handlePadClick(padIndex) {
    if (this.isDemonstrating) return;

    this.flashPad(padIndex, 180);

    // Verify pad with current step in sequence
    if (padIndex === this.sequence[this.playerInputIndex]) {
      this.playerInputIndex++;
      this.updateDots();

      // Current sequence length cleared
      if (this.playerInputIndex === this.sequence.length) {
        if (typeof sound !== 'undefined') sound.playTone(620, 'sine', 0.15, 0.15);

        if (this.currentSequenceLength >= this.targetSequenceLength) {
          // Win level
          this.updateHub('🎉', 'PERFECT');
          setFeedback(`Great memory! You mastered a sequence of ${this.targetSequenceLength} steps!`, 'success');
          handleLevelPassed('memory', 130 + this.currentSequenceLength * 15);
        } else {
          this.updateHub('✨', 'GREAT');
          setFeedback(`Length ${this.currentSequenceLength} cleared! Getting ready for length ${this.currentSequenceLength + 1}...`, 'success');
          this.currentSequenceLength++;
          setTimeout(() => {
            this.render();
            this.generateAndPlaySequence();
          }, 800);
        }
      }
    } else {
      // Mistake made
      this.updateHub('❌', 'OOPS');
      setFeedback('Sequence broken! Don’t worry, lock in your focus and try again!', 'error');
      if (typeof triggerShake === 'function') triggerShake();
      handleLevelFailed('memory', 'Memory pattern missed');
    }
  }

  updateHub(icon, text) {
    const hub = document.getElementById('memory-hub-text');
    if (hub) {
      hub.innerHTML = `<span>${icon}</span><span class="hub-label">${text}</span>`;
    }
  }

  updateInstruction(text) {
    const inst = document.getElementById('memory-instruction');
    if (inst) inst.textContent = text;
  }

  updateDots() {
    const dotsContainer = document.getElementById('memory-step-dots');
    if (dotsContainer) {
      dotsContainer.innerHTML = Array(this.currentSequenceLength).fill(0).map((_, i) => `
        <span class="step-circle ${i < this.playerInputIndex ? 'done' : (i === this.playerInputIndex && !this.isDemonstrating ? 'current' : '')}"></span>
      `).join('');
    }
  }

  destroy() {
    this.isDemonstrating = false;
    window.removeEventListener('keydown', this.handleKeyDown);
  }
}
