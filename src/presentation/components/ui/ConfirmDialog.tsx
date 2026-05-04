type ConfirmDialogProps = {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!isOpen) return null

  const border = '.5px solid rgba(255,255,255,0.08)'

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#222', border, borderRadius: 16, padding: '2rem', width: 380, textAlign: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 500, marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 16, color: '#888', marginBottom: 28, lineHeight: 1.6 }}>{message}</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button
            onClick={onCancel}
            style={{ padding: '10px 24px', borderRadius: 8, border, background: 'transparent', color: '#888', fontSize: 16, cursor: 'pointer' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#2a2a2a'; el.style.color = '#f0f0f0' }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.color = '#888' }}
          >
            cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{ padding: '10px 24px', borderRadius: 8, border: '.5px solid rgba(226,75,74,0.4)', background: 'rgba(226,75,74,0.12)', color: '#E24B4A', fontSize: 16, cursor: 'pointer', fontWeight: 500 }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(226,75,74,0.2)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(226,75,74,0.12)'}
          >
            confirmar
          </button>
        </div>
      </div>
    </div>
  )
}