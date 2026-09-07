/**
 * DoMaiN - Memory Protocol: Sequence Recall
 * Four circular colored pads with progressive neural sequence pattern retention.
 */
class SequenceRecallGame {
  constructor(isBoss = false) {
    this.isBoss = isBoss;
    // Flash a sequence starting at length 2 + currentCycle
    this.currentSequenceLength = 2 + gameState.currentCycle;
    // Win condition: Successfully repeat a sequence of length 6 + currentCycle
    this.targetSequenceLength = 6 + gameState.currentCycle;

    this.sequence = [];
    this.playerInputIndex = 0;
    this.isDemonstrating = false;

    this.render();
    this.generateAndPlaySequence();

    if (this.isBoss) {
      startBossTimer(() => {
        handleLevelFailed('memory', 'Boss Countdown Expired');
      });
    }
  }

  render() {
    const container = document.getElementById('minigame-container');
    if (!container) return;

    container.innerHTML = `
      <div class="memory-area">
        <div class="sequence-info">
          <span>Current Length: <strong style="color: var(--accent);">${this.currentSequenceLength}</strong></span>
          <span>Target: <strong>${this.targetSequenceLength}</strong></span>
        </div>

        <div class="memory-pad-grid">
          <div class="memory-pad pad-red" data-pad="0" title="Red Pad"></div>
          <div class="memory-pad pad-blue" data-pad="1" title="Blue Pad"></div>
          <div class="memory-pad pad-green" data-pad="2" title="Green Pad"></div>
          <div class="memory-pad pad-yellow" data-pad="3" title="Yellow Pad"></div>
          <div class="memory-center-hub" id="memory-hub-text">...</div>
        </div>

        <div style="font-size: 0.9rem; color: var(--text-muted); text-align: center;" id="memory-instruction">
          Observe sequence demonstration...
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
    this.updateHub('WATCH');
    this.updateInstruction('Neural demonstration playing. Memorize pattern.');

    // Build sequence of current target length
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
          this.updateHub('REPEAT');
          this.updateInstruction('Your turn: Repeat the sequence now.');
          setFeedback('Your turn! Replicate sequence.', 'accent');
        }, 300);
        return;
      }

      const padIndex = this.sequence[step];
      this.flashPad(padIndex, this.isBoss ? 240 : 380);
      step++;
      setTimeout(playNextStep, this.isBoss ? 380 : 540);
    };

    setTimeout(playNextStep, 500);
  }

  flashPad(padIndex, duration = 300) {
    sound.playMemoryPad(padIndex);
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

    this.flashPad(padIndex, 200);

    // Verify pad with current step in sequence
    if (padIndex === this.sequence[this.playerInputIndex]) {
      this.playerInputIndex++;

      // Current sequence length cleared
      if (this.playerInputIndex === this.sequence.length) {
        sound.playTone(600, 'sine', 0.15, 0.15);

        if (this.currentSequenceLength >= this.targetSequenceLength) {
          // Win level
          setFeedback(`Correct! Reached sequence length ${this.targetSequenceLength}!`, 'success');
          handleLevelPassed('memory', 120 + this.currentSequenceLength * 15);
        } else {
          setFeedback(`Correct! Sequence length ${this.currentSequenceLength} mastered! Increasing...`, 'success');
          this.currentSequenceLength++;
          setTimeout(() => {
            this.render();
            this.generateAndPlaySequence();
          }, 700);
        }
      }
    } else {
      // Mistake made
      this.updateHub('ERROR');
      setFeedback('Wrong! Pattern sequence broken!', 'error');
      if (typeof triggerShake === 'function') triggerShake();
      handleLevelFailed('memory', 'Memory Desynchronization');
    }
  }

  updateHub(text) {
    const hub = document.getElementById('memory-hub-text');
    if (hub) hub.textContent = text;
  }

  updateInstruction(text) {
    const inst = document.getElementById('memory-instruction');
    if (inst) inst.textContent = text;
  }

  destroy() {
    this.isDemonstrating = false;
  }
}
