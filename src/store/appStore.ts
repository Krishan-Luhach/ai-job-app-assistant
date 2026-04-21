import { ChatHistoryEntry, SkillGapResult } from "@/lib/types";
import { create } from "zustand";

type AppStore = {
    sessionId: string | null;
    setSessionId: (id: string) => void;

    resumeText: string;
    setResumeText: (t: string) => void;

    analysis: SkillGapResult | null;
    setAnalysis: (t: SkillGapResult) => void;

    jdText: string;
    setJdText: (t: string) => void;

    chatHistory: ChatHistoryEntry[];
    addChatTurn: (human: string, ai: string) => void;
    clearHistory: () => void;

    reset: () => void;
};

export const useAppStore = create<AppStore>((set) => ({
    sessionId: null,
    resumeText: "",
    jdText: "",
    analysis: null,
    chatHistory: [],

    setSessionId: (id) => set({ sessionId: id }),
    setResumeText: (t) => set({ resumeText: t }),
    setAnalysis: (a) => set({ analysis: a }),
    setJdText: (a) => set({ jdText: a }),
    addChatTurn: (human, ai) =>
        set((state) => ({
            chatHistory: [
                ...state.chatHistory,
                { role: "human", content: human },
                { role: "ai", content: ai },
            ],
        })),
    clearHistory: () => set({ chatHistory: [] }),
    reset: () =>
        set({
            sessionId: null,
            resumeText: "",
            jdText: "",
            analysis: null,
            chatHistory: [],
        }),
}));
