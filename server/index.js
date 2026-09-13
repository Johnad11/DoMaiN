/**
 * DO-MAIN-IT — Real-Time Game Server & Backend
 * Port: 3001 (or process.env.PORT)
 */
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { DEFAULT_QUIZZES } = require('./data/defaultQuizzes');
const { forgeQuiz } = require('./services/quizForge');
const RoomManager = require('./rooms');

const app = express();
const server = http.createServer(app);

// CORS configuration for Socket.IO and REST API
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 3001;
const roomManager = new RoomManager(io);

// In-memory quiz store initialized with default rich quizzes
let savedQuizzes = [...DEFAULT_QUIZZES];

// --- REST Endpoints ---

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: Date.now(), activeRooms: roomManager.rooms.size });
});

// Direct APK download link for mobile players
app.get('/download', (req, res) => {
  res.redirect('https://github.com/Johnad11/DoMaiN/releases/download/latest-apk/app-debug.apk');
});

app.get('/api/quizzes', (req, res) => {
  res.json({ quizzes: savedQuizzes });
});

app.post('/api/quizzes', (req, res) => {
  const { title, description, category, questions } = req.body;
  if (!title || !questions || !Array.isArray(questions)) {
    return res.status(400).json({ error: 'Title and questions array are required' });
  }

  const newQuiz = {
    id: `quiz-custom-${Date.now()}`,
    title,
    description: description || '',
    category: category || 'General',
    coverIcon: 'Sparkles',
    questions
  };

  savedQuizzes.unshift(newQuiz);
  res.status(201).json({ success: true, quiz: newQuiz });
});

app.post('/api/quiz-forge', async (req, res) => {
  try {
    const { prompt, sourceText, apiKey, questionCount } = req.body;
    const generated = await forgeQuiz({
      prompt,
      sourceText,
      apiKey,
      questionCount: Number(questionCount) || 8
    });

    savedQuizzes.unshift(generated);
    res.json({ success: true, quiz: generated });
  } catch (err) {
    console.error('Quiz Forge API error:', err);
    res.status(500).json({ error: err.message || 'Failed to forge quiz' });
  }
});

// Endpoint for hosts to save their own custom-created quizzes
app.post('/api/quizzes/custom', (req, res) => {
  try {
    const { title, questions } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Quiz title is required.' });
    }
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'At least one question is required.' });
    }

    const cleanQuiz = {
      id: `custom_${Date.now()}`,
      title: title.trim(),
      category: 'Custom',
      questions: questions.map((q, idx) => ({
        id: `q_${Date.now()}_${idx}`,
        text: q.text.trim(),
        options: q.options.map(opt => (opt || '').trim()),
        correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
        timeLimit: Number(q.timeLimit) || 20,
        points: Number(q.points) || 1000
      }))
    };

    savedQuizzes.unshift(cleanQuiz);
    res.json({ success: true, quiz: cleanQuiz });
  } catch (err) {
    console.error('Custom quiz creation error:', err);
    res.status(500).json({ error: 'Failed to create custom quiz' });
  }
});

// --- Socket.IO Real-Time Protocol ---

