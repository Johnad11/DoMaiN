/**
 * DO-MAIN-IT — Real-Time Game Room & State Machine Manager
 * PRD Sections 4, 5, 8
 */

const { calculateScore, sanitizeQuestionForPlayer } = require('./engine/scoringEngine');
const {
  createHexMap,
  assignSpawnPoints,
  executeTileAction,
  penalizeWrongAnswer,
  getTerritoryStats
} = require('./engine/domainEngine');

const PLAYER_COLORS = [
  '#00E5FF', // Plasma Cyan
  '#FF6B35', // Magma Orange
  '#39FF88', // Bio Green
  '#FF2E63', // Blood Red
  '#D946EF', // Neon Violet
  '#FACC15', // Solar Yellow
  '#38BDF8', // Sky Pulse
  '#FB7185', // Coral Blade
  '#A855F7', // Deep Purple
  '#2DD4BF', // Emerald Teal
  '#F97316', // Sunset Orange
  '#4ADE80'  // Lime Green
];

const BOT_NAMES = ['Avery', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Alex'];

class RoomManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Map(); // pin -> room
  }

  generatePin() {
    let pin;
    do {
      pin = Math.floor(100000 + Math.random() * 900000).toString();
    } while (this.rooms.has(pin));
    return pin;
  }

  getRoomDetails(pin) {
    const room = this.rooms.get(pin);
    if (!room) return null;
    const players = Object.values(room.players);
    return {
      pin: room.pin,
      status: room.status,
      quizTitle: room.quiz?.title,
      takenNames: players.map(p => p.nickname.toLowerCase()),
      takenColors: players.map(p => p.color.toUpperCase()),
      availableColors: PLAYER_COLORS.filter(c => !players.some(p => p.color.toUpperCase() === c.toUpperCase()))
    };
  }

  createRoom({ hostSocketId, quiz, enableDomainBattles = true, mapRadius = 3 }) {
    const pin = this.generatePin();
    const map = enableDomainBattles ? createHexMap(mapRadius) : null;

    const room = {
      pin,
      hostSocketId,
      status: 'LOBBY', // LOBBY, QUESTION_ACTIVE, REVEAL, DOMAIN_BATTLE, LEADERBOARD, GAME_OVER
      quiz,
      currentQuestionIndex: -1,
      questionStartTime: null,
      questionTimeLimitSec: 20,
      enableDomainBattles,
      mapRadius,
      map,
      isSurgeRound: false,
      players: {}, // socketId -> playerObj
      playerSeeds: {}, // socketId -> seed
      activeQuestionMappings: {}, // socketId -> mapping array
      currentAnswers: {}, // playerId -> { optionIndex, isCorrect, answerTimeMs, scoreResult }
      antiCheatLogs: {}, // playerId -> { blurCount, flags: [] }
      timerInterval: null
    };

    this.rooms.set(pin, room);
    return room;
  }

  getRoom(pin) {
    return this.rooms.get(pin);
  }

  findRoomByHostSocket(socketId) {
    for (const room of this.rooms.values()) {
      if (room.hostSocketId === socketId) return room;
    }
    return null;
  }

  findRoomByPlayerSocket(socketId) {
    for (const room of this.rooms.values()) {
      if (room.players[socketId]) return room;
    }
    return null;
  }

  addPlayer(pin, { socketId, nickname, avatar = 'hex-1', color }) {
    const room = this.rooms.get(pin);
    if (!room) return { error: 'Game room not found. Please check the 6-digit PIN.' };
    if (room.status !== 'LOBBY') return { error: 'This game has already started.' };

    const cleanName = (nickname || '').trim();
    if (!cleanName) return { error: 'Please enter a name to join.' };

    // Requirement 6: Unique player name per room
    const isNameTaken = Object.values(room.players).some(
      p => p.nickname.trim().toLowerCase() === cleanName.toLowerCase()
    );
    if (isNameTaken) {
      return { error: `The name "${cleanName}" is already taken in this game. Please choose a different name!` };
    }

    // Requirement 6: Unique player color per room
    const playersList = Object.values(room.players);
    const chosenColor = color ? color.toUpperCase() : null;

    if (chosenColor && playersList.some(p => p.color.toUpperCase() === chosenColor)) {
      return { error: 'That color has already been claimed by another player. Please pick a different color!' };
    }

    // If no color selected or available, pick first available color
    let finalColor = chosenColor;
    if (!finalColor) {
      const freeColor = PLAYER_COLORS.find(c => !playersList.some(p => p.color.toUpperCase() === c.toUpperCase()));
      finalColor = freeColor || PLAYER_COLORS[playersList.length % PLAYER_COLORS.length];
    }

    const player = {
      id: socketId,
      socketId,
      nickname: cleanName,
      avatar,
      color: finalColor,
      score: 0,
      streak: 0,
      actionPoints: 0,
      totalCorrect: 0,
      totalAnswered: 0,
      isBot: false,
      cheatFlags: 0,
      rank: playersList.length + 1
    };

    room.players[socketId] = player;
    room.playerSeeds[socketId] = `seed_${pin}_${socketId}_${Date.now()}`;
    room.antiCheatLogs[socketId] = { blurCount: 0, flags: [] };

    const updatedPlayers = Object.values(room.players);
    const takenColors = updatedPlayers.map(p => p.color.toUpperCase());
    const takenNames = updatedPlayers.map(p => p.nickname.toLowerCase());

    // Broadcast updated player list and taken colors/names to room
    this.io.to(pin).emit('room:players_updated', {
      players: updatedPlayers,
      takenColors,
      takenNames
    });

    return { success: true, player, room };
  }

  addBotPlayer(pin) {
    const room = this.rooms.get(pin);
    if (!room || room.status !== 'LOBBY') return null;

    const existingPlayers = Object.values(room.players);
    const existingNames = new Set(existingPlayers.map(p => p.nickname.toLowerCase()));
    const existingColors = new Set(existingPlayers.map(p => p.color.toUpperCase()));

    // Find unique bot name
    const botName = BOT_NAMES.find(name => !existingNames.has(name.toLowerCase())) ||
      `Player_${existingPlayers.length + 1}`;

    // Find unique color
    const botColor = PLAYER_COLORS.find(c => !existingColors.has(c.toUpperCase())) ||
      PLAYER_COLORS[existingPlayers.length % PLAYER_COLORS.length];

    const botId = `bot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const botPlayer = {
      id: botId,
      socketId: botId,
      nickname: botName,
      avatar: `hex-bot`,
      color: botColor,
      score: 0,
      streak: 0,
      actionPoints: 0,
      totalCorrect: 0,
      totalAnswered: 0,
      isBot: true,
      cheatFlags: 0,
      rank: existingPlayers.length + 1
    };

    room.players[botId] = botPlayer;
    room.playerSeeds[botId] = `bot_seed_${botId}`;
    room.antiCheatLogs[botId] = { blurCount: 0, flags: [] };

    const updatedPlayers = Object.values(room.players);
    const takenColors = updatedPlayers.map(p => p.color.toUpperCase());
    const takenNames = updatedPlayers.map(p => p.nickname.toLowerCase());

    this.io.to(pin).emit('room:players_updated', {
      players: updatedPlayers,
      takenColors,
      takenNames
    });

    return botPlayer;
  }

  removePlayer(socketId) {
    for (const [pin, room] of this.rooms.entries()) {
      if (room.players[socketId]) {
        delete room.players[socketId];
        delete room.playerSeeds[socketId];
        delete room.activeQuestionMappings[socketId];
        delete room.currentAnswers[socketId];
        delete room.antiCheatLogs[socketId];

        this.io.to(pin).emit('room:players_updated', {
          players: Object.values(room.players)
        });
        break;
      }
    }
  }

  startGame(pin) {
    const room = this.rooms.get(pin);
    if (!room) return false;

    // Assign spawn tiles if Domain Battles enabled
    if (room.enableDomainBattles && room.map) {
      assignSpawnPoints(room.map, room.players);
    }

    this.nextQuestion(pin);
    return true;
  }

  nextQuestion(pin) {
    const room = this.rooms.get(pin);
    if (!room) return false;

    clearInterval(room.timerInterval);

    room.currentQuestionIndex += 1;
    if (room.currentQuestionIndex >= room.quiz.questions.length) {
      return this.endGame(pin);
    }

    const currentQ = room.quiz.questions[room.currentQuestionIndex];
    room.status = 'QUESTION_ACTIVE';
    room.currentAnswers = {};
    room.questionStartTime = Date.now();
    room.questionTimeLimitSec = currentQ.timeLimit || 20;
    room.isSurgeRound = (room.currentQuestionIndex + 1) % 5 === 0;

    // Send host the clean question without revealing the answer key yet
    this.io.to(room.hostSocketId).emit('question:show_host', {
      questionIndex: room.currentQuestionIndex,
      totalQuestions: room.quiz.questions.length,
      text: currentQ.text,
      type: currentQ.type || 'multiple_choice',
      timeLimit: room.questionTimeLimitSec,
      options: currentQ.options,
      isSurgeRound: room.isSurgeRound,
      map: room.map
    });

    // Send each player their sanitized & randomized question
    for (const [socketId, player] of Object.entries(room.players)) {
      if (player.isBot) continue;

      const sanitized = sanitizeQuestionForPlayer(currentQ, room.playerSeeds[socketId]);
      room.activeQuestionMappings[socketId] = sanitized._clientMapping;

      this.io.to(socketId).emit('question:show_player', {
        questionIndex: room.currentQuestionIndex,
        totalQuestions: room.quiz.questions.length,
        text: sanitized.text,
        type: sanitized.type,
        timeLimit: sanitized.timeLimit,
        options: sanitized.options,
        isSurgeRound: room.isSurgeRound,
        streak: player.streak
      });
    }

    // Simulate bot answers asynchronously
    this.simulateBotAnswers(room, currentQ);

    // Host timer tick down
    let timeLeft = room.questionTimeLimitSec;
    room.timerInterval = setInterval(() => {
      timeLeft -= 1;
      this.io.to(pin).emit('timer:tick', {
        timeLeft: Math.max(0, timeLeft),
        totalTime: room.questionTimeLimitSec
      });

      if (timeLeft <= 0) {
        clearInterval(room.timerInterval);
        this.revealAnswer(pin);
      }
    }, 1000);

    return true;
  }

  simulateBotAnswers(room, currentQ) {
    const bots = Object.values(room.players).filter(p => p.isBot);
    bots.forEach(bot => {
      const delay = 1500 + Math.random() * (room.questionTimeLimitSec * 750);
      setTimeout(() => {
        if (room.status !== 'QUESTION_ACTIVE') return;
        const willBeCorrect = Math.random() > 0.35; // 65% bot accuracy
        const chosenOriginalIndex = willBeCorrect
          ? currentQ.correctIndex
          : (currentQ.correctIndex + 1) % currentQ.options.length;

        this.submitAnswer(room.pin, bot.id, chosenOriginalIndex, true);
      }, delay);
    });
  }

  submitAnswer(pin, socketId, selectedIndex, isDirectIndex = false) {
    const room = this.rooms.get(pin);
    if (!room || room.status !== 'QUESTION_ACTIVE') return null;

    const player = room.players[socketId];
    if (!player) return null;
    if (room.currentAnswers[socketId]) return null; // already answered

    const now = Date.now();
    const answerTimeMs = now - room.questionStartTime;
    const currentQ = room.quiz.questions[room.currentQuestionIndex];

    // Map randomized client index back to original question index
    let originalChosenIndex = selectedIndex;
    if (!isDirectIndex && room.activeQuestionMappings[socketId]) {
      originalChosenIndex = room.activeQuestionMappings[socketId][selectedIndex];
    }

    const isCorrect = originalChosenIndex === currentQ.correctIndex;
    const scoreResult = calculateScore({
      answerTimeMs,
      timeLimitSec: room.questionTimeLimitSec,
      currentStreak: player.streak,
      powerupModifier: 1.0,
      isCorrect
    });

    // Update player state
    player.score += scoreResult.pointsEarned;
    player.streak = scoreResult.newStreak;
    player.totalAnswered += 1;
    if (isCorrect) {
      player.totalCorrect += 1;
      // PRD: Correct answer -> 1 Action Point (or 2 during Domain Surge)
      player.actionPoints += room.isSurgeRound ? 2 : 1;
    } else {
      // PRD: Wrong answer -> penalize 1 tile if domain battles active
      if (room.enableDomainBattles && room.map) {
        penalizeWrongAnswer(room.map, player.id);
      }
    }

    room.currentAnswers[socketId] = {
      originalChosenIndex,
      isCorrect,
      answerTimeMs,
      scoreResult
    };

    // Notify player that answer was locked
    if (!player.isBot) {
      this.io.to(socketId).emit('answer:acknowledged', {
        status: 'LOCKED',
        streak: player.streak,
        score: player.score
      });
    }

    // Notify host of response count
    const totalAnswered = Object.keys(room.currentAnswers).length;
    const totalPlayers = Object.keys(room.players).length;

    this.io.to(room.hostSocketId).emit('host:answer_received', {
      totalAnswered,
      totalPlayers,
      latestPlayer: player.nickname
    });

    // Auto reveal if all players answered
    if (totalAnswered >= totalPlayers) {
      clearInterval(room.timerInterval);
      this.revealAnswer(pin);
    }

    return true;
  }

  recordAntiCheatEvent(pin, socketId, eventType) {
    const room = this.rooms.get(pin);
    if (!room) return;

    const log = room.antiCheatLogs[socketId];
    const player = room.players[socketId];
    if (!log || !player) return;

    if (eventType === 'tab_blur') {
      log.blurCount += 1;
      log.flags.push({ timestamp: Date.now(), type: 'TAB_BLUR' });

      if (log.blurCount > 2) {
        player.cheatFlags += 1;
        this.io.to(room.hostSocketId).emit('host:cheat_flagged', {
          playerId: player.id,
          nickname: player.nickname,
          blurCount: log.blurCount,
          reason: 'Excessive tab switching detected'
        });
      }

      this.io.to(socketId).emit('player:cheat_warning', {
        blurCount: log.blurCount,
        maxAllowed: 2
      });
    }
  }

  revealAnswer(pin) {
    const room = this.rooms.get(pin);
    if (!room) return;

    clearInterval(room.timerInterval);
    const currentQ = room.quiz.questions[room.currentQuestionIndex];
    room.status = 'REVEAL';

    // Update ranks
    const sorted = Object.values(room.players).sort((a, b) => b.score - a.score);
    sorted.forEach((p, idx) => {
      p.rank = idx + 1;
    });

    // Send reveal details to host
    this.io.to(room.hostSocketId).emit('question:reveal_host', {
      correctIndex: currentQ.correctIndex,
      correctText: currentQ.options[currentQ.correctIndex],
      explanation: currentQ.explanation,
      answers: room.currentAnswers,
      leaderboard: sorted,
      map: room.map,
      territoryStats: room.map ? getTerritoryStats(room.map) : null
    });

    // Send individual results to each player
    for (const [socketId, player] of Object.entries(room.players)) {
      if (player.isBot) continue;

      const answerInfo = room.currentAnswers[socketId] || {
        isCorrect: false,
        scoreResult: { pointsEarned: 0, speedBonus: 0, streakMultiplier: 1 }
      };

      this.io.to(socketId).emit('question:reveal_player', {
        isCorrect: answerInfo.isCorrect,
        pointsEarned: answerInfo.scoreResult ? answerInfo.scoreResult.pointsEarned : 0,
        streak: player.streak,
        score: player.score,
        rank: player.rank,
        actionPoints: player.actionPoints,
        correctOptionText: currentQ.options[currentQ.correctIndex],
        explanation: currentQ.explanation,
        map: room.map
      });
    }

    // Auto-execute bot territory actions if Domain Battles active
    if (room.enableDomainBattles && room.map) {
      this.simulateBotTerritoryActions(room);
    }
  }

  simulateBotTerritoryActions(room) {
    const bots = Object.values(room.players).filter(p => p.isBot && p.actionPoints > 0);
    bots.forEach(bot => {
      while (bot.actionPoints > 0) {
        bot.actionPoints -= 1;
        // Find adjacent neutral or enemy tile
        const candidateKeys = Object.keys(room.map.tiles).filter(k => {
          const t = room.map.tiles[k];
          if (t.ownerId === bot.id) return false;
          // Check adjacency
          const neighbors = require('./engine/domainEngine').getNeighbors(t.q, t.r, room.map);
          return neighbors.some(n => n.ownerId === bot.id);
        });

        if (candidateKeys.length > 0) {
          const targetKey = candidateKeys[Math.floor(Math.random() * candidateKeys.length)];
          executeTileAction({
            map: room.map,
            player: bot,
            targetKey,
            allPlayers: room.players
          });
        }
      }
    });

    // Broadcast updated map
    this.io.to(room.pin).emit('map:updated', {
      map: room.map,
      territoryStats: getTerritoryStats(room.map)
    });
  }

  handlePlayerTileAction(pin, socketId, targetKey) {
    const room = this.rooms.get(pin);
    if (!room || !room.enableDomainBattles || !room.map) {
      return { success: false, reason: 'Domain Battles not active' };
    }

    const player = room.players[socketId];
    if (!player) return { success: false, reason: 'Player not found' };
    if (player.actionPoints <= 0) return { success: false, reason: 'No action points remaining' };

    const result = executeTileAction({
      map: room.map,
      player,
      targetKey,
      allPlayers: room.players
    });

    if (result.success) {
      player.actionPoints -= 1;

      // Broadcast map update to all participants
      this.io.to(pin).emit('map:updated', {
        map: room.map,
        territoryStats: getTerritoryStats(room.map),
        lastAction: {
          playerId: player.id,
          playerName: player.nickname,
          actionType: result.actionType,
          targetKey
        }
      });

      // Update player's remaining AP
      this.io.to(socketId).emit('player:ap_updated', {
        actionPoints: player.actionPoints
      });
    }

    return result;
  }

  endGame(pin) {
    const room = this.rooms.get(pin);
    if (!room) return;

    room.status = 'GAME_OVER';
    clearInterval(room.timerInterval);

    const sorted = Object.values(room.players).sort((a, b) => b.score - a.score);
    const territoryStats = room.map ? getTerritoryStats(room.map) : null;

    const report = {
      winner: sorted[0] || null,
      leaderboard: sorted,
      totalQuestions: room.quiz.questions.length,
      map: room.map,
      territoryStats
    };

    this.io.to(pin).emit('game:over', report);
  }

  updateRoomQuiz(pin, newQuiz) {
    const room = this.rooms.get(pin);
    if (!room || room.status !== 'LOBBY') return null;
    room.quiz = newQuiz;
    this.io.to(pin).emit('room:quiz_updated', {
      quizTitle: newQuiz.title,
      questionCount: newQuiz.questions.length
    });
    return room;
  }
}

module.exports = RoomManager;
