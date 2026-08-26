export const ROLE_IDS = {
  ALUNO: '2fa85f64-5717-4562-b3fc-2c963f66afa3',
  ADMIN: '2fa85f64-5717-4562-b3fc-2c963f66afa2',
  SUPER_ADMIN: '2fa85f64-5717-4562-b3fc-2c963f66afa1',
  LEADER: 'id-do-lider-pendente',
} as const;

export const ROLE_LABELS: Record<string, string> = {
  [ROLE_IDS.ALUNO]: 'Aluno',
  [ROLE_IDS.ADMIN]: 'Administrador',
  [ROLE_IDS.SUPER_ADMIN]: 'Coordenadora',
  [ROLE_IDS.LEADER]: 'Líder',
};

export const ROLE_DISPLAY_NAMES: Record<string, string> = {
  aluno: 'Aluno',
  admin: 'Administrador',
  super_admin: 'Coordenadora',
  coordenadora: 'Coordenadora',
  lider: 'Líder',
};

export const ROLE_NAME_COLORS: Record<string, string> = {
  aluno: 'bg-[#457EFF]/10 text-[#457EFF] border-[#457EFF]/20',
  admin: 'bg-[#8204EE]/10 text-[#8204EE] border-[#8204EE]/20',
  super_admin: 'bg-[#F51BA3]/10 text-[#F51BA3] border-[#F51BA3]/20',
  lider:
    'bg-[#FFBF00]/10 text-[#D49E00] border-[#FFBF00]/20 dark:text-[#FFBF00]',
};
