import { Button } from './Button'

type ConfirmDialogProps = {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-[var(--bg2)] border border-[var(--border2)] rounded-2xl p-6 w-[340px] text-center">
        <div className="text-base font-medium mb-2">{title}</div>
        <div className="text-sm text-[var(--muted)] mb-5">{message}</div>
        <div className="flex gap-2 justify-center">
          <Button label="cancelar" onClick={onCancel} variant="secondary" />
          <Button label="confirmar" onClick={onConfirm} variant="danger" />
        </div>
      </div>
    </div>
  )
}