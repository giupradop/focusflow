export const Category = {
  WORK: 'trabalho',
  COLLEGE: 'faculdade',
  HEALTH: 'saúde e bem estar',
  PERSONAL: 'formação pessoal',
  PROJECTS: 'projetos pessoais',
} as const

export type Category = typeof Category[keyof typeof Category]