import React from 'react';
import { DocumentStats } from '../types';
import { Clock, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface StatusBarProps {
  stats: DocumentStats;
  cursorPos?: { line: number; col: number };
  isDirty: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  stats,
  cursorPos,
  isDirty,
}) => {
  return (
    <footer className="h-8 bg-[#101017] light:bg-[#f3f4f8] border-t border-white/10 light:border-black/10 px-4 flex items-center justify-between text-[11px] font-mono text-[#787890] select-none flex-shrink-0 z-20">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="text-[#555568]">Words:</span>
          <span className="text-[#c0c0d4] light:text-[#333] font-medium">{stats.words}</span>
        </div>

        <div className="w-[1px] h-3 bg-white/10 light:bg-black/10" />

        <div className="flex items-center gap-1.5">
          <span className="text-[#555568]">Chars:</span>
          <span className="text-[#c0c0d4] light:text-[#333] font-medium">{stats.chars}</span>
        </div>

        <div className="w-[1px] h-3 bg-white/10 light:bg-black/10" />

        <div className="flex items-center gap-1.5">
          <span className="text-[#555568]">Lines:</span>
          <span className="text-[#c0c0d4] light:text-[#333] font-medium">{stats.lines}</span>
        </div>

        <div className="w-[1px] h-3 bg-white/10 light:bg-black/10" />

        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-[#555568]" />
          <span className="text-[#c0c0d4] light:text-[#333] font-medium">
            ~{stats.readingTimeMin} min read
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {cursorPos && (
          <div className="flex items-center gap-1">
            <span className="text-[#555568]">Ln</span>
            <span className="text-[#c0c0d4] light:text-[#333]">{cursorPos.line}</span>
            <span className="text-[#555568]">, Col</span>
            <span className="text-[#c0c0d4] light:text-[#333]">{cursorPos.col}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          {isDirty ? (
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Unsaved
            </span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Saved
            </span>
          )}
        </div>
      </div>
    </footer>
  );
};
