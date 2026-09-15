import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { WysiwygEditor } from './components/WysiwygEditor';
import { MarkdownSourceEditor } from './components/MarkdownSourceEditor';
import { StatusBar } from './components/StatusBar';
import { HtmlOutputModal } from './components/HtmlOutputModal';
import { CommandPalette } from './components/CommandPalette';
import { markdownToHtml, calculateStats } from './utils/markdownConverter';
import { generateStandaloneHtml, downloadFile } from './utils/exportHtml';
import { ViewMode, Theme, DocumentStats } from './types';
import {
  Code,
  Edit3,
  Columns,
  Eye,
  FilePlus,
  FolderOpen,
  Download,
  Moon,
  Sun,
  Table,
  CheckSquare,
  Sparkles,
} from 'lucide-react';

const STARTER_MARKDOWN = `# Welcome to Markdown WYSIWYG ✦

Click directly on any rendered text in this document and edit it just like in **Notion** or **Microsoft Word**!

---

## ⚡ Key Highlights

- **Full WYSIWYG Mode**: Click anywhere and type directly on the rendered page
- **Floating Format Toolbar**: Highlight any text to reveal format controls (Bold, Italic, Underline, Strikethrough, Code, Marker Highlight, Links)
- **Slash Commands (\`/\`)**: Type \`/\` on any line to insert Headings, Lists, Tables, Quotes, or Code Blocks
- **Interactive Checklists**: Click on the checkboxes below to toggle task completion in real-time
- **Bidirectional Sync**: Seamlessly syncs between rich WYSIWYG and standard Markdown

---

## 📋 Interactive Task Checklist

- [x] Click text directly to edit inline
- [x] Select text to test the floating bubble toolbar
- [ ] Try typing \`# \` or \`- \` to trigger automatic Markdown formatting
- [ ] Open the **HTML Output** modal to copy or download ready-to-publish HTML
- [ ] Try switching to **Split View** to view Markdown source and live WYSIWYG side-by-side

---

## 💻 Code Snippet Example

\`\`\`typescript
interface MarkdownDocument {
  id: string;
  title: string;
  content: string;
  mode: 'wysiwyg' | 'split' | 'markdown';
}

const editor = new MarkdownDocument({
  title: "My Modern Notes",
  mode: "wysiwyg"
});
\`\`\`

---

## 📊 Comparison Table

| Feature | Classic Markdown | Modern WYSIWYG |
| :--- | :--- | :--- |
| **Direct inline editing** | ❌ Source only | ✅ Click & type |
| **Floating format toolbar** | ❌ None | ✅ Selection popover |
| **Interactive checkboxes** | ❌ Plain text | ✅ Click to toggle |
| **Instant HTML Export** | ⚠️ Needs compiler | ✅ Standalone single-file |

> 💡 **Tip:** Press \`Ctrl+K\` to open the Command Palette, or click the **HTML Output** button above to generate a standalone web page with one click!
`;

