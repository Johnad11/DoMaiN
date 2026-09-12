import React, { useState } from 'react';
import { Sparkles, X, Plus, Trash2, CheckCircle2, Play, Cpu } from 'lucide-react';
import { sound } from '../audio/soundEngine';

export default function QuizForgeModal({ isOpen, onClose, onQuizCreated }) {
  const [topic, setTopic] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [questionCount, setQuestionCount] = useState(6);
  const [isForging, setIsForging] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Review / Editor State
  const [forgedQuiz, setForgedQuiz] = useState(null);

  if (!isOpen) return null;

  const handleForge = async () => {
    if (!topic && !sourceText) {
      setErrorMessage('Please enter a topic or paste study text/notes');
      return;
    }

    setErrorMessage('');
    setIsForging(true);
    sound.playSurge();

    try {
      const res = await fetch('/api/quiz-forge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: topic,
          sourceText,
          apiKey,
          questionCount
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Forge generation failed');

      setForgedQuiz(data.quiz);
      sound.playCorrect();
    } catch (err) {
      setErrorMessage(err.message || 'Error communicating with Quiz Forge');
      sound.playWrong();
    } finally {
      setIsForging(false);
    }
  };

  const handleSaveAndLaunch = () => {
    if (!forgedQuiz) return;
    onQuizCreated(forgedQuiz);
    onClose();
  };

  const updateQuestionText = (idx, newText) => {
    const updated = { ...forgedQuiz };
    updated.questions[idx].text = newText;
    setForgedQuiz(updated);
  };

  const updateOptionText = (qIdx, optIdx, newText) => {
    const updated = { ...forgedQuiz };
    updated.questions[qIdx].options[optIdx] = newText;
    setForgedQuiz(updated);
  };

  const setCorrectOption = (qIdx, optIdx) => {
    const updated = { ...forgedQuiz };
    updated.questions[qIdx].correctIndex = optIdx;
    setForgedQuiz(updated);
  };

  const deleteQuestion = (qIdx) => {
    const updated = { ...forgedQuiz };
    updated.questions.splice(qIdx, 1);
    setForgedQuiz(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-obsidian/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-3xl w-full bg-slate border border-cyan-plasma/40 rounded-2xl shadow-cyan-glow overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-steel/50 bg-obsidian/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-cyan-plasma/15 border border-cyan-plasma flex items-center justify-center text-cyan-plasma">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-lg text-bone uppercase tracking-wider flex items-center gap-2">
                AI Quiz Forge <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-plasma/20 text-cyan-plasma">v1.0</span>
              </h2>
              <p className="text-xs text-ash font-body">
                Transform any topic, notes, or prompt into a tactical domain arena quiz.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-ash hover:text-bone hover:bg-steel/40 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {!forgedQuiz ? (
            /* Forge Generator Form */
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-ash mb-1.5">
                  Topic or Theme
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Cyberpunk 2077 Lore, Quantum Computing, Rome Siege Tactics, JavaScript Internals"
                  className="w-full px-4 py-3 bg-obsidian border border-steel/60 focus:border-cyan-plasma rounded-xl font-heading text-bone placeholder:text-ash/50 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-ash mb-1.5">
                  Source Notes / Raw Text (Optional)
                </label>
                <textarea
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  rows={4}
                  placeholder="Paste article, study notes, or syllabus content here to extract questions..."
                  className="w-full px-4 py-2.5 bg-obsidian border border-steel/60 focus:border-cyan-plasma rounded-xl font-body text-sm text-bone placeholder:text-ash/50 outline-none transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-ash mb-1.5">
                    Question Count
                  </label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-obsidian border border-steel/60 focus:border-cyan-plasma rounded-xl font-mono text-bone outline-none"
                  >
                    <option value={4}>4 Questions (Blitz)</option>
                    <option value={6}>6 Questions (Standard)</option>
                    <option value={8}>8 Questions (Tactical)</option>
                    <option value={12}>12 Questions (Grand Arena)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-ash mb-1.5">
                    Custom OpenAI API Key (Optional)
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-... (Leave empty to use built-in smart engine)"
                    className="w-full px-4 py-3 bg-obsidian border border-steel/60 focus:border-cyan-plasma rounded-xl font-mono text-xs text-bone placeholder:text-ash/50 outline-none"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-blood/15 border border-red-blood text-red-blood text-xs font-mono rounded-xl">
                  {errorMessage}
                </div>
              )}

              <button
                onClick={handleForge}
                disabled={isForging}
                className="w-full py-4 bg-cyan-plasma hover:bg-cyan-plasma/90 text-obsidian font-heading font-extrabold text-base rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-cyan-glow btn-tactile border-b-4 border-cyan-400 disabled:opacity-50"
              >
                {isForging ? (
                  <>
                    <Cpu className="w-5 h-5 animate-spin" />
                    <span>Synthesizing Arena Questions...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Forge Tactical Quiz</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Quiz Review & Live Editor */
            <div className="space-y-6">
              <div className="p-4 bg-obsidian border border-steel/60 rounded-xl flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-bone text-base">{forgedQuiz.title}</h3>
                  <p className="text-xs text-ash font-body">{forgedQuiz.description}</p>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-green-bio/15 text-green-bio border border-green-bio/30">
                  {forgedQuiz.questions.length} Questions Generated
                </span>
              </div>

              <div className="space-y-4">
                {forgedQuiz.questions.map((q, qIdx) => (
                  <div key={q.id || qIdx} className="p-4 bg-obsidian/70 border border-steel/40 rounded-xl space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-mono text-xs font-bold text-cyan-plasma mt-1">Q{qIdx + 1}</span>
                      <input
                        type="text"
                        value={q.text}
                        onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                        className="flex-1 bg-transparent border-b border-steel/60 focus:border-cyan-plasma font-heading font-semibold text-bone text-sm pb-1 outline-none"
                      />
                      {forgedQuiz.questions.length > 2 && (
                        <button
                          onClick={() => deleteQuestion(qIdx)}
                          className="text-ash hover:text-red-blood p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = q.correctIndex === optIdx;
                        return (
                          <div
                            key={optIdx}
                            onClick={() => setCorrectOption(qIdx, optIdx)}
                            className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                              isCorrect
                                ? 'bg-green-bio/15 border-green-bio text-bone shadow-green-glow'
                                : 'bg-slate/50 border-steel/30 text-ash hover:border-steel'
                            }`}
                          >
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                              isCorrect ? 'bg-green-bio text-obsidian' : 'bg-steel/50 text-ash'
                            }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <input
                              type="text"
                              value={opt}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => updateOptionText(qIdx, optIdx, e.target.value)}
                              className="flex-1 bg-transparent text-xs font-body text-bone outline-none"
                            />
                            {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-green-bio ml-auto" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {forgedQuiz && (
          <div className="p-4 border-t border-steel/50 bg-obsidian/50 flex items-center justify-between gap-3">
            <button
              onClick={() => setForgedQuiz(null)}
              className="px-4 py-2 text-ash hover:text-bone text-xs font-mono"
            >
              ← Forge Another Topic
            </button>
            <button
              onClick={handleSaveAndLaunch}
              className="px-6 py-3 bg-green-bio hover:bg-green-bio/90 text-obsidian font-heading font-extrabold text-sm rounded-xl uppercase tracking-wider flex items-center gap-2 shadow-green-glow btn-tactile border-b-4 border-green-400"
            >
              <Play className="w-4 h-4 fill-obsidian" />
              <span>Launch Live Game</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
