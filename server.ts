import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Error instantiating GoogleGenAI client:', err);
  }
}

function safeParseJSON<T>(text: string | null | undefined, fallback: T): T {
  if (!text || typeof text !== 'string') {
    return fallback;
  }

  const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
  if (!cleaned) return fallback;

  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.warn('JSON.parse failed on Gemini response text, extracting JSON safely:', err);
    try {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]) as T;
      }
    } catch (regexErr) {
      console.error('Regex JSON extraction failed:', regexErr);
    }
    return fallback;
  }
}

// Endpoint: AI Task Planner
app.post('/api/ai/plan', async (req, res) => {
  try {
    const { goal, timeAvailable, focusArea, contextNotes } = req.body || {};

    if (!goal) {
      return res.status(400).json({ error: 'Goal is required' });
    }

    if (!ai) {
      return res.status(530).json({ error: 'Gemini API client not initialized' });
    }

    const prompt = `You are FocusQuest AI Master Planner. Create a structured, highly actionable quest plan for a user.
User Goal: "${goal}"
Available Time: "${timeAvailable || '60 minutes'}"
Focus Domain: "${focusArea || 'General Productivity'}"
Additional Notes: "${contextNotes || 'None'}"

Generate 3 logical, high-impact tasks. Each task should have estimated minutes, priority (High, Medium, or Low), tags, and 2-4 subtasks.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an elite productivity strategist and gamified task planner. Respond ONLY with valid JSON matching the requested schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            planTitle: { type: Type.STRING },
            summary: { type: Type.STRING },
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                  estimatedMinutes: { type: Type.INTEGER },
                  tags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  subtasks: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['title', 'description', 'priority', 'estimatedMinutes', 'tags', 'subtasks'],
              },
            },
            aiTips: { type: Type.STRING },
          },
          required: ['planTitle', 'summary', 'tasks', 'aiTips'],
        },
      },
    });

    const parsedData = safeParseJSON(response.text, null);
    if (!parsedData || !Array.isArray((parsedData as Record<string, unknown>).tasks)) {
      throw new Error('Gemini output could not be parsed into a valid AI plan schema');
    }

    return res.json(parsedData);
  } catch (error) {
    console.error('Error generating AI plan:', error);
    return res.status(500).json({ error: 'Failed to generate AI plan', details: String(error) });
  }
});

// Endpoint: AI Subtask Generator
app.post('/api/ai/subtasks', async (req, res) => {
  try {
    const { taskTitle, taskDescription } = req.body || {};

    if (!taskTitle) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    if (!ai) {
      return res.status(503).json({ error: 'Gemini API client not initialized' });
    }

    const prompt = `Break down this task into 3-5 concrete, step-by-step subtasks:
Task: "${taskTitle}"
Description: "${taskDescription || ''}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subtasks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['subtasks'],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    return res.json(parsedData);
  } catch (error) {
    console.error('Error generating subtasks:', error);
    return res.status(500).json({ error: 'Failed to generate subtasks' });
  }
});

// Endpoint: AI Cognitive Coach (Tiny Step Mode & Learning Style)
app.post('/api/ai/coach', async (req, res) => {
  try {
    const { goalTitle, learningStyle, isTinyStepMode, timeBlock, focusDomain } = req.body || {};

    if (!goalTitle) {
      return res.status(400).json({ error: 'Goal title is required' });
    }

    if (!ai) {
      return res.status(530).json({ error: 'Gemini client uninitialized' });
    }

    const styleDirectives: Record<string, string> = {
      Visual: 'Generate a study plan using diagrams, flowcharts, colors and visual explanations.',
      Auditory: 'Generate a study plan using explanations, discussions and verbal learning.',
      Reading: 'Generate bullet summaries, notes, flashcards and text-based learning.',
      Kinesthetic: 'Generate hands-on activities, practice questions and interactive learning.',
    };

    const selectedDirective = styleDirectives[learningStyle] || styleDirectives['Visual'];

    const prompt = `You are FocusQuest AI Cognitive Coach designed specifically for neurodivergent students (ADHD, Autism, Dyslexia).
Task / Goal: "${goalTitle}"
Selected Learning Style: "${learningStyle || 'Visual'}"
Selected Time Block: "${timeBlock || '30 minutes'}"
Selected Focus Domain: "${focusDomain || 'Academics & Study'}"
STRICT LEARNING STYLE INSTRUCTION: ${selectedDirective}
Tiny Step Mode Enabled: ${isTinyStepMode ? 'YES (Break into 2-5 min micro-actions to beat task initiation paralysis)' : 'NO'}

Create a supportive, empathetic coaching plan tailored strictly for a ${learningStyle} learner.
Return a structured JSON object containing:
- goalTitle: The task title
- coachMessage: A warm empathetic coach message addressing task initiation friction
- motivation: A short inspiring motivational quote or statement to boost dopamine
- estimatedTime: Total estimated completion time (e.g. "${timeBlock || '35 minutes'}")
- resources: An array of 3 recommended tools or reference materials tailored to ${learningStyle} learning (e.g. visual flowcharts, flashcards, speech notes, hands-on tasks)
- learningTips: An array of 3 specific actionable learning tips tailored to ${learningStyle} learning in ${focusDomain || 'Academics'}
- steps: An array of 3-5 micro-steps, each with stepNumber, title, estimatedMinutes, and learningStyleHint
- learningStyleUsed: "${learningStyle || 'Visual'}"
- isTinyStepMode: boolean`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an empathetic ADHD & neurodivergent study coach. Speak warmly, reduce cognitive overload, and tailor every step strictly to the requested learning style.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            goalTitle: { type: Type.STRING },
            coachMessage: { type: Type.STRING },
            motivation: { type: Type.STRING },
            estimatedTime: { type: Type.STRING },
            resources: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            learningTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  estimatedMinutes: { type: Type.INTEGER },
                  learningStyleHint: { type: Type.STRING },
                },
                required: ['stepNumber', 'title', 'estimatedMinutes'],
              },
            },
            learningStyleUsed: { type: Type.STRING },
            isTinyStepMode: { type: Type.BOOLEAN },
          },
          required: ['goalTitle', 'coachMessage', 'steps', 'learningStyleUsed', 'isTinyStepMode'],
        },
      },
    });

    const parsedData = safeParseJSON(response.text, null);
    if (!parsedData) {
      throw new Error('Gemini output could not be parsed into a valid coach plan');
    }
    return res.json(parsedData);
  } catch (err) {
    console.error('Error generating cognitive coach plan:', err);
    return res.status(500).json({ error: 'Failed to generate coach plan' });
  }
});

