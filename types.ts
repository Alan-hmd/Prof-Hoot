export interface TeksStandard {
  id: string;
  code: string;
  category: string;
  description: string;
}

export interface LessonSlide {
  title: string;
  content: string;
  visualType: 'chart' | 'text' | 'calculation' | 'geometry';
  visualData?: any; // Data for charts or specific visual instructions
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface UserProgress {
  completedLessons: string[]; // TEKS IDs
  quizScores: Record<string, number>; // TEKS ID -> Highest Score (0-100)
  stars: number;
  settings: {
    useTTS: boolean;
    bgMusic: boolean;
  };
}

export enum AppState {
  DASHBOARD = 'DASHBOARD',
  LESSON_LOADING = 'LESSON_LOADING',
  LESSON_ACTIVE = 'LESSON_ACTIVE',
  QUIZ_LOADING = 'QUIZ_LOADING',
  QUIZ_ACTIVE = 'QUIZ_ACTIVE',
}

// Gemini Types
export interface GeneratedLessonResponse {
  slides: LessonSlide[];
}

export interface GeneratedQuizResponse {
  questions: QuizQuestion[];
}
