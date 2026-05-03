type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

type ButtonProps = {
  label: string
  onClick: () => void
  variant?: ButtonVariant
  disabled?: boolean
  fullWidth?: boolean
}

export function Button({ label, onClick, variant = 'primary', disabled = false, fullWidth = false }: ButtonProps) {
  const base = 'px-4 py-2 rounded-lg text-sm font-medium cursor-pointer border-none transition-opacity'

  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-[var(--pink-400)] text-white hover:bg-[var(--pink-500)]',
    secondary: 'bg-[var(--bg4)] text-[var(--muted)] hover:text-[var(--text)]',
    danger: 'bg-[var(--red-bg)] text-[#F09595] hover:bg-[var(--red)] hover:text-white',
    ghost: 'bg-transparent text-[var(--muted)] border border-[var(--border2)] hover:bg-[var(--bg3)] hover:text-[var(--text)]',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      {label}
    </button>
  )
}