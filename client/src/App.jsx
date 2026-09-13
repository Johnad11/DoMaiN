import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Monitor, Smartphone, Sparkles, HelpCircle, Swords } from 'lucide-react';

import LobbyHost from './screens/LobbyHost';
import GameHost from './screens/GameHost';
import ReportHost from './screens/ReportHost';
import JoinPlayer from './screens/JoinPlayer';
import GamePlayer from './screens/GamePlayer';
import ReportPlayer from './screens/ReportPlayer';
import QuizSuggestionsModal from './components/QuizSuggestionsModal';
import CreateCustomQuizModal from './components/CreateCustomQuizModal';
import HowToPlayModal from './components/HowToPlayModal';
import { sound } from './audio/soundEngine';
import { getServerUrl } from './utils/serverUrl';

export default function App() {
  const [role, setRole] = useState('player'); // 'host' or 'player'
  const [socket, setSocket] = useState(null);

  // Host States
  const [hostPin, setHostPin] = useState(null);
  const [hostQuizTitle, setHostQuizTitle] = useState('');
  const [hostPlayers, setHostPlayers] = useState([]);
  const [hostGameStatus, setHostGameStatus] = useState('LOBBY'); // LOBBY, QUESTION_ACTIVE, REVEAL, GAME_OVER
  const [hostCurrentQ, setHostCurrentQ] = useState(null);
  const [hostQuestionIndex, setHostQuestionIndex] = useState(0);
  const [hostTotalQuestions, setHostTotalQuestions] = useState(0);
  const [hostTimeLeft, setHostTimeLeft] = useState(20);
  const [hostTotalTime, setHostTotalTime] = useState(20);
  const [hostAnsweredCount, setHostAnsweredCount] = useState(0);
  const [hostRevealData, setHostRevealData] = useState(null);
  const [hostMap, setHostMap] = useState(null);
  const [hostIsSurge, setHostIsSurge] = useState(false);
  const [hostEndReport, setHostEndReport] = useState(null);

  // Player States
  const [playerInfo, setPlayerInfo] = useState(null);
  const [playerPin, setPlayerPin] = useState('');
  const [playerGameStatus, setPlayerGameStatus] = useState('JOIN'); // JOIN, WAITING_LOBBY, QUESTION_ACTIVE, REVEAL, GAME_OVER
  const [playerCurrentQ, setPlayerCurrentQ] = useState(null);
  const [playerQIndex, setPlayerQIndex] = useState(0);
  const [playerTotalQ, setPlayerTotalQ] = useState(0);
  const [playerIsSurge, setPlayerIsSurge] = useState(false);
  const [playerIsLocked, setPlayerIsLocked] = useState(false);
  const [playerRevealResult, setPlayerRevealResult] = useState(null);
  const [playerMap, setPlayerMap] = useState(null);
  const [playerActionPoints, setPlayerActionPoints] = useState(0);
  const [joinErrorMessage, setJoinErrorMessage] = useState('');
  const [takenColors, setTakenColors] = useState([]);
  const [takenNames, setTakenNames] = useState([]);
  const [playerEndReport, setPlayerEndReport] = useState(null);

  // Modals
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [isCustomQuizOpen, setIsCustomQuizOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState(null);

  // Parse URL search parameters for quick role & pin
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('host') === '1') {
      setRole('host');
    }
    if (params.get('pin')) {
      const p = params.get('pin').trim();
      setPlayerPin(p);
    }
  }, []);

  // Fetch quizzes on mount
  useEffect(() => {
    fetch(`${getServerUrl()}/api/quizzes`)
      .then(res => res.json())
      .then(data => {
        if (data.quizzes && data.quizzes.length > 0) {
          setAvailableQuizzes(data.quizzes);
          setSelectedQuizId(data.quizzes[0].id);
        }
      })
      .catch(err => console.error('Failed to load quizzes:', err));
  }, []);

  // Initialize Socket.IO connection
  useEffect(() => {
    const targetUrl = getServerUrl();
    console.log('[Socket] Connecting to server:', targetUrl);
    const newSocket = io(targetUrl, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('[Socket] Connected as', newSocket.id);
      // If PIN is already known, check room details
      const params = new URLSearchParams(window.location.search);
      const urlPin = params.get('pin');
      if (urlPin) {
        newSocket.emit('player:check_room', { pin: urlPin });
      }
    });

    // --- Host Socket Listeners ---
    newSocket.on('host:room_created', (data) => {
      setHostPin(data.pin);
      setHostQuizTitle(data.quizTitle);
      setHostTotalQuestions(data.questionCount);
      setHostMap(data.map);
      setHostGameStatus('LOBBY');
    });

    newSocket.on('host:quiz_updated', (data) => {
      setHostQuizTitle(data.quizTitle);
      setHostTotalQuestions(data.questionCount);
    });

    newSocket.on('room:players_updated', (data) => {
      setHostPlayers(data.players || []);
      if (data.takenColors) setTakenColors(data.takenColors);
      if (data.takenNames) setTakenNames(data.takenNames);
    });

    newSocket.on('question:show_host', (data) => {
      setHostGameStatus('QUESTION_ACTIVE');
      setHostCurrentQ(data);
      setHostQuestionIndex(data.questionIndex);
      setHostTotalQuestions(data.totalQuestions);
      setHostTimeLeft(data.timeLimit);
      setHostTotalTime(data.timeLimit);
      setHostAnsweredCount(0);
      setHostRevealData(null);
      setHostIsSurge(data.isSurgeRound);
      if (data.map) setHostMap(data.map);
    });

    newSocket.on('host:answer_received', (data) => {
      setHostAnsweredCount(data.totalAnswered);
    });

    newSocket.on('timer:tick', (data) => {
      setHostTimeLeft(data.timeLeft);
    });

    newSocket.on('question:reveal_host', (data) => {
      setHostGameStatus('REVEAL');
      setHostRevealData(data);
      if (data.map) setHostMap(data.map);
      if (data.leaderboard) setHostPlayers(data.leaderboard);
    });

    newSocket.on('map:updated', (data) => {
      setHostMap(data.map);
      setPlayerMap(data.map);
    });

    newSocket.on('game:over', (report) => {
      setHostGameStatus('GAME_OVER');
      setPlayerGameStatus('GAME_OVER');
      setHostEndReport(report);
      setPlayerEndReport(report);
    });

    // --- Player Socket Listeners ---
    newSocket.on('player:room_details', (data) => {
      if (data.success) {
        if (data.takenColors) setTakenColors(data.takenColors);
        if (data.takenNames) setTakenNames(data.takenNames);
      }
    });

    newSocket.on('player:join_success', (data) => {
      setPlayerInfo(data.player);
      setPlayerGameStatus('WAITING_LOBBY');
      setJoinErrorMessage('');
      sound.playJoin();
    });

    newSocket.on('player:join_error', (data) => {
      setJoinErrorMessage(data.message || 'Unable to join game');
      sound.playWrong();
    });

    newSocket.on('question:show_player', (data) => {
      setPlayerGameStatus('QUESTION_ACTIVE');
      setPlayerCurrentQ(data);
      setPlayerQIndex(data.questionIndex);
      setPlayerTotalQ(data.totalQuestions);
      setPlayerIsSurge(data.isSurgeRound);
      setPlayerIsLocked(false);
      setPlayerRevealResult(null);
    });

    newSocket.on('answer:acknowledged', () => {
      setPlayerIsLocked(true);
    });

    newSocket.on('question:reveal_player', (data) => {
      setPlayerGameStatus('REVEAL');
      setPlayerRevealResult(data);
      setPlayerActionPoints(data.actionPoints || 0);
      if (data.map) setPlayerMap(data.map);
    });

    newSocket.on('player:ap_updated', (data) => {
      setPlayerActionPoints(data.actionPoints);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // --- Host Actions ---
  const handleHostCreateRoom = (quizOrQuizId) => {
    if (!socket) return;
    const payload = {
      enableDomainBattles: true,
      mapRadius: 3
    };
    if (quizOrQuizId && typeof quizOrQuizId === 'object') {
      payload.quiz = quizOrQuizId;
    } else {
      payload.quizId = quizOrQuizId || selectedQuizId;
    }
    socket.emit('host:create_room', payload);
  };

  const handleAddBot = () => {
    if (!socket || !hostPin) return;
    socket.emit('host:add_bot', { pin: hostPin });
  };

  const handleStartGame = () => {
    if (!socket || !hostPin) return;
    sound.playSurge();
    socket.emit('host:start_game', { pin: hostPin });
  };

  const handleHostNextQuestion = () => {
    if (!socket || !hostPin) return;
    socket.emit('host:next_question', { pin: hostPin });
  };

  const handleHostRevealNow = () => {
    if (!socket || !hostPin) return;
    socket.emit('host:reveal_now', { pin: hostPin });
  };

  // --- Player Actions ---
  const handlePlayerJoin = ({ pin, nickname, color }) => {
    if (!socket) return;
    setPlayerPin(pin);
    setJoinErrorMessage('');
    socket.emit('player:join_room', { pin, nickname, color });
  };

  const handlePlayerSubmitAnswer = (selectedIndex) => {
    if (!socket || !playerPin) return;
    socket.emit('player:submit_answer', {
      pin: playerPin,
      selectedIndex
    });
  };

  const handlePlayerTileAction = (targetKey) => {
    if (!socket || !playerPin) return;
    socket.emit('player:tile_action', {
      pin: playerPin,
      targetKey
    });
  };

  const handlePlayerAntiCheat = (eventType) => {
    if (!socket || !playerPin) return;
    socket.emit('player:anti_cheat_event', {
      pin: playerPin,
      eventType
    });
  };

  // Switch role cleanly without obstructing game buttons
  const switchRole = (newRole) => {
    sound.playClaimTile();
    setRole(newRole);
    if (newRole === 'host' && !hostPin) {
      handleHostCreateRoom();
    }
  };

  const handleQuizCreatedFromSuggestions = (newQuiz) => {
    setAvailableQuizzes(prev => [newQuiz, ...prev]);
    setSelectedQuizId(newQuiz.id);
    setHostQuizTitle(newQuiz.title);
    setHostTotalQuestions(newQuiz.questions.length);
    if (hostPin && socket) {
      socket.emit('host:update_quiz', { pin: hostPin, quiz: newQuiz });
    } else if (role === 'host') {
      handleHostCreateRoom(newQuiz);
    }
  };

  const handleCustomQuizCreated = (newQuiz) => {
    setAvailableQuizzes(prev => [newQuiz, ...prev]);
    setSelectedQuizId(newQuiz.id);
    setHostQuizTitle(newQuiz.title);
    setHostTotalQuestions(newQuiz.questions.length);
    if (hostPin && socket) {
      socket.emit('host:update_quiz', { pin: hostPin, quiz: newQuiz });
    } else if (role === 'host') {
      handleHostCreateRoom(newQuiz);
    }
  };

  return (
    <div className="relative min-h-screen bg-obsidian text-bone">
      {/* Quiz Suggestions Modal */}
      <QuizSuggestionsModal
        isOpen={isSuggestionsOpen}
        onClose={() => setIsSuggestionsOpen(false)}
        onQuizCreated={handleQuizCreatedFromSuggestions}
        onOpenCustomCreator={() => setIsCustomQuizOpen(true)}
      />

      {/* Create Custom Quiz Modal */}
      <CreateCustomQuizModal
        isOpen={isCustomQuizOpen}
        onClose={() => setIsCustomQuizOpen(false)}
        onQuizCreated={handleCustomQuizCreated}
        onOpenSuggestions={() => setIsSuggestionsOpen(true)}
      />

      {/* How to Play Help Modal */}
      <HowToPlayModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* --- HOST EXPERIENCE --- */}
      {role === 'host' && (
        <>
          {hostGameStatus === 'LOBBY' && (
            <LobbyHost
              pin={hostPin}
              quizTitle={hostQuizTitle}
              players={hostPlayers}
              onStartGame={handleStartGame}
              onAddBot={handleAddBot}
              enableDomainBattles={true}
              onOpenForge={() => setIsSuggestionsOpen(true)}
              onOpenCustomCreator={() => setIsCustomQuizOpen(true)}
              onSwitchToPlayer={() => switchRole('player')}
              onOpenHelp={() => setIsHelpOpen(true)}
            />
          )}

          {(hostGameStatus === 'QUESTION_ACTIVE' || hostGameStatus === 'REVEAL') && (
            <GameHost
              question={hostCurrentQ}
              questionIndex={hostQuestionIndex}
              totalQuestions={hostTotalQuestions}
              timeLeft={hostTimeLeft}
              totalTime={hostTotalTime}
              answeredCount={hostAnsweredCount}
              totalPlayers={hostPlayers.length}
              isReveal={hostGameStatus === 'REVEAL'}
              revealData={hostRevealData}
              map={hostMap}
              players={hostPlayers}
              onNextQuestion={handleHostNextQuestion}
              onRevealNow={handleHostRevealNow}
              isSurgeRound={hostIsSurge}
            />
          )}

          {hostGameStatus === 'GAME_OVER' && hostEndReport && (
            <ReportHost
              winner={hostEndReport.winner}
              leaderboard={hostEndReport.leaderboard}
              map={hostEndReport.map}
              territoryStats={hostEndReport.territoryStats}
              onPlayAgain={() => handleHostCreateRoom()}
            />
          )}
        </>
      )}

      {/* --- PLAYER EXPERIENCE --- */}
      {role === 'player' && (
        <>
          {playerGameStatus === 'JOIN' && (
            <JoinPlayer
              onJoin={handlePlayerJoin}
              onSwitchToHost={() => switchRole('host')}
              initialPin={playerPin}
              errorMessage={joinErrorMessage}
              takenColors={takenColors}
              takenNames={takenNames}
            />
          )}

          {playerGameStatus === 'WAITING_LOBBY' && (
            <div className="min-h-screen bg-obsidian bg-cyber-grid text-bone flex flex-col justify-center items-center p-6 text-center space-y-6 select-none">
              <div className="p-4 bg-cyan-plasma/10 border-2 border-cyan-plasma rounded-3xl shadow-cyan-glow animate-pulse">
                <Swords className="w-12 h-12 text-cyan-plasma" />
              </div>
              <div className="space-y-2">
                <h1 className="font-heading font-extrabold text-2xl text-bone">
                  You're in the Game!
                </h1>
                <p className="text-sm font-mono text-ash">
                  Player: <span className="text-cyan-plasma font-bold">{playerInfo?.nickname}</span> • Room PIN: <span className="text-bone">{playerPin}</span>
                </p>
              </div>
              <div className="p-5 bg-slate border border-steel/60 rounded-3xl max-w-sm w-full text-xs text-ash space-y-2">
                <div className="text-bone font-bold uppercase">Quick Tip</div>
                <p>Look at the Host Screen when the game starts. Answer fast for bonus points and claim tiles on the territory map!</p>
              </div>
            </div>
          )}

          {(playerGameStatus === 'QUESTION_ACTIVE' || playerGameStatus === 'REVEAL') && (
            <GamePlayer
              player={playerInfo}
              question={playerCurrentQ}
              questionIndex={playerQIndex}
              totalQuestions={playerTotalQ}
              isSurgeRound={playerIsSurge}
              isLocked={playerIsLocked}
              isReveal={playerGameStatus === 'REVEAL'}
              revealResult={playerRevealResult}
              map={playerMap}
              actionPoints={playerActionPoints}
              onSubmitAnswer={handlePlayerSubmitAnswer}
              onTileAction={handlePlayerTileAction}
              onAntiCheatEvent={handlePlayerAntiCheat}
            />
          )}

          {playerGameStatus === 'GAME_OVER' && (
            <ReportPlayer
              player={playerInfo}
              winner={playerEndReport?.winner}
              leaderboard={playerEndReport?.leaderboard || []}
              map={playerEndReport?.map || playerMap}
              territoryStats={playerEndReport?.territoryStats}
              onJoinAnother={() => {
                setPlayerGameStatus('JOIN');
                setPlayerEndReport(null);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
