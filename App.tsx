import React, { useState, useEffect } from 'react';
import { AppState, TeksStandard, UserProgress, LessonSlide, QuizQuestion } from './types';
import { TEKS_DATA, INITIAL_PROGRESS } from './constants';
import { generateLesson, generateQuiz } from './services/geminiService';
import { authService } from './services/authService';
import Dashboard from './components/Dashboard';
import LessonView from './components/LessonView';
import QuizView from './components/QuizView';
import AuthView from './components/AuthView';
import ChatBot from './components/ChatBot';
import { Loader2, GraduationCap, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.AUTH);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentTeks, setCurrentTeks] = useState<TeksStandard | null>(null);
  const [progress, setProgress] = useState<UserProgress>(INITIAL_PROGRESS);
  
  // Content State
  const [activeLesson, setActiveLesson] = useState<LessonSlide[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<QuizQuestion[]>([]);

  // Check for session (optional, for this request we want "sign in every time", but a refresh persistence is nice)
  // The prompt says "option for creating an account to sign in every time", which implies session might not be sticky, 
  // but standard UX is to keep them logged in during refresh.
  // I will not auto-login on refresh to satisfy "sign in every time", or at least default to AUTH state.
  // But wait, "sign in every time" usually means strict security. I'll just default to AppState.AUTH on load.

  useEffect(() => {
    if (currentUser) {
      const savedProgress = authService.getUserProgress(currentUser);
      setProgress(savedProgress);
      setAppState(AppState.DASHBOARD);
    } else {
      setAppState(AppState.AUTH);
    }
  }, [currentUser]);

  // Save progress on change
  useEffect(() => {
    if (currentUser) {
      authService.saveUserProgress(currentUser, progress);
    }
  }, [progress, currentUser]);

  const handleLogin = (username: string) => {
    setCurrentUser(username);
    // State transition happens in useEffect
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAppState(AppState.AUTH);
    setProgress(INITIAL_PROGRESS);
  };

  const handleSelectLesson = async (teks: TeksStandard) => {
    setCurrentTeks(teks);
    setAppState(AppState.LESSON_LOADING);
    
    // Fetch lesson from Gemini
    const lessonData = await generateLesson(teks);
    setActiveLesson(lessonData.slides);
    setAppState(AppState.LESSON_ACTIVE);
  };

  const handleLessonComplete = async () => {
    if (!currentTeks) return;

    // Mark lesson as completed if new
    if (!progress.completedLessons.includes(currentTeks.id)) {
      setProgress(prev => ({
        ...prev,
        completedLessons: [...prev.completedLessons, currentTeks.id],
        stars: prev.stars + 10 // Reward for finishing lesson
      }));
    }

    setAppState(AppState.QUIZ_LOADING);
    const quizData = await generateQuiz(currentTeks);
    setActiveQuiz(quizData.questions);
    setAppState(AppState.QUIZ_ACTIVE);
  };

  const handleQuizComplete = (score: number) => {
    if (!currentTeks) return;

    setProgress(prev => {
      const currentBest = prev.quizScores[currentTeks.id] || 0;
      const starsEarned = score >= 80 && currentBest < 80 ? 20 : 0; // Bonus stars for mastery
      
      return {
        ...prev,
        quizScores: {
          ...prev.quizScores,
          [currentTeks.id]: Math.max(currentBest, score)
        },
        stars: prev.stars + starsEarned
      };
    });

    setAppState(AppState.DASHBOARD);
    setCurrentTeks(null);
  };
  
  const handleRetry = () => {
    // Reset quiz
    setAppState(AppState.QUIZ_LOADING); // Briefly show loading to reset
    setTimeout(() => {
        setAppState(AppState.QUIZ_ACTIVE);
    }, 500);
  };

  if (appState === AppState.AUTH) {
    return <AuthView onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen w-screen bg-sky-50 flex flex-col font-fredoka text-slate-800">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-sky-100 p-4 flex justify-between items-center shadow-sm z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="bg-violet-600 p-2 rounded-lg text-white">
            <GraduationCap size={24} />
          </div>
          <h1 className="text-xl md:text-2xl font-black text-violet-800 tracking-tight hidden md:block">Professor Hoot's Academy</h1>
          <h1 className="text-xl font-black text-violet-800 tracking-tight md:hidden">Hoot's Academy</h1>
        </div>
        
        <div className="flex gap-4 items-center">
            {appState !== AppState.DASHBOARD && (
                <button onClick={() => setAppState(AppState.DASHBOARD)} className="text-sm font-bold text-slate-500 hover:text-slate-800">
                    Exit Lesson
                </button>
            )}
            
            {currentUser && (
               <div className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-500">
                  <span className="bg-slate-100 px-3 py-1 rounded-full">Hi, {currentUser}</span>
               </div>
            )}

            <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold shadow-sm flex items-center gap-1">
                <span>⭐</span> {progress.stars}
            </div>

            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Sign Out">
              <LogOut size={20} />
            </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        
        {appState === AppState.DASHBOARD && (
          <Dashboard progress={progress} onSelectLesson={handleSelectLesson} />
        )}

        {(appState === AppState.LESSON_LOADING || appState === AppState.QUIZ_LOADING) && (
          <div className="h-full w-full flex flex-col items-center justify-center space-y-4 animate-pulse">
            <div className="relative">
                <Loader2 className="h-16 w-16 text-violet-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-violet-700">
                    {appState === AppState.LESSON_LOADING ? "..." : "?"}
                </div>
            </div>
            <p className="text-xl font-bold text-slate-500">
              {appState === AppState.LESSON_LOADING ? "Professor Hoot is preparing your lesson..." : "Writing quiz questions..."}
            </p>
          </div>
        )}

        {appState === AppState.LESSON_ACTIVE && currentTeks && (
          <LessonView 
            teks={currentTeks} 
            slides={activeLesson} 
            onComplete={handleLessonComplete} 
          />
        )}

        {appState === AppState.QUIZ_ACTIVE && currentTeks && (
          <QuizView 
            teks={currentTeks} 
            questions={activeQuiz} 
            onComplete={handleQuizComplete}
            onRetry={handleRetry}
          />
        )}

        {/* Global ChatBot - Available anywhere when logged in */}
        <ChatBot />

      </main>
    </div>
  );
};

export default App;
