'use client'
import { useEffect, useState } from 'react'
import {
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAppStore } from '@/store/appStore'

function Nav() {
  const pathname = usePathname()
  const { sessionId } = useAppStore();
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  let links = [{ href: '/', label: 'Upload' }]

  if (mounted && sessionId) {
    links = [...links,
    { href: '/analyse', label: 'Analysis' },
    { href: '/cover-letter', label: 'Cover Letter' },
    { href: '/interview', label: 'Interview' },
    { href: '/chat', label: 'Chat' },
    ]
  }

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-1">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${isActive(l.href)
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <Nav />
      {children}
    </QueryClientProvider>
  )
}
