import { useEffect } from 'react'

type ToastProps = {
  message: string
  isVisible: boolean
  onHide: () => void
}

export function Toast({ message, isVisible, onHide }: ToastProps) {
  useEffect(() => {
    if (!isVisible) return
    const timer = setTimeout(() => {
      onHide()
    }, 3000)
    return () => clearTimeout(timer)
  }, [isVisible, message])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-[var(--pink-900)] text-[var(--pink-100)] border border-[var(--pink-800)] px-5 py-2.5 rounded-xl text-sm">
      {message}
    </div>
  )
}