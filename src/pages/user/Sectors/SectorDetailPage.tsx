import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  Crown,
  ExternalLink,
  FileText,
  FolderKanban,
  HelpCircle,
  Mail,
  RefreshCw,
  Search,
  Settings,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { isAdminRole } from '@/config/roles';
import { sectorsApi } from '@/features/sectors/api/sectorsApi';
import { useSectorContext } from '@/features/sectors/context/useSectorContext';
import { formatDateCivil } from '@/features/weeklies/utils/dateUtils';
import { useAsyncQuery } from '@/hooks/useAsyncQuery';
import { useAuth } from '@/hooks/useAuth';
import type { SectorDetail, SectorMemberItem } from '@/types/sectors';

function getInitials(name: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function SectorDetailPage() {
  const { sectorId } = useParams<{ sectorId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectSector, isMemberOf, getMyRole } = useSectorContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const queryFn = useCallback(async (): Promise<SectorDetail> => {
    if (!sectorId) {
      throw new Error('ID do setor não informado.');
    }
    return sectorsApi.getById(sectorId);
  }, [sectorId]);

  const { data: sector, isLoading, error, refetch } = useAsyncQuery(queryFn);

  const isAdmin = isAdminRole(user?.global_role);
  const isMember = sectorId ? isMemberOf(sectorId) : false;
  const myRole = sectorId ? getMyRole(sectorId) : null;
  const isLeader = myRole === 'lider';

  // Separa membros em líderes e integrantes normais
  const { leaders, regularMembers } = useMemo(() => {
    if (!sector?.membros) {
      return { leaders: [], regularMembers: [] };
    }
    const leadersList: SectorMemberItem[] = [];
    const membersList: SectorMemberItem[] = [];

    for (const m of sector.membros) {
      if (m.papel === 'lider') {
        leadersList.push(m);
      } else {
        membersList.push(m);
      }
    }

    return { leaders: leadersList, regularMembers: membersList };
  }, [sector]);

  // Filtra integrantes pelo termo de busca
  const filteredRegularMembers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return regularMembers;
    return regularMembers.filter(
      m =>
        m.nome_completo.toLowerCase().includes(term) ||
        m.email.toLowerCase().includes(term),
    );
  }, [regularMembers, searchTerm]);

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleGoToWeekly = () => {
    if (sector) {
      selectSector(sector.id, sector.nome);
      navigate('/');
    }
  };

  const primaryLeader = leaders[0] || null;

  return (
    <div className="w-full max-w-6xl mx-auto py-6 sm:py-10 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      {/* Navegação de retorno */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/setores')}
          className="gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Catálogo de Setores
        </Button>
      </div>

      {isLoading && (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-500">
          <Spinner className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm font-medium">Carregando detalhes do setor...</p>
        </div>
      )}

      {error && !isLoading && (
        <Card className="border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 text-center py-12 px-6">
          <CardContent className="space-y-4 max-w-md mx-auto">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-200">
              Não foi possível carregar o setor
            </h3>
            <p className="text-sm text-rose-600 dark:text-rose-400">
              {error.message}
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="gap-2 border-rose-300 text-rose-700 hover:bg-rose-100"
              >
                <RefreshCw className="w-4 h-4" />
                Tentar novamente
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigate('/setores')}
              >
                Voltar aos setores
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && sector && (
        <>
          {/* Header principal com status e ações */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                    <FolderKanban className="w-7 h-7" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                      {sector.nome}
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Identificador: {sector.id}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Badge
                    variant={sector.ativo ? 'default' : 'secondary'}
                    className={
                      sector.ativo
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }
                  >
                    {sector.ativo ? 'Setor Ativo' : 'Setor Inativo'}
                  </Badge>

                  {/* Badge de vínculo com o usuário logado */}
                  {isLeader ? (
                    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 gap-1.5">
                      <Crown className="w-3.5 h-3.5 text-amber-600" />
                      Você é Líder deste Setor
                    </Badge>
                  ) : isMember ? (
                    <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-300 gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      Você é Membro deste Setor
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-slate-300 text-slate-600 dark:text-slate-400 gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      Setor Externo (Você não faz parte desta equipe)
                    </Badge>
                  )}
                </div>
              </div>

              {/* Botões de Ação contextualizados */}
              <div className="flex flex-wrap items-center gap-3">
                {isMember && (
                  <Button
                    onClick={handleGoToWeekly}
                    className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                  >
                    <FileText className="w-4 h-4" />
                    Ir para Minhas Weeklies
                  </Button>
                )}

                {(isLeader || isAdmin) && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      navigate(`/setores/${sector.id}/acompanhamento`)
                    }
                    className="gap-2 border-slate-300 dark:border-slate-700"
                  >
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    Painel de Acompanhamento
                  </Button>
                )}

                {isAdmin && (
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/admin/setores/${sector.id}`)}
                    className="gap-2 border-slate-300 dark:border-slate-700"
                  >
                    <Settings className="w-4 h-4" />
                    Gerenciar Setor
                  </Button>
                )}

                {!isMember && primaryLeader && (
                  <Button
                    variant="outline"
                    asChild
                    className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-900 dark:text-indigo-300"
                  >
                    <a
                      href={`mailto:${primaryLeader.email}?subject=${encodeURIComponent(
                        `[Learning Lab] Interesse em atuar no setor ${sector.nome}`,
                      )}`}
                    >
                      <Mail className="w-4 h-4" />
                      Contatar Liderança
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Descrição do Setor */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Sobre este Setor / Projetos
              </h3>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                {sector.descricao ||
                  'Nenhuma descrição detalhada informada para este setor.'}
              </p>
            </div>
          </div>

          {/* Cards de Métricas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="border-slate-200 dark:border-slate-800 shadow-2xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Integrantes</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {sector.membros.length}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 shadow-2xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Liderança</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {leaders.length}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 shadow-2xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Membros Ativos</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {regularMembers.length}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 shadow-2xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Criado em</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {formatDateCivil(sector.criado_em)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seção 1: Liderança do Setor */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Liderança do Setor
              </h2>
            </div>

            {leaders.length === 0 ? (
              <Card className="border-dashed p-6 text-center text-slate-500">
                <p className="text-sm">
                  Nenhum líder atribuído a este setor no momento.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {leaders.map(lider => {
                  const isCurrent = lider.id === user?.id;
                  return (
                    <Card
                      key={lider.id}
                      className="border-amber-200 dark:border-amber-950/60 bg-amber-50/20 dark:bg-amber-950/10 shadow-2xs"
                    >
                      <CardContent className="p-5 flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <Avatar size="lg" className="border border-amber-300">
                            <AvatarFallback className="bg-amber-100 text-amber-800 font-bold">
                              {getInitials(lider.nome_completo)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
                                {lider.nome_completo}
                              </h3>
                              {isCurrent && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0"
                                >
                                  Você
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              {lider.email}
                            </p>
                            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 text-xs mt-1">
                              Líder do Setor
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyEmail(lider.email)}
                            title="Copiar e-mail"
                            className="h-8 w-8 p-0"
                          >
                            {copiedEmail === lider.email ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-slate-400" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            title="Enviar mensagem"
                            className="h-8 w-8 p-0"
                          >
                            <a
                              href={`mailto:${lider.email}?subject=${encodeURIComponent(
                                `[Learning Lab] Dúvida sobre o setor ${sector.nome}`,
                              )}`}
                            >
                              <ExternalLink className="w-4 h-4 text-slate-400" />
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Seção 2: Membros da Equipe */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Integrantes da Equipe ({regularMembers.length})
                </h2>
              </div>

              {/* Campo de pesquisa de membros */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Buscar membro por nome ou e-mail..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>
            </div>

            {regularMembers.length === 0 ? (
              <Card className="border-dashed p-8 text-center space-y-2">
                <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nenhum membro cadastrado nesta equipe
                </p>
                <p className="text-xs text-slate-500">
                  Os membros alocados a este setor aparecerão listados aqui.
                </p>
              </Card>
            ) : filteredRegularMembers.length === 0 ? (
              <Card className="border-dashed p-8 text-center space-y-2">
                <Search className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nenhum integrante encontrado para "{searchTerm}"
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm('')}
                  className="text-xs"
                >
                  Limpar busca
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRegularMembers.map(membro => {
                  const isCurrent = membro.id === user?.id;
                  return (
                    <Card
                      key={membro.id}
                      className={`border shadow-2xs hover:shadow-xs transition-shadow ${
                        isCurrent
                          ? 'border-indigo-300 dark:border-indigo-800 bg-indigo-50/20 dark:bg-indigo-950/20'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <CardContent className="p-4 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <Avatar size="default" className="border">
                            <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs">
                              {getInitials(membro.nome_completo)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                                {membro.nome_completo}
                              </p>
                              {isCurrent && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0 bg-indigo-100 text-indigo-700"
                                >
                                  Você
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 truncate">
                              {membro.email}
                            </p>
                            <Badge
                              variant="outline"
                              className="text-[10px] font-normal border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 mt-1"
                            >
                              Membro
                            </Badge>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyEmail(membro.email)}
                          title="Copiar e-mail"
                          className="h-7 w-7 p-0 shrink-0 text-slate-400 hover:text-slate-700"
                        >
                          {copiedEmail === membro.email ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card Informativo sobre Mobilidade & Transparência */}
          <Card className="bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800">
            <CardContent className="p-6 flex flex-col sm:flex-row items-start gap-4">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                  Deseja migrar ou atuar junto a este setor?
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  No Learning Lab incentivamos a transparência e a colaboração
                  entre frentes de trabalho. Para participar das atividades ou
                  solicitar transferência para este setor, procure o líder da
                  equipe ou contate a coordenação do laboratório. Apenas membros
                  oficialmente vinculados podem submeter relatórios de Weeklies
                  para este setor.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
