'use client'
import React, { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { useAppStore }                                 from '@/store/appStore'
import { useRouter }                                   from 'next/navigation'
import ReactMarkdown from 'react-markdown';
import type { ChatHistoryEntry }                       from '@/lib/types'

function Message({ entry }: { entry: ChatHistoryEntry }) {
  const isHuman = entry.role === 'human'
  return (
    <div className={`flex ${isHuman ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xl px-4 py-3 rounded-2xl text-sm leading-relaxed
        ${isHuman
          ? 'bg-indigo-600 text-white rounded-br-sm'
          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'}`}>
        <ReactMarkdown>{entry.content}</ReactMarkdown>
      </div>
    </div>
  )
}
 
export default function ChatPage() {
  const { sessionId, chatHistory, addChatTurn } = useAppStore()
  const [input,     setInput]     = useState('');
  const [streaming, setStreaming] = useState('');
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const bottomRef                 = useRef<HTMLDivElement>(null)
  const router                    = useRouter()
 
  // if (!sessionId) { router.replace('/'); return null }
 
  // Auto-scroll on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, streaming])
 
  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
 
    setInput('')
    setLoading(true)
    setError(null)
    setStreaming('')
 
    try {
      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          sessionId,
          input:        text,
          chat_history: chatHistory, //TODO:: can we store chat_history within this component as state, if not used in other components? 
        }),
      })
 
      if (!res.ok) throw new Error(await res.text())
      //TODO:: How this streaming part is working?
      const reader  = res.body!.getReader()
      const decoder = new TextDecoder()
      let   buffer  = ''
      let   full    = ''
 
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
 
        // stream:true handles multi-byte characters split across chunks
        buffer += decoder.decode(value, { stream: true })
        // Split on SSE double-newline delimiter
        const events = buffer.split('\n\n')
        // Last item may be incomplete — keep in buffer for next iteration
        buffer = events.pop() ?? ''
       
        for (const event of events) {
          if (!event.trim()) continue
          // Extract content after "data: " prefix
          const token = event.replace(/^data:\s*/gm, '').trim()
          if (!token) continue
          full += token + ' '
          setStreaming(prev => prev + ' ' + token)
        }
            }
       
            // Flush any remaining buffer content
            if (buffer) {
        const token = buffer.replace(/^data:\s*/gm, '').trim()
        if (token) { 
          full += token + ' '
          setStreaming(prev => prev + ' ' + token) 
        }
            }
 
      // Commit completed turn to Zustand history
      addChatTurn(text, full)
      setStreaming('')
 
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }
 
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter — new line on Shift+Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }
 
  return (
    <main className="flex flex-col h-screen bg-slate-50">
 
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h1 className="font-bold text-slate-800">Chat with Your Resume</h1>
        {/* TODO:: better highlight this Clear History button */}
        <button
          onClick={() => useAppStore.getState().clearHistory()}
          className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">
          Clear history
        </button>
      </div>
 
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
 
        {chatHistory.length === 0 && !streaming && (
          <p className="text-center text-slate-400 text-sm mt-12">
            Ask anything about your resume — skills, experience, projects...
          </p>
        )}
 
        {/* Committed history */}
        {chatHistory.map((entry, i) => (
          <Message key={i} entry={entry} />
        ))}
 
        {/* Streaming response in progress */}
        {streaming && (
          <Message entry={{ role: 'ai', content: streaming + '▌' }} />
        )}
 
        {error && (
          <p className="text-center text-red-400 text-sm">{error}</p>
        )}
 
        <div ref={bottomRef} />
      </div>
 
      {/* Input */}
      <div className="bg-white border-t border-slate-200 px-6 py-4">
        <div className="flex gap-3 items-center ">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={2}
            disabled={loading}
            placeholder="Ask about your resume... (Enter to send, Shift+Enter for new line)"
            className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm
                       resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300
                       disabled:opacity-50"
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="bg-indigo-600 text-white px-5 py-3 rounded-xl text-sm font-medium
                       hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed
                       transition-colors shrink-0"
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>
      </div>
 
    </main>
  )
}