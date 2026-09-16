import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { WysiwygEditor } from './components/WysiwygEditor';
import { MarkdownSourceEditor } from './components/MarkdownSourceEditor';
import { StatusBar } from './components/StatusBar';
import { HtmlOutputModal } from './components/HtmlOutputModal';
import { CommandPalette } from './components/CommandPalette';
import { markdownToHtml, calculateStats } from './utils/markdownConverter';
import { generateStandaloneHtml, downloadFile } from './utils/exportHtml';
import {
  isFileSystemAccessSupported,
  openLocalMarkdownFile,
  saveDirectlyToHandle,
  saveAsNewLocalMarkdownFile,
} from './utils/fileSystemAccess';
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
  HardDrive,
  Save,
  Check,
} from 'lucide-react';

const STARTER_MARKDOWN = `# Welcome to Markdown Visual Editor ✦

Click directly on any rendered text in this document and edit it smoothly just like in modern editors!

---

## ⚡ Key Highlights

- **Visual Editor Mode**: Click anywhere and type directly on the formatted page (formerly called WYSIWYG)
- **Direct Local File System Editor**: Click **Open File** (or press \`Ctrl+O\`) to load a markdown file from your disk, edit it, and press \`Ctrl+S\` to save directly back to your local file!
- **Floating Format Toolbar**: Highlight any text to reveal format controls (Bold, Italic, Underline, Strikethrough, Code, Marker Highlight, Links)
- **Slash Commands (\`/\`)**: Type \`/\` on any line to insert Headings, Lists, Tables, Quotes, or Code Blocks
- **Interactive Checklists**: Click on the checkboxes below to toggle task completion in real-time
- **Bidirectional Sync**: Seamlessly syncs between Visual view and standard Markdown source

---

## 📂 Direct Local File Editing Workflow

1. Click **Open File** above or press \`Ctrl+O\`
2. Select any \`.md\` file from your local hard drive
3. Edit either in **Visual Editor**, **Split View**, or **Markdown** source
4. Press \`Ctrl+S\` or click **Save to Disk** — changes write straight back to your file on disk!

---

## 📋 Interactive Task Checklist

- [x] Click text directly to edit inline
- [x] Select text to test the floating bubble toolbar
- [ ] Try opening a local markdown file from your computer (\`Ctrl+O\`)
- [ ] Press \`Ctrl+S\` to save directly to disk
- [ ] Open the **HTML Output** modal to copy or download ready-to-publish HTML
- [ ] Try switching to **Split View** to view Markdown source and live preview side-by-side

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

| Feature | Classic Text Editor | Direct Disk Markdown Editor |
| :--- | :--- | :--- |
| **Direct inline editing** | ❌ Source only | ✅ Click & type visual editor |
| **Local File Direct Save** | ❌ Browser downloads copies | ✅ Direct disk write (\`Ctrl+S\`) |
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

  // Direct Local File System state
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(null);
  const [isDirectLocalFile, setIsDirectLocalFile] = useState<boolean>(false);
  const [isDiskDirty, setIsDiskDirty] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [autoSaveToDisk, setAutoSaveToDisk] = useState<boolean>(() => {
    return localStorage.getItem('md_auto_save_disk') === 'true';
  });

  // Notification Toast state
  const [toast, setToast] = useState<{ message: string; type?: 'info' | 'success' | 'warning' } | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  // Modals
  const [isHtmlModalOpen, setIsHtmlModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Split view resizer
  const [splitPercent, setSplitPercent] = useState(50);
  const isDraggingSplit = useRef(false);

  // Hidden file input for opening markdown files (fallback)
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to show notification toasts
  const showToast = useCallback((message: string, type: 'info' | 'success' | 'warning' = 'success') => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast({ message, type });
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

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
    setIsDiskDirty(true);

    // Debounced autosave to localStorage
    localStorage.setItem('md_editor_content', newMarkdown);
    setTimeout(() => {
      setIsDirty(false);
    }, 800);
  }, []);

  // Direct disk auto-save effect
  const autoSaveDiskTimerRef = useRef<number | null>(null);
  useEffect(() => {
    if (!autoSaveToDisk || !fileHandle || !isDirectLocalFile || !isDiskDirty) {
      return;
    }

    if (autoSaveDiskTimerRef.current) {
      window.clearTimeout(autoSaveDiskTimerRef.current);
    }

    autoSaveDiskTimerRef.current = window.setTimeout(async () => {
      try {
        await saveDirectlyToHandle(fileHandle, markdown);
        setIsDiskDirty(false);
      } catch (err) {
        console.warn('Auto-save to disk failed:', err);
      }
    }, 2000);

    return () => {
      if (autoSaveDiskTimerRef.current) {
        window.clearTimeout(autoSaveDiskTimerRef.current);
      }
    };
  }, [markdown, autoSaveToDisk, fileHandle, isDirectLocalFile, isDiskDirty]);

  // Standard download fallback
  const handleExportMarkdown = () => {
    const filename = `${(title || 'document').replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
    const cleanFilename = filename.endsWith('.md') ? filename : `${filename}.md`;
    downloadFile(markdown, cleanFilename, 'text/markdown');
    setIsDirty(false);
    setIsDiskDirty(false);
    showToast(`Downloaded ${cleanFilename}`, 'info');
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
    showToast(`Exported standalone ${filename}`, 'info');
  };

  const handleNewDocument = () => {
    if (isDiskDirty && !window.confirm('You have unsaved changes to your disk file. Discard and create new?')) {
      return;
    }
    const emptyDoc = '# Untitled Document\n\nStart writing here...\n';
    setTitle('Untitled.md');
    setFileHandle(null);
    setIsDirectLocalFile(false);
    setIsDiskDirty(false);
    handleMarkdownChange(emptyDoc);
    showToast('Created new in-memory document', 'info');
  };

  // Open Local File (direct editor mode)
  const handleOpenDocument = async () => {
    if (isFileSystemAccessSupported()) {
      try {
        const result = await openLocalMarkdownFile();
        if (!result) return; // User cancelled
        setFileHandle(result.handle);
        setIsDirectLocalFile(true);
        setTitle(result.name);
        setMarkdown(result.content);
        setStats(calculateStats(result.content));
        setIsDirty(false);
        setIsDiskDirty(false);
        showToast(`Opened ${result.name} (Direct Disk Editing active)`, 'success');
        return;
      } catch (err: any) {
        console.warn('File System Access API failed or blocked, falling back to input:', err);
      }
    }
    // Fallback to standard input
    fileInputRef.current?.click();
  };

  // Fallback file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTitle(file.name);
    setFileHandle(null);
    setIsDirectLocalFile(false);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleMarkdownChange(content);
      setIsDiskDirty(false);
      showToast(`Loaded ${file.name} (Note: Direct disk save requires browser file picker support)`, 'info');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Direct Save to Local File
  const handleSaveDirectly = async () => {
    if (fileHandle && isDirectLocalFile) {
      try {
        setIsSaving(true);
        await saveDirectlyToHandle(fileHandle, markdown);
        setIsDiskDirty(false);
        setIsDirty(false);
        setIsSaving(false);
        showToast(`✓ Saved directly to ${fileHandle.name}`, 'success');
      } catch (err: any) {
        setIsSaving(false);
        console.error('Save directly failed:', err);
        showToast(`Save failed: ${err.message || 'Write permission denied'}`, 'warning');
      }
    } else {
      // If not currently attached to a local file, trigger Save As
      handleSaveAsLocalFile();
    }
  };

  // Save As New Local File on Disk
  const handleSaveAsLocalFile = async () => {
    if (isFileSystemAccessSupported()) {
      try {
        setIsSaving(true);
        const result = await saveAsNewLocalMarkdownFile(markdown, title);
        setIsSaving(false);
        if (!result) return; // Cancelled
        setFileHandle(result.handle);
        setIsDirectLocalFile(true);
        setTitle(result.name);
        setIsDiskDirty(false);
        setIsDirty(false);
        showToast(`✓ Saved and linked to ${result.name}`, 'success');
      } catch (err: any) {
        setIsSaving(false);
        console.warn('Save As failed, downloading instead:', err);
        handleExportMarkdown();
      }
    } else {
      handleExportMarkdown();
    }
  };

  // Detach direct file connection
  const handleDetachLocalFile = () => {
    setFileHandle(null);
    setIsDirectLocalFile(false);
    setIsDiskDirty(false);
    showToast('Detached local file. Editor is now in memory scratchpad mode.', 'info');
  };

  // Toggle Auto-save to disk
  const handleToggleAutoSaveToDisk = () => {
    setAutoSaveToDisk((prev) => {
      const next = !prev;
      localStorage.setItem('md_auto_save_disk', String(next));
      showToast(next ? '⚡ Auto-save to disk enabled (every 2s)' : 'Auto-save to disk disabled', 'info');
      return next;
    });
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
        handleSaveDirectly();
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
  }, [markdown, title, fileHandle, isDirectLocalFile]);

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
      title: 'Switch to Visual Editor',
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
      id: 'open-local-file',
      title: 'Open File from Disk (Direct Editor)',
      category: 'File',
      icon: <FolderOpen className="w-4 h-4 text-sky-400" />,
      shortcut: 'Ctrl+O',
      action: handleOpenDocument,
    },
    {
      id: 'save-direct-disk',
      title: isDirectLocalFile ? `Save directly to disk (${fileHandle?.name})` : 'Save Document',
      category: 'File',
      icon: <Save className="w-4 h-4 text-emerald-400" />,
      shortcut: 'Ctrl+S',
      action: handleSaveDirectly,
    },
    {
      id: 'save-as-disk',
      title: 'Save As New Local File...',
      category: 'File',
      icon: <HardDrive className="w-4 h-4 text-indigo-400" />,
      action: handleSaveAsLocalFile,
    },
    {
      id: 'toggle-auto-save',
      title: `Toggle Auto-Save to Disk (${autoSaveToDisk ? 'Enabled' : 'Disabled'})`,
      category: 'File',
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
      action: handleToggleAutoSaveToDisk,
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
      id: 'toggle-theme',
      title: `Toggle Theme (${theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'})`,
      category: 'Appearance',
      icon: theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />,
      action: () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark')),
    },
  ];

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0d0d11] light:bg-[#f8f9fc] text-[#e2e2e8] light:text-[#1a1a2e]">
      {/* Hidden file input for opening markdown files (fallback) */}
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
        isDirectLocalFile={isDirectLocalFile}
        localFileName={fileHandle?.name}
        isDiskDirty={isDiskDirty}
        isSaving={isSaving}
        autoSaveToDisk={autoSaveToDisk}
        onSaveDirectly={handleSaveDirectly}
        onSaveAsLocalFile={handleSaveAsLocalFile}
        onDetachLocalFile={handleDetachLocalFile}
        onToggleAutoSaveToDisk={handleToggleAutoSaveToDisk}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Visual Editor Mode (Full canvas inline editing) */}
        {viewMode === 'wysiwyg' && (
          <WysiwygEditor
            markdown={markdown}
            onChange={handleMarkdownChange}
            fullWidth={fullWidth}
          />
        )}

        {/* Split View Mode (Markdown source left, Visual Editor right) */}
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

            {/* Right: Visual Inline Editor */}
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
        isDirectLocalFile={isDirectLocalFile}
        localFileName={fileHandle?.name}
        isDiskDirty={isDiskDirty}
        autoSaveToDisk={autoSaveToDisk}
        onSaveDirectly={handleSaveDirectly}
        onOpenLocalFile={handleOpenDocument}
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

      {/* Notification Toast */}
      {toast && (
        <div
          className={`fixed bottom-12 right-6 z-50 flex items-center gap-2 px-3.5 py-2.5 rounded-xl shadow-2xl border text-xs font-medium animate-in fade-in slide-in-from-bottom-2 ${
            toast.type === 'warning'
              ? 'bg-amber-950/90 text-amber-200 border-amber-500/30'
              : toast.type === 'info'
              ? 'bg-[#181824]/90 text-sky-200 border-sky-500/30'
              : 'bg-[#141b18]/95 text-emerald-200 border-emerald-500/30'
          } backdrop-blur-md`}
        >
          {toast.type === 'warning' ? (
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          ) : toast.type === 'info' ? (
            <HardDrive className="w-3.5 h-3.5 text-sky-400" />
          ) : (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

