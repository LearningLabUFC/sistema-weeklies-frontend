export interface MockSector {
  id: string;
  name: string;
  description?: string;
  members: string[];
}

export const MOCK_SECTOR: MockSector[] = [
  {
    id: 'p1',
    name: 'Midias',
    description: 'Equipe responsável pelas redes sociais e comunicação visual.',
    members: ['2', '7'],
  },
  {
    id: 'p2',
    name: 'GestLab',
    description: 'Desenvolvimento do sistema de gestão interna.',
    members: ['3', '5', '6'],
  },
  {
    id: 'p3',
    name: 'StudyLab',
    description: 'Plataforma de compartilhamento de artigos e estudos.',
    members: ['3', '4', '6'],
  },
  {
    id: 'p4',
    name: 'Gamificall',
    description: 'Pesquisa e aplicação de gamificação na educação.',
    members: ['4', '7'],
  },
  {
    id: 'p5',
    name: 'LLGirls',
    description: 'Iniciativa de incentivo e apoio a mulheres na tecnologia.',
    members: ['2', '8'],
  },
  {
    id: 'p6',
    name: 'LabGames',
    description: 'Estúdio experimental de desenvolvimento de jogos digitais.',
    members: ['6', '8'],
  },
];
