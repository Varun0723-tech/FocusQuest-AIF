import { UserFeedback } from '../models/types';

const FEEDBACK_STORAGE_KEY = 'focusquest_user_feedback_v1';

// Pre-seeded initial realistic mock feedback entries for demo/testing analysis
const INITIAL_MOCK_FEEDBACK: UserFeedback[] = [
  {
    id: 'fb_mock_1',
    testerType: 'Student',
    testerName: 'Jordan S. (ADHD)',
    ageGroup: '18-22',
    testingDate: '2026-08-05',
    testingDuration: '25 minutes',
    navigationRating: 5,
    buttonRating: 5,
    textRating: 4,
    overwhelmingRating: 2, // Low overwhelming = good
    colorRating: 5,
    nextStepRating: 5,
    aiHelpfulness: 5,
    aiStepLength: 5,
    aiStepClarity: 5,
    aiStressReduction: 5,
    freeTextFeedback:
      'The AI planner deconstructed my huge exam study goal into small 15-minute subtasks! Usually I get paralyzed starting, but this made step 1 so obvious.',
    improvements: ['Larger text', 'Simpler dashboard', 'Reminder notifications'],
    overallExperience: '😀',
    wouldUseAgain: 'Yes',
    createdAt: '2026-08-05T14:30:00.000Z',
  },
  {
    id: 'fb_mock_2',
    testerType: 'Teacher',
    testerName: 'Mrs. Davis (Special Ed)',
    ageGroup: '35-50',
    testingDate: '2026-08-04',
    testingDuration: '40 minutes',
    navigationRating: 4,
    buttonRating: 5,
    textRating: 5,
    overwhelmingRating: 1,
    colorRating: 5,
    nextStepRating: 4,
    aiHelpfulness: 5,
    aiStepLength: 4,
    aiStepClarity: 5,
    aiStressReduction: 5,
    freeTextFeedback:
      'High contrast mode and the Pomodoro ambient synthesizer are fantastic for neurodivergent high schoolers. The gamified XP rewards keep them engaged.',
    improvements: ['Voice support', 'Better colors'],
    overallExperience: '😀',
    wouldUseAgain: 'Yes',
    createdAt: '2026-08-04T10:15:00.000Z',
  },
  {
    id: 'fb_mock_3',
    testerType: 'Student',
    testerName: 'Alex M. (Autism Spectrum)',
    ageGroup: '13-17',
    testingDate: '2026-08-03',
    testingDuration: '30 minutes',
    navigationRating: 4,
    buttonRating: 4,
    textRating: 4,
    overwhelmingRating: 2,
    colorRating: 4,
    nextStepRating: 4,
    aiHelpfulness: 4,
    aiStepLength: 4,
    aiStepClarity: 4,
    aiStressReduction: 4,
    freeTextFeedback:
      'I really like the Single-Task Focus Mode in accessibility settings. It hides all the extra buttons so I can focus on just one thing at a time.',
    improvements: ['Fewer buttons', 'Dark mode'],
    overallExperience: '😀',
    wouldUseAgain: 'Yes',
    createdAt: '2026-08-03T16:45:00.000Z',
  },
];

export function getStoredFeedback(): UserFeedback[] {
  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored feedback', e);
  }
  // Store initial mock data if empty
  localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_FEEDBACK));
  return INITIAL_MOCK_FEEDBACK;
}

export async function saveUserFeedback(feedback: Omit<UserFeedback, 'id' | 'createdAt'>): Promise<UserFeedback> {
  const newEntry: UserFeedback = {
    ...feedback,
    id: `fb_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    createdAt: new Date().toISOString(),
  };

  // Try API/Firestore route if exists
  try {
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEntry),
    });
  } catch (err) {
    console.warn('Backend feedback endpoint unavailable, storing locally', err);
  }

  // Local storage save
  const currentList = getStoredFeedback();
  const updated = [newEntry, ...currentList];
  localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updated));

  return newEntry;
}
