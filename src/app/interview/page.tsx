'use client'
import { useEffect, useState } from 'react'
import { useInterview }   from '@/hooks/useInterview'
import { useAppStore }    from '@/store/appStore'
import { useRouter }      from 'next/navigation'
import type { InterviewQuestions } from '@/lib/types'
import QuestionCard from '@/components/interview/QuestionCard'
 

 
export default function InterviewPage() {
  const { sessionId }                    = useAppStore()
  const { data, isLoading, error }       = useInterview()
  const [shuffled, setShuffled]          = useState<InterviewQuestions[] | null>(null)
  const router                           = useRouter()
 
  useEffect(() => {
    if (!sessionId) router.replace('/')
  }, [sessionId, router])

  if (!sessionId) return null
 
  const questions = shuffled ?? data ?? []
 
  const shuffle = () => {
    if (!data) return
    setShuffled([...data].sort(() => Math.random() - 0.5))
  }
 
  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
 
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">Interview Prep</h1>
          {data && (
            <button onClick={shuffle}
              className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
              ↺ Shuffle
            </button>
          )}
        </div>
 
        {isLoading && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
              </div>
            ))}
          </div>
        )}
 
        {error && (
          <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
            {(error as Error).message}
          </p>
        )}
 
        <div className="space-y-4">
          {questions.map((q, i) => (
            <QuestionCard key={i} q={q} index={i} />
          ))}
        </div>
 
      </div>
    </main>
  )
}