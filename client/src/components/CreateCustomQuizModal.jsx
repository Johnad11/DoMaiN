import React, { useState } from 'react';
import { PlusCircle, Trash2, CheckCircle2, Play, Plus, Clock, HelpCircle, Sparkles, X } from 'lucide-react';
import { sound } from '../audio/soundEngine';
import { getServerUrl } from '../utils/serverUrl';

const OPTION_THEMES = [
  { label: 'A', bg: 'bg-cyan-plasma/10', border: 'border-cyan-plasma/40', text: 'text-cyan-plasma', ring: 'ring-cyan-plasma' },
  { label: 'B', bg: 'bg-orange-magma/10', border: 'border-orange-magma/40', text: 'text-orange-magma', ring: 'ring-orange-magma' },
  { label: 'C', bg: 'bg-purple-neon/10', border: 'border-purple-neon/40', text: 'text-purple-neon', ring: 'ring-purple-neon' },
  { label: 'D', bg: 'bg-green-bio/10', border: 'border-green-bio/40', text: 'text-green-bio', ring: 'ring-green-bio' }
];

const DEFAULT_SAMPLE_QUESTIONS = [
  {
    text: "What is the fastest land animal on Earth?",
    options: ["Cheetah", "Lion", "Pronghorn", "Peregrine Falcon"],
    correctIndex: 0,
    timeLimit: 20
  },
  {
    text: "How many sides does a hexagon have?",
    options: ["5", "6", "8", "12"],
    correctIndex: 1,
    timeLimit: 20
  }
];

export default function CreateCustomQuizModal({
  isOpen,
  onClose,
  onQuizCreated,
  onOpenSuggestions
}) {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([
    {
      text: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      timeLimit: 20
    }
  ]);
  const [validationError, setValidationError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleAddQuestion = () => {
    if (questions.length >= 24) {
      setValidationError('You can add up to 24 questions per quiz.');
      return;
    }
    sound.playClaimTile();
    setValidationError('');
    setQuestions(prev => [
      ...prev,
      {
        text: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        timeLimit: 20
      }
    ]);
  };

  const handleRemoveQuestion = (qIdx) => {
    if (questions.length <= 1) {
      setValidationError('Your quiz must have at least one question.');
      return;
    }
    sound.playShieldBreak();
    setValidationError('');
    setQuestions(prev => prev.filter((_, idx) => idx !== qIdx));
  };

  const handleUpdateQuestionText = (qIdx, text) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[qIdx] = { ...copy[qIdx], text };
      return copy;
    });
  };

  const handleUpdateOption = (qIdx, optIdx, text) => {
    setQuestions(prev => {
      const copy = [...prev];
      const newOpts = [...copy[qIdx].options];
      newOpts[optIdx] = text;
      copy[qIdx] = { ...copy[qIdx], options: newOpts };
      return copy;
    });
  };

  const handleSelectCorrect = (qIdx, optIdx) => {
    sound.playCorrect();
    setQuestions(prev => {
      const copy = [...prev];
      copy[qIdx] = { ...copy[qIdx], correctIndex: optIdx };
      return copy;
    });
  };

  const handleUpdateTimeLimit = (qIdx, timeLimit) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[qIdx] = { ...copy[qIdx], timeLimit: Number(timeLimit) };
      return copy;
    });
  };

  const handleLoadSample = () => {
    sound.playJoin();
    setTitle('General Knowledge Arena');
    setQuestions(DEFAULT_SAMPLE_QUESTIONS);
    setValidationError('');
  };

  const handleSaveQuiz = async () => {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setValidationError('Please give your quiz a title (e.g. "My Family Trivia").');
      return;
    }

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        setValidationError(`Question #${i + 1} is missing its question text.`);
        return;
      }
      for (let j = 0; j < 4; j++) {
        if (!q.options[j] || !q.options[j].trim()) {
          setValidationError(`Question #${i + 1}, Option ${String.fromCharCode(65 + j)} is empty.`);
          return;
        }
      }
    }

    setValidationError('');
    setIsSaving(true);
    sound.playSurge();

    try {
      const res = await fetch(`${getServerUrl()}/api/quizzes/custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: cleanTitle,
          questions
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save quiz');

      onQuizCreated(data.quiz);
      onClose();
    } catch (err) {
      setValidationError(err.message || 'Error saving custom quiz.');
      sound.playWrong();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-obsidian/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto select-none">
      <div className="max-w-3xl w-full bg-slate border border-green-bio/40 rounded-3xl shadow-green-glow overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-steel/50 bg-obsidian/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-green-bio/15 border border-green-bio flex items-center justify-center text-green-bio">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-lg text-bone">
                Create Your Own Questions
              </h2>
              <p className="text-xs text-ash">
                Write personal trivia, custom multiple choice, and host with your rules
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenSuggestions && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSuggestions();
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-obsidian border border-cyan-plasma/40 text-cyan-plasma hover:border-cyan-plasma text-xs font-semibold transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Need suggestions?</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-ash hover:text-bone hover:bg-steel/30 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Quiz Title Banner */}
          <div className="space-y-2">
            <label className="block text-xs font-heading font-bold text-ash uppercase tracking-wider">
              Quiz Title
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Friday Team Trivia, History Master, Family Night..."
                className="flex-1 px-4 py-3 bg-obsidian border border-steel/60 focus:border-green-bio rounded-2xl text-bone placeholder-ash/50 outline-none text-sm transition-all"
              />
              <button
                type="button"
                onClick={handleLoadSample}
                className="px-3.5 py-2 rounded-2xl bg-obsidian border border-steel/60 hover:border-bone text-ash hover:text-bone text-xs font-medium transition-all"
                title="Fill with sample questions to customize"
              >
                Sample
              </button>
            </div>
          </div>

          {/* Validation Banner */}
          {validationError && (
            <div className="p-3.5 bg-red-blood/15 border border-red-blood text-red-blood text-xs rounded-2xl font-medium flex items-center justify-between">
              <span>{validationError}</span>
              <button onClick={() => setValidationError('')} className="underline text-[11px] ml-2">Dismiss</button>
            </div>
          )}

          {/* Question List */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-heading font-bold text-bone uppercase tracking-wider">
                Questions ({questions.length} / 24)
              </span>
              <span className="text-[11px] text-ash">
                Click the checkmark next to an answer to set the correct one
              </span>
            </div>

            {questions.map((q, qIdx) => (
              <div
                key={qIdx}
                className="p-5 bg-obsidian/70 border border-steel/50 rounded-2xl space-y-4 hover:border-steel transition-all"
              >
                {/* Question Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-green-bio/20 text-green-bio font-heading font-bold text-xs flex items-center justify-center">
                      {qIdx + 1}
                    </span>
                    <span className="font-heading font-bold text-xs text-bone">
                      Question {qIdx + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Time Limit Selector */}
                    <div className="flex items-center gap-1.5 text-xs text-ash">
                      <Clock className="w-3.5 h-3.5 text-cyan-plasma" />
                      <select
                        value={q.timeLimit || 20}
                        onChange={(e) => handleUpdateTimeLimit(qIdx, e.target.value)}
                        className="bg-obsidian border border-steel/60 rounded-xl px-2 py-1 text-xs text-bone outline-none focus:border-cyan-plasma"
                      >
                        <option value={10}>10s</option>
                        <option value={15}>15s</option>
                        <option value={20}>20s</option>
                        <option value={30}>30s</option>
                        <option value={45}>45s</option>
                        <option value={60}>60s</option>
                      </select>
                    </div>

                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIdx)}
                        className="p-1.5 text-ash hover:text-red-blood hover:bg-red-blood/10 rounded-xl transition-all"
                        title="Delete question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Question Text */}
                <input
                  type="text"
                  value={q.text}
                  onChange={(e) => handleUpdateQuestionText(qIdx, e.target.value)}
                  placeholder={`Type question #${qIdx + 1} here...`}
                  className="w-full px-4 py-3 bg-slate border border-steel/60 focus:border-green-bio rounded-xl text-bone placeholder-ash/50 outline-none text-sm transition-all"
                />

                {/* 4 Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {q.options.map((opt, optIdx) => {
                    const isCorrect = q.correctIndex === optIdx;
                    const theme = OPTION_THEMES[optIdx];

                    return (
                      <div
                        key={optIdx}
                        className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                          isCorrect
                            ? 'bg-green-bio/15 border-green-bio ring-1 ring-green-bio'
                            : 'bg-slate border-steel/40 hover:border-steel'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleSelectCorrect(qIdx, optIdx)}
                          className={`w-7 h-7 rounded-lg font-heading font-extrabold text-xs flex items-center justify-center transition-all ${
                            isCorrect
                              ? 'bg-green-bio text-obsidian shadow-green-glow scale-105'
                              : `${theme.bg} ${theme.border} ${theme.text} hover:opacity-100`
                          }`}
                          title={isCorrect ? 'Correct Answer' : 'Click to set as correct answer'}
                        >
                          {isCorrect ? '✓' : theme.label}
                        </button>

                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                          placeholder={`Option ${theme.label}...`}
                          className="flex-1 bg-transparent text-bone text-xs outline-none placeholder-ash/40"
                        />

                        {isCorrect && (
                          <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-green-bio pr-1.5">
                            Correct
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Add Question Button */}
          <button
            type="button"
            onClick={handleAddQuestion}
            className="w-full py-3.5 bg-obsidian border-2 border-dashed border-steel/60 hover:border-green-bio/80 text-ash hover:text-green-bio rounded-2xl font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:bg-green-bio/5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Another Question ({questions.length} / 24)</span>
          </button>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-steel/50 bg-obsidian/60 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-ash">
            Total: <span className="text-bone font-bold">{questions.length} Questions</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-steel/30 hover:bg-steel/50 text-ash hover:text-bone font-heading text-xs font-bold uppercase tracking-wider transition-all"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveQuiz}
              disabled={isSaving}
              className="px-7 py-3 bg-green-bio hover:bg-green-bio/90 text-obsidian font-heading font-extrabold text-xs rounded-2xl uppercase tracking-wider flex items-center gap-2 shadow-green-glow btn-tactile border-b-4 border-green-400 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-obsidian" />
              <span>{isSaving ? 'Saving...' : 'Save & Host Quiz'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
