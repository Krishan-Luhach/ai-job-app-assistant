import { SkillGapResult } from "@/lib/types";
import { useAppStore } from "@/store/appStore";
import { useQuery } from "@tanstack/react-query";

async function fetchAnalysis(sessionId:string,resumeText:string,jdText:string):Promise<SkillGapResult>{
    const res = await fetch('/api/analyse',{method: 'POST',body:JSON.stringify({sessionId,resumeText,jdText})});
    if(!res.ok) throw new Error(await res.text());
    return res.json();
}

export function useAnalyse(){
    const {sessionId, setAnalysis,resumeText,jdText} = useAppStore();
    return useQuery({
        queryKey: ['analyse',sessionId],
        queryFn: async ()=>{
            const result = await fetchAnalysis(sessionId!,resumeText,jdText);
            setAnalysis(result);
            return result;
        },
        enabled: !!sessionId && !!resumeText && !!jdText,
        staleTime: Infinity,
    })
}