/**
 * DoMaiN - Logic Protocol: Codebreaker
 * Deduce a 4-color security cipher with Black & White feedback pegs.
 */
class CodebreakerGame {
  constructor(isBoss = false) {
    this.isBoss = isBoss;
    this.paletteColors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4'];
    // Palette size = 4 + currentCycle (max 6)
    this.activePaletteSize = Math.min(6, 4 + gameState.currentCycle);
    this.availableColors = this.paletteColors.slice(0, this.activePaletteSize);

    // Win condition: Guess correctly within 9 - currentCycle attempts (min 6)
    this.maxAttempts = Math.max(6, 9 - gameState.currentCycle);
    this.attemptsUsed = 0;

    // Generate secret random code of 4 colors
    this.secretCode = [];
    for (let i = 0; i < 4; i++) {
      const randColor = this.availableColors[Math.floor(Math.random() * this.availableColors.length)];
      this.secretCode.push(randColor);
    }

    this.currentGuess = [null, null, null, null];
    this.selectedSlotIndex = 0;
    this.history = [];

    this.render();

    if (this.isBoss) {
      startBossTimer(() => {
        handleLevelFailed('logic', 'Boss Countdown Expired');
      });
    }
  }

  render() {
    const container = document.getElementById('minigame-container');
    if (!container) return;

    container.innerHTML = `
      <div class="codebreaker-area">
        <div style="font-size: 0.9rem; color: var(--text-muted); display: flex; justify-content: space-between; width: 100%;">
          <span>Attempts remaining: <strong style="color: var(--accent);">${this.maxAttempts - this.attemptsUsed}</strong></span>
          <span>Palette: <strong>${this.activePaletteSize} Colors</strong></span>
        </div>

        <div class="history-board" id="cb-history">
          ${this.renderHistoryRows()}
        </div>

        <div class="active-guess-row">
          ${[0, 1, 2, 3].map(i => `
            <div class="guess-slot ${this.selectedSlotIndex === i ? 'selected' : ''}" 
                 data-slot="${i}" 
                 style="background-color: ${this.currentGuess[i] || 'transparent'};">
            </div>
          `).join('')}
        </div>

        <div class="palette-picker">
          ${this.availableColors.map(c => `
            <button class="palette-color-btn" data-color="${c}" style="background-color: ${c};" title="Select color"></button>
          `).join('')}
        </div>

        <div style="display: flex; gap: 12px; width: 100%; max-width: 320px;">
          <button class="btn btn-secondary" id="cb-btn-clear" style="flex: 1;">Clear</button>
          <button class="btn btn-primary" id="cb-btn-submit" style="flex: 2;">Submit Guess</button>
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
        this.currentGuess[this.selectedSlotIndex] = color;
        sound.playTone(500 + this.selectedSlotIndex * 80, 'sine', 0.1, 0.1);
        
        // Auto-advance to next empty slot
        const filledIndex = this.selectedSlotIndex;
        for (let i = 0; i < 4; i++) {
          if (this.currentGuess[i] === null) {
            this.selectedSlotIndex = i;
            break;
          }
        }
        this.render();
        // Add pop bounce to the slot that was just filled
        const updatedSlot = document.querySelector(`.guess-slot[data-slot="${filledIndex}"]`);
        if (updatedSlot) {
          updatedSlot.classList.add('pop');
        }
      });
    });

    // Clear guess button
    document.getElementById('cb-btn-clear').addEventListener('click', () => {
      this.currentGuess = [null, null, null, null];
      this.selectedSlotIndex = 0;
      this.render();
    });

    // Submit guess button
    document.getElementById('cb-btn-submit').addEventListener('click', () => {
      this.submitGuess();
    });
  }

  renderHistoryRows() {
    if (this.history.length === 0) {
      return `<div style="text-align: center; color: var(--text-muted); padding: 20px; font-size: 0.9rem;">Submit your first 4-color hypothesis above.</div>`;
    }
    return this.history.map((entry, idx) => `
      <div class="history-row">
        <span class="attempt-number">#${idx + 1}</span>
        <div class="peg-group">
          ${entry.guess.map(col => `<div class="color-peg" style="background-color: ${col};"></div>`).join('')}
        </div>
        <div class="feedback-pegs">
          ${Array(entry.black).fill(0).map(() => `<div class="feedback-dot black" title="Exact match"></div>`).join('')}
          ${Array(entry.white).fill(0).map(() => `<div class="feedback-dot white" title="Color match"></div>`).join('')}
          ${Array(Math.max(0, 4 - entry.black - entry.white)).fill(0).map(() => `<div class="feedback-dot" title="Miss"></div>`).join('')}
        </div>
      </div>
    `).join('');
  }

  submitGuess() {
    if (this.currentGuess.some(c => c === null)) {
      setFeedback('Fill all 4 slots before submitting!', 'error');
      sound.playTone(200, 'sawtooth', 0.15, 0.15);
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
      const bonusXP = (this.maxAttempts - this.attemptsUsed + 1) * 20;
      setFeedback('Correct! Security cipher cracked!', 'success');
      handleLevelPassed('logic', 100 + bonusXP);
      return;
    }

    // Check loss condition
    if (this.attemptsUsed >= this.maxAttempts) {
      setFeedback('Wrong! Maximum attempts exhausted!', 'error');
      handleLevelFailed('logic', 'Codebreaker Breach Failed');
      return;
    }

    sound.playTone(350, 'triangle', 0.12, 0.1);
    setFeedback(`Wrong! Feedback: ${black} Exact (Black), ${white} Position (White)`, 'error');
    if (typeof triggerShake === 'function') triggerShake();

    // Reset current guess for next attempt
    this.currentGuess = [null, null, null, null];
    this.selectedSlotIndex = 0;
    this.render();
  }

  destroy() {
    // cleanup
  }
}
