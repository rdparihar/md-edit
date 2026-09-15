/**
 * Generates a complete, beautiful, standalone HTML document for sharing or publishing
 */
export function generateStandaloneHtml(options: {
  title: string;
  bodyHtml: string;
  theme?: 'dark' | 'light';
}): string {
  const isDark = options.theme !== 'light';
  const bgColor = isDark ? '#0d0d11' : '#ffffff';
  const textColor = isDark ? '#e2e2e8' : '#1a1a2e';
  const surfaceColor = isDark ? '#15151c' : '#f8f9fa';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
  const accentColor = '#7c6af7';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(options.title || 'Document')}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${isDark ? 'atom-one-dark' : 'github'}.min.css">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: ${bgColor};
      color: ${textColor};
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.7;
      font-size: 16px;
      padding: 48px 24px;
      display: flex;
      justify-content: center;
      min-height: 100vh;
    }
    .container {
      max-width: 820px;
      width: 100%;
    }
    h1, h2, h3, h4, h5, h6 {
      color: ${textColor};
      font-weight: 700;
      line-height: 1.3;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
    }
    h1 { font-size: 2.25em; border-bottom: 1px solid ${borderColor}; padding-bottom: 0.3em; }
    h2 { font-size: 1.75em; border-bottom: 1px solid ${borderColor}; padding-bottom: 0.25em; }
    h3 { font-size: 1.35em; }
    h4 { font-size: 1.15em; }
    p { margin: 1em 0; }
    a { color: ${accentColor}; text-decoration: underline; text-underline-offset: 3px; }
    a:hover { opacity: 0.8; }
    strong { font-weight: 600; }
    em { font-style: italic; }
    del, s { text-decoration: line-through; opacity: 0.65; }
    mark { background: rgba(251, 191, 36, 0.25); color: inherit; padding: 2px 4px; border-radius: 3px; }
    u { text-decoration: underline; }
    blockquote {
      border-left: 4px solid ${accentColor};
      padding: 12px 20px;
      margin: 1.25em 0;
      background: ${isDark ? 'rgba(124, 106, 247, 0.08)' : 'rgba(124, 106, 247, 0.05)'};
      border-radius: 0 8px 8px 0;
      color: ${isDark ? '#94a3b8' : '#4b5563'};
    }
    code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.88em;
      background: ${surfaceColor};
      border: 1px solid ${borderColor};
      padding: 2px 6px;
      border-radius: 4px;
      color: #e879f9;
    }
    pre {
      background: ${surfaceColor};
      border: 1px solid ${borderColor};
      border-radius: 10px;
      padding: 16px 20px;
      overflow-x: auto;
      margin: 1.25em 0;
    }
    pre code {
      background: transparent;
      border: none;
      padding: 0;
      color: inherit;
      font-size: 0.9em;
      line-height: 1.5;
    }
    ul, ol {
      margin: 1em 0;
      padding-left: 2em;
    }
    li { margin: 0.35em 0; }
    .task-list-item {
      list-style: none;
      margin-left: -1.5em;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .task-checkbox {
      width: 16px;
      height: 16px;
      accent-color: ${accentColor};
      cursor: pointer;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5em 0;
      border: 1px solid ${borderColor};
      border-radius: 8px;
      overflow: hidden;
    }
    th, td {
      padding: 12px 16px;
      border: 1px solid ${borderColor};
      text-align: left;
    }
    th {
      background: ${surfaceColor};
      font-weight: 600;
      font-size: 0.95em;
    }
    tr:nth-child(even) td {
      background: ${isDark ? 'rgba(255, 255, 255, 0.015)' : 'rgba(0, 0, 0, 0.015)'};
    }
    hr {
      border: none;
      border-top: 1px solid ${borderColor};
      margin: 2em 0;
    }
    img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 1em 0;
    }
    @media print {
      body { background: #fff; color: #000; padding: 0; }
      pre, blockquote { border-color: #ccc; }
    }
  </style>
</head>
<body>
  <div class="container">
    ${options.bodyHtml}
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <script>
    document.querySelectorAll('pre code').forEach((el) => {
      hljs.highlightElement(el);
    });
  </script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
