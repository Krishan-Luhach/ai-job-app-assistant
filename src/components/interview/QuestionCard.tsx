'use client'
import { InterviewQuestions } from "@/lib/types";
import { useState } from "react";

const DIFFICULTY_STYLE: Record<InterviewQuestions['difficulty'], string> = {
  Easy:   'bg-emerald-100 text-emerald-700',
  Medium: 'bg-amber-100 text-amber-700',
  Hard:   'bg-red-100 text-red-700',
}
 
export default function QuestionCard({ q, index }: { q: InterviewQuestions; index: number }) {
  const [open, setOpen] = useState(false)
 
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3 items-start">
          <span className="text-slate-400 text-sm font-medium mt-0.5">Q{index + 1}</span>
          <p className="text-slate-800 text-sm font-medium">{q.question}</p>
        </div>
        <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium
          ${DIFFICULTY_STYLE[q.difficulty]}`}>
          {q.difficulty}
        </span>
      </div>
 
      <button
        onClick={() => setOpen(o => !o)}
        className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
      >
        {open ? '▲ Hide hint' : '▼ Show hint'}
      </button>
 
      {open && (
        <p className="text-sm text-slate-500 bg-slate-50 rounded-lg p-3 border border-slate-100">
          {q.hint}
        </p>
      )}
    </div>
  )
}