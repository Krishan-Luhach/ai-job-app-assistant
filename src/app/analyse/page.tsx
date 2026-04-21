'use client'
import { useEffect } from 'react'
import Badge from '@/components/analyse/Badge'
import ScoreRing from '@/components/analyse/ScoreRing'
import { useAnalyse }   from '@/hooks/useAnalyse'
import { useAppStore }  from '@/store/appStore'
import { useRouter }    from 'next/navigation'
 

 
export default function AnalyzePage() {
  const { sessionId } = useAppStore()
  const { data, isLoading, error } = useAnalyse()
  const router = useRouter()
 
  useEffect(() => {
    if (!sessionId) router.replace('/')
  }, [sessionId, router])

  if (!sessionId) return null
 
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent
                        rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 text-sm">Analysing your resume...</p>
      </div>
    </div>
  )
 
  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-500">{(error as Error).message}</p>
    </div>
  )
 
  if (!data) return null
 
  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
 
        <h1 className="text-2xl font-bold text-slate-800">Skill Gap Analysis</h1>
 
        {/* Score + summary row */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex gap-8 items-start">
          <ScoreRing score={data.score} />
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-2">Matched Skills</p>
              <div className="flex flex-wrap gap-2">
                {data.matchedSkills.map(s => <Badge key={s} label={s} variant="green" />)}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 mb-2">Missing Skills</p>
              <div className="flex flex-wrap gap-2">
                {data.missingSkills.map(s => <Badge key={s} label={s} variant="red" />)}
              </div>
            </div>
          </div>
        </div>
 
        {/* Recommendations */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-sm font-medium text-slate-700 mb-3">Recommendations</p>
          <ul className="space-y-2">
            {data.recommendations.map((r, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-600">
                <span className="text-indigo-500 mt-0.5">→</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
 
        {/* Navigation */}
        <div className="flex gap-3">
          <button onClick={() => router.push('/cover-letter')}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-indigo-700 cursor-pointer">
            Generate Cover Letter →
          </button>
          <button onClick={() => router.push('/interview')}
            className="flex-1 bg-white border border-slate-200 text-slate-700 py-3 rounded-xl text-sm font-medium hover:bg-slate-50 cursor-pointer">
            Interview Prep →
          </button>
          <button onClick={() => router.push('/chat')}
            className="flex-1 bg-white border border-slate-200 text-slate-700 py-3 rounded-xl text-sm font-medium hover:bg-slate-50 cursor-pointer">
            Chat with Resume →
          </button>
        </div>
 
      </div>
    </main>
  )
}