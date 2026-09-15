import React, { useRef, useEffect } from 'react';
import {
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Strikethrough,
  Code,
  Quote,
  List,
  ListOrdered,
  CheckSquare,
  Link as LinkIcon,
  Table,
  Minus,
} from 'lucide-react';

interface MarkdownSourceEditorProps {
  value: string;
  onChange: (val: string) => void;
  onCursorChange?: (line: number, col: number) => void;
}

export const MarkdownSourceEditor: React.FC<MarkdownSourceEditorProps> = ({
  value,
  onChange,
  onCursorChange,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const lines = value.split('\n');
  const lineCount = Math.max(1, lines.length);

  // Sync scroll between textarea and line numbers
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const updateCursorPosition = () => {
    if (!textareaRef.current || !onCursorChange) return;
    const pos = textareaRef.current.selectionStart;
    const textBefore = value.slice(0, pos);
    const line = textBefore.split('\n').length;
    const col = pos - textBefore.lastIndexOf('\n');
    onCursorChange(line, col);
  };

  const insertSnippet = (before: string, after: string = '', defaultText: string = '') => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selectedText = value.slice(start, end) || defaultText;

    const replacement = before + selectedText + after;
    const newValue = value.slice(0, start) + replacement + value.slice(end);
    onChange(newValue);

    setTimeout(() => {
      el.focus();
      const newCursor = start + before.length + selectedText.length;
      el.setSelectionRange(newCursor, newCursor);
      updateCursorPosition();
    }, 10);
  };

  const insertLinePrefix = (prefix: string) => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = value.indexOf('\n', start);
    const actualEnd = lineEnd === -1 ? value.length : lineEnd;
    const line = value.slice(lineStart, actualEnd);

    let newLine = '';
    if (line.startsWith(prefix)) {
      newLine = line.slice(prefix.length);
    } else {
      newLine = prefix + line;
    }

    const newValue = value.slice(0, lineStart) + newLine + value.slice(actualEnd);
    onChange(newValue);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + (line.startsWith(prefix) ? -prefix.length : prefix.length), start + (line.startsWith(prefix) ? -prefix.length : prefix.length));
      updateCursorPosition();
    }, 10);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const ctrl = e.ctrlKey || e.metaKey;

    if (ctrl && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      insertSnippet('**', '**', 'bold text');
      return;
    }
    if (ctrl && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      insertSnippet('*', '*', 'italic text');
      return;
    }
    if (ctrl && e.key === '`') {
      e.preventDefault();
      insertSnippet('`', '`', 'code');
      return;
    }
    if (ctrl && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      insertSnippet('[', '](url)', 'link text');
      return;
    }

    // Tab indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      insertSnippet('  ');
      return;
    }

    // Enter key auto-list continuation
    if (e.key === 'Enter') {
      const el = textareaRef.current;
      if (!el) return;
      const start = el.selectionStart;
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const currentLine = value.slice(lineStart, start);

      const bulletMatch = currentLine.match(/^(\s*[-*+]\s+)/);
      const numberMatch = currentLine.match(/^(\s*(\d+)\.\s+)/);
      const taskMatch = currentLine.match(/^(\s*[-*+]\s+\[[ xX]\]\s+)/);

      if (taskMatch) {
        e.preventDefault();
        if (currentLine.trim() === taskMatch[0].trim()) {
          // Empty task item: terminate list
          const newValue = value.slice(0, lineStart) + '\n' + value.slice(start);
          onChange(newValue);
        } else {
          insertSnippet('\n- [ ] ');
        }
        return;
      }

      if (numberMatch) {
        e.preventDefault();
        const num = parseInt(numberMatch[2], 10);
        if (currentLine.trim() === numberMatch[0].trim()) {
          // Empty ordered item
          const newValue = value.slice(0, lineStart) + '\n' + value.slice(start);
          onChange(newValue);
        } else {
          insertSnippet(`\n${num + 1}. `);
        }
        return;
      }

      if (bulletMatch) {
        e.preventDefault();
        if (currentLine.trim() === bulletMatch[0].trim()) {
          // Empty bullet item
          const newValue = value.slice(0, lineStart) + '\n' + value.slice(start);
          onChange(newValue);
        } else {
          insertSnippet(`\n${bulletMatch[1]}`);
        }
        return;
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0d11] light:bg-[#f8f9fc] border-r border-white/5 light:border-black/5 overflow-hidden">
      {/* Markdown quick shortcuts toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-1.5 bg-[#121218] light:bg-gray-100 border-b border-white/10 light:border-black/10 flex-shrink-0 overflow-x-auto text-[#8b8b9f]">
        <button
          type="button"
          title="Heading 1"
          onClick={() => insertLinePrefix('# ')}
          className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors text-xs font-semibold px-1.5"
        >
          H1
        </button>
        <button
          type="button"
          title="Heading 2"
          onClick={() => insertLinePrefix('## ')}
          className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors text-xs font-semibold px-1.5"
        >
          H2
        </button>
        <button
          type="button"
          title="Heading 3"
          onClick={() => insertLinePrefix('### ')}
          className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors text-xs font-semibold px-1.5"
        >
          H3
        </button>

        <div className="w-[1px] h-3.5 bg-white/10 light:bg-black/10 mx-1" />

        <button
          type="button"
          title="Bold (Ctrl+B)"
          onClick={() => insertSnippet('**', '**', 'bold text')}
          className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Italic (Ctrl+I)"
          onClick={() => insertSnippet('*', '*', 'italic text')}
          className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Strikethrough"
          onClick={() => insertSnippet('~~', '~~', 'strikethrough')}
          className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Inline Code"
          onClick={() => insertSnippet('`', '`', 'code')}
          className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors"
        >
          <Code className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-3.5 bg-white/10 light:bg-black/10 mx-1" />

        <button
          type="button"
          title="Blockquote"
          onClick={() => insertLinePrefix('> ')}
          className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Bullet List"
          onClick={() => insertLinePrefix('- ')}
          className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Numbered List"
          onClick={() => insertLinePrefix('1. ')}
          className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Task Checklist"
          onClick={() => insertLinePrefix('- [ ] ')}
          className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors"
        >
          <CheckSquare className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-3.5 bg-white/10 light:bg-black/10 mx-1" />

        <button
          type="button"
          title="Link"
          onClick={() => insertSnippet('[', '](https://)', 'link text')}
          className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors"
        >
          <LinkIcon className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Insert Table"
          onClick={() =>
            insertSnippet(
              '\n| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n'
            )
          }
          className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors"
        >
          <Table className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Divider"
          onClick={() => insertSnippet('\n---\n')}
          className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Editor Body with line numbers */}
      <div className="flex-1 flex overflow-hidden font-mono text-sm leading-relaxed">
        {/* Line Numbers */}
        <div
          ref={lineNumbersRef}
          className="w-12 py-4 select-none bg-[#0a0a0e] light:bg-gray-50 text-[#4c4c60] light:text-gray-400 text-right pr-3 overflow-hidden border-r border-white/5 light:border-black/5"
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} className="h-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          id="markdown-source-textarea"
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            updateCursorPosition();
          }}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          onClick={updateCursorPosition}
          onKeyUp={updateCursorPosition}
          placeholder="Type markdown syntax here..."
          className="flex-1 h-full p-4 bg-transparent resize-none outline-none text-[#e2e2e8] light:text-[#1a1a2e] overflow-y-auto"
          style={{ lineHeight: '1.5rem' }}
          spellCheck={false}
        />
      </div>
    </div>
  );
};