// Endpoint: AI Knowledge Galaxy Generator
app.post('/api/ai/galaxy', async (req, res) => {
  try {
    const { topic } = req.body || {};
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    if (!ai) {
      return res.status(530).json({ error: 'Gemini client uninitialized' });
    }

    const prompt = `You are FocusQuest Knowledge Universe Architect.
Generate an interactive, structured learning constellation (knowledge graph) for the study topic: "${topic}".

Generate 6 sequential micro-concept nodes forming a progression path from basic foundations to boss mastery.
Provide x (percentage 15 to 85) and y (percentage 15 to 80) coordinates so they render as an aesthetically balanced constellation network.

Assign node types ('completed', 'active', 'target', 'locked', 'boss').
Include dependencies (node IDs) and connections (node IDs).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a Knowledge Graph Architect. Return strictly valid JSON matching the requested schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            galaxyTitle: { type: Type.STRING },
            description: { type: Type.STRING },
            recommendedNodeId: { type: Type.STRING },
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  category: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['locked', 'completed', 'active', 'target', 'boss'] },
                  x: { type: Type.INTEGER },
                  y: { type: Type.INTEGER },
                  difficulty: { type: Type.STRING, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
                  estimatedTime: { type: Type.INTEGER },
                  xp: { type: Type.INTEGER },
                  dependencies: { type: Type.ARRAY, items: { type: Type.STRING } },
                  connections: { type: Type.ARRAY, items: { type: Type.STRING } },
                  summary: { type: Type.STRING },
                  resources: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['id', 'title', 'category', 'type', 'x', 'y', 'difficulty', 'estimatedTime', 'xp', 'dependencies', 'connections', 'summary', 'resources'],
              },
            },
          },
          required: ['galaxyTitle', 'description', 'recommendedNodeId', 'nodes'],
        },
      },
    });

    const parsedData = safeParseJSON(response.text, null);
    if (!parsedData) {
      throw new Error('Could not parse Gemini galaxy json output');
    }
    return res.json(parsedData);
  } catch (err) {
    console.error('Error generating galaxy map:', err);
    return res.status(500).json({ error: 'Failed to generate galaxy map' });
  }
});

// Endpoint: AI Dynamic Quest Subtask Graph
app.post('/api/ai/quest-graph', async (req, res) => {
  try {
    const { taskTitle } = req.body || {};
    if (!taskTitle) {
      return res.status(400).json({ error: 'taskTitle is required' });
    }

    if (!ai) {
      return res.status(530).json({ error: 'Gemini client uninitialized' });
    }

    const prompt = `You are FocusQuest Task Graph Architect.
Deconstruct the task "${taskTitle}" into 5 to 7 logical subtask nodes forming a sequential dependency graph (constellation).

For each node, specify:
- id: number (1, 2, 3...)
- title: string
- difficulty: "Easy" | "Medium" | "Hard"
- estimatedTime: string (e.g. "10 min", "20 min")
- xp: number (e.g. 20, 30, 40, 50)
- dependsOn: array of prerequisite node IDs (e.g. [], [1])
- summary: string (short, 1-sentence actionable summary)

Ensure the first node has dependsOn: [] and subsequent nodes depend on earlier nodes.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a Task Constellation Architect. Return strictly valid JSON matching requested schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            task: { type: Type.STRING },
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  difficulty: { type: Type.STRING, enum: ['Easy', 'Medium', 'Hard'] },
                  estimatedTime: { type: Type.STRING },
                  xp: { type: Type.INTEGER },
                  dependsOn: { type: Type.ARRAY, items: { type: Type.INTEGER } },
                  summary: { type: Type.STRING },
                },
                required: ['id', 'title', 'difficulty', 'estimatedTime', 'xp', 'dependsOn', 'summary'],
              },
            },
          },
          required: ['task', 'nodes'],
        },
      },
    });

    const parsedData = safeParseJSON(response.text, null);
    if (!parsedData) {
      throw new Error('Could not parse Gemini quest graph json output');
    }
    return res.json(parsedData);
  } catch (err) {
    console.error('Error generating quest graph:', err);
    return res.status(500).json({ error: 'Failed to generate quest graph' });
  }
});

