import { Document } from "@langchain/core/documents";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import {
    ChatPromptTemplate,
    MessagesPlaceholder,
} from "@langchain/core/prompts";
import { geminiFlash } from "../gemini";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { getChatRetriever } from "../chroma";
import { RunnableBranch, RunnableSequence } from "@langchain/core/runnables";
import { ChatHistoryEntry } from "../types";


type ChatInput = {
    input:string,
    chat_history:ChatHistoryEntry[],
    sessionId:string
}

const toMessages = (history:ChatHistoryEntry[]):BaseMessage[] =>
     history.map(m => m.role==='human' ? new HumanMessage(m.content): new AIMessage(m.content));

const docsToString = (docs:Document[])=> docs.map(doc=>doc.pageContent).join('\n\n');

const rephrasedPrompt = ChatPromptTemplate.fromMessages([[
    'system',`Given the conversation history and a follow-up question,
    rephrase the follow-up as a standalone question that can be understood
    without the conversation history. Be concise. Return ONLY the rephrased question`
    ],
    new MessagesPlaceholder('chat_history'),
    ['human','{input}']
 ])
//TODO:: Why this rephrased prompt is needed? Only for getting resume context based on chat history?
const rephraseChain =  rephrasedPrompt.pipe(geminiFlash).pipe(new StringOutputParser());

const qaPrompt = ChatPromptTemplate.fromMessages([
    ['system',`You are a helpful career assistant with access to the candidate's resume.
        Answer the user's question using the resume context below.
        If the answer is not in the context, say so honestly — do not fabricate
        Resume Context: {context}` 
    ],
    new MessagesPlaceholder('chat_history'),
    ['human','{input}']
]);


export function buildChatChain(sessionId:string){
    const retriever = getChatRetriever(sessionId);

    return RunnableSequence.from([
        {
            context: RunnableBranch.from([
            [
                (input:ChatInput) => input.chat_history.length>0,
                RunnableSequence.from([
                    (input:ChatInput)=>({input: input.input,chat_history: toMessages(input.chat_history)}),
                    rephraseChain,
                    (rephrased:string)=> retriever.invoke(rephrased),
                    docsToString
                ])
            ],
            (input:ChatInput)=> retriever.invoke(input.input).then(docsToString)
        ]),

            input: (input:ChatInput)=>input.input,
            chat_history: (input:ChatInput)=>toMessages(input.chat_history)
        },
        qaPrompt,
        geminiFlash,
        new StringOutputParser()
    ])
}



