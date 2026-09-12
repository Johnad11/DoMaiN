/**
 * DO-MAIN-IT — Server-Authoritative Anti-Cheat Scoring Engine
 * PRD Section 4.4 & 4.6
 */

function calculateScore({
  answerTimeMs,
  timeLimitSec,
  currentStreak = 0,
  powerupModifier = 1.0,
  isCorrect = false
}) {
  if (!isCorrect) {
    return {
      pointsEarned: 0,
      newStreak: 0,
      basePoints: 0,
      speedBonus: 0,
      streakMultiplier: 1.0
    };
  }

  const basePoints = 1000;
  const timeLimitMs = timeLimitSec * 1000;
  const clampedAnswerTime = Math.max(0, Math.min(answerTimeMs, timeLimitMs));
  const timeRatio = clampedAnswerTime / timeLimitMs;

  const speedBonus = Math.max(0, Math.round(1000 * (1 - timeRatio)));
  const newStreak = currentStreak + 1;
  const streakMultiplier = 1 + (Math.min(newStreak, 5) * 0.1);

  const pointsEarned = Math.round(
    (basePoints + speedBonus) * streakMultiplier * powerupModifier
  );

  return {
    pointsEarned,
    newStreak,
    basePoints,
    speedBonus,
    streakMultiplier: Number(streakMultiplier.toFixed(1))
  };
}

/**
 * Deterministic PRNG using integer seed (Fisher-Yates)
 */
function shuffleArrayWithSeed(array, seedStr) {
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
  }

  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = Math.floor((seed / 4294967296) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Prepares a question payload for a specific player:
 * - Omits correct_index
 * - Shuffles options deterministically for that player
 * - Retains original option mapping so server can score accurately
 */
function sanitizeQuestionForPlayer(question, playerSeed) {
  const originalOptions = question.options.map((opt, idx) => ({
    originalIndex: idx,
    text: opt
  }));

  const shuffledOptions = shuffleArrayWithSeed(originalOptions, `${playerSeed}_q${question.id || question.text}`);

  return {
    id: question.id,
    text: question.text,
    type: question.type || 'multiple_choice',
    timeLimit: question.timeLimit || 20,
    mediaUrl: question.mediaUrl || null,
    // Shuffled display list for this specific player
    options: shuffledOptions.map(o => o.text),
    // Mapping kept on server to map player's chosen display index back to original index
    _clientMapping: shuffledOptions.map(o => o.originalIndex)
  };
}

module.exports = {
  calculateScore,
  shuffleArrayWithSeed,
  sanitizeQuestionForPlayer
};
