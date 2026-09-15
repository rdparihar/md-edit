import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  Code2,
  Eye,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { generateStandaloneHtml, downloadFile } from '../utils/exportHtml';

interface HtmlOutputModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  bodyHtml: string;
  markdown: string;
  theme: 'dark' | 'light';
}

export const HtmlOutputModal: React.FC<HtmlOutputModalProps> = ({
  isOpen,
  onClose,
  title,
  bodyHtml,
  markdown,
  theme,
}) => {
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const standaloneHtml = generateStandaloneHtml({
    title,
    bodyHtml,
    theme,
  });

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(standaloneHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Clipboard copy failed:', e);
    }
  };

  const handleDownloadHtml = () => {
    const filename = `${(title || 'document').replace(/[^a-zA-Z0-9_-]/g, '_')}.html`;
    downloadFile(standaloneHtml, filename, 'text/html');
  };

  const handleDownloadMarkdown = () => {
    const filename = `${(title || 'document').replace(/[^a-zA-Z0-9_-]/g, '_')}.md`;
    downloadFile(markdown, filename, 'text/markdown');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div
        id="html-output-modal"
        className="relative w-full max-w-4xl h-[85vh] bg-[#14141c] light:bg-white border border-white/10 light:border-black/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[#e2e2e8] light:text-[#1a1a2e]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 light:border-black/10 bg-[#171722] light:bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#7c6af7]/20 text-[#7c6af7] flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">HTML Output & Standalone Export</h2>
              <p className="text-xs text-[#8b8b9f]">
                Fully styled, responsive, standalone HTML ready to share or publish
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch */}
            <div className="flex items-center bg-[#20202c] light:bg-gray-200 rounded-lg p-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'code'
                    ? 'bg-[#7c6af7] text-white shadow-sm'
                    : 'text-[#8b8b9f] hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" /> HTML Code
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-[#7c6af7] text-white shadow-sm'
                    : 'text-[#8b8b9f] hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Live Preview
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-[#8b8b9f] hover:text-white transition-colors ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          {activeTab === 'code' ? (
            <div className="h-full overflow-y-auto p-4 bg-[#0a0a0f] text-xs font-mono">
              <pre className="text-[#a78bfa] whitespace-pre-wrap select-all">
                {standaloneHtml}
              </pre>
            </div>
          ) : (
            <div className="h-full overflow-y-auto p-8 bg-[#0d0d11] light:bg-white">
              <div
                className="max-w-2xl mx-auto wysiwyg-content"
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-white/10 light:border-black/10 bg-[#171722] light:bg-gray-50 flex-shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <a
              href="/standalone.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#a78bfa] hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open Standalone HTML File
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="copy-html-btn"
              onClick={handleCopyHtml}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#252533] hover:bg-[#2d2d3d] text-inherit font-medium transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy HTML
                </>
              )}
            </button>

            <button
              type="button"
              id="download-html-btn"
              onClick={handleDownloadHtml}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#7c6af7] hover:bg-[#6c58f0] text-white font-medium shadow-md shadow-[#7c6af7]/20 transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Download .html
            </button>

            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-white/10 text-[#8b8b9f] hover:text-white transition-colors"
            >
              <FileText className="w-3.5 h-3.5" /> Download .md
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
