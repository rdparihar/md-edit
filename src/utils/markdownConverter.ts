import { marked } from 'marked';
import TurndownService from 'turndown';
// @ts-ignore
import { gfm } from 'turndown-plugin-gfm';
import hljs from 'highlight.js';

// Configure Turndown for HTML -> Markdown
const turndownService = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
  strongDelimiter: '**',
});

// Apply GFM plugin if available
try {
  turndownService.use(gfm);
} catch (e) {
  console.warn('turndown-plugin-gfm init warning:', e);
}

// Custom Turndown rules for WYSIWYG elements
turndownService.addRule('strikethrough', {
  filter: ['del', 's'],
  replacement: (content) => `~~${content}~~`,
});

turndownService.addRule('highlight', {
  filter: ['mark'],
  replacement: (content) => `==${content}==`,
});

turndownService.addRule('underlined', {
  filter: ['u'],
  replacement: (content) => `<u>${content}</u>`,
});

turndownService.addRule('taskListItem', {
  filter: (node) => {
    return (
      node.nodeName === 'LI' &&
      (node.classList.contains('task-list-item') ||
        node.querySelector('input[type="checkbox"]') !== null)
    );
  },
  replacement: (content, node) => {
    const li = node as HTMLElement;
    const checkbox = li.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
    const isChecked = checkbox ? checkbox.checked : li.getAttribute('data-checked') === 'true';
    const cleanContent = content
      .replace(/^\[[ xX]\]\s*/, '')
      .replace(/^\s+/, '');
    return `- [${isChecked ? 'x' : ' '}] ${cleanContent}\n`;
  },
});

turndownService.addRule('fencedCodeBlockWithLang', {
  filter: (node) => {
    return node.nodeName === 'PRE';
  },
  replacement: (_content, node) => {
    const pre = node as HTMLElement;
    const code = pre.querySelector('code');
    const text = code ? (code.textContent || '') : (pre.textContent || '');
    let lang = '';
    if (code) {
      const match = code.className.match(/(?:lang|language)-([a-z0-9_-]+)/i);
      if (match) lang = match[1];
    }
    return `\n\`\`\`${lang}\n${text.trimEnd()}\n\`\`\`\n\n`;
  },
});

// Marked custom renderer for syntax highlighting & clean classes
const renderer = new marked.Renderer();

// Support both Marked v4 (string, lang) and Marked v12+ ({ text, lang }) token signatures
// @ts-ignore
renderer.code = function (arg1: any, arg2?: string): string {
  const code = typeof arg1 === 'object' && arg1 !== null ? arg1.text : arg1;
  const lang = typeof arg1 === 'object' && arg1 !== null ? arg1.lang : arg2;
  const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
  let highlighted = code;
  try {
    if (lang && hljs.getLanguage(lang)) {
      highlighted = hljs.highlight(code, { language }).value;
    } else {
      highlighted = hljs.highlightAuto(code).value;
    }
  } catch (e) {
    highlighted = code;
  }
  return `<pre class="code-block-wrapper" data-lang="${lang || ''}"><code class="hljs language-${language}">${highlighted}</code></pre>`;
};

// Support both Marked v4 (text, task, checked) and Marked v12+ (item) token signatures
// @ts-ignore
renderer.listitem = function (arg1: any, arg2?: boolean, arg3?: boolean): string {
  if (typeof arg1 === 'object' && arg1 !== null) {
    const task = Boolean(arg1.task);
    const checked = Boolean(arg1.checked);
    const text = arg1.text || '';
    if (task) {
      return `<li class="task-list-item" data-checked="${checked ? 'true' : 'false'}"><input type="checkbox" class="task-checkbox" ${checked ? 'checked' : ''}/> <span class="task-text ${checked ? 'line-through opacity-60' : ''}">${text}</span></li>`;
    }
    return `<li>${text}</li>`;
  }
  const text = arg1;
  const task = arg2;
  const checked = arg3;
  if (task) {
    return `<li class="task-list-item" data-checked="${checked ? 'true' : 'false'}"><input type="checkbox" class="task-checkbox" ${checked ? 'checked' : ''}/> <span class="task-text ${checked ? 'line-through opacity-60' : ''}">${text}</span></li>`;
  }
  return `<li>${text}</li>`;
};

marked.setOptions({
  renderer,
  gfm: true,
  breaks: true,
});

/**
 * Convert Markdown string to rich HTML suitable for WYSIWYG editing
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return '<p><br></p>';
  try {
    const raw = marked.parse(markdown);
    let html = typeof raw === 'string' ? raw : String(raw);
    
    // Replace ==highlight== with <mark>...</mark>
    html = html.replace(/==([^=\n]+)==/g, '<mark class="bg-amber-400/20 text-amber-200 px-1 rounded">$1</mark>');
    
    // Clean up empty lines to ensure paragraphs can receive cursor
    if (!html.trim()) {
      return '<p><br></p>';
    }
    return html;
  } catch (e) {
    console.error('Markdown parse error:', e);
    return `<p>${markdown}</p>`;
  }
}

/**
 * Convert WYSIWYG HTML back into clean, formatted Markdown
 */
export function htmlToMarkdown(html: string): string {
  if (!html) return '';
  try {
    // Create a temporary container to clean up any UI artifacts before converting
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Remove any UI overlays or non-content elements
    const buttons = temp.querySelectorAll('.block-handle, .copy-code-btn');
    buttons.forEach(b => b.remove());

    // Update checked attributes from actual inputs if present
    const checkboxes = temp.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((cb) => {
      const input = cb as HTMLInputElement;
      const li = input.closest('li');
      if (li) {
        li.setAttribute('data-checked', input.checked ? 'true' : 'false');
      }
    });

    const markdown = turndownService.turndown(temp.innerHTML);
    return markdown;
  } catch (e) {
    console.error('HTML to Markdown conversion error:', e);
    return html;
  }
}

/**
 * Calculate document statistics
 */
export function calculateStats(text: string) {
  const clean = text.trim();
  const words = clean ? clean.split(/\s+/).filter(Boolean).length : 0;
  const chars = text.length;
  const lines = text ? text.split('\n').length : 0;
  const readingTimeMin = Math.max(1, Math.ceil(words / 200));
  return { words, chars, lines, readingTimeMin };
}
