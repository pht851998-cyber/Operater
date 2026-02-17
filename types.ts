export interface VideoGenerationState {
  status: 'idle' | 'generating' | 'completed' | 'error';
  videoUrl?: string;
  error?: string;
  progressMessage?: string;
}

export type AspectRatio = '16:9' | '9:16';

export interface GenerationConfig {
  prompt: string;
  aspectRatio: AspectRatio;
}

// Augment window for the AI Studio helper
declare global {
  // Fix: Augment the AIStudio interface to ensure methods exist,
  // instead of redeclaring 'aistudio' on Window which causes conflicts.
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}