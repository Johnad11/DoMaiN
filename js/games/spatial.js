/**
 * DoMaiN - Spatial Protocol: Mental Rotation
 * Render 3D isometric voxel structures side-by-side.
 * 50% 90-degree 3D rotational symmetry, 50% mirrored/different chiral structure.
 */
class MentalRotationGame {
  constructor(isBoss = false) {
    this.isBoss = isBoss;
    this.trialsCompleted = 0;
    this.correctTrials = 0;
    // Win condition: Achieve 5 correct answers out of 7 trials
    this.targetCorrect = 5;
    this.totalTrials = 7;

    this.isSame = false;
    this.structureA = [];
    this.structureB = [];

    this.render();
    this.nextTrial();

    if (this.isBoss) {
      startBossTimer(() => {
        handleLevelFailed('spatial', 'Boss Countdown Expired');
      });
    }
  }

  render() {
    const container = document.getElementById('minigame-container');
    if (!container) return;

    container.innerHTML = `
      <div class="spatial-area">
        <div style="display: flex; justify-content: space-between; width: 100%; font-size: 0.95rem;">
          <span class="trial-counter">Trial: <strong id="sp-trial-num" style="color: var(--accent);">${this.trialsCompleted + 1}</strong> / ${this.totalTrials}</span>
          <span class="trial-counter">Score: <strong id="sp-score-num" style="color: var(--success);">${this.correctTrials}</strong> (Need ${this.targetCorrect})</span>
        </div>

        <div class="spatial-canvas-container">
          <div class="structure-card">
            <div class="structure-label">ORIGINAL (STRUCTURE A)</div>
            <canvas id="canvas-struct-a" class="iso-canvas" width="240" height="240"></canvas>
          </div>
          <div class="structure-card">
            <div class="structure-label">TEST (STRUCTURE B)</div>
            <canvas id="canvas-struct-b" class="iso-canvas" width="240" height="240"></canvas>
          </div>
        </div>

        <div class="spatial-controls">
          <button class="btn btn-success" id="btn-spatial-same">
            ✓ Yes (Same)
          </button>
          <button class="btn btn-danger" id="btn-spatial-diff">
            ✗ No (Different)
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-spatial-same').addEventListener('click', () => this.evaluateAnswer(true));
    document.getElementById('btn-spatial-diff').addEventListener('click', () => this.evaluateAnswer(false));
  }

  nextTrial() {
    if (this.correctTrials >= this.targetCorrect) {
      setFeedback(`Correct! Reached ${this.correctTrials} of 7 correct!`, 'success');
      handleLevelPassed('spatial', 130 + this.correctTrials * 20);
      return;
    }

    if (this.trialsCompleted >= this.totalTrials) {
      handleLevelFailed('spatial', `Wrong! Only ${this.correctTrials}/${this.targetCorrect} correct in 7 trials`);
      return;
    }

    // Update trial indicators
    const trialNumEl = document.getElementById('sp-trial-num');
    const scoreNumEl = document.getElementById('sp-score-num');
    if (trialNumEl) trialNumEl.textContent = this.trialsCompleted + 1;
    if (scoreNumEl) scoreNumEl.textContent = this.correctTrials;

    // Generate base connected 3D voxel structure
    this.structureA = this.generateConnectedStructure();

    // 50% chance: Structure B is rotated around an axis
    this.isSame = Math.random() < 0.5;

    if (this.isSame) {
      let rotBlocks = JSON.parse(JSON.stringify(this.structureA));
      const axisChoices = ['y', 'x', 'z'];
      const rotationsCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 90-degree rotations
      for (let r = 0; r < rotationsCount; r++) {
        const axis = axisChoices[Math.floor(Math.random() * axisChoices.length)];
        rotBlocks = this.rotateVoxels(rotBlocks, axis);
      }
      this.structureB = rotBlocks;
    } else {
      let diffBlocks = JSON.parse(JSON.stringify(this.structureA));
      if (Math.random() < 0.6) {
        // Mirror along X axis (inverts chirality)
        diffBlocks = diffBlocks.map(b => ({ x: -b.x, y: b.y, z: b.z, color: b.color }));
      } else {
        // Displace endpoint block
        diffBlocks[diffBlocks.length - 1].x = (diffBlocks[diffBlocks.length - 1].x + 1) % 3 - 1;
      }
      // Rotate the altered structure so differences must be mentally rotated
      diffBlocks = this.rotateVoxels(diffBlocks, 'y');
      this.structureB = diffBlocks;
    }

    // Draw both onto canvases
    const canvasA = document.getElementById('canvas-struct-a');
    const canvasB = document.getElementById('canvas-struct-b');
    if (canvasA && canvasB) {
      this.drawIsometricStructure(canvasA, this.structureA);
      this.drawIsometricStructure(canvasB, this.structureB);
    }
  }

  generateConnectedStructure() {
    const blocks = [{ x: 0, y: 0, z: 0, color: '#BB86FC' }];
    const blockCount = 5 + Math.min(2, gameState.currentCycle - 1);
    const dirs = [
      { x: 1, y: 0, z: 0 }, { x: -1, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 }, { x: 0, y: -1, z: 0 },
      { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: -1 }
    ];

    const colors = ['#BB86FC', '#03DAC6', '#FFB74D', '#818CF8'];

    while (blocks.length < blockCount) {
      const base = blocks[Math.floor(Math.random() * blocks.length)];
      const dir = dirs[Math.floor(Math.random() * dirs.length)];
      const nx = base.x + dir.x;
      const ny = base.y + dir.y;
      const nz = base.z + dir.z;

      // Keep within -1 to 1 bounds (3x3x3 grid)
      if (nx >= -1 && nx <= 1 && ny >= -1 && ny <= 1 && nz >= -1 && nz <= 1) {
        if (!blocks.some(b => b.x === nx && b.y === ny && b.z === nz)) {
          blocks.push({
            x: nx,
            y: ny,
            z: nz,
            color: colors[blocks.length % colors.length]
          });
        }
      }
    }
    return blocks;
  }

  rotateVoxels(blocks, axis = 'y') {
    return blocks.map(b => {
      let nx = b.x, ny = b.y, nz = b.z;
      if (axis === 'y') {
        // 90 deg around Y: x' = z, z' = -x
        nx = b.z;
        nz = -b.x;
      } else if (axis === 'x') {
        // 90 deg around X: y' = -z, z' = y
        ny = -b.z;
        nz = b.y;
      } else if (axis === 'z') {
        // 90 deg around Z: x' = -y, y' = x
        nx = -b.y;
        ny = b.x;
      }
      return { x: nx, y: ny, z: nz, color: b.color };
    });
  }

  drawIsometricStructure(canvas, blocks) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 + 10;
    const cubeSize = 26;

    // Sort voxels for Painter's Algorithm in isometric view
    const sorted = [...blocks].sort((a, b) => {
      return (a.x + a.z - a.y) - (b.x + b.z - b.y);
    });

    sorted.forEach(block => {
      const isoAngle = Math.PI / 6; // 30 degrees
      const cos30 = Math.cos(isoAngle);
      const sin30 = Math.sin(isoAngle);

      const px = centerX + (block.x - block.z) * cos30 * cubeSize;
      const py = centerY + (block.x + block.z) * sin30 * cubeSize - block.y * (cubeSize * 1.15);

      this.drawIsometricCube(ctx, px, py, cubeSize, block.color);
    });
  }

  drawIsometricCube(ctx, x, y, size, baseColor) {
    const h = size * 0.58;
    const w = size * 0.86;

    // Top Face
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.moveTo(x, y - h);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x - w, y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Left Face
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.moveTo(x - w, y);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + h + size);
    ctx.lineTo(x - w, y + size);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = baseColor;
    ctx.globalAlpha = 0.65;
    ctx.fill();
    ctx.globalAlpha = 1.0;
    ctx.stroke();

    // Right Face
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + size);
    ctx.lineTo(x, y + h + size);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = baseColor;
    ctx.globalAlpha = 0.45;
    ctx.fill();
    ctx.globalAlpha = 1.0;
    ctx.stroke();
  }

  evaluateAnswer(playerGuessedSame) {
    const correct = (playerGuessedSame === this.isSame);
    this.trialsCompleted++;

    if (correct) {
      this.correctTrials++;
      sound.playTone(600, 'sine', 0.12, 0.15);
      setFeedback('Correct! Spatial alignment confirmed.', 'success');
    } else {
      sound.playTone(220, 'sawtooth', 0.15, 0.15);
      setFeedback(`Wrong! It was ${this.isSame ? 'Yes (Same)' : 'No (Different)'}.`, 'error');
      if (typeof triggerShake === 'function') triggerShake();
    }

    // Check if 5 correct answers achieved immediately
    if (this.correctTrials >= this.targetCorrect) {
      setTimeout(() => {
        setFeedback(`Correct! 5 of 7 trials achieved!`, 'success');
        handleLevelPassed('spatial', 130 + this.correctTrials * 20);
      }, 350);
      return;
    }

    setTimeout(() => {
      this.nextTrial();
    }, 500);
  }

  destroy() {
    // cleanup
  }
}
