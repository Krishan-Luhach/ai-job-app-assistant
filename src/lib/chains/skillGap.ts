import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import { geminiFlash } from "../gemini";
import { RunnableSequence } from "@langchain/core/runnables";

/* Retrievel & Augmentation  */
const schema = z.object({
    matchedSkills: z.array(z.string()),
    missingSkills: z.array(z.string()),
    score: z.number().min(0).max(100),
    recommendations: z.array(z.string()),
});
const parser = StructuredOutputParser.fromZodSchema(schema);

const prompt = PromptTemplate.fromTemplate(`
    You are an expert career coach analysing a resume against a job description 
    Resume: {resumeText}
    Job Description: {jdText}
    Analyse the match and respond with following JSON format: {format_instructions}
`);

interface SkillGapInputProps{
    resumeText:string,
    jdText:string
}
export const skillGapChain =  RunnableSequence.from([{
    resumeText: (input: SkillGapInputProps)=> input.resumeText,
    jdText: (input: SkillGapInputProps)=> input.jdText,
    format_instructions: ()=> parser.getFormatInstructions()
},
prompt, geminiFlash,parser]);



