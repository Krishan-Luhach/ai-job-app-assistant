'use client'
export default function Badge({ label, variant }: { label: string; variant: 'green' | 'red' }) {
  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium
      ${variant === 'green' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
      {label}
    </span>
  )
}
 