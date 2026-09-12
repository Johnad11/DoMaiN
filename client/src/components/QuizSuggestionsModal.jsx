import React, { useState } from 'react';
import { Sparkles, X, Trash2, CheckCircle2, Play, Loader2, PlusCircle } from 'lucide-react';
import { sound } from '../audio/soundEngine';

export default function QuizSuggestionsModal({ isOpen, onClose, onQuizCreated, onOpenCustomCreator }) {
  const [topic, setTopic] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [questionCount, setQuestionCount] = useState(12);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Review / Editor State
  const [suggestedQuiz, setSuggestedQuiz] = useState(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!topic.trim() && !sourceText.trim()) {
      setErrorMessage('Please enter a topic or paste some text.');
      return;
    }

    setErrorMessage('');
    setIsGenerating(true);
    sound.playSurge();

    try {
      const res = await fetch('/api/quiz-forge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: topic.trim(),
          sourceText: sourceText.trim(),
          apiKey: apiKey.trim(),
          questionCount
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not generate quiz');

      setSuggestedQuiz(data.quiz);
      sound.playCorrect();
    } catch (err) {
      setErrorMessage(err.message || 'Something went wrong generating questions.');
      sound.playWrong();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAndLaunch = () => {
    if (!suggestedQuiz) return;
    onQuizCreated(suggestedQuiz);
    onClose();
  };

  const updateQuestionText = (idx, newText) => {
    const updated = { ...suggestedQuiz };
    updated.questions[idx].text = newText;
    setSuggestedQuiz(updated);
  };

  const updateOptionText = (qIdx, optIdx, newText) => {
    const updated = { ...suggestedQuiz };
    updated.questions[qIdx].options[optIdx] = newText;
    setSuggestedQuiz(updated);
  };

  const setCorrectOption = (qIdx, optIdx) => {
    const updated = { ...suggestedQuiz };
    updated.questions[qIdx].correctIndex = optIdx;
    setSuggestedQuiz(updated);
  };

  const deleteQuestion = (qIdx) => {
    const updated = { ...suggestedQuiz };
    updated.questions.splice(qIdx, 1);
    setSuggestedQuiz(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-obsidian/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-3xl w-full bg-slate border border-cyan-plasma/40 rounded-3xl shadow-cyan-glow overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-steel/50 bg-obsidian/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-plasma/15 border border-cyan-plasma flex items-center justify-center text-cyan-plasma">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-lg text-bone">
                Quiz Suggestions
              </h2>
              <p className="text-xs text-ash">
                Pick a topic and instantly get ready-to-play questions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onOpenCustomCreator && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCustomCreator();
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-obsidian border border-green-bio/40 text-green-bio hover:border-green-bio text-xs font-semibold transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Write Own Questions</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-ash hover:text-bone hover:bg-steel/40 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {!suggestedQuiz ? (
            /* Suggestion Form */
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ash mb-1.5">
                  What topic would you like to play?
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. World Geography, 90s Pop Music, Space & Planets, Movies, Inventions"
                  className="w-full px-4 py-3 bg-obsidian border border-steel/60 focus:border-cyan-plasma rounded-2xl font-heading text-bone placeholder:text-ash/50 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ash mb-1.5">
                  Paste Notes or Study Material (Optional)
                </label>
                <textarea
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  rows={4}
                  placeholder="Paste article text, study notes, or textbook summaries to create questions from your own material..."
                  className="w-full px-4 py-3 bg-obsidian border border-steel/60 focus:border-cyan-plasma rounded-2xl font-body text-sm text-bone placeholder:text-ash/50 outline-none transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ash mb-1.5">
                  Number of Questions
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-obsidian border border-steel/60 focus:border-cyan-plasma rounded-2xl font-body text-bone outline-none"
                >
                  <option value={6}>6 Questions (Quick Game)</option>
                  <option value={12}>12 Questions (Standard Game)</option>
                  <option value={18}>18 Questions (Extended Game)</option>
                  <option value={24}>24 Questions (Grand Championship)</option>
                </select>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-blood/15 border border-red-blood text-red-blood text-xs rounded-xl">
                  {errorMessage}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-4 bg-cyan-plasma hover:bg-cyan-plasma/90 text-obsidian font-heading font-extrabold text-base rounded-2xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-cyan-glow btn-tactile border-b-4 border-cyan-400 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Preparing {questionCount} Questions...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Get Quiz Suggestions</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Quiz Review & Live Editor */
            <div className="space-y-5">
              <div className="p-4 bg-obsidian border border-steel/60 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-bone text-base">{suggestedQuiz.title}</h3>
                  <p className="text-xs text-ash">{suggestedQuiz.description}</p>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-green-bio/15 text-green-bio border border-green-bio/30">
                  {suggestedQuiz.questions.length} Questions
                </span>
              </div>

              <div className="space-y-4">
                {suggestedQuiz.questions.map((q, qIdx) => (
                  <div key={q.id || qIdx} className="p-4 bg-obsidian/70 border border-steel/40 rounded-2xl space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-mono text-xs font-bold text-cyan-plasma mt-1">#{qIdx + 1}</span>
                      <input
                        type="text"
                        value={q.text}
                        onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                        className="flex-1 bg-transparent border-b border-steel/60 focus:border-cyan-plasma font-heading font-semibold text-bone text-sm pb-1 outline-none"
                      />
                      {suggestedQuiz.questions.length > 2 && (
                        <button
                          onClick={() => deleteQuestion(qIdx)}
                          className="text-ash hover:text-red-blood p-1 transition-colors"
                          title="Remove question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = q.correctIndex === optIdx;
                        return (
                          <div
                            key={optIdx}
                            onClick={() => setCorrectOption(qIdx, optIdx)}
                            className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                              isCorrect
                                ? 'bg-green-bio/15 border-green-bio text-bone shadow-green-glow'
                                : 'bg-slate/50 border-steel/30 text-ash hover:border-steel'
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                              isCorrect ? 'bg-green-bio text-obsidian' : 'bg-steel/50 text-ash'
                            }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <input
                              type="text"
                              value={opt}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => updateOptionText(qIdx, optIdx, e.target.value)}
                              className="flex-1 bg-transparent text-xs text-bone outline-none"
                            />
                            {isCorrect && <CheckCircle2 className="w-4 h-4 text-green-bio ml-auto shrink-0" />}
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
        {suggestedQuiz && (
          <div className="p-4 border-t border-steel/50 bg-obsidian/50 flex items-center justify-between gap-3">
            <button
              onClick={() => setSuggestedQuiz(null)}
              className="px-4 py-2 text-ash hover:text-bone text-xs font-semibold transition-colors"
            >
              ← Choose Another Topic
            </button>
            <button
              onClick={handleSaveAndLaunch}
              className="px-6 py-3 bg-green-bio hover:bg-green-bio/90 text-obsidian font-heading font-extrabold text-sm rounded-2xl uppercase tracking-wider flex items-center gap-2 shadow-green-glow btn-tactile border-b-4 border-green-400"
            >
              <Play className="w-4 h-4 fill-obsidian" />
              <span>Launch This Quiz</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
