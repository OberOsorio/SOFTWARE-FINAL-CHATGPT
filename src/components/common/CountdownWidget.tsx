import React, { useState, useEffect } from 'react';
import { Flag, Clock, Calendar as CalendarIcon, Sparkles } from 'lucide-react';

interface CountdownWidgetProps {
  variant?: 'banner' | 'card' | 'compact';
  className?: string;
  targetDateStr?: string;
}

export const CountdownWidget: React.FC<CountdownWidgetProps> = ({
  variant = 'card',
  className = '',
  targetDateStr = ''
}) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = targetDateStr ? new Date(targetDateStr).getTime() : 0;
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDateStr]);

  if (variant === 'compact') {
    return (
      <div className={`bg-[#030e1c]/90 border border-amber-500/40 px-3.5 py-2 rounded-xl flex items-center gap-3 shadow-lg ${className}`}>
        <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-xs uppercase">
          <Flag className="w-3.5 h-3.5 animate-bounce" /> Día E:
        </div>
        <div className="flex items-center gap-2 font-mono text-xs font-black text-amber-300">
          <span>{timeLeft.days}d</span>:
          <span>{String(timeLeft.hours).padStart(2, '0')}h</span>:
          <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>:
          <span className="text-rose-400">{String(timeLeft.seconds).padStart(2, '0')}s</span>
        </div>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`w-full bg-gradient-to-r from-[#031326] via-[#082342] to-[#041224] border border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 ${className}`}>
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400 shrink-0">
            <Flag className="w-6 h-6 animate-pulse text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-black text-xs uppercase tracking-wider flex items-center gap-1">
                CUENTA REGRESIVA PARA EL DÍA E
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] font-extrabold uppercase font-mono">
                Elecciones Municipales
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 font-medium">
              Próxima jornada electoral: <strong className="text-white font-mono">{targetDateStr ? new Date(targetDateStr).toLocaleString('es-CO') : 'Sin fecha configurada'}</strong>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2.5 font-mono shrink-0 w-full md:w-auto">
          <div className="bg-[#030e1c] px-3.5 py-2 rounded-xl border border-amber-500/30 text-center min-w-[65px]">
            <span className="block text-2xl font-black text-amber-300">{timeLeft.days}</span>
            <span className="text-[9px] text-slate-400 font-sans uppercase font-extrabold tracking-wider">Días</span>
          </div>
          <div className="bg-[#030e1c] px-3.5 py-2 rounded-xl border border-amber-500/30 text-center min-w-[65px]">
            <span className="block text-2xl font-black text-amber-300">{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="text-[9px] text-slate-400 font-sans uppercase font-extrabold tracking-wider">Horas</span>
          </div>
          <div className="bg-[#030e1c] px-3.5 py-2 rounded-xl border border-amber-500/30 text-center min-w-[65px]">
            <span className="block text-2xl font-black text-amber-300">{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="text-[9px] text-slate-400 font-sans uppercase font-extrabold tracking-wider">Min</span>
          </div>
          <div className="bg-[#030e1c] px-3.5 py-2 rounded-xl border border-amber-500/30 text-center min-w-[65px]">
            <span className="block text-2xl font-black text-rose-400">{String(timeLeft.seconds).padStart(2, '0')}</span>
            <span className="text-[9px] text-slate-400 font-sans uppercase font-extrabold tracking-wider">Seg</span>
          </div>
        </div>
      </div>
    );
  }

  // Default 'card' variant
  return (
    <div className={`bg-[#030e1c]/90 border border-amber-500/40 p-4 sm:p-5 rounded-2xl shadow-xl space-y-3 text-center ${className}`}>
      <div className="flex items-center justify-center gap-1.5 text-amber-400 font-black text-xs uppercase tracking-wider">
        <Flag className="w-4 h-4 animate-bounce text-amber-400" /> CUENTA REGRESIVA PARA EL DÍA E
      </div>
      
      <div className="grid grid-cols-4 gap-2 font-mono">
        <div className="bg-[#081e36] p-2 sm:p-2.5 rounded-xl border border-amber-500/20">
          <span className="block text-2xl sm:text-3xl font-black text-amber-300">{timeLeft.days}</span>
          <span className="text-[9px] text-slate-400 font-sans uppercase font-extrabold">Días</span>
        </div>
        <div className="bg-[#081e36] p-2 sm:p-2.5 rounded-xl border border-amber-500/20">
          <span className="block text-2xl sm:text-3xl font-black text-amber-300">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="text-[9px] text-slate-400 font-sans uppercase font-extrabold">Horas</span>
        </div>
        <div className="bg-[#081e36] p-2 sm:p-2.5 rounded-xl border border-amber-500/20">
          <span className="block text-2xl sm:text-3xl font-black text-amber-300">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="text-[9px] text-slate-400 font-sans uppercase font-extrabold">Min</span>
        </div>
        <div className="bg-[#081e36] p-2 sm:p-2.5 rounded-xl border border-amber-500/20">
          <span className="block text-2xl sm:text-3xl font-black text-rose-400">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="text-[9px] text-slate-400 font-sans uppercase font-extrabold">Seg</span>
        </div>
      </div>
    </div>
  );
};
