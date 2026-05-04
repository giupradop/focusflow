import { useEffect } from 'react'

type ToastProps = {
  message: string
  isVisible: boolean
  onHide: () => void
}

export function Toast({ message, isVisible, onHide }: ToastProps) {
  useEffect(() => {
    if (!isVisible) return
    const timer = setTimeout(() => onHide(), 3000)
    return () => clearTimeout(timer)
  }, [isVisible, message])

  if (!isVisible) return null

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 50,
      background: '#4B1528', border: '.5px solid #72243E',
      color: '#F4C2D4', padding: '12px 20px',
      borderRadius: 12, fontSize: 16,
    }}>
      {message}
    </div>
  )
}