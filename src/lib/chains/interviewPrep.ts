import { ChatPromptTemplate } from "@langchain/core/prompts";
import { getInterviewRetriever } from "../chroma";
import { RunnableSequence } from "@langchain/core/runnables";
import { geminiFlash } from "../gemini";
import {
    StringOutputParser,
    StructuredOutputParser,
} from "@langchain/core/output_parsers";
import * as z from "zod";

/* Retrievel & Augmentation  */
const schema = z.array(
    z.object({
        question: z.string(),
        difficulty: z.enum(["Easy", "Medium", "Hard"]),
        hint: z.string(),
    }),
);

const parser = StructuredOutputParser.fromZodSchema(schema);

const prompt = ChatPromptTemplate.fromMessages([
    [
        "system",
        `
    You are an expert technical interviewer.
    Use the candidate's resume context to generate relevant questions.
 
    Resume context:
    {context}
  `,
    ],
    [
        "human",
        `
    Job Description:
    {jdText}
 
    Generate 8 interview questions
 
    - 3 technical questions based on required skills
    - 3 behavioral questions based on candidate experience
    - 2 role-specific scenario questions
  
    Please respond with following JSON format: {format_instructions}
  `,
    ],
]);

interface InterviewInputProps {
    jdText: string;
}
export function buildInterviewChain(sessionId: string) {
    const retriever = getInterviewRetriever(sessionId); // k=6

    return RunnableSequence.from([
        {
            context: (input: InterviewInputProps) =>
                retriever
                    .invoke(input.jdText)
                    .then((d) => d.map((i) => i.pageContent).join("\n\n")),
            jdText: (input: InterviewInputProps) => input.jdText,
            format_instructions: () => parser.getFormatInstructions(),
        },
        prompt,
        geminiFlash,
        parser,
    ]);
}
