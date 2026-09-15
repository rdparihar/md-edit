import React, { useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Highlighter,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  RemoveFormatting,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { FloatingToolbarPosition } from '../types';

interface FloatingToolbarProps {
  position: FloatingToolbarPosition;
  onFormat: (command: string, value?: string) => void;
  activeFormats: {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strike: boolean;
    code: boolean;
    highlight: boolean;
    link: boolean;
    blockType: string;
  };
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  position,
  onFormat,
  activeFormats,
}) => {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showBlockMenu, setShowBlockMenu] = useState(false);

  if (!position.visible) return null;

  const handleApplyLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkUrl.trim()) {
      let formatted = linkUrl.trim();
      if (!/^https?:\/\//i.test(formatted) && !formatted.startsWith('/') && !formatted.startsWith('#')) {
        formatted = 'https://' + formatted;
      }
      onFormat('createLink', formatted);
    }
    setShowLinkInput(false);
    setLinkUrl('');
  };

  const handleRemoveLink = () => {
    onFormat('unlink');
    setShowLinkInput(false);
  };

  // Prevent selection clearing on mousedown
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div
      id="floating-format-toolbar"
      className="fixed z-50 flex items-center bg-[#15151c]/95 dark:bg-[#15151c]/95 light:bg-white/95 backdrop-blur-md border border-white/10 dark:border-white/10 light:border-black/10 shadow-2xl rounded-xl p-1 text-[#e2e2e8] light:text-[#1a1a2e] transition-all duration-150 animate-in fade-in zoom-in-95 pointer-events-auto"
      style={{
        top: `${Math.max(12, position.top)}px`,
        left: `${Math.max(12, position.left)}px`,
        transform: 'translateX(-50%)',
      }}
      onMouseDown={handleMouseDown}
    >
      {showLinkInput ? (
        <form onSubmit={handleApplyLink} className="flex items-center gap-1.5 px-1 py-0.5">
          <LinkIcon className="w-3.5 h-3.5 text-[#7c6af7] ml-1 flex-shrink-0" />
          <input
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Paste URL or type link..."
            autoFocus
            className="w-48 bg-[#1f1f2a] light:bg-gray-100 text-xs text-inherit rounded-md px-2 py-1 outline-none border border-white/10 focus:border-[#7c6af7]"
          />
          <button
            type="submit"
            title="Apply link"
            className="p-1 rounded hover:bg-[#7c6af7] text-white hover:text-white transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          {activeFormats.link && (
            <button
              type="button"
              onClick={handleRemoveLink}
              title="Remove link"
              className="p-1 rounded hover:bg-red-500/20 text-red-400 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowLinkInput(false)}
            title="Cancel"
            className="p-1 rounded hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-[#8b8b9f]" />
          </button>
        </form>
      ) : (
        <div className="flex items-center gap-0.5">
          {/* Block Type Dropdown */}
          <div className="relative">
            <button
              type="button"
              id="toolbar-block-dropdown"
              onClick={() => setShowBlockMenu(!showBlockMenu)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium hover:bg-white/10 transition-colors"
            >
              <span>{activeFormats.blockType || 'Text'}</span>
              <span className="text-[10px] opacity-60">▼</span>
            </button>

            {showBlockMenu && (
              <div
                className="absolute left-0 top-full mt-1 bg-[#181822] light:bg-white border border-white/10 light:border-black/10 rounded-lg shadow-xl py-1 w-32 flex flex-col z-50 animate-in fade-in"
                onMouseDown={handleMouseDown}
              >
                <button
                  type="button"
                  onClick={() => {
                    onFormat('formatBlock', '<p>');
                    setShowBlockMenu(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-[#7c6af7]/20 text-left"
                >
                  <span>Paragraph</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onFormat('formatBlock', '<h1>');
                    setShowBlockMenu(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-[#7c6af7]/20 text-left font-semibold"
                >
                  <Heading1 className="w-3.5 h-3.5" />
                  <span>Heading 1</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onFormat('formatBlock', '<h2>');
                    setShowBlockMenu(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-[#7c6af7]/20 text-left font-medium"
                >
                  <Heading2 className="w-3.5 h-3.5" />
                  <span>Heading 2</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onFormat('formatBlock', '<h3>');
                    setShowBlockMenu(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-[#7c6af7]/20 text-left font-medium"
                >
                  <Heading3 className="w-3.5 h-3.5" />
                  <span>Heading 3</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onFormat('formatBlock', '<blockquote>');
                    setShowBlockMenu(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-[#7c6af7]/20 text-left"
                >
                  <Quote className="w-3.5 h-3.5" />
                  <span>Quote</span>
                </button>
              </div>
            )}
          </div>

          <div className="w-[1px] h-4 bg-white/10 dark:bg-white/10 light:bg-black/10 mx-0.5" />

          {/* Bold */}
          <button
            type="button"
            id="toolbar-bold"
            title="Bold (Ctrl+B)"
            onClick={() => onFormat('bold')}
            className={`p-1.5 rounded-lg transition-colors ${
              activeFormats.bold
                ? 'bg-[#7c6af7] text-white'
                : 'hover:bg-white/10 text-[#c8c8d8] hover:text-white'
            }`}
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          {/* Italic */}
          <button
            type="button"
            id="toolbar-italic"
            title="Italic (Ctrl+I)"
            onClick={() => onFormat('italic')}
            className={`p-1.5 rounded-lg transition-colors ${
              activeFormats.italic
                ? 'bg-[#7c6af7] text-white'
                : 'hover:bg-white/10 text-[#c8c8d8] hover:text-white'
            }`}
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          {/* Underline */}
          <button
            type="button"
            id="toolbar-underline"
            title="Underline (Ctrl+U)"
            onClick={() => onFormat('underline')}
            className={`p-1.5 rounded-lg transition-colors ${
              activeFormats.underline
                ? 'bg-[#7c6af7] text-white'
                : 'hover:bg-white/10 text-[#c8c8d8] hover:text-white'
            }`}
          >
            <Underline className="w-3.5 h-3.5" />
          </button>

          {/* Strikethrough */}
          <button
            type="button"
            id="toolbar-strike"
            title="Strikethrough"
            onClick={() => onFormat('strikeThrough')}
            className={`p-1.5 rounded-lg transition-colors ${
              activeFormats.strike
                ? 'bg-[#7c6af7] text-white'
                : 'hover:bg-white/10 text-[#c8c8d8] hover:text-white'
            }`}
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          {/* Inline Code */}
          <button
            type="button"
            id="toolbar-code"
            title="Inline code"
            onClick={() => onFormat('code')}
            className={`p-1.5 rounded-lg transition-colors ${
              activeFormats.code
                ? 'bg-[#7c6af7] text-white'
                : 'hover:bg-white/10 text-[#c8c8d8] hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
          </button>

          {/* Highlighter */}
          <button
            type="button"
            id="toolbar-highlight"
            title="Highlight text"
            onClick={() => onFormat('highlight')}
            className={`p-1.5 rounded-lg transition-colors ${
              activeFormats.highlight
                ? 'bg-amber-400 text-black'
                : 'hover:bg-white/10 text-[#c8c8d8] hover:text-white'
            }`}
          >
            <Highlighter className="w-3.5 h-3.5" />
          </button>

          {/* Link */}
          <button
            type="button"
            id="toolbar-link"
            title="Add link (Ctrl+K)"
            onClick={() => setShowLinkInput(true)}
            className={`p-1.5 rounded-lg transition-colors ${
              activeFormats.link
                ? 'bg-[#7c6af7] text-white'
                : 'hover:bg-white/10 text-[#c8c8d8] hover:text-white'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-white/10 dark:bg-white/10 light:bg-black/10 mx-0.5" />

          {/* Remove formatting */}
          <button
            type="button"
            id="toolbar-clear"
            title="Clear formatting"
            onClick={() => onFormat('removeFormat')}
            className="p-1.5 rounded-lg hover:bg-white/10 text-[#8b8b9f] hover:text-white transition-colors"
          >
            <RemoveFormatting className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