export default function App() {
  const [markdown, setMarkdown] = useState<string>(() => {
    const saved = localStorage.getItem('md_editor_content');
    return saved !== null ? saved : STARTER_MARKDOWN;
  });

  const [title, setTitle] = useState<string>(() => {
    return localStorage.getItem('md_editor_title') || 'Welcome to Markdown.md';
  });

  const [viewMode, setViewMode] = useState<ViewMode>('wysiwyg');
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('md_editor_theme') as Theme) || 'dark';
  });

  const [isDirty, setIsDirty] = useState(false);
  const [stats, setStats] = useState<DocumentStats>(() => calculateStats(markdown));
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [fullWidth, setFullWidth] = useState(false);

  // Modals
  const [isHtmlModalOpen, setIsHtmlModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Split view resizer
  const [splitPercent, setSplitPercent] = useState(50);
  const isDraggingSplit = useRef(false);

  // Hidden file input for opening markdown files
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Apply theme to document.body
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
    localStorage.setItem('md_editor_theme', theme);
  }, [theme]);

  // Sync title and metadata
  useEffect(() => {
    localStorage.setItem('md_editor_title', title);
  }, [title]);

  // Handle Markdown content update
  const handleMarkdownChange = useCallback((newMarkdown: string) => {
    setMarkdown(newMarkdown);
    setStats(calculateStats(newMarkdown));
    setIsDirty(true);

    // Debounced autosave
    localStorage.setItem('md_editor_content', newMarkdown);
    setTimeout(() => {
      setIsDirty(false);
    }, 800);
  }, []);

  const handleExportMarkdown = () => {
    const filename = `${(title || 'document').replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
    const cleanFilename = filename.endsWith('.md') ? filename : `${filename}.md`;
    downloadFile(markdown, cleanFilename, 'text/markdown');
    setIsDirty(false);
  };

  const handleExportHtml = () => {
    const htmlBody = markdownToHtml(markdown);
    const standalone = generateStandaloneHtml({
      title,
      bodyHtml: htmlBody,
      theme,
    });
    const filename = `${(title || 'document').replace(/[^a-zA-Z0-9_.-]/g, '_').replace(/\.md$/, '')}.html`;
    downloadFile(standalone, filename, 'text/html');
  };

  const handleNewDocument = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Discard and create new?')) {
      return;
    }
    const emptyDoc = '# Untitled Document\n\nStart writing here...\n';
    setTitle('Untitled.md');
    handleMarkdownChange(emptyDoc);
  };

  const handleOpenDocument = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTitle(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleMarkdownChange(content);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key.toLowerCase() === 'k' && !window.getSelection()?.toString()) {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      if (ctrl && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleExportMarkdown();
        return;
      }

      if (ctrl && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        handleOpenDocument();
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [markdown, title]);

  // Split view drag resizer
  const handleMouseDownResizer = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingSplit.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingSplit.current) return;
      const pct = (moveEvent.clientX / window.innerWidth) * 100;
      setSplitPercent(Math.min(80, Math.max(20, pct)));
    };

    const handleMouseUp = () => {
      isDraggingSplit.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // List of quick commands for Command Palette
  const commands = [
    {
      id: 'wysiwyg-mode',
      title: 'Switch to WYSIWYG Mode',
      category: 'View',
      icon: <Edit3 className="w-4 h-4" />,
      action: () => setViewMode('wysiwyg'),
    },
    {
      id: 'split-mode',
      title: 'Switch to Split View',
      category: 'View',
      icon: <Columns className="w-4 h-4" />,
      action: () => setViewMode('split'),
    },
    {
      id: 'markdown-mode',
      title: 'Switch to Markdown Source Mode',
      category: 'View',
      icon: <Code className="w-4 h-4" />,
      action: () => setViewMode('markdown'),
    },
    {
      id: 'preview-mode',
      title: 'Switch to Read Preview',
      category: 'View',
      icon: <Eye className="w-4 h-4" />,
      action: () => setViewMode('preview'),
    },
    {
      id: 'html-output',
      title: 'View & Copy HTML Output',
      category: 'Export',
      icon: <Code className="w-4 h-4" />,
      action: () => setIsHtmlModalOpen(true),
    },
    {
      id: 'export-html',
      title: 'Download Standalone .html File',
      category: 'Export',
      icon: <Download className="w-4 h-4" />,
      action: handleExportHtml,
    },
    {
      id: 'export-md',
      title: 'Download .md Markdown File',
      category: 'Export',
      icon: <Download className="w-4 h-4" />,
      shortcut: 'Ctrl+S',
      action: handleExportMarkdown,
    },
    {
      id: 'new-doc',
      title: 'New Document',
      category: 'File',
      icon: <FilePlus className="w-4 h-4" />,
      action: handleNewDocument,
    },
    {
      id: 'open-doc',
      title: 'Open Markdown File...',
      category: 'File',
      icon: <FolderOpen className="w-4 h-4" />,
      shortcut: 'Ctrl+O',
      action: handleOpenDocument,
    },
    {
      id: 'toggle-theme',
      title: `Toggle Theme (${theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'})`,
      category: 'Appearance',
      icon: theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />,
      action: () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark')),
    },
  ];

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0d0d11] light:bg-[#f8f9fc] text-[#e2e2e8] light:text-[#1a1a2e]">
      {/* Hidden file input for opening markdown files */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.markdown,.txt"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Top Header */}
      <Header
        title={title}
        onTitleChange={setTitle}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        onOpenHtmlModal={() => setIsHtmlModalOpen(true)}
        onExportMarkdown={handleExportMarkdown}
        onExportHtml={handleExportHtml}
        onNewDocument={handleNewDocument}
        onOpenDocument={handleOpenDocument}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        isDirty={isDirty}
        fullWidth={fullWidth}
        onToggleFullWidth={() => setFullWidth((prev) => !prev)}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* WYSIWYG Mode (Full canvas inline editing) */}
        {viewMode === 'wysiwyg' && (
          <WysiwygEditor
            markdown={markdown}
            onChange={handleMarkdownChange}
            fullWidth={fullWidth}
          />
        )}

        {/* Split View Mode (Markdown source left, WYSIWYG right) */}
        {viewMode === 'split' && (
          <div className="flex-1 flex w-full h-full overflow-hidden">
            {/* Left: Markdown Source */}
            <div
              style={{ width: `${splitPercent}%` }}
              className="h-full flex flex-col min-w-[200px]"
            >
              <MarkdownSourceEditor
                value={markdown}
                onChange={handleMarkdownChange}
                onCursorChange={(line, col) => setCursorPos({ line, col })}
              />
            </div>

            {/* Split Resizer Divider */}
            <div
              onMouseDown={handleMouseDownResizer}
              className="w-1.5 hover:w-2 bg-white/10 hover:bg-[#7c6af7] transition-all cursor-col-resize z-20 flex-shrink-0"
              title="Drag to resize panes"
            />

            {/* Right: WYSIWYG Inline Editor */}
            <div
              style={{ width: `${100 - splitPercent}%` }}
              className="h-full flex flex-col min-w-[200px]"
            >
              <WysiwygEditor
                markdown={markdown}
                onChange={handleMarkdownChange}
                fullWidth={true}
              />
            </div>
          </div>
        )}

        {/* Markdown Source Mode only */}
        {viewMode === 'markdown' && (
          <div className="flex-1 h-full">
            <MarkdownSourceEditor
              value={markdown}
              onChange={handleMarkdownChange}
              onCursorChange={(line, col) => setCursorPos({ line, col })}
            />
          </div>
        )}

        {/* Clean Reading Preview Mode */}
        {viewMode === 'preview' && (
          <div className="flex-1 h-full overflow-y-auto px-4 sm:px-8 py-12 flex justify-center bg-[#0d0d11] light:bg-[#f8f9fc]">
            <div
              className="max-w-3xl w-full wysiwyg-content"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(markdown) }}
            />
          </div>
        )}
      </main>

      {/* Bottom Status Bar */}
      <StatusBar
        stats={stats}
        cursorPos={viewMode === 'markdown' || viewMode === 'split' ? cursorPos : undefined}
        isDirty={isDirty}
      />

      {/* HTML Output & Standalone Export Modal */}
      <HtmlOutputModal
        isOpen={isHtmlModalOpen}
        onClose={() => setIsHtmlModalOpen(false)}
        title={title}
        bodyHtml={markdownToHtml(markdown)}
        markdown={markdown}
        theme={theme}
      />

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        commands={commands}
      />
    </div>
  );
}
