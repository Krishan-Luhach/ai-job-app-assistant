'use client'
import { useEffect, useState } from 'react'
import { useCoverLetter }      from '@/hooks/useCoverLetter'
import { useAppStore }         from '@/store/appStore'
import { useRouter }           from 'next/navigation'
 
export default function CoverLetterPage() {
  const { sessionId }                          = useAppStore()
  const { mutate, data, isPending, error }     = useCoverLetter()
  const [copied, setCopied]                    = useState(false)
  const router                                 = useRouter()
 
  // Auto-generate on page load
  useEffect(() => {
    if (sessionId) {
      let lastCall = 0
      const throttledMutate = () => {
        const now = Date.now()
        if (now - lastCall >= 1000) {
          lastCall = now
          mutate()
        }
      }
      throttledMutate()
    }
  }, [sessionId, mutate])
 
  useEffect(() => {
    if (!sessionId) router.replace('/')
  }, [sessionId, router])

  if (!sessionId) return null
 
  const handleCopy = () => {
    if (!data?.coverLetter) return
    navigator.clipboard.writeText(data.coverLetter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
 
  const handleDownload = () => {
    if (!data?.coverLetter) return
    const blob = new Blob([data.coverLetter], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'cover-letter.txt'
    a.click()
    URL.revokeObjectURL(url)
  }
 
  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
 
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">Cover Letter</h1>
            <div className="flex gap-2">
            <button onClick={() => mutate()}
              disabled={isPending}
              className="px-4 py-2 text-sm border border-slate-200 rounded-lg
                   hover:bg-slate-50 disabled:opacity-40 cursor-pointer">
              {isPending ? 'Generating...' : '↺ Regenerate'}
            </button>
            <button onClick={handleCopy}
              disabled={!data?.coverLetter}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg
                   hover:bg-indigo-700 disabled:opacity-40 cursor-pointer">
              {copied ? '✓ Copied' : 'Copy'}
            </button>
            <button onClick={handleDownload}
              disabled={!data?.coverLetter}
              className="px-4 py-2 text-sm border border-slate-200 rounded-lg
                   hover:bg-slate-50 disabled:opacity-40 cursor-pointer">
              Download
            </button>
            </div>
        </div>
 
        {error && (
          <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
            {(error as Error).message}
          </p>
        )}
 
        {isPending && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i}
                className={`h-4 bg-slate-100 rounded animate-pulse
                  ${i === 5 ? 'w-2/3' : 'w-full'}`} />
            ))}
          </div>
        )}
 
        {data?.coverLetter && !isPending && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed">
              {data.coverLetter}
            </pre>
          </div>
        )}
 
      </div>
    </main>
  )
}