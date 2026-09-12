/**
 * DoMaiNiT - Logic Protocol: Codebreaker
 * Deduce a 4-color secret code with Black & White clue pegs.
 * Scaled across 50 levels with tactile undo and keyboard shortcuts.
 */
class CodebreakerGame {
  constructor(isBoss = false) {
    this.isBoss = isBoss;
    const lvl = gameState.currentLevel || 1;
    const sector = Math.min(5, Math.floor((lvl - 1) / 10) + 1);

    this.paletteColors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
    this.colorNames = ['Red', 'Blue', 'Green', 'Amber', 'Purple', 'Pink'];

    // Palette size: 4 in Sector 1, 5 in Sector 2, 6 in Sectors 3-5
    if (sector === 1) {
      this.activePaletteSize = 4;
    } else if (sector === 2) {
      this.activePaletteSize = 5;
    } else {
      this.activePaletteSize = 6;
    }
    this.availableColors = this.paletteColors.slice(0, this.activePaletteSize);

    // Max attempts scale down smoothly across 50 levels
    if (isBoss) {
      this.maxAttempts = Math.max(6, 8 - Math.floor((sector - 1) * 0.5));
    } else if (sector === 1) {
      this.maxAttempts = 9;
    } else if (sector === 2) {
      this.maxAttempts = 8;
    } else if (sector === 3) {
      this.maxAttempts = 8;
    } else if (sector === 4) {
      this.maxAttempts = 7;
    } else {
      this.maxAttempts = 6;
    }

    this.attemptsUsed = 0;

    // Generate secret random code of 4 colors from available palette
    this.secretCode = [];
    for (let i = 0; i < 4; i++) {
      const randColor = this.availableColors[Math.floor(Math.random() * this.availableColors.length)];
      this.secretCode.push(randColor);
    }

    this.currentGuess = [null, null, null, null];
    this.selectedSlotIndex = 0;
    this.history = [];

    this.handleKeyDown = this.handleKeyDown.bind(this);
    window.addEventListener('keydown', this.handleKeyDown);

    this.render();

    if (this.isBoss) {
      startBossTimer(() => {
        handleLevelFailed('logic', 'Time ran out before cracking the code!');
      });
    }
  }

  handleKeyDown(e) {
    // 1-6 keys for palette colors
    const keyNum = parseInt(e.key, 10);
    if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= this.activePaletteSize) {
      const chosenColor = this.availableColors[keyNum - 1];
      this.placeColor(chosenColor);
      return;
    }

    if (e.key === 'Backspace') {
      this.undoLastSlot();
      return;
    }

    if (e.key === 'Enter') {
      this.submitGuess();
      return;
    }
  }

  placeColor(color) {
    this.currentGuess[this.selectedSlotIndex] = color;
    if (typeof sound !== 'undefined') {
      sound.playTone(500 + this.selectedSlotIndex * 70, 'sine', 0.08, 0.12);
    }

    const filledIndex = this.selectedSlotIndex;
    // Auto-advance to next empty slot
    let nextEmpty = -1;
    for (let i = 0; i < 4; i++) {
      if (this.currentGuess[i] === null) {
        nextEmpty = i;
        break;
      }
    }
    this.selectedSlotIndex = nextEmpty !== -1 ? nextEmpty : Math.min(3, filledIndex + 1);

    this.render();

    const updatedSlot = document.querySelector(`.guess-slot[data-slot="${filledIndex}"]`);
    if (updatedSlot) {
      updatedSlot.classList.add('pop');
    }
  }

  undoLastSlot() {
    // Find last filled slot
    for (let i = 3; i >= 0; i--) {
      if (this.currentGuess[i] !== null) {
        this.currentGuess[i] = null;
        this.selectedSlotIndex = i;
        this.render();
        return;
      }
    }
  }

  render() {
    const container = document.getElementById('minigame-container');
    if (!container) return;

    const remainingAttempts = this.maxAttempts - this.attemptsUsed;
    const isLowAttempts = remainingAttempts <= 2;

    container.innerHTML = `
      <div class="codebreaker-area">
        <!-- Status Bar -->
        <div class="game-meta-row">
          <span>Attempts Left: <strong style="color: ${isLowAttempts ? 'var(--error)' : 'var(--accent)'};">${remainingAttempts}</strong> / ${this.maxAttempts}</span>
          <span>Color Choices: <strong>${this.activePaletteSize}</strong></span>
        </div>

        <!-- Clue Legend helper -->
        <div class="clue-legend-bar">
          <span class="legend-item"><span class="feedback-dot black"></span> Right Color & Exact Spot</span>
          <span class="legend-sep">•</span>
          <span class="legend-item"><span class="feedback-dot white"></span> Right Color, Wrong Spot</span>
        </div>

        <!-- History Board -->
        <div class="history-board" id="cb-history">
          ${this.renderHistoryRows()}
        </div>

        <!-- Current Active Guess Slots -->
        <div class="active-guess-section">
          <div class="slots-label">YOUR CURRENT GUESS:</div>
          <div class="active-guess-row">
            ${[0, 1, 2, 3].map(i => `
              <div class="guess-slot ${this.selectedSlotIndex === i ? 'selected' : ''}" 
                   data-slot="${i}" 
                   title="Slot ${i + 1}"
                   style="background-color: ${this.currentGuess[i] || 'transparent'};">
                ${!this.currentGuess[i] ? `<span class="slot-placeholder">${i + 1}</span>` : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Color Palette Picker -->
        <div class="palette-picker-wrapper">
          <div class="palette-label">CHOOSE A COLOR:</div>
          <div class="palette-picker">
            ${this.availableColors.map((c, idx) => `
              <button class="palette-color-btn" 
                      data-color="${c}" 
                      style="background-color: ${c};" 
                      title="${this.colorNames[idx]} (Press ${idx + 1})">
                <span class="key-hint">${idx + 1}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="game-action-row">
          <button class="btn btn-secondary" id="cb-btn-undo" title="Undo last color">
            ↩ Undo
          </button>
          <button class="btn btn-secondary" id="cb-btn-clear" title="Clear all slots">
            Clear
          </button>
          <button class="btn btn-primary" id="cb-btn-submit" title="Check your combination">
            Submit
          </button>
        </div>
      </div>
    `;

    // Auto scroll history board to latest guess
    const histEl = document.getElementById('cb-history');
    if (histEl) histEl.scrollTop = histEl.scrollHeight;

    // Slot click listeners
    document.querySelectorAll('.guess-slot').forEach(el => {
      el.addEventListener('click', () => {
        this.selectedSlotIndex = parseInt(el.getAttribute('data-slot'), 10);
        this.render();
      });
    });

    // Palette color selection
    document.querySelectorAll('.palette-color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const color = btn.getAttribute('data-color');
        this.placeColor(color);
      });
    });

    // Undo button
    document.getElementById('cb-btn-undo')?.addEventListener('click', () => {
      this.undoLastSlot();
    });

    // Clear guess button
    document.getElementById('cb-btn-clear')?.addEventListener('click', () => {
      this.currentGuess = [null, null, null, null];
      this.selectedSlotIndex = 0;
      this.render();
    });

    // Submit guess button
    document.getElementById('cb-btn-submit')?.addEventListener('click', () => {
      this.submitGuess();
    });
  }

  renderHistoryRows() {
    if (this.history.length === 0) {
      return `
        <div class="history-empty">
          <p>🎯 <strong>Pick 4 colors</strong> above and click <strong>Submit</strong>.</p>
          <p class="history-empty-sub">Clue pegs will show how close your guess was!</p>
        </div>
      `;
    }
    return this.history.map((entry, idx) => `
      <div class="history-row">
        <span class="attempt-number">#${idx + 1}</span>
        <div class="peg-group">
          ${entry.guess.map(col => `<div class="color-peg" style="background-color: ${col};"></div>`).join('')}
        </div>
        <div class="feedback-pegs" title="${entry.black} exact spots, ${entry.white} wrong spots">
          ${Array(entry.black).fill(0).map(() => `<div class="feedback-dot black" title="Exact match (right color & right spot)"></div>`).join('')}
          ${Array(entry.white).fill(0).map(() => `<div class="feedback-dot white" title="Color exists, but in wrong spot"></div>`).join('')}
          ${Array(Math.max(0, 4 - entry.black - entry.white)).fill(0).map(() => `<div class="feedback-dot miss" title="Not in the secret code"></div>`).join('')}
        </div>
      </div>
    `).join('');
  }

  submitGuess() {
    if (this.currentGuess.some(c => c === null)) {
      setFeedback('⚠️ Please fill all 4 color slots before submitting!', 'error');
      if (typeof sound !== 'undefined') sound.playTone(220, 'sawtooth', 0.15, 0.15);
      return;
    }

    this.attemptsUsed++;

    // Calculate Black & White feedback pegs without double counting
    let black = 0;
    let white = 0;
    const secretCopy = [...this.secretCode];
    const guessCopy = [...this.currentGuess];

    // First pass: exact matches (black pegs)
    for (let i = 0; i < 4; i++) {
      if (guessCopy[i] === secretCopy[i]) {
        black++;
        secretCopy[i] = null;
        guessCopy[i] = null;
      }
    }

    // Second pass: color matches in wrong positions (white pegs)
    for (let i = 0; i < 4; i++) {
      if (guessCopy[i] !== null) {
        const foundIndex = secretCopy.indexOf(guessCopy[i]);
        if (foundIndex !== -1) {
          white++;
          secretCopy[foundIndex] = null;
        }
      }
    }

    this.history.push({
      guess: [...this.currentGuess],
      black,
      white
    });

    // Check win condition
    if (black === 4) {
      const bonusXP = (this.maxAttempts - this.attemptsUsed + 1) * 25;
      setFeedback(`🎉 Incredible deduction! Secret code cracked in ${this.attemptsUsed} attempt${this.attemptsUsed > 1 ? 's' : ''}!`, 'success');
      handleLevelPassed('logic', 120 + bonusXP);
      return;
    }

    // Check loss condition
    if (this.attemptsUsed >= this.maxAttempts) {
      const colorDisplay = this.secretCode.map(c => {
        const idx = this.paletteColors.indexOf(c);
        return this.colorNames[idx] || 'Color';
      }).join(', ');
      setFeedback(`Out of attempts! The code was: ${colorDisplay}. You've got this, try again!`, 'error');
      handleLevelFailed('logic', 'Code cracking attempts exhausted');
      return;
    }

    if (typeof sound !== 'undefined') sound.playTone(340, 'triangle', 0.12, 0.1);
    
    // Human, friendly feedback message
    let clueMsg = '';
    if (black === 0 && white === 0) {
      clueMsg = 'None of those colors are in the code!';
    } else {
      const parts = [];
      if (black > 0) parts.push(`${black} in the exact spot ⚫`);
      if (white > 0) parts.push(`${white} right color in wrong spot ⚪`);
      clueMsg = parts.join(', ');
    }
    setFeedback(`Clues: ${clueMsg}`, 'normal');
    if (typeof triggerShake === 'function') triggerShake();

    // Reset current guess for next attempt
    this.currentGuess = [null, null, null, null];
    this.selectedSlotIndex = 0;
    this.render();
  }

  destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
  }
}
