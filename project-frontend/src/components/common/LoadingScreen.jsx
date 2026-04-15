import { useState, useEffect } from 'react';
import { SkeletonBlock } from './SkeletonBlock';
import { Loader2, CheckCircle2, Circle } from 'lucide-react';

export function LoadingScreen({ messages = [
  "Extracting resume data...", 
  "Matching against ATS algorithms...", 
  "Scoring skills gap...", 
  "Generating interview questions...", 
  "Finalizing your report..."
] }) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1 < messages.length ? prev + 1 : prev));
    }, 3500);
    return () => clearInterval(interval);
  }, [messages]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8 animate-in fade-in duration-700 w-full relative z-10">
      <div className="flex flex-col items-center justify-center p-12 glass-card rounded-3xl text-center relative overflow-hidden shadow-xl">
        {/* Decorative background gradients */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary via-purple-400 to-brand-primary animate-pulse" />
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex items-center justify-center w-20 h-20 mb-8 mt-4">
          <div className="absolute inset-0 border-4 border-brand-light rounded-full" />
          <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
        </div>
        
        <h2 className="text-2xl md:text-3xl font-extrabold text-brand-dark dark:text-gray-100 mb-8 tracking-tight">
          Processing App Data...
        </h2>
        
        <div className="w-full max-w-sm space-y-4 text-left mx-auto relative z-10 pb-4">
          {messages.map((msg, i) => {
            const isCompleted = i < msgIndex;
            const isActive = i === msgIndex;
            return (
              <div key={i} className={`flex items-center gap-4 transition-all duration-700 ${isActive ? 'opacity-100 translate-x-2 scale-105' : isCompleted ? 'opacity-50' : 'opacity-30'}`}>
                {isCompleted ? (
                   <CheckCircle2 className="w-6 h-6 text-brand-success shrink-0 drop-shadow-sm" />
                ) : isActive ? (
                   <Loader2 className="w-6 h-6 text-brand-primary font-bold animate-spin shrink-0 drop-shadow-md" />
                ) : (
                   <Circle className="w-6 h-6 text-brand-mid dark:text-gray-400 shrink-0" />
                )}
                <span className={`text-sm md:text-base ${isActive ? 'text-brand-primary font-bold drop-shadow-sm' : 'text-brand-dark dark:text-gray-100'}`}>
                  {msg}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60">
        {[...Array(3)].map((_, i) => (
           <div key={i} className="glass-card p-6 rounded-2xl flex flex-col gap-4">
             <SkeletonBlock height="24px" width="40%" />
             <div className="space-y-2">
                <SkeletonBlock height="16px" />
                <SkeletonBlock height="16px" width="80%" />
             </div>
           </div>
        ))}
      </div>
    </div>
  );
}
