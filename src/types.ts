export type ViewMode = 'wysiwyg' | 'split' | 'markdown' | 'preview';

export type Theme = 'dark' | 'light';

export interface DocumentStats {
  words: number;
  chars: number;
  lines: number;
  readingTimeMin: number;
}

export interface SlashCommand {
  id: string;
  title: string;
  description: string;
  icon: string;
  keywords: string[];
  action: () => void;
}

export interface FloatingToolbarPosition {
  top: number;
  left: number;
  visible: boolean;
}
