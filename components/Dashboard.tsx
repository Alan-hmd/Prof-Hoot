import React from 'react';
import { TEKS_DATA } from '../constants.ts';
import { UserProgress, TeksStandard } from '../types.ts';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trophy, Star, BookOpen } from 'lucide-react';

interface DashboardProps {
  progress: UserProgress;
  onSelectLesson: (teks: TeksStandard) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ progress, onSelectLesson }) => {
  const chartData = TEKS_DATA.map(teks => ({
    name: teks.id,
    score: progress.quizScores[teks.id] || 0,
    full: 100
  }));

  const totalMastered = (Object.values(progress.quizScores) as number[]).filter(s => s >= 80).length;

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto w-full overflow-y-auto h-full">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-yellow-100 p-6 rounded-3xl shadow-sm border-2 border-yellow-200 flex items-center space-x-4 transform hover:scale-105 transition-transform">
          <div className="bg-yellow-400 p-3 rounded-full text-white">
            <Star size={32} fill="currentColor" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-yellow-800">Total Stars</h3>
            <p className="text-3xl font-black text-yellow-600">{progress.stars}</p>
          </div>
        </div>

        <div className="bg-blue-100 p-6 rounded-3xl shadow-sm border-2 border-blue-200 flex items-center space-x-4 transform hover:scale-105 transition-transform">
          <div className="bg-blue-400 p-3 rounded-full text-white">
            <BookOpen size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-blue-800">Lessons Done</h3>
            <p className="text-3xl font-black text-blue-600">{progress.completedLessons.length}</p>
          </div>
        </div>

        <div className="bg-green-100 p-6 rounded-3xl shadow-sm border-2 border-green-200 flex items-center space-x-4 transform hover:scale-105 transition-transform">
          <div className="bg-green-400 p-3 rounded-full text-white">
            <Trophy size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-green-800">Mastered Skills</h3>
            <p className="text-3xl font-black text-green-600">{totalMastered}</p>
          </div>
        </div>
      </div>

      {/* Mastery Chart */}
      <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-100">
        <h2 className="text-2xl font-bold mb-6 text-slate-700">Your Mastery Map</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip 
                cursor={{fill: '#f1f5f9'}}
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
              <Bar dataKey="score" radius={[8, 8, 8, 8]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.score >= 80 ? '#4ade80' : entry.score >= 50 ? '#facc15' : '#e2e8f0'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Module List */}
      <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-100">
        <h2 className="text-2xl font-bold mb-6 text-slate-700">Learning Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEKS_DATA.map((teks) => (
            <button
              key={teks.id}
              onClick={() => onSelectLesson(teks)}
              className="text-left p-4 rounded-xl border-2 hover:border-violet-400 hover:bg-violet-50 transition-all group relative overflow-hidden bg-slate-50 border-slate-200"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-slate-500 text-sm bg-slate-200 px-2 py-0.5 rounded-full">{teks.code}</span>
                {progress.quizScores[teks.id] && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${progress.quizScores[teks.id] >= 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {progress.quizScores[teks.id]}%
                  </span>
                )}
              </div>
              <h3 className="font-bold text-slate-800 group-hover:text-violet-700 mb-1">{teks.category}</h3>
              <p className="text-sm text-slate-500 line-clamp-2">{teks.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;