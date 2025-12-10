import React, { useState } from 'react';
import { QuizQuestion, TeksStandard } from '../types';
import Avatar from './Avatar';
import { CheckCircle, XCircle, ArrowRight, RotateCcw } from 'lucide-react';

interface QuizViewProps {
  teks: TeksStandard;
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
  onRetry: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({ teks, questions, onComplete, onRetry }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const currentQ = questions[currentIndex];

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === currentQ.correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
      // Calculate final percentage score
      const finalScore = Math.round(((score + (selectedOption === currentQ.correctIndex ? 0 : 0)) / questions.length) * 100);
      // Wait a tick to ensure rendering doesn't conflict
      setTimeout(() => onComplete(finalScore), 0);
    }
  };

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 animate-fade-in text-center max-w-lg mx-auto">
        <Avatar talking={false} mood={percentage >= 70 ? 'happy' : 'thinking'} />
        <h2 className="text-4xl font-black mt-6 mb-2 text-slate-800">
          {percentage >= 80 ? "Owl-standing!" : percentage >= 50 ? "Good job!" : "Keep practicing!"}
        </h2>
        <p className="text-xl text-slate-600 mb-8">
          You scored <span className={`font-bold ${percentage >= 70 ? 'text-green-600' : 'text-orange-500'}`}>{percentage}%</span> on {teks.code}.
        </p>
        
        <div className="flex gap-4">
          <button 
            onClick={onRetry}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
          >
            <RotateCcw size={20} /> Try Again
          </button>
          <button 
            onClick={() => onComplete(percentage)} // Return to dashboard
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 text-white font-bold hover:bg-violet-700 shadow-lg shadow-violet-200 transition-colors"
          >
            Finish <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full max-w-3xl mx-auto p-4 md:p-8 flex flex-col justify-center w-full">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-10 relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
          <div 
            className="h-full bg-violet-500 transition-all duration-500" 
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        <div className="mb-6 mt-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Question {currentIndex + 1} of {questions.length}</span>
          <h2 className="text-2xl font-bold text-slate-800 mt-2">{currentQ.question}</h2>
        </div>

        <div className="space-y-3">
          {currentQ.options.map((option, idx) => {
            let stateClass = "border-slate-200 hover:border-violet-300 hover:bg-violet-50";
            let icon = null;

            if (isAnswered) {
              if (idx === currentQ.correctIndex) {
                stateClass = "border-green-500 bg-green-50 text-green-800";
                icon = <CheckCircle size={20} className="text-green-500" />;
              } else if (idx === selectedOption) {
                stateClass = "border-red-400 bg-red-50 text-red-800";
                icon = <XCircle size={20} className="text-red-500" />;
              } else {
                stateClass = "border-slate-100 opacity-50";
              }
            } else if (selectedOption === idx) {
              stateClass = "border-violet-500 bg-violet-50";
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionSelect(idx)}
                disabled={isAnswered}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center font-medium ${stateClass}`}
              >
                <span>{option}</span>
                {icon}
              </button>
            );
          })}
        </div>

        {/* Explanation & Next Button */}
        {isAnswered && (
          <div className="mt-6 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-blue-50 p-4 rounded-xl text-blue-800 mb-4 flex items-start gap-3">
              <Avatar talking={false} mood="happy" />
              <div className="text-sm md:text-base">
                <span className="font-bold block mb-1">Professor Hoot says:</span>
                {currentQ.explanation}
              </div>
            </div>
            <button
              onClick={handleNext}
              className="w-full py-4 bg-slate-800 text-white rounded-xl font-bold text-lg hover:bg-slate-700 transition-colors shadow-lg"
            >
              {currentIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizView;
