export type Priority = 'High' | 'Medium' | 'Low';
export type LearningStyle = 'Visual' | 'Auditory' | 'Reading' | 'Kinesthetic';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  deadline?: string; // ISO date or YYYY-MM-DD
  priority: Priority;
  completed: boolean;
  completedAt?: string;
  tags: string[];
  estimatedMinutes?: number;
  subtasks: Subtask[];
  xpReward: number;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  totalFocusMinutes: number;
  tasksCompletedCount: number;
  unlockedBadges: string[];
  preferences: {
    theme: 'light' | 'dark' | 'system';
    highContrast: boolean;
    soundEnabled: boolean;
    autoStartBreaks: boolean;
    largeText?: boolean;
    reducedAnimations?: boolean;
    minimalInterface?: boolean;
    singleTaskFocusMode?: boolean;
    adhdMode?: boolean;
    accessibilityProfile?: 'ADHD' | 'Dyslexia' | 'Autism' | 'Custom';
    learningStyle?: LearningStyle;
    adaptiveFocusMinutes?: number;
    consecutiveQuits?: number;
  };
}

export interface PostSessionReflection {
  id: string;
  sessionId: string;
  taskTitle?: string;
  difficultyReason: 'Too noisy' | 'Task too large' | "Didn't understand" | 'Tired' | 'Felt smooth';
  notes?: string;
  createdAt: string;
}

export interface MicroStep {
  id: string;
  stepNumber: number;
  title: string;
  estimatedMinutes: number;
  completed: boolean;
  learningStyleHint?: string;
}

export interface CognitiveCoachPlan {
  goalTitle: string;
  coachMessage: string;
  motivation?: string;
  estimatedTime?: string;
  resources?: string[];
  learningTips?: string[];
  steps: MicroStep[];
  learningStyleUsed: LearningStyle;
  isTinyStepMode: boolean;
  timeBlock?: string;
  focusDomain?: string;
}

export interface ParentTeacherReport {
  studentName: string;
  weekRange: string;
  completedTasksCount: number;
  totalFocusMinutes: number;
  focusTrend: string;
  bestStudyTime: string;
  mostChallengingSubject: string;
  aiCoachRecommendations: string[];
  reflectionsSummary: string[];
  generatedAt: string;
}

export interface UserFeedback {
  id: string;
  testerType: 'Student' | 'Teacher' | 'Parent' | 'Other';
  testerName?: string;
  ageGroup: string;
  testingDate: string;
  testingDuration: string;
  navigationRating: number;
  buttonRating: number;
  textRating: number;
  overwhelmingRating: number;
  colorRating: number;
  nextStepRating: number;
  aiHelpfulness: number;
  aiStepLength: number;
  aiStepClarity: number;
  aiStressReduction: number;
  freeTextFeedback: string;
  improvements: string[];
  overallExperience: '😀' | '😐' | '😞';
  wouldUseAgain: 'Yes' | 'Maybe' | 'No';
  createdAt: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  targetCount: number;
  currentCount: number;
  completed: boolean;
  type: 'daily_tasks' | 'focus_time' | 'ai_planner' | 'streak_master';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconName: string;
  category: 'Streak' | 'Focus' | 'Tasks' | 'AI' | 'Special';
  unlockedAt?: string;
}

export interface FocusSession {
  id: string;
  userId: string;
  taskId?: string;
  taskTitle?: string;
  durationMinutes: number;
  completedAt: string;
  xpEarned: number;
  mode: 'pomodoro' | 'shortBreak' | 'longBreak' | 'custom';
}

export interface AIPlanResponse {
  planTitle: string;
  summary: string;
  tasks: {
    title: string;
    description: string;
    priority: Priority;
    estimatedMinutes: number;
    tags: string[];
    subtasks: string[];
  }[];
  aiTips: string;
}

export interface GalaxyTopicNode {
  id: string;
  title: string;
  category: string;
  type: 'locked' | 'completed' | 'active' | 'target' | 'boss';
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  estimatedTime: number; // minutes
  xp: number;
  dependencies: string[]; // Node IDs or prerequisite names
  connections: string[]; // Connected target node IDs
  summary: string;
  resources: string[];
  status?: 'completed' | 'active' | 'locked'; // backward compatibility
}

export interface GalaxyMap {
  galaxyTitle: string;
  description: string;
  recommendedNodeId: string;
  nodes: GalaxyTopicNode[];
}

export interface QuestGraphNode {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedTime: string;
  xp: number;
  dependsOn: number[];
  summary?: string;
  status?: 'completed' | 'current' | 'upcoming' | 'locked';
  completedAt?: string;
}

export interface QuestGraphData {
  task: string;
  nodes: QuestGraphNode[];
  createdAt?: string;
  updatedAt?: string;
}