io.on('connection', (socket) => {
  // Host creates room
  socket.on('host:create_room', ({ quiz, quizId, enableDomainBattles = true, mapRadius = 3 }) => {
    let quizToUse = null;
    if (quiz && quiz.questions && quiz.questions.length > 0) {
      quizToUse = quiz;
      if (!savedQuizzes.some(q => q.id === quiz.id)) {
        savedQuizzes.unshift(quiz);
      }
    } else {
      quizToUse = savedQuizzes.find(q => q.id === quizId) || savedQuizzes[0];
    }

    const room = roomManager.createRoom({
      hostSocketId: socket.id,
      quiz: quizToUse,
      enableDomainBattles,
      mapRadius
    });

    socket.join(room.pin);
    socket.emit('host:room_created', {
      pin: room.pin,
      quizTitle: quizToUse.title,
      questionCount: quizToUse.questions.length,
      enableDomainBattles,
      map: room.map
    });
    console.log(`[Host] Created room PIN ${room.pin} with quiz: "${quizToUse.title}" (${quizToUse.questions.length} Qs)`);
  });

  // Host updates active quiz while in Lobby
  socket.on('host:update_quiz', ({ pin, quiz }) => {
    if (!quiz || !pin) return;
    const room = roomManager.updateRoomQuiz(pin, quiz);
    if (room) {
      if (!savedQuizzes.some(q => q.id === quiz.id)) {
        savedQuizzes.unshift(quiz);
      }
      socket.emit('host:quiz_updated', {
        quizTitle: quiz.title,
        questionCount: quiz.questions.length
      });
      console.log(`[Host] Room ${pin} active quiz updated to "${quiz.title}"`);
    }
  });

  // Player checks room availability & taken colors
  socket.on('player:check_room', ({ pin }) => {
    const details = roomManager.getRoomDetails(pin);
    if (!details) {
      return socket.emit('player:room_details', { error: 'Game room not found. Check the 6-digit PIN.' });
    }
    socket.emit('player:room_details', {
      success: true,
      quizTitle: details.quizTitle,
      takenColors: details.takenColors,
      takenNames: details.takenNames,
      availableColors: details.availableColors
    });
  });

  // Player joins room
  socket.on('player:join_room', ({ pin, nickname, avatar, color }) => {
    const result = roomManager.addPlayer(pin, {
      socketId: socket.id,
      nickname,
      avatar,
      color
    });

    if (result.error) {
      return socket.emit('player:join_error', { message: result.error });
    }

    socket.join(pin);
    socket.emit('player:join_success', {
      player: result.player,
      quizTitle: result.room.quiz.title,
      enableDomainBattles: result.room.enableDomainBattles
    });
    console.log(`[Player] ${result.player.nickname} joined room ${pin}`);
  });

  // Host adds demo bot
  socket.on('host:add_bot', ({ pin }) => {
    const bot = roomManager.addBotPlayer(pin);
    if (bot) {
      console.log(`[Bot] Added bot ${bot.nickname} to room ${pin}`);
    }
  });

  // Host starts game
  socket.on('host:start_game', ({ pin }) => {
    const started = roomManager.startGame(pin);
    if (started) {
      console.log(`[Game] Started in room ${pin}`);
    }
  });

  // Player submits answer
  socket.on('player:submit_answer', ({ pin, selectedIndex }) => {
    roomManager.submitAnswer(pin, socket.id, selectedIndex);
  });

  // Player claims or attacks hex tile
  socket.on('player:tile_action', ({ pin, targetKey }) => {
    roomManager.handlePlayerTileAction(pin, socket.id, targetKey);
  });

  // Anti-cheat tab blur event
  socket.on('player:anti_cheat_event', ({ pin, eventType }) => {
    roomManager.recordAntiCheatEvent(pin, socket.id, eventType);
  });

  // Host controls
  socket.on('host:next_question', ({ pin }) => {
    roomManager.nextQuestion(pin);
  });

  socket.on('host:reveal_now', ({ pin }) => {
    roomManager.revealAnswer(pin);
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    roomManager.removePlayer(socket.id);
  });
});

// Direct APK download route
app.get('/download', (req, res) => {
  res.redirect('https://github.com/Johnad11/DoMaiN/releases/download/latest-apk/app-debug.apk');
});

// Kill legacy service workers registered by previous projects
app.get('/sw.js', (req, res) => {
  res.set('Content-Type', 'application/javascript');
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.send(`
    self.addEventListener('install', () => self.skipWaiting());
    self.addEventListener('activate', () => {
      self.registration.unregister().then(() => {
        return self.clients.matchAll();
      }).then(clients => {
        clients.forEach(client => client.navigate(client.url));
      });
    });
  `);
});

// Serve client build in production if available with cache-busting for index.html
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    }
  }));
  app.use((req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[DO-MAIN-IT] Realtime server active on port ${PORT}`);
});
