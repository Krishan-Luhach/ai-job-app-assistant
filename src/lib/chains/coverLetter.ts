import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableMap, RunnableSequence } from "@langchain/core/runnables";
import { geminiFlash } from "../gemini";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { getSkillRetriever } from "../chroma";

const prompt = ChatPromptTemplate.fromMessages([
    [
        "system",
        `
    You are an expert career coach writing a tailored cover letter.
    Use relevant resume sections below as context
    Resume sections: {context}
    Skill Gap Analysis:
    - Matched Skills: {matchedSkills}
    - Missing Skills: {missingSkills}
    - Match Score: {score}/100
    `,
    ],
    [
        "human",
        `
    Job Description: {jdText}
   Write a professional, personalized cover letter that: 
    - Opens with a strong hook referencing the specific roel
    - Highlights the matched skills with concrete examples
    - Addresses the missing skills as area of active growth
    - Keeps a confident, human-tone
    - Is 3 - 4 paragraph, max 400 words
    `,
    ],
]);

interface CoverLetterChainInputProps {
    jdText: string;
    matchedSkills: string[];
    missingSkills: string[];
    score: number;
}
export async function buildCoverLetterChain(sessionId: string) {
    const retriever = getSkillRetriever(sessionId);
    return RunnableSequence.from([
        {
            context: (input: CoverLetterChainInputProps) =>
                retriever
                    .invoke(input.jdText)
                    .then((d) => d.map((i) => i.pageContent).join("\n\n")),
            jdText: (input: CoverLetterChainInputProps) => input.jdText,
            matchedSkills: (input: CoverLetterChainInputProps) =>
                input.matchedSkills.join(", "),
            missingSkills: (input: CoverLetterChainInputProps) =>
                input.missingSkills.join(", "),
            score: (input: CoverLetterChainInputProps) => String(input.score),
        },
        prompt,
        geminiFlash,
        new StringOutputParser(),
    ]);
}
