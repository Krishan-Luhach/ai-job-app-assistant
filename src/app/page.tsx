'use client'
import { useCallback, useState } from 'react'
import { useDropzone }           from 'react-dropzone'
import { useIngest }             from '@/hooks/useIngest'
 
export default function LandingPage() {
  const [jdText,  setJdText]  = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const { mutate, isPending, error } = useIngest()
 
  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setPdfFile(accepted[0])
  }, [])
 
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept:   { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  })
 
  const handleSubmit = () => {
    if (!pdfFile || !jdText.trim()) return
 
    const form = new FormData()
    form.append('resume', pdfFile)
    form.append('jd',     jdText)
    mutate(form)
  }
 
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 w-full max-w-2xl space-y-6">
 
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Job Application Assistant</h1>
          <p className="text-slate-500 text-sm mt-1">
            Upload your resume and paste the job description to get started.
          </p>
        </div>
 
        {/* PDF Dropzone */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">
            Resume (PDF)
          </label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
              ${isDragActive
                ? 'border-indigo-400 bg-indigo-50'
                : 'border-slate-200 hover:border-indigo-300'}`}
          >
            <input {...getInputProps()} />
            {pdfFile
              ? <p className="text-indigo-600 font-medium">✓ {pdfFile.name}</p>
              : <p className="text-slate-400">
                  Drag and drop your PDF here, or click to browse
                </p>
            }
          </div>
        </div>
 
        {/* Job Description */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">
            Job Description
          </label>
          <textarea
            value={jdText}
            onChange={e => setJdText(e.target.value)}
            rows={6}
            className="w-full border border-slate-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Paste the job description here..."
          />
          <p className="text-xs text-slate-400 mt-1 text-right">{jdText.length} chars</p>
        </div>
 
        {error && (
          <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
            {(error as Error).message}
          </p>
        )}
 
        <button
          onClick={handleSubmit}
          disabled={isPending || !pdfFile || !jdText.trim()}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium
                     hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed
                     transition-colors"
        >
          {isPending ? 'Processing...' : 'Analyse My Application →'}
        </button>
 
      </div>
    </main>
  )
}