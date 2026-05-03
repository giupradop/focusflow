export const TaskStatus = {
  PENDING: 'pendente',
  IN_PROGRESS: 'em andamento',
  PAUSED: 'pausada',
  DONE: 'concluída',
  OVERDUE: 'atrasada',
  ARCHIVED: 'arquivada',
} as const

export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus]