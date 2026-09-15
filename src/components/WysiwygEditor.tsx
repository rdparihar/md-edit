import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code2,
  Table,
  Minus,
  AlertCircle,
  Plus,
  Trash2,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { FloatingToolbar } from './FloatingToolbar';
import { SlashCommandMenu, SlashItem } from './SlashCommandMenu';
import { markdownToHtml, htmlToMarkdown } from '../utils/markdownConverter';
import { FloatingToolbarPosition } from '../types';

interface WysiwygEditorProps {
  markdown: string;
  onChange: (markdown: string) => void;
  fullWidth?: boolean;
}

export const WysiwygEditor: React.FC<WysiwygEditorProps> = ({
  markdown,
  onChange,
  fullWidth = false,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  // Floating format toolbar state
  const [toolbarPos, setToolbarPos] = useState<FloatingToolbarPosition>({
    top: 0,
    left: 0,
    visible: false,
  });
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    code: false,
    highlight: false,
    link: false,
    blockType: 'Paragraph',
  });

  // Slash commands state
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashPos, setSlashPos] = useState({ top: 0, left: 0 });
  const [slashQuery, setSlashQuery] = useState('');
  const [slashIndex, setSlashIndex] = useState(0);

  // Table active state
  const [activeTable, setActiveTable] = useState<{
    table: HTMLTableElement;
    cell: HTMLTableCellElement;
    top: number;
    left: number;
  } | null>(null);

  // Initial load or external markdown changes
  useEffect(() => {
    if (editorRef.current && !isInternalUpdate.current) {
      const newHtml = markdownToHtml(markdown);
      if (editorRef.current.innerHTML !== newHtml) {
        editorRef.current.innerHTML = newHtml;
      }
    }
  }, [markdown]);

  // Sync back to markdown on user edits
  const handleContentChange = useCallback(() => {
    if (!editorRef.current) return;
    isInternalUpdate.current = true;
    const md = htmlToMarkdown(editorRef.current.innerHTML);
    onChange(md);
    setTimeout(() => {
      isInternalUpdate.current = false;
    }, 50);
  }, [onChange]);

  // Update floating toolbar position and active states based on selection
  const updateToolbar = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !editorRef.current) {
      setToolbarPos((prev) => ({ ...prev, visible: false }));
      return;
    }

    // Ensure selection is inside this editor
    if (!editorRef.current.contains(selection.anchorNode)) {
      setToolbarPos((prev) => ({ ...prev, visible: false }));
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (rect.width === 0 && rect.height === 0) {
      setToolbarPos((prev) => ({ ...prev, visible: false }));
      return;
    }

    setToolbarPos({
      top: rect.top - 46 + window.scrollY,
      left: rect.left + rect.width / 2,
      visible: true,
    });

    // Determine active styles
    const parent = selection.anchorNode?.parentElement;
    const block = parent?.closest('h1, h2, h3, h4, blockquote, p') || null;
    let blockType = 'Paragraph';
    if (block) {
      const tag = block.tagName.toLowerCase();
      if (tag === 'h1') blockType = 'Heading 1';
      else if (tag === 'h2') blockType = 'Heading 2';
      else if (tag === 'h3') blockType = 'Heading 3';
      else if (tag === 'blockquote') blockType = 'Quote';
    }

    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strike: document.queryCommandState('strikeThrough'),
      code: parent?.tagName === 'CODE' || parent?.closest('code') !== null,
      highlight: parent?.tagName === 'MARK' || parent?.closest('mark') !== null,
      link: parent?.tagName === 'A' || parent?.closest('a') !== null,
      blockType,
    });
  }, []);

  // Format execution handler
  const handleFormat = (command: string, value?: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    if (command === 'highlight') {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;
      const range = selection.getRangeAt(0);
      const parentMark = range.commonAncestorContainer.parentElement?.closest('mark');

      if (parentMark) {
        // Unwrap mark
        const parent = parentMark.parentNode;
        while (parentMark.firstChild) {
          parent?.insertBefore(parentMark.firstChild, parentMark);
        }
        parentMark.remove();
      } else {
        const mark = document.createElement('mark');
        mark.className = 'bg-amber-400/20 text-amber-200 px-1 rounded';
        try {
          range.surroundContents(mark);
        } catch (e) {
          document.execCommand('backColor', false, '#fef08a');
        }
      }
    } else if (command === 'code') {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;
      const range = selection.getRangeAt(0);
      const parentCode = range.commonAncestorContainer.parentElement?.closest('code');

      if (parentCode) {
        const parent = parentCode.parentNode;
        while (parentCode.firstChild) {
          parent?.insertBefore(parentCode.firstChild, parentCode);
        }
        parentCode.remove();
      } else {
        const codeEl = document.createElement('code');
        try {
          range.surroundContents(codeEl);
        } catch (e) {
          const selectedText = selection.toString();
          document.execCommand('insertHTML', false, `<code>${selectedText}</code>`);
        }
      }
    } else {
      document.execCommand(command, false, value);
    }

    handleContentChange();
    setTimeout(updateToolbar, 20);
  };

  // Slash commands list definitions
  const slashCommands: SlashItem[] = [
    {
      id: 'h1',
      title: 'Heading 1',
      description: 'Large top-level header',
      icon: <Heading1 className="w-4 h-4" />,
      keywords: ['h1', 'header', 'title', 'large'],
      execute: () => {
        document.execCommand('formatBlock', false, '<h1>');
        handleContentChange();
      },
    },
    {
      id: 'h2',
      title: 'Heading 2',
      description: 'Medium section header',
      icon: <Heading2 className="w-4 h-4" />,
      keywords: ['h2', 'header', 'subtitle', 'medium'],
      execute: () => {
        document.execCommand('formatBlock', false, '<h2>');
        handleContentChange();
      },
    },
    {
      id: 'h3',
      title: 'Heading 3',
      description: 'Small subsection header',
      icon: <Heading3 className="w-4 h-4" />,
      keywords: ['h3', 'header', 'small'],
      execute: () => {
        document.execCommand('formatBlock', false, '<h3>');
        handleContentChange();
      },
    },
    {
      id: 'bullet-list',
      title: 'Bulleted List',
      description: 'Create a simple bulleted list',
      icon: <List className="w-4 h-4" />,
      keywords: ['bullet', 'list', 'unordered'],
      execute: () => {
        document.execCommand('insertUnorderedList');
        handleContentChange();
      },
    },
    {
      id: 'numbered-list',
      title: 'Numbered List',
      description: 'Create a numbered list sequence',
      icon: <ListOrdered className="w-4 h-4" />,
      keywords: ['numbered', 'list', 'ordered', '1.'],
      execute: () => {
        document.execCommand('insertOrderedList');
        handleContentChange();
      },
    },
    {
      id: 'task-list',
      title: 'To-do List',
      description: 'Checklist with interactive checkboxes',
      icon: <CheckSquare className="w-4 h-4" />,
      keywords: ['todo', 'task', 'checklist', 'checkbox'],
      execute: () => {
        const taskHtml = `<ul><li class="task-list-item" data-checked="false"><input type="checkbox" class="task-checkbox" /> <span class="task-text">New task</span></li></ul><p><br></p>`;
        document.execCommand('insertHTML', false, taskHtml);
        handleContentChange();
      },
    },
    {
      id: 'quote',
      title: 'Quote',
      description: 'Capture a standout quote or takeaway',
      icon: <Quote className="w-4 h-4" />,
      keywords: ['quote', 'blockquote', 'cite'],
      execute: () => {
        document.execCommand('formatBlock', false, '<blockquote>');
        handleContentChange();
      },
    },
    {
      id: 'code-block',
      title: 'Code Block',
      description: 'Fenced code snippet with syntax highlighting',
      icon: <Code2 className="w-4 h-4" />,
      keywords: ['code', 'snippet', 'javascript', 'pre'],
      execute: () => {
        const codeSnippet = `<pre class="code-block-wrapper"><code class="hljs language-javascript">// Code snippet\nconsole.log("Hello, world!");</code></pre><p><br></p>`;
        document.execCommand('insertHTML', false, codeSnippet);
        handleContentChange();
      },
    },
    {
      id: 'table',
      title: 'Table',
      description: 'Insert a 3x3 data table',
      icon: <Table className="w-4 h-4" />,
      keywords: ['table', 'grid', 'columns', 'rows'],
      execute: () => {
        const tableHtml = `
          <table>
            <thead>
              <tr>
                <th>Header 1</th>
                <th>Header 2</th>
                <th>Header 3</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Cell 1</td>
                <td>Cell 2</td>
                <td>Cell 3</td>
              </tr>
              <tr>
                <td>Cell 4</td>
                <td>Cell 5</td>
                <td>Cell 6</td>
              </tr>
            </tbody>
          </table>
          <p><br></p>
        `;
        document.execCommand('insertHTML', false, tableHtml);
        handleContentChange();
      },
    },
    {
      id: 'callout',
      title: 'Callout Box',
      description: 'Highlighted note or tip box',
      icon: <AlertCircle className="w-4 h-4" />,
      keywords: ['callout', 'alert', 'note', 'tip'],
      execute: () => {
        const calloutHtml = `
          <div class="wysiwyg-callout">
            <span style="font-size: 1.25rem;">💡</span>
            <div><strong>Tip:</strong> You can edit directly in this box!</div>
          </div>
          <p><br></p>
        `;
        document.execCommand('insertHTML', false, calloutHtml);
        handleContentChange();
      },
    },
    {
      id: 'divider',
      title: 'Divider',
      description: 'Visual horizontal line break',
      icon: <Minus className="w-4 h-4" />,
      keywords: ['divider', 'line', 'hr', 'break'],
      execute: () => {
        document.execCommand('insertHorizontalRule');
        handleContentChange();
      },
    },
  ];

  // Execute selected slash command and remove typed slash trigger
  const executeSlashCommand = (cmd: SlashItem) => {
    setSlashMenuOpen(false);

    // Remove the typed /query text
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const textNode = range.startContainer;
      if (textNode.nodeType === Node.TEXT_NODE && textNode.textContent) {
        const text = textNode.textContent;
        const slashIdx = text.lastIndexOf('/');
        if (slashIdx !== -1) {
          textNode.textContent = text.slice(0, slashIdx);
        }
      }
    }

    cmd.execute();
    setSlashQuery('');
    setSlashIndex(0);
  };

  // Keyboard handler for Notion-like behaviors & shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Slash menu open navigation
    if (slashMenuOpen) {
      const filtered = slashCommands.filter((c) => {
        const q = slashQuery.toLowerCase().trim();
        if (!q) return true;
        return (
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.keywords.some((k) => k.toLowerCase().includes(q))
        );
      });

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSlashIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSlashIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[slashIndex]) {
          executeSlashCommand(filtered[slashIndex]);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setSlashMenuOpen(false);
        return;
      }
    }

    // Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+K
    const ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      handleFormat('bold');
      return;
    }
    if (ctrl && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      handleFormat('italic');
      return;
    }
    if (ctrl && e.key.toLowerCase() === 'u') {
      e.preventDefault();
      handleFormat('underline');
      return;
    }
    if (ctrl && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      updateToolbar();
      return;
    }

    // Enter key handling in task list items
    if (e.key === 'Enter' && !e.shiftKey) {
      const selection = window.getSelection();
      const anchorNode = selection?.anchorNode;
      const currentLi = anchorNode instanceof Element ? anchorNode.closest('li') : anchorNode?.parentElement?.closest('li');

      if (currentLi && currentLi.classList.contains('task-list-item')) {
        const text = currentLi.textContent?.trim() || '';
        // If current item is empty, break out into normal paragraph
        if (text === '' || text === '\u00A0') {
          e.preventDefault();
          const p = document.createElement('p');
          p.innerHTML = '<br>';
          currentLi.parentElement?.replaceChild(p, currentLi);
          const newRange = document.createRange();
          newRange.setStart(p, 0);
          newRange.collapse(true);
          selection?.removeAllRanges();
          selection?.addRange(newRange);
          handleContentChange();
          return;
        }

        // Otherwise insert new task item
        e.preventDefault();
        const newLi = document.createElement('li');
        newLi.className = 'task-list-item';
        newLi.setAttribute('data-checked', 'false');
        newLi.innerHTML = `<input type="checkbox" class="task-checkbox" /> <span class="task-text"><br></span>`;
        currentLi.after(newLi);

        const newRange = document.createRange();
        const textSpan = newLi.querySelector('.task-text');
        if (textSpan) {
          newRange.setStart(textSpan, 0);
          newRange.collapse(true);
          selection?.removeAllRanges();
          selection?.addRange(newRange);
        }
        handleContentChange();
        return;
      }
    }

    // Markdown shortcut expansion on space (e.g. # space -> H1, - space -> List)
    if (e.key === ' ') {
      const selection = window.getSelection();
      if (selection && selection.isCollapsed) {
        const node = selection.anchorNode;
        if (node && node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent || '';
          const pos = selection.anchorOffset;
          const lineStart = text.slice(0, pos);

          if (lineStart === '#') {
            e.preventDefault();
            node.textContent = text.slice(pos);
            document.execCommand('formatBlock', false, '<h1>');
            handleContentChange();
            return;
          }
          if (lineStart === '##') {
            e.preventDefault();
            node.textContent = text.slice(pos);
            document.execCommand('formatBlock', false, '<h2>');
            handleContentChange();
            return;
          }
          if (lineStart === '###') {
            e.preventDefault();
            node.textContent = text.slice(pos);
            document.execCommand('formatBlock', false, '<h3>');
            handleContentChange();
            return;
          }
          if (lineStart === '-' || lineStart === '*') {
            e.preventDefault();
            node.textContent = text.slice(pos);
            document.execCommand('insertUnorderedList');
            handleContentChange();
            return;
          }
          if (lineStart === '1.') {
            e.preventDefault();
            node.textContent = text.slice(pos);
            document.execCommand('insertOrderedList');
            handleContentChange();
            return;
          }
          if (lineStart === '>') {
            e.preventDefault();
            node.textContent = text.slice(pos);
            document.execCommand('formatBlock', false, '<blockquote>');
            handleContentChange();
            return;
          }
          if (lineStart === '[]' || lineStart === '[ ]') {
            e.preventDefault();
            node.textContent = text.slice(pos);
            const taskHtml = `<ul><li class="task-list-item" data-checked="false"><input type="checkbox" class="task-checkbox" /> <span class="task-text"><br></span></li></ul>`;
            document.execCommand('insertHTML', false, taskHtml);
            handleContentChange();
            return;
          }
          if (lineStart === '---') {
            e.preventDefault();
            node.textContent = text.slice(pos);
            document.execCommand('insertHorizontalRule');
            handleContentChange();
            return;
          }
        }
      }
    }

    // Tab key indent
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        document.execCommand('outdent');
      } else {
        document.execCommand('indent');
      }
      handleContentChange();
      return;
    }
  };

  // Detect input for Slash `/` menu
  const handleInput = () => {
    handleContentChange();

    const selection = window.getSelection();
    if (!selection || !selection.isCollapsed) {
      setSlashMenuOpen(false);
      return;
    }

    const node = selection.anchorNode;
    if (node && node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      const offset = selection.anchorOffset;
      const textBefore = text.slice(0, offset);

      const slashMatch = textBefore.match(/(?:^|\s)\/([a-zA-Z0-9_-]*)$/);
      if (slashMatch) {
        const query = slashMatch[1];
        setSlashQuery(query);
        setSlashIndex(0);

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSlashPos({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
        });
        setSlashMenuOpen(true);
        return;
      }
    }

    setSlashMenuOpen(false);
  };

  // Interactive Click Handlers (Task Checkbox click & Table cell selection)
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    // Checkbox click
    if (target.classList.contains('task-checkbox') || target.tagName === 'INPUT') {
      const checkbox = target as HTMLInputElement;
      const li = checkbox.closest('li');
      if (li) {
        li.setAttribute('data-checked', checkbox.checked ? 'true' : 'false');
        const span = li.querySelector('.task-text');
        if (span) {
          span.classList.toggle('line-through', checkbox.checked);
          span.classList.toggle('opacity-60', checkbox.checked);
        }
        handleContentChange();
      }
      return;
    }

    // Table cell detection
    const cell = target.closest('td, th') as HTMLTableCellElement | null;
    const table = target.closest('table') as HTMLTableElement | null;
    if (cell && table) {
      const rect = cell.getBoundingClientRect();
      setActiveTable({
        table,
        cell,
        top: rect.top + window.scrollY,
        left: rect.right + window.scrollX,
      });
    } else {
      setActiveTable(null);
    }
  };

  // Table manipulation helpers
  const handleAddTableRow = () => {
    if (!activeTable) return;
    const { table, cell } = activeTable;
    const currentRow = cell.closest('tr');
    if (!currentRow) return;

    const newRow = document.createElement('tr');
    const colsCount = currentRow.children.length;
    for (let i = 0; i < colsCount; i++) {
      const newCell = document.createElement('td');
      newCell.textContent = 'Cell';
      newRow.appendChild(newCell);
    }
    currentRow.after(newRow);
    handleContentChange();
  };

  const handleDeleteTableRow = () => {
    if (!activeTable) return;
    const { cell } = activeTable;
    const currentRow = cell.closest('tr');
    if (currentRow && currentRow.parentElement?.children.length && currentRow.parentElement.children.length > 1) {
      currentRow.remove();
      setActiveTable(null);
      handleContentChange();
    }
  };

  const handleAddTableCol = () => {
    if (!activeTable) return;
    const { table } = activeTable;
    const rows = table.querySelectorAll('tr');
    rows.forEach((row, i) => {
      const cell = document.createElement(i === 0 && row.querySelector('th') ? 'th' : 'td');
      cell.textContent = i === 0 ? 'Header' : 'Cell';
      row.appendChild(cell);
    });
    handleContentChange();
  };

  return (
    <div
      className="relative flex-1 flex flex-col h-full overflow-y-auto bg-[#0d0d11] light:bg-[#f8f9fc] text-[#e2e2e8] light:text-[#1a1a2e]"
      onClick={() => {
        if (!toolbarPos.visible) updateToolbar();
      }}
    >
      {/* Floating Selection Toolbar */}
      <FloatingToolbar
        position={toolbarPos}
        onFormat={handleFormat}
        activeFormats={activeFormats}
      />

      {/* Slash Commands Dropdown */}
      {slashMenuOpen && (
        <SlashCommandMenu
          position={slashPos}
          searchQuery={slashQuery}
          onSelect={executeSlashCommand}
          onClose={() => setSlashMenuOpen(false)}
          commands={slashCommands}
          selectedIndex={slashIndex}
        />
      )}

      {/* Table Context Floating Actions */}
      {activeTable && (
        <div
          className="fixed z-40 flex items-center gap-1 bg-[#181822] light:bg-white border border-white/10 light:border-black/10 shadow-lg rounded-lg p-1 text-xs animate-in fade-in"
          style={{
            top: `${activeTable.top - 32}px`,
            left: `${activeTable.left - 120}px`,
          }}
        >
          <button
            type="button"
            title="Add row below"
            onClick={handleAddTableRow}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 text-xs text-[#a78bfa]"
          >
            <Plus className="w-3 h-3" /> Row
          </button>
          <button
            type="button"
            title="Add column right"
            onClick={handleAddTableCol}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 text-xs text-[#a78bfa]"
          >
            <Plus className="w-3 h-3" /> Col
          </button>
          <button
            type="button"
            title="Delete current row"
            onClick={handleDeleteTableRow}
            className="p-1 rounded hover:bg-red-500/20 text-red-400"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Main WYSIWYG Document Canvas */}
      <div className="flex-1 flex justify-center px-4 sm:px-8 py-8 md:py-12 cursor-text" onClick={() => editorRef.current?.focus()}>
        <div
          className={`w-full transition-all duration-200 ${
            fullWidth ? 'max-w-5xl' : 'max-w-3xl'
          }`}
        >
          <div
            id="wysiwyg-editor"
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onMouseUp={updateToolbar}
            onKeyUp={(e) => {
              if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
                updateToolbar();
              }
            }}
            onClick={handleClick}
            className="wysiwyg-content focus:outline-none min-h-[70vh] pb-32"
          />
        </div>
      </div>
    </div>
  );
};
