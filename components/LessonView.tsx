import React, { useEffect, useState } from 'react';
import { LessonSlide, TeksStandard } from '../types.ts';
import Avatar from './Avatar.tsx';
import { Play, Pause, ChevronRight, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { generateSpeech } from '../services/geminiService.ts';
import { audioController } from '../services/audioService.ts';

interface LessonViewProps {
  teks: TeksStandard;
  slides: LessonSlide[];
  onComplete: () => void;
}

const LessonView: React.FC<LessonViewProps> = ({ teks, slides, onComplete }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [useAudio, setUseAudio] = useState(true);

  const currentSlide = slides[currentSlideIndex];

  // Stop audio when unmounting or changing slides
  useEffect(() => {
    audioController.stop();
    setIsPlayingAudio(false);
    setIsTalking(false);
    
    if (useAudio && currentSlide) {
      handlePlayAudio();
    }
    
    return () => {
      audioController.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlideIndex]); // We intentionally want this to run on slide change

  const handlePlayAudio = async () => {
    if (!currentSlide) return;
    
    // If already playing, toggle pause (stop for now, simpler than resume)
    if (isPlayingAudio) {
      audioController.stop();
      setIsPlayingAudio(false);
      setIsTalking(false);
      return;
    }

    setIsPlayingAudio(true);
    setIsTalking(true);

    const textToRead = `${currentSlide.title}. ${currentSlide.content}`;
    const audioData = await generateSpeech(textToRead);

    if (audioData) {
      await audioController.playAudio(audioData);
    }
    
    setIsPlayingAudio(false);
    setIsTalking(false);
  };

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const renderVisual = () => {
    if (!currentSlide) return null;

    if (currentSlide.visualType === 'chart' && currentSlide.visualData) {
      return (
        <div className="h-48 md:h-64 w-full bg-white rounded-xl p-4 shadow-inner">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={currentSlide.visualData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    // Placeholder for other types or generic diagrams
    return (
      <div className="h-48 md:h-64 w-full bg-blue-50 rounded-xl border-2 border-dashed border-blue-200 flex items-center justify-center p-4">
        <div className="text-center text-blue-400">
          {currentSlide.visualType === 'geometry' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="w-16 h-16 border-4 border-blue-400"></div>
              <div className="w-16 h-16 border-4 border-blue-400 rounded-full"></div>
            </div>
          )}
          {currentSlide.visualType === 'calculation' && (
             <div className="text-2xl font-mono">12 + 24 = 36</div>
          )}
          {currentSlide.visualType === 'text' && (
            <span className="text-4xl">📝</span>
          )}
        </div>
      </div>
    );
  };

  if (!currentSlide) return <div>Loading...</div>;

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-4 md:p-6 w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-sm font-bold text-violet-600 uppercase tracking-wide">{teks.code}</h2>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800">{currentSlide.title}</h1>
        </div>
        <button 
          onClick={() => setUseAudio(!useAudio)}
          className="p-3 rounded-full bg-white shadow-sm hover:shadow-md transition-all text-slate-600"
        >
          {useAudio ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left: Avatar & Audio Controls */}
        <div className="w-full md:w-1/3 bg-violet-50 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-violet-100 relative">
          <Avatar talking={isTalking} mood={currentSlideIndex === slides.length - 1 ? 'happy' : 'neutral'} />
          
          <div className="mt-8 flex gap-4">
            <button
              onClick={handlePlayAudio}
              className={`p-4 rounded-full text-white shadow-lg transform active:scale-95 transition-all ${isPlayingAudio ? 'bg-red-500 hover:bg-red-600' : 'bg-violet-600 hover:bg-violet-700'}`}
              title={isPlayingAudio ? "Stop" : "Read Aloud"}
            >
              {isPlayingAudio ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
            </button>
          </div>
          <p className="mt-4 text-center text-sm text-violet-400 font-semibold">
            {isTalking ? "Professor Hoot is speaking..." : "Click play to listen!"}
          </p>
        </div>

        {/* Right: Content & Visuals */}
        <div className="w-full md:w-2/3 p-6 md:p-8 flex flex-col overflow-y-auto">
          <div className="mb-6 prose prose-lg prose-slate">
             <p className="text-xl leading-relaxed text-slate-700 whitespace-pre-line">{currentSlide.content}</p>
          </div>
          
          <div className="mt-auto">
            {renderVisual()}
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="mt-6 flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex gap-2">
          {slides.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-3 w-3 rounded-full transition-colors ${idx === currentSlideIndex ? 'bg-violet-500 scale-125' : 'bg-slate-200'}`} 
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-700 transition-colors shadow-lg shadow-slate-300"
        >
          {currentSlideIndex === slides.length - 1 ? "Start Practice" : "Next"}
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default LessonView;