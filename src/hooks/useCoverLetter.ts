import { useAppStore } from "@/store/appStore";
import { useMutation } from "@tanstack/react-query";

async function fetchCoverLetter(
    sessionId: string,
    resumeText: string,
    jdText: string,
): Promise<{ coverLetter: string }> {
    const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, resumeText, jdText }),
    });

    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export function useCoverLetter() {
    const { sessionId, resumeText, jdText } = useAppStore();
    return useMutation({
        mutationFn: () => fetchCoverLetter(sessionId!, resumeText, jdText),
    });
}
