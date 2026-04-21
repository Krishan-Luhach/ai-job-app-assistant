export type SkillGapResult = {
    matchedSkills: string[],
    missingSkills: string[],
    score: number,
    recommendations: string[]
}

export type InterviewQuestions = {
    question: string,
    difficulty: 'Easy' | 'Medium' | 'Hard',
    hint: string
}

export type ChatHistoryEntry = {
    role: 'human' | 'ai',
    content: string
}