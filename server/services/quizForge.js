/**
 * DO-MAIN-IT — Quiz Suggestions Service
 * Generates custom quizzes from topics or study notes (up to 24 questions).
 */

const https = require('https');

/**
 * Procedural generator providing up to 24 clear, human, interesting questions.
 */
function generateProceduralQuiz({ topic, questionCount = 12, difficulty = 'medium' }) {
  const cleanTopic = (topic || 'General Knowledge').trim();

  // 24 unique, clear, human-focused question templates
  const questionPool = [
    {
      q: `What is the main goal or big idea behind ${cleanTopic}?`,
      correct: `Solving key problems and improving how things work in ${cleanTopic}`,
      distractors: [
        `Ignoring practical results and avoiding any real progress`,
        `Doing everything by hand with no organization`,
        `Relying on random luck instead of clear methods`
      ],
      exp: `${cleanTopic} focuses on solving real challenges through clear, structured thinking.`
    },
    {
      q: `Why is speed and responsiveness important in ${cleanTopic}?`,
      correct: `It gives people quick feedback and keeps everything running smoothly`,
      distractors: [
        `It slows down work and wastes people's time`,
        `It makes the system completely unresponsive`,
        `It causes unnecessary delays for everyone`
      ],
      exp: `Fast, dependable performance creates a better experience for everyone.`
    },
    {
      q: `True or False: Staying organized and double-checking work helps avoid mistakes in ${cleanTopic}.`,
      type: 'true_false',
      correct: `True`,
      distractors: [`False`],
      exp: `Careful checking and consistency catch errors before they become problems.`
    },
    {
      q: `When team members collaborate on ${cleanTopic}, what helps them succeed the most?`,
      correct: `Clear communication, shared goals, and mutual support`,
      distractors: [
        `Keeping all information a secret from each other`,
        `Never agreeing on what needs to be done`,
        `Refusing to share updates or ask questions`
      ],
      exp: `Teamwork thrives on open sharing and shared understanding.`
    },
    {
      q: `What is one of the biggest risks to avoid when studying or working with ${cleanTopic}?`,
      correct: `Assuming you know everything without testing your assumptions`,
      distractors: [
        `Taking the time to double-check important details`,
        `Learning from experienced mentors`,
        `Asking helpful questions when you are stuck`
      ],
      exp: `Testing your ideas against reality is how real understanding is built.`
    },
    {
      q: `True or False: Breaking a big topic like ${cleanTopic} into smaller steps makes it easier to master.`,
      type: 'true_false',
      correct: `True`,
      distractors: [`False`],
      exp: `Tackling one small piece at a time builds confidence and deep mastery.`
    },
    {
      q: `What is the smartest way to handle an unexpected challenge in ${cleanTopic}?`,
      correct: `Stay calm, break down the facts, and test solutions one by one`,
      distractors: [
        `Panic immediately and give up on the whole project`,
        `Ignore the issue and hope it magically disappears`,
        `Blame someone else without looking at what went wrong`
      ],
      exp: `Methodical problem-solving is the hallmark of expertise.`
    },
    {
      q: `Which habit creates the strongest long-term results in ${cleanTopic}?`,
      correct: `Regular practice, curiosity, and continuous learning`,
      distractors: [
        `Cramming once a year and forgetting everything the next day`,
        `Never reviewing what you did well or where you can improve`,
        `Avoiding any new ideas or modern tools`
      ],
      exp: `Consistent daily or weekly habits always beat sporadic effort.`
    },
    {
      q: `True or False: In ${cleanTopic}, keeping things simple is often better than making them unnecessarily complicated.`,
      type: 'true_false',
      correct: `True`,
      distractors: [`False`],
      exp: `Simplicity improves clarity, reduces bugs, and makes everything easier to maintain.`
    },
    {
      q: `What role does good feedback play in understanding ${cleanTopic}?`,
      correct: `It shows you what is working and points out where to improve`,
      distractors: [
        `It should be ignored because change is never necessary`,
        `It only exists to discourage learners`,
        `It has zero value for personal or project growth`
      ],
      exp: `Actionable feedback is the fastest shortcut to getting better.`
    },
    {
      q: `When making important decisions in ${cleanTopic}, what should guide you most?`,
      correct: `Reliable facts, clear evidence, and sound reasoning`,
      distractors: [
        `Rumors and unverified gossip from strangers`,
        `Whatever option requires zero thought or care`,
        `Blind guesses without looking at any data`
      ],
      exp: `Solid evidence and sound reasoning lead to decisions you can stand behind.`
    },
    {
      q: `True or False: You can learn a lot from mistakes when exploring ${cleanTopic}.`,
      type: 'true_false',
      correct: `True`,
      distractors: [`False`],
      exp: `Mistakes highlight blind spots and show the path to genuine improvement.`
    },
    {
      q: `What is the benefit of having a clear plan before diving into ${cleanTopic}?`,
      correct: `It keeps you focused on priorities and prevents wasted time`,
      distractors: [
        `It guarantees that nobody knows what to do next`,
        `It prevents you from ever finishing your work`,
        `It forces you to start over every morning`
      ],
      exp: `A clear direction gives purpose and structure to your effort.`
    },
    {
      q: `Which approach helps someone explain ${cleanTopic} best to a beginner?`,
      correct: `Using plain everyday language, relatable stories, and clear examples`,
      distractors: [
        `Using confusing jargon and refusing to answer questions`,
        `Speaking as fast as possible without pausing`,
        `Assuming the beginner already knows advanced theory`
      ],
      exp: `True mastery means being able to explain complex ideas simply.`
    },
    {
      q: `True or False: Technology and methods in ${cleanTopic} continue to evolve over time.`,
      type: 'true_false',
      correct: `True`,
      distractors: [`False`],
      exp: `Every field evolves as new tools, research, and ideas emerge.`
    },
    {
      q: `What helps maintain consistency when working on ${cleanTopic}?`,
      correct: `Setting realistic milestones and checking in on your progress`,
      distractors: [
        `Setting impossible goals and quitting after day one`,
        `Changing direction every five minutes with no purpose`,
        `Never writing down your tasks or responsibilities`
      ],
      exp: `Measurable milestones keep motivation high and progress steady.`
    },
    {
      q: `Why is it valuable to hear different viewpoints regarding ${cleanTopic}?`,
      correct: `It uncovers fresh angles and helps spot blind spots you missed`,
      distractors: [
        `It makes decisions completely impossible forever`,
        `It ensures everyone stays confused`,
        `It removes all creative thinking from the team`
      ],
      exp: `Diverse perspectives lead to stronger, more resilient solutions.`
    },
    {
      q: `True or False: High quality always matters more than rushing out sloppy work in ${cleanTopic}.`,
      type: 'true_false',
      correct: `True`,
      distractors: [`False`],
      exp: `Quality work lasts, builds trust, and saves time in the long run.`
    },
    {
      q: `What is the most effective way to test your knowledge of ${cleanTopic}?`,
      correct: `Answering practical questions, teaching others, and applying what you know`,
      distractors: [
        `Glancing at a headline for two seconds`,
        `Pretending you understand without ever trying it out`,
        `Closing your eyes and guessing blindly`
      ],
      exp: `Active recall and hands-on practice prove whether you truly understand a topic.`
    },
    {
      q: `How does keeping good records help in ${cleanTopic}?`,
      correct: `It lets you review what worked, share knowledge, and build on past success`,
      distractors: [
        `It fills up drawers with paper nobody will ever read`,
        `It stops all future progress from happening`,
        `It guarantees that secrets get lost forever`
      ],
      exp: `Good documentation turns temporary wins into lasting knowledge.`
    },
    {
      q: `True or False: Staying patient and persistent pays off when mastering ${cleanTopic}.`,
      type: 'true_false',
      correct: `True`,
      distractors: [`False`],
      exp: `Great skills take time, patience, and repetition to flourish.`
    },
    {
      q: `What is a great sign that someone is really skilled in ${cleanTopic}?`,
      correct: `They can solve difficult problems cleanly and help others do the same`,
      distractors: [
        `They boast loudly but produce zero results`,
        `They make simple tasks look impossibly hard`,
        `They refuse to let anyone else succeed`
      ],
      exp: `Real competence shows in reliable outcomes and lifting others up.`
    },
    {
      q: `Why is safety and security always a top priority in ${cleanTopic}?`,
      correct: `It protects people, preserves data, and builds long-term trust`,
      distractors: [
        `It has no practical benefit and wastes resources`,
        `It encourages dangerous shortcuts`,
        `It makes systems fragile and unpredictable`
      ],
      exp: `Trust is the foundation of any enduring system or discipline.`
    },
    {
      q: `True or False: Curiosity and asking "why" is the spark behind major breakthroughs in ${cleanTopic}.`,
      type: 'true_false',
      correct: `True`,
      distractors: [`False`],
      exp: `Deep curiosity leads to discoveries that change how we see the world.`
    }
  ];

  // Support up to 24 questions!
  const count = Math.min(Math.max(4, questionCount), 24);
  const questions = [];

  for (let i = 0; i < count; i++) {
    const template = questionPool[i % questionPool.length];
    const isTf = template.type === 'true_false';
    const allOptions = isTf ? ['True', 'False'] : [template.correct, ...template.distractors];
    const correctIndex = isTf ? (template.correct === 'True' ? 0 : 1) : 0;

    questions.push({
      id: `suggest_${Date.now()}_${i + 1}`,
      text: template.q,
      type: isTf ? 'true_false' : 'multiple_choice',
      timeLimit: isTf ? 15 : 20,
      options: allOptions,
      correctIndex: correctIndex,
      explanation: template.exp
    });
  }

  return {
    id: `quiz-suggest-${Date.now()}`,
    title: cleanTopic.slice(0, 45),
    description: `A ${count}-question tactical quiz exploring ${cleanTopic}.`,
    category: 'Quiz Suggestions',
    coverIcon: 'Sparkles',
    questions
  };
}

