type ModalProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-[var(--bg2)] border border-[var(--border2)] rounded-2xl p-7 w-[560px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <div className="text-base font-medium mb-6">{title}</div>
        {children}
      </div>
    </div>
  )
}