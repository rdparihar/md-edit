import React from 'react';
import { DocumentStats } from '../types';
import { Clock, FileText, CheckCircle2, AlertCircle, HardDrive, Save } from 'lucide-react';

interface StatusBarProps {
  stats: DocumentStats;
  cursorPos?: { line: number; col: number };
  isDirty: boolean;
  isDirectLocalFile?: boolean;
  localFileName?: string;
  isDiskDirty?: boolean;
  autoSaveToDisk?: boolean;
  onSaveDirectly?: () => void;
  onOpenLocalFile?: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  stats,
  cursorPos,
  isDirty,
  isDirectLocalFile = false,
  localFileName,
  isDiskDirty = false,
  autoSaveToDisk = false,
  onSaveDirectly,
  onOpenLocalFile,
}) => {
  return (
    <footer className="h-8 bg-[#101017] light:bg-[#f3f4f8] border-t border-white/10 light:border-black/10 px-4 flex items-center justify-between text-[11px] font-mono text-[#787890] select-none flex-shrink-0 z-20">
      <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5">
          <span className="text-[#555568]">Words:</span>
          <span className="text-[#c0c0d4] light:text-[#333] font-medium">{stats.words}</span>
        </div>

        <div className="w-[1px] h-3 bg-white/10 light:bg-black/10 hidden sm:block" />

        <div className="flex items-center gap-1.5 hidden sm:flex">
          <span className="text-[#555568]">Chars:</span>
          <span className="text-[#c0c0d4] light:text-[#333] font-medium">{stats.chars}</span>
        </div>

        <div className="w-[1px] h-3 bg-white/10 light:bg-black/10 hidden md:block" />

        <div className="flex items-center gap-1.5 hidden md:flex">
          <span className="text-[#555568]">Lines:</span>
          <span className="text-[#c0c0d4] light:text-[#333] font-medium">{stats.lines}</span>
        </div>

        <div className="w-[1px] h-3 bg-white/10 light:bg-black/10 hidden sm:block" />

        <div className="flex items-center gap-1.5 hidden sm:flex">
          <Clock className="w-3 h-3 text-[#555568]" />
          <span className="text-[#c0c0d4] light:text-[#333] font-medium">
            ~{stats.readingTimeMin} min read
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
        {/* Direct Local File System Status */}
        {isDirectLocalFile ? (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <HardDrive className="w-3 h-3 text-emerald-400" />
              <span className="hidden sm:inline">Direct File:</span>
              <span className="text-white light:text-gray-900 font-sans font-medium truncate max-w-[100px]">
                {localFileName}
              </span>
              {isDiskDirty ? (
                <span className="text-amber-400 ml-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="hidden md:inline">Unsaved</span>
                </span>
              ) : (
                <span className="text-emerald-400 ml-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="hidden md:inline">Disk Synced</span>
                </span>
              )}
            </span>

            {isDiskDirty && onSaveDirectly && (
              <button
                type="button"
                onClick={onSaveDirectly}
                title="Save changes directly to local file (Ctrl+S)"
                className="hidden sm:flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                <Save className="w-2.5 h-2.5" />
                <span>Save</span>
              </button>
            )}

            {autoSaveToDisk && (
              <span className="text-[10px] text-emerald-400/80 hidden lg:inline" title="Auto-save to disk is active">
                ⚡ Auto-save on
              </span>
            )}
          </div>
        ) : (
          onOpenLocalFile && (
            <button
              type="button"
              onClick={onOpenLocalFile}
              title="Open a local Markdown file to edit directly on your filesystem"
              className="hidden lg:flex items-center gap-1 text-[11px] text-[#8b8b9f] hover:text-[#c0c0d4] transition-colors"
            >
              <HardDrive className="w-3 h-3 text-sky-400/70" />
              <span>Direct disk editing: Idle</span>
            </button>
          )
        )}

        <div className="w-[1px] h-3 bg-white/10 light:bg-black/10 hidden sm:block" />

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