/**
 * Calls Google Gemini API if GEMINI_API_KEY is supplied
 */
async function callGemini({ prompt, apiKey, questionCount = 12 }) {
  const count = Math.min(Math.max(4, questionCount), 24);
  const promptText = `You are the DO-MAIN-IT Quiz Suggestions engine. Create a lively, clear, fun, and accurate multiplayer trivia quiz in structured JSON.
Return ONLY valid JSON matching this exact structure:
{
  "title": "Quiz Title",
  "description": "Short friendly summary",
  "category": "Topic Name",
  "questions": [
    {
      "id": "q1",
      "text": "Clear, engaging question text?",
      "type": "multiple_choice",
      "timeLimit": 20,
      "options": ["Correct Answer", "Plausible Distractor 1", "Plausible Distractor 2", "Plausible Distractor 3"],
      "correctIndex": 0,
      "explanation": "Clear one-sentence explanation"
    }
  ]
}
Write in clear, simple, human English. The correct option must always be index 0 in the options array.
Create exactly ${count} high-quality trivia questions about: ${prompt}`;

  const payload = JSON.stringify({
    contents: [
      {
        parts: [
          { text: promptText }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7
    }
  });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            return reject(new Error(parsed.error.message || 'Gemini API returned an error'));
          }
          const textCandidate = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!textCandidate) {
            return reject(new Error('No response content from Gemini'));
          }
          const quiz = JSON.parse(textCandidate);
          quiz.id = `quiz-gemini-${Date.now()}`;
          // Clean title: remove any Forge Master artifacts
          quiz.title = (quiz.title || prompt).replace(/\s*\{Forge Master\}|\s*\[Forge Master\]/gi, '').trim();

          // Normalize questions structure
          if (Array.isArray(quiz.questions)) {
            quiz.questions = quiz.questions.map((q, idx) => {
              const text = q.text || q.question_text || q.question || `Question ${idx + 1}`;
              const options = Array.isArray(q.options) ? q.options : ['Yes', 'No'];
              let correctIndex = typeof q.correctIndex === 'number' ? q.correctIndex : 0;
              if (q.correct_answer && options.includes(q.correct_answer)) {
                correctIndex = options.indexOf(q.correct_answer);
              }
              return {
                id: q.id || `gemini_${Date.now()}_${idx + 1}`,
                text,
                type: q.type || (options.length === 2 ? 'true_false' : 'multiple_choice'),
                timeLimit: q.timeLimit || 20,
                options,
                correctIndex,
                explanation: q.explanation || ''
              };
            });
          }

          resolve(quiz);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

/**
 * Calls OpenAI API if OPENAI_API_KEY is supplied
 */
async function callOpenAI({ prompt, apiKey, questionCount = 12 }) {
  const count = Math.min(Math.max(4, questionCount), 24);
  const systemPrompt = `You are the DO-MAIN-IT Quiz Suggestions engine. Create a lively, clear, fun, and accurate multiplayer trivia quiz in structured JSON.
Return ONLY valid JSON matching this structure:
{
  "title": "Quiz Title",
  "description": "Short friendly summary",
  "category": "Topic Name",
  "questions": [
    {
      "id": "q1",
      "text": "Clear, engaging question text?",
      "type": "multiple_choice",
      "timeLimit": 20,
      "options": ["Correct Answer", "Plausible Distractor 1", "Plausible Distractor 2", "Plausible Distractor 3"],
      "correctIndex": 0,
      "explanation": "Clear one-sentence explanation"
    }
  ]
}
Write in clear, simple, human English. The correct option must always be at index 0 in the options array.`;

  const payload = JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Create ${count} high-quality trivia questions about: ${prompt}` }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7
  });

  return new Promise((resolve, reject) => {
    const req = https.request('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            return reject(new Error(parsed.error.message));
          }
          const content = parsed.choices[0].message.content;
          const quiz = JSON.parse(content);
          quiz.id = `quiz-ai-${Date.now()}`;
          resolve(quiz);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function forgeQuiz({ prompt, sourceText, apiKey, questionCount = 12 }) {
  const geminiKey = process.env.GEMINI_API_KEY || apiKey;
  const openaiKey = process.env.OPENAI_API_KEY;
  const inputTopic = prompt || (sourceText ? sourceText.slice(0, 100) : 'General Knowledge');
  const count = Math.min(Math.max(4, Number(questionCount) || 12), 24);

  // 1. Try Google Gemini API if configured
  if (geminiKey) {
    try {
      const geminiQuiz = await callGemini({
        prompt: sourceText ? `Summary of source material: ${sourceText.slice(0, 3000)}\nTopic: ${inputTopic}` : inputTopic,
        apiKey: geminiKey,
        questionCount: count
      });
      return geminiQuiz;
    } catch (err) {
      console.warn('Gemini API call failed, falling back to procedural engine:', err.message);
    }
  }

  // 2. Try OpenAI API if configured
  if (openaiKey) {
    try {
      const aiQuiz = await callOpenAI({
        prompt: sourceText ? `Summary: ${sourceText.slice(0, 2000)}\nTopic: ${inputTopic}` : inputTopic,
        apiKey: openaiKey,
        questionCount: count
      });
      return aiQuiz;
    } catch (err) {
      console.warn('OpenAI API call failed, falling back to procedural engine:', err.message);
    }
  }

  // 3. Fallback to built-in procedural engine (zero setup, works offline)
  return generateProceduralQuiz({ topic: inputTopic, questionCount: count });
}

module.exports = {
  forgeQuiz,
  generateProceduralQuiz,
  callGemini,
  callOpenAI
};
