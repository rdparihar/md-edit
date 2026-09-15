import React, { useEffect, useRef } from 'react';
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
} from 'lucide-react';

export interface SlashItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  keywords: string[];
  execute: () => void;
}

interface SlashCommandMenuProps {
  position: { top: number; left: number };
  searchQuery: string;
  onSelect: (item: SlashItem) => void;
  onClose: () => void;
  commands: SlashItem[];
  selectedIndex: number;
}

export const SlashCommandMenu: React.FC<SlashCommandMenuProps> = ({
  position,
  searchQuery,
  onSelect,
  onClose,
  commands,
  selectedIndex,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredCommands = commands.filter((cmd) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.description.toLowerCase().includes(q) ||
      cmd.keywords.some((k) => k.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    // Scroll selected item into view if necessary
    const selectedEl = menuRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (filteredCommands.length === 0) {
    return (
      <div
        ref={menuRef}
        id="slash-command-menu"
        className="fixed z-50 w-64 bg-[#181822] light:bg-white border border-white/10 light:border-black/10 rounded-xl shadow-2xl p-3 text-xs text-[#8b8b9f] animate-in fade-in"
        style={{
          top: `${position.top + 24}px`,
          left: `${Math.min(window.innerWidth - 280, Math.max(16, position.left))}px`,
        }}
      >
        No matching commands
      </div>
    );
  }

  return (
    <div
      ref={menuRef}
      id="slash-command-menu"
      className="fixed z-50 w-72 max-h-80 overflow-y-auto bg-[#181822]/98 light:bg-white/98 backdrop-blur-xl border border-white/10 light:border-black/10 rounded-xl shadow-2xl p-1.5 text-[#e2e2e8] light:text-[#1a1a2e] animate-in fade-in zoom-in-95"
      style={{
        top: `${position.top + 26}px`,
        left: `${Math.min(window.innerWidth - 310, Math.max(16, position.left))}px`,
      }}
    >
      <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#6e6e85]">
        Basic Blocks
      </div>

      {filteredCommands.map((cmd, idx) => {
        const isSelected = idx === selectedIndex;
        return (
          <button
            key={cmd.id}
            data-index={idx}
            type="button"
            onClick={() => onSelect(cmd)}
            onMouseEnter={() => {}}
            className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left transition-colors text-xs ${
              isSelected
                ? 'bg-[#7c6af7] text-white shadow-sm'
                : 'hover:bg-white/5 light:hover:bg-black/5 text-inherit'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${
                isSelected
                  ? 'bg-white/20 text-white'
                  : 'bg-[#232330] light:bg-gray-100 text-[#7c6af7] light:text-[#6352e8]'
              }`}
            >
              {cmd.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{cmd.title}</div>
              <div
                className={`text-[11px] truncate ${
                  isSelected ? 'text-white/80' : 'text-[#8b8b9f]'
                }`}
              >
                {cmd.description}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
