import { create } from 'zustand';
import type { AIMessage, WeekPlanSuggestion } from '../types/models';

interface AIStore {
  conversations: AIMessage[];
  isStreaming: boolean;
  streamingContent: string;
  lastSuggestion: WeekPlanSuggestion | null;

  addMessage: (msg: AIMessage) => void;
  setIsStreaming: (val: boolean) => void;
  appendToStream: (chunk: string) => void;
  clearStream: () => void;
  setLastSuggestion: (s: WeekPlanSuggestion | null) => void;
  clearConversation: () => void;
}

export const useAIStore = create<AIStore>((set) => ({
  conversations: [],
  isStreaming: false,
  streamingContent: '',
  lastSuggestion: null,

  addMessage: (msg) =>
    set((state) => ({ conversations: [...state.conversations, msg] })),

  setIsStreaming: (val) => set({ isStreaming: val }),

  appendToStream: (chunk) =>
    set((state) => ({ streamingContent: state.streamingContent + chunk })),

  clearStream: () => set({ streamingContent: '' }),

  setLastSuggestion: (s) => set({ lastSuggestion: s }),

  clearConversation: () =>
    set({ conversations: [], streamingContent: '', lastSuggestion: null }),
}));
