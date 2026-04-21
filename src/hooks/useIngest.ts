import { useAppStore } from "@/store/appStore";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

async function ingestResume(formData: FormData): Promise<{
    sessionId: string,
    resumeText:string,
    chunkCount:number
}>{
    const res = await fetch('/api/ingest',{method: 'POST',body: formData});
    if(!res.ok) throw new Error(await res.text());
    return res.json()
};

export function useIngest(){
    const {setSessionId,setResumeText,setJdText,reset} = useAppStore();
    const router = useRouter();
    return useMutation({
        mutationFn: ingestResume,
        onSuccess: (data,variables)=>{
            reset()
            setSessionId(data.sessionId)
            setResumeText(data.resumeText)
            setJdText(variables.get('jd') as string ?? '');
            router.push('/analyse')
        }
    })
}