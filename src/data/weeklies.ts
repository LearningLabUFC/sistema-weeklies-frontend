import type { Weekly } from '@/types/weeklies';

export const mockWeeklies: Weekly[] = [
  // ============================================================================
  // EXEMPLO 1: A SEMANA IDEAL (Vários projetos, alta produtividade, ZERO impedimentos)
  // Teste visual: Não deve renderizar o card vermelho de impedimentos em nenhum projeto.
  // ============================================================================
  {
    id: 'uuid-weekly-001',
    sector_member_id: 'uuid-user-123',
    status: 'closed',
    date_week: '2026-04-15',
    submitted_at: '2026-04-15T16:00:00Z',
    tasks: [
      {
        id: 'task-101',
        weekly_id: 'uuid-weekly-001',
        type: 'past',
        status: 'done',
        content:
          'Migração do banco de dados para a nova instância cloud completada com sucesso',
        project_name: 'gamificall',
      },
      {
        id: 'task-102',
        weekly_id: 'uuid-weekly-001',
        type: 'current',
        status: 'pending',
        content: 'Configurar alarmes e monitoramento no Datadog',
        project_name: 'gamificall',
      },
      {
        id: 'task-103',
        weekly_id: 'uuid-weekly-001',
        type: 'past',
        status: 'done',
        content:
          'Entrevistas qualitativas com 5 usuários sobre o fluxo de checkout',
        project_name: 'LLabUX',
      },
      {
        id: 'task-104',
        weekly_id: 'uuid-weekly-001',
        type: 'current',
        status: 'pending',
        content: 'Compilar relatório de insights e apresentar para a diretoria',
        project_name: 'LLabUX',
      },
    ],
  },

  // ============================================================================
  // EXEMPLO 2: O PROTÓTIPO ORIGINAL (Cenário misto com impedimento)[cite: 3]
  // Teste visual: Valida o design exato da imagem de referência (Mídias + LabUX).[cite: 3]
  // ============================================================================
  {
    id: 'uuid-weekly-002',
    sector_member_id: 'uuid-user-123',
    status: 'closed',
    date_week: '2026-04-08',
    submitted_at: '2026-04-08T14:30:00Z',
    tasks: [
      {
        id: 'task-01',
        weekly_id: 'uuid-weekly-002',
        type: 'past',
        status: 'done',
        content: 'Desenvolvi nova interface para o feed de notícias',
        project_name: 'Midias e Rede',
      },
      {
        id: 'task-02',
        weekly_id: 'uuid-weekly-002',
        type: 'current',
        status: 'pending',
        content: 'Implementar sistema de comentários',
        project_name: 'Midias e Rede',
      },
      {
        id: 'task-03',
        weekly_id: 'uuid-weekly-002',
        type: 'past',
        status: 'done',
        content: 'Realizei pesquisa com usuários sobre a navegação',
        project_name: 'LabUX',
      },
      {
        id: 'task-04',
        weekly_id: 'uuid-weekly-002',
        type: 'current',
        status: 'pending',
        content: 'Criar protótipo de alta fidelidade',
        project_name: 'LabUX',
      },
      {
        id: 'task-05',
        weekly_id: 'uuid-weekly-002',
        type: 'current',
        status: 'blocked',
        content: 'Aguardando aprovação do design system',
        project_name: 'LabUX',
      },
    ],
  },

  // ============================================================================
  // EXEMPLO 3: SEMANA CRÍTICA / GARGALO (Múltiplos impedimentos no mesmo projeto)
  // Teste visual: Valida se a caixa vermelha cresce bem e lista múltiplos bullets de erro.
  // ============================================================================
  {
    id: 'uuid-weekly-003',
    sector_member_id: 'uuid-user-123',
    status: 'closed',
    date_week: '2026-04-01',
    submitted_at: '2026-04-01T18:15:00Z',
    tasks: [
      {
        id: 'task-301',
        weekly_id: 'uuid-weekly-003',
        type: 'past',
        status: 'done',
        content: 'Tentativa de integração com o gateway de pagamento v2',
        project_name: 'Processos',
      },
      {
        id: 'task-302',
        weekly_id: 'uuid-weekly-003',
        type: 'current',
        status: 'pending',
        content: 'Finalizar testes unitários do webhook de PIX',
        project_name: 'Processos',
      },
      {
        id: 'task-303',
        weekly_id: 'uuid-weekly-003',
        type: 'current',
        status: 'blocked',
        content:
          'API do banco parceiro está instável e retornando erro 503 no ambiente de sandbox',
        project_name: 'Processos',
      },
      {
        id: 'task-304',
        weekly_id: 'uuid-weekly-003',
        type: 'current',
        status: 'blocked',
        content:
          'Falta de credenciais de produção para validar o certificado SSL',
        project_name: 'Processos',
      },
    ],
  },

  // ============================================================================
  // EXEMPLO 4: FOCO TOTAL (Apenas 1 projeto na semana inteira com muitas tarefas)
  // Teste visual: Apenas uma Badge renderizada, com listas longas de itens.
  // ============================================================================
  {
    id: 'uuid-weekly-004',
    sector_member_id: 'uuid-user-123',
    status: 'closed',
    date_week: '2026-03-25',
    submitted_at: '2026-03-25T11:20:00Z',
    tasks: [
      {
        id: 'task-401',
        weekly_id: 'uuid-weekly-004',
        type: 'past',
        status: 'done',
        content:
          'Auditoria completa de acessibilidade (WCAG 2.1) nas telas de login',
        project_name: 'GestLLab',
      },
      {
        id: 'task-402',
        weekly_id: 'uuid-weekly-004',
        type: 'past',
        status: 'done',
        content:
          'Substituição de componentes legados em classes para React Functional Components',
        project_name: 'GestLLab',
      },
      {
        id: 'task-403',
        weekly_id: 'uuid-weekly-004',
        type: 'past',
        status: 'done',
        content:
          'Atualização das dependências de segurança (Vite, Tailwind e Lucide)',
        project_name: 'GestLLab',
      },
      {
        id: 'task-404',
        weekly_id: 'uuid-weekly-004',
        type: 'current',
        status: 'pending',
        content: 'Aplicar code review nas PRs do time júnior',
        project_name: 'GestLLab',
      },
      {
        id: 'task-405',
        weekly_id: 'uuid-weekly-004',
        type: 'current',
        status: 'pending',
        content:
          'Iniciar quebra de micro frontends para o painel administrativo',
        project_name: 'GestLLab',
      },
    ],
  },

  // ============================================================================
  // EXEMPLO 5: TAREFAS AVULSAS / FALLBACK "GERAL" (Sem project_name definido)
  // Teste visual: Valida o fallback do código (quando não há projeto, deve agrupar em "Geral").
  // ============================================================================
  {
    id: 'uuid-weekly-005',
    sector_member_id: 'uuid-user-123',
    status: 'closed',
    date_week: '2026-03-18',
    submitted_at: '2026-03-18T17:45:00Z',
    tasks: [
      {
        id: 'task-501',
        weekly_id: 'uuid-weekly-005',
        type: 'past',
        status: 'done',
        content:
          'Participação no alinhamento estratégico de Q2 com os tech leads',
        // Sem project_name -> cairá na badge "Geral"
      },
      {
        id: 'task-502',
        weekly_id: 'uuid-weekly-005',
        type: 'past',
        status: 'done',
        content: 'Onboarding de 2 novos desenvolvedores na equipe de front-end',
      },
      {
        id: 'task-503',
        weekly_id: 'uuid-weekly-005',
        type: 'current',
        status: 'pending',
        content:
          'Preparar slides para a conferência interna de tecnologia da empresa',
      },
    ],
  },

  // ============================================================================
  // EXEMPLO 6: INÍCIO DE SPRINT / PLANEJAMENTO (Sem tarefas passadas, apenas futuras)
  // Teste visual: Valida se a sessão "O que fiz na semana passada" é ocultada corretamente.
  // ============================================================================
  {
    id: 'uuid-weekly-006',
    sector_member_id: 'uuid-user-123',
    status: 'planning', // Status diferente (em planejamento)
    date_week: '2026-03-11',
    submitted_at: '2026-03-11T09:00:00Z',
    tasks: [
      {
        id: 'task-601',
        weekly_id: 'uuid-weekly-006',
        type: 'current',
        status: 'pending',
        content:
          'Explorar documentação da OpenAI para novo recurso de assistente virtual',
        project_name: 'Artigos',
      },
      {
        id: 'task-602',
        weekly_id: 'uuid-weekly-006',
        type: 'current',
        status: 'pending',
        content:
          'Desenhar diagrama de arquitetura do novo microserviço em Node.js',
        project_name: 'Artigos',
      },
    ],
  },
];