// Endpoint: AI Focus Companion (Chat / Supportive Coach Dialog)
app.post('/api/ai/companion', async (req, res) => {
  try {
    const { userMessage, taskTitle, currentMinutes, streak } = req.body || {};

    if (!ai) {
      return res.json({
        reply: `I hear you! Starting is often the hardest part with ADHD and executive function challenges. Let's make a deal: just do 2 minutes on "${taskTitle || 'your task'}". If you want to stop after 2 minutes, you have permission to stop! Ready?`,
        suggestedMicroStep: `Open your materials for ${taskTitle || 'your task'}`,
        suggestedMinutes: 2,
      });
    }

    const prompt = `You are FocusQuest Companion, an empathetic, supportive AI ADHD coach.
The student says: "${userMessage}"
Current Task context: "${taskTitle || 'General Study'}"
Focus minutes completed today: ${currentMinutes || 0}
Current Streak: ${streak || 0} days

Respond like a loving, supportive study buddy or ADHD coach.
Acknowledge task paralysis, fear, or friction without judgement.
Offer a tiny, friction-free micro-step (2-5 minutes max) to help them get started.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a warm, non-judgmental AI Focus Companion. Always validate emotions and suggest tiny 2-minute steps.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            suggestedMicroStep: { type: Type.STRING },
            suggestedMinutes: { type: Type.INTEGER },
          },
          required: ['reply', 'suggestedMicroStep', 'suggestedMinutes'],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    return res.json(parsedData);
  } catch (err) {
    console.error('Error in AI Focus Companion:', err);
    return res.json({
      reply: "That is completely okay. Let's lower the bar to the ground: just spend 2 minutes opening your work. You can do anything for 2 minutes!",
      suggestedMicroStep: 'Open notebook / app workspace',
      suggestedMinutes: 2,
    });
  }
});

// Endpoint: AI Parent / Teacher Report Generator
app.post('/api/ai/report', async (req, res) => {
  try {
    const { studentName, tasksCompletedCount, totalFocusMinutes, reflections, weekRange } = req.body || {};

    if (!ai) {
      return res.status(530).json({ error: 'Gemini client uninitialized' });
    }

    const prompt = `Generate a weekly executive function and focus progress report for a parent or educator.
Student Name: ${studentName || 'Student Hero'}
Week Range: ${weekRange || 'Current Week'}
Completed Quests/Tasks: ${tasksCompletedCount || 5}
Total Focus Minutes: ${totalFocusMinutes || 120}
Reflections Log: ${JSON.stringify(reflections || ['Tired on Tuesday', 'Task too large on Thursday'])}

Synthesize this data into a professional, encouraging AI progress report with insights on focus trends, best study times, subjects of difficulty, and 3 actionable coaching recommendations for home or school support.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an educational psychologist and executive function AI advisor. Generate clear, actionable parent/teacher progress reports.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            studentName: { type: Type.STRING },
            weekRange: { type: Type.STRING },
            completedTasksCount: { type: Type.INTEGER },
            totalFocusMinutes: { type: Type.INTEGER },
            focusTrend: { type: Type.STRING },
            bestStudyTime: { type: Type.STRING },
            mostChallengingSubject: { type: Type.STRING },
            aiCoachRecommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            reflectionsSummary: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            generatedAt: { type: Type.STRING },
          },
          required: [
            'studentName',
            'weekRange',
            'completedTasksCount',
            'totalFocusMinutes',
            'focusTrend',
            'bestStudyTime',
            'mostChallengingSubject',
            'aiCoachRecommendations',
            'reflectionsSummary',
            'generatedAt',
          ],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    return res.json(parsedData);
  } catch (err) {
    console.error('Error generating parent report:', err);
    return res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Endpoint: AI Motivator & Quest Advice
app.post('/api/ai/motivate', async (req, res) => {
  try {
    const { userLevel, streak } = req.body || {};

    if (!ai) {
      return res.json({ quote: 'Focus on small wins today. Great momentum builds great legends!' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Give a 1-2 sentence RPG Quest Master motivational quote for a hero at Level ${userLevel || 1} with a ${streak || 0}-day streak.`,
    });

    return res.json({ quote: response.text?.trim() || 'Unleash your potential today!' });
  } catch {
    return res.json({ quote: 'Keep striving hero! Every finished quest unlocks your true potential.' });
  }
});

export default app;
