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
  HardDrive,
  Check,
  RotateCcw,
  XCircle,
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
  // Local File direct editor props
  isDirectLocalFile?: boolean;
  localFileName?: string;
  isDiskDirty?: boolean;
  isSaving?: boolean;
  autoSaveToDisk?: boolean;
  onSaveDirectly?: () => void;
  onSaveAsLocalFile?: () => void;
  onDetachLocalFile?: () => void;
  onToggleAutoSaveToDisk?: () => void;
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
  isDirectLocalFile = false,
  localFileName,
  isDiskDirty = false,
  isSaving = false,
  autoSaveToDisk = false,
  onSaveDirectly,
  onSaveAsLocalFile,
  onDetachLocalFile,
  onToggleAutoSaveToDisk,
}) => {
  const [showFileMenu, setShowFileMenu] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="h-14 bg-[#14141c] light:bg-white border-b border-white/10 light:border-black/10 px-3 sm:px-4 flex items-center justify-between flex-shrink-0 select-none z-30">
      {/* Left: Brand, Editable File Name & Direct Disk Indicator */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#6352e8] to-[#9b84ff] flex items-center justify-center text-white font-bold shadow-md shadow-[#6352e8]/30 flex-shrink-0">
            ✦
          </div>
          <span className="font-semibold text-sm tracking-tight hidden lg:inline text-white light:text-gray-900">
            Markdown
          </span>
        </div>

        <div className="h-4 w-[1px] bg-white/10 light:bg-black/10 hidden sm:block" />

        {/* Title input & Local file pill */}
        <div className="flex items-center gap-1.5 sm:gap-2 max-w-[200px] sm:max-w-[280px] md:max-w-[340px]">
          <input
            id="document-title-input"
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="bg-transparent text-xs sm:text-sm font-medium text-[#e2e2e8] light:text-[#1a1a2e] hover:bg-white/5 light:hover:bg-black/5 focus:bg-[#1f1f2c] light:focus:bg-gray-100 rounded-md px-2 py-1 outline-none transition-colors truncate"
            title="Click to rename document"
          />

          {/* Status Dot / Direct Disk indicator */}
          {isDirectLocalFile ? (
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium flex-shrink-0"
              title={`Direct Disk Editing: ${localFileName || title} (${isDiskDirty ? 'Unsaved changes on disk' : 'Synced with disk'})`}
            >
              <HardDrive className="w-3 h-3 text-emerald-400" />
              <span className="hidden xl:inline text-[10px]">Disk:</span>
              <span className={`w-1.5 h-1.5 rounded-full ${isDiskDirty ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
            </div>
          ) : (
            <div
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                isDirty ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
              }`}
              title={isDirty ? 'Unsaved changes in memory' : 'Saved in memory'}
            />
          )}
        </div>
      </div>

      {/* Center: View Mode Switcher (Renamed WYSIWYG to Visual Editor / Visual) */}
      <div className="flex items-center bg-[#1c1c27] light:bg-gray-100 p-1 rounded-xl border border-white/5 light:border-black/5">
        <button
          type="button"
          id="view-mode-wysiwyg"
          title="Visual Editor (Click & edit directly on formatted text)"
          onClick={() => onViewModeChange('wysiwyg')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            viewMode === 'wysiwyg'
              ? 'bg-[#7c6af7] text-white shadow-sm'
              : 'text-[#8b8b9f] hover:text-white'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Visual Editor</span>
          <span className="hidden sm:inline md:hidden">Visual</span>
        </button>

        <button
          type="button"
          id="view-mode-split"
          title="Split View (Markdown left, Live preview right)"
          onClick={() => onViewModeChange('split')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
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
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
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
          title="Clean Reading Preview Mode"
          onClick={() => onViewModeChange('preview')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            viewMode === 'preview'
              ? 'bg-[#7c6af7] text-white shadow-sm'
              : 'text-[#8b8b9f] hover:text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Preview</span>
        </button>
      </div>

      {/* Right: Direct Disk Actions, HTML Output, File Menu, Theme */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Open Local File Direct button */}
        <button
          type="button"
          id="open-file-header-btn"
          title="Load Markdown from local file system (Ctrl+O)"
          onClick={onOpenDocument}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1f1f2c] light:bg-gray-100 hover:bg-white/10 text-xs font-medium text-[#c0c0d4] light:text-[#333] transition-colors"
        >
          <FolderOpen className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Open File</span>
        </button>

        {/* Direct Save Button */}
        {onSaveDirectly && (
          <button
            type="button"
            id="save-direct-header-btn"
            title={
              isDirectLocalFile
                ? `Save directly to disk (${localFileName || title}) [Ctrl+S]`
                : 'Save document (Ctrl+S)'
            }
            onClick={onSaveDirectly}
            disabled={isSaving}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isDiskDirty
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-700/20'
                : 'bg-[#1f1f2c] light:bg-gray-100 text-[#c0c0d4] light:text-[#333] hover:bg-white/10'
            }`}
          >
            {isSaving ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className={`w-3.5 h-3.5 ${isDiskDirty ? 'text-white' : 'text-emerald-400'}`} />
            )}
            <span className="hidden sm:inline">
              {isSaving
                ? 'Saving...'
                : isDirectLocalFile
                ? isDiskDirty
                  ? 'Save to Disk'
                  : 'Saved'
                : 'Save'}
            </span>
          </button>
        )}

        {/* Full width toggle (for Visual mode) */}
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
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-[#8b8b9f] hover:text-white hover:bg-white/5 transition-colors hidden xl:flex border border-white/5"
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
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#7c6af7]/15 hover:bg-[#7c6af7]/25 text-[#a78bfa] border border-[#7c6af7]/30 text-xs font-medium transition-all"
        >
          <Code className="w-3.5 h-3.5" />
          <span className="hidden md:inline">HTML Output</span>
          <span className="hidden sm:inline md:hidden">HTML</span>
        </button>

        {/* File & Export Dropdown Menu */}
        <div className="relative">
          <button
            type="button"
            id="file-dropdown-btn"
            title="File Options & Exports"
            onClick={() => setShowFileMenu(!showFileMenu)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#1f1f2c] light:bg-gray-100 text-xs font-medium text-[#e2e2e8] light:text-[#1a1a2e] hover:bg-white/10 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {showFileMenu && (
            <div
              className="absolute right-0 top-full mt-1.5 w-56 bg-[#181822] light:bg-white border border-white/10 light:border-black/10 rounded-xl shadow-2xl py-1 z-50 text-xs text-[#e2e2e8] light:text-[#1a1a2e] animate-in fade-in"
              onMouseLeave={() => setShowFileMenu(false)}
            >
              {/* Local File Direct Actions */}
              <div className="px-3 py-1.5 text-[10px] font-semibold text-[#666680] uppercase tracking-wider">
                Direct File System
              </div>

              <button
                type="button"
                onClick={() => {
                  onOpenDocument();
                  setShowFileMenu(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#7c6af7]/20 text-left"
              >
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-3.5 h-3.5 text-sky-400" />
                  <div>
                    <div className="font-medium">Open Local File...</div>
                    <div className="text-[10px] text-[#8b8b9f]">Direct disk editor</div>
                  </div>
                </div>
                <span className="text-[10px] text-[#8b8b9f] font-mono">Ctrl+O</span>
              </button>

              {onSaveDirectly && (
                <button
                  type="button"
                  onClick={() => {
                    onSaveDirectly();
                    setShowFileMenu(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#7c6af7]/20 text-left"
                >
                  <div className="flex items-center gap-2">
                    <Save className="w-3.5 h-3.5 text-emerald-400" />
                    <div>
                      <div className="font-medium">
                        {isDirectLocalFile ? 'Save to Local File' : 'Save Document'}
                      </div>
                      <div className="text-[10px] text-[#8b8b9f]">
                        {isDirectLocalFile ? 'Writes directly to disk' : 'Save as local file'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#8b8b9f] font-mono">Ctrl+S</span>
                </button>
              )}

              {onSaveAsLocalFile && (
                <button
                  type="button"
                  onClick={() => {
                    onSaveAsLocalFile();
                    setShowFileMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#7c6af7]/20 text-left"
                >
                  <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                  <div>
                    <div className="font-medium">Save As New File...</div>
                    <div className="text-[10px] text-[#8b8b9f]">Pick location on disk</div>
                  </div>
                </button>
              )}

              {isDirectLocalFile && onToggleAutoSaveToDisk && (
                <button
                  type="button"
                  onClick={onToggleAutoSaveToDisk}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#7c6af7]/20 text-left border-t border-white/5"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <div>
                      <div className="font-medium">Auto-Save to Disk</div>
                      <div className="text-[10px] text-[#8b8b9f]">
                        {autoSaveToDisk ? 'Active (every 2s)' : 'Disabled'}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-8 h-4 rounded-full transition-colors flex items-center p-0.5 ${
                      autoSaveToDisk ? 'bg-emerald-500 justify-end' : 'bg-white/20 justify-start'
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full bg-white shadow-sm" />
                  </div>
                </button>
              )}

              {isDirectLocalFile && onDetachLocalFile && (
                <button
                  type="button"
                  onClick={() => {
                    onDetachLocalFile();
                    setShowFileMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-rose-500/20 text-rose-300 text-left border-t border-white/5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <div>
                    <div className="font-medium">Detach Local File</div>
                    <div className="text-[10px] text-rose-300/70">Switch back to memory</div>
                  </div>
                </button>
              )}

              <div className="h-[1px] bg-white/10 light:bg-black/10 my-1" />

              <div className="px-3 py-1.5 text-[10px] font-semibold text-[#666680] uppercase tracking-wider">
                Export & Actions
              </div>

              <button
                type="button"
                onClick={() => {
                  onNewDocument();
                  setShowFileMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#7c6af7]/20 text-left"
              >
                <FilePlus className="w-3.5 h-3.5 text-purple-400" />
                <span>New Document</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onExportHtml();
                  setShowFileMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#7c6af7]/20 text-left"
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
                  setShowFileMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#7c6af7]/20 text-left"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <div>
                  <div className="font-medium">Download .md</div>
                  <div className="text-[10px] text-[#8b8b9f]">Standard Markdown file</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  handlePrint();
                  setShowFileMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#7c6af7]/20 text-left"
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
