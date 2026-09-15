import React, { useState } from 'react';
import {
  Sparkles,
  Columns,
  Code,
  Eye,
  Edit3,
  Download,
  Sun,
  Moon,
  FileText,
  Printer,
  ChevronDown,
  Command,
  Maximize2,
  Minimize2,
  FolderOpen,
  FilePlus,
  Save,
} from 'lucide-react';
import { ViewMode, Theme } from '../types';

interface HeaderProps {
  title: string;
  onTitleChange: (val: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  theme: Theme;
  onToggleTheme: () => void;
  onOpenHtmlModal: () => void;
  onExportMarkdown: () => void;
  onExportHtml: () => void;
  onNewDocument: () => void;
  onOpenDocument: () => void;
  onOpenCommandPalette: () => void;
  isDirty: boolean;
  fullWidth: boolean;
  onToggleFullWidth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onTitleChange,
  viewMode,
  onViewModeChange,
  theme,
  onToggleTheme,
  onOpenHtmlModal,
  onExportMarkdown,
  onExportHtml,
  onNewDocument,
  onOpenDocument,
  onOpenCommandPalette,
  isDirty,
  fullWidth,
  onToggleFullWidth,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="h-14 bg-[#14141c] light:bg-white border-b border-white/10 light:border-black/10 px-4 flex items-center justify-between flex-shrink-0 select-none z-30">
      {/* Left: Brand & Editable File Name */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#6352e8] to-[#9b84ff] flex items-center justify-center text-white font-bold shadow-md shadow-[#6352e8]/30 flex-shrink-0">
            ✦
          </div>
          <span className="font-semibold text-sm tracking-tight hidden md:inline text-white light:text-gray-900">
            Markdown
          </span>
        </div>

        <div className="h-4 w-[1px] bg-white/10 light:bg-black/10 hidden sm:block" />

        {/* Title input */}
        <div className="flex items-center gap-2 max-w-[200px] sm:max-w-[280px]">
          <input
            id="document-title-input"
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="bg-transparent text-xs sm:text-sm font-medium text-[#e2e2e8] light:text-[#1a1a2e] hover:bg-white/5 light:hover:bg-black/5 focus:bg-[#1f1f2c] light:focus:bg-gray-100 rounded-md px-2 py-1 outline-none transition-colors truncate"
            title="Click to rename document"
          />
          <div
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              isDirty ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
            }`}
            title={isDirty ? 'Unsaved changes' : 'Saved'}
          />
        </div>
      </div>

      {/* Center: View Mode Switcher */}
      <div className="flex items-center bg-[#1c1c27] light:bg-gray-100 p-1 rounded-xl border border-white/5 light:border-black/5">
        <button
          type="button"
          id="view-mode-wysiwyg"
          title="WYSIWYG Mode (Click & edit directly)"
          onClick={() => onViewModeChange('wysiwyg')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            viewMode === 'wysiwyg'
              ? 'bg-[#7c6af7] text-white shadow-sm'
              : 'text-[#8b8b9f] hover:text-white'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">WYSIWYG</span>
        </button>

        <button
          type="button"
          id="view-mode-split"
          title="Split View (Markdown left, Live preview right)"
          onClick={() => onViewModeChange('split')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            viewMode === 'split'
              ? 'bg-[#7c6af7] text-white shadow-sm'
              : 'text-[#8b8b9f] hover:text-white'
          }`}
        >
          <Columns className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Split</span>
        </button>

        <button
          type="button"
          id="view-mode-markdown"
          title="Markdown Source Mode"
          onClick={() => onViewModeChange('markdown')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            viewMode === 'markdown'
              ? 'bg-[#7c6af7] text-white shadow-sm'
              : 'text-[#8b8b9f] hover:text-white'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Markdown</span>
        </button>

        <button
          type="button"
          id="view-mode-preview"
          title="Clean Preview Mode"
          onClick={() => onViewModeChange('preview')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            viewMode === 'preview'
              ? 'bg-[#7c6af7] text-white shadow-sm'
              : 'text-[#8b8b9f] hover:text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Preview</span>
        </button>
      </div>

      {/* Right: HTML Output, Export, Tools, Theme */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Full width toggle (for WYSIWYG) */}
        {viewMode === 'wysiwyg' && (
          <button
            type="button"
            title={fullWidth ? 'Standard column width' : 'Full width canvas'}
            onClick={onToggleFullWidth}
            className="p-2 rounded-lg text-[#8b8b9f] hover:text-white hover:bg-white/5 transition-colors hidden md:block"
          >
            {fullWidth ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        )}

        {/* Command Palette Trigger */}
        <button
          type="button"
          id="command-palette-btn"
          title="Command Palette (Ctrl+K)"
          onClick={onOpenCommandPalette}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-[#8b8b9f] hover:text-white hover:bg-white/5 transition-colors hidden lg:flex border border-white/5"
        >
          <Command className="w-3 h-3" />
          <span className="text-[11px]">Ctrl+K</span>
        </button>

        {/* HTML Output Button */}
        <button
          type="button"
          id="html-output-btn"
          title="View & Export HTML Output"
          onClick={onOpenHtmlModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7c6af7]/15 hover:bg-[#7c6af7]/25 text-[#a78bfa] border border-[#7c6af7]/30 text-xs font-medium transition-all"
        >
          <Code className="w-3.5 h-3.5" />
          <span>HTML Output</span>
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            type="button"
            id="export-dropdown-btn"
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#1f1f2c] light:bg-gray-100 text-xs font-medium text-[#e2e2e8] light:text-[#1a1a2e] hover:bg-white/10 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {showExportMenu && (
            <div
              className="absolute right-0 top-full mt-1.5 w-48 bg-[#181822] light:bg-white border border-white/10 light:border-black/10 rounded-xl shadow-2xl py-1 z-50 text-xs text-[#e2e2e8] light:text-[#1a1a2e] animate-in fade-in"
              onMouseLeave={() => setShowExportMenu(false)}
            >
              <button
                type="button"
                onClick={() => {
                  onExportHtml();
                  setShowExportMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-[#7c6af7]/20 text-left"
              >
                <Code className="w-3.5 h-3.5 text-[#a78bfa]" />
                <div>
                  <div className="font-medium">Export .html</div>
                  <div className="text-[10px] text-[#8b8b9f]">Standalone styled webpage</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onExportMarkdown();
                  setShowExportMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-[#7c6af7]/20 text-left"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <div>
                  <div className="font-medium">Export .md</div>
                  <div className="text-[10px] text-[#8b8b9f]">Standard Markdown file</div>
                </div>
              </button>

              <div className="h-[1px] bg-white/10 light:bg-black/10 my-1" />

              <button
                type="button"
                onClick={() => {
                  handlePrint();
                  setShowExportMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-[#7c6af7]/20 text-left"
              >
                <Printer className="w-3.5 h-3.5 text-blue-400" />
                <span>Print / Save as PDF</span>
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          type="button"
          id="theme-toggle-btn"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          onClick={onToggleTheme}
          className="p-2 rounded-lg text-[#8b8b9f] hover:text-white hover:bg-white/5 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>
      </div>
    </header>
  );
};
