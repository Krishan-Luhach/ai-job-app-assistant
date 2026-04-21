import { InterviewQuestions } from "@/lib/types";
import { useAppStore } from "@/store/appStore";
import { useQuery } from "@tanstack/react-query";

async function fetchInterview(sessionId:string,jdText:string):Promise<InterviewQuestions[]>{
    const res = await fetch('/api/interview',{
        method:'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({sessionId,jdText})
    })
    if(!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return data?.interviewQuestions ?? data ;
}

export function useInterview(){
    const {sessionId,jdText} = useAppStore();
    return useQuery({
        queryKey: ['interview',sessionId],
        queryFn: ()=> fetchInterview(sessionId!,jdText),
        enabled: !!sessionId && !!jdText,
        staleTime: Infinity,
    })
}
