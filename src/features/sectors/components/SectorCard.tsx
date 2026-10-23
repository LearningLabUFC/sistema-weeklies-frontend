import {
  Activity,
  Check,
  ChevronRight,
  Crown,
  Eye,
  FolderKanban,
  Settings,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { isAdminRole } from '@/config/roles';
import { useSectorContext } from '@/features/sectors/context/useSectorContext';
import { useAuth } from '@/hooks/useAuth';
import type { SectorListItem } from '@/types/sectors';

interface SectorCardProps {
  sector: SectorListItem;
}

export function SectorCard({ sector }: SectorCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedSectorId, selectSector, isMemberOf, getMyRole } =
    useSectorContext();

  const isSelected = selectedSectorId === sector.id;
  const isAdmin = isAdminRole(user?.global_role);
  const isMember = isMemberOf(sector.id);
  const myRole = getMyRole(sector.id);
  const isLeader = myRole === 'lider';

  const handleSelect = () => {
    selectSector(sector.id, sector.nome);
    navigate('/');
  };

  const handleVerDetalhes = () => {
    navigate(`/setores/${sector.id}`);
  };

  const handleAcompanhamento = () => {
    navigate(`/setores/${sector.id}/acompanhamento`);
  };

  const handleManage = () => {
    navigate(`/admin/setores/${sector.id}`);
  };

  return (
    <Card className="flex flex-col justify-between h-full border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <CardTitle
                onClick={handleVerDetalhes}
                className="text-base font-semibold text-slate-900 dark:text-slate-100 line-clamp-1 cursor-pointer hover:text-indigo-600 transition-colors"
              >
                {sector.nome}
              </CardTitle>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {isLeader ? (
              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 text-[10px] px-1.5 py-0">
                Líder
              </Badge>
            ) : isMember ? (
              <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 text-[10px] px-1.5 py-0">
                Seu Setor
              </Badge>
            ) : null}

            <Badge
              variant={sector.ativo ? 'default' : 'secondary'}
              className={
                sector.ativo
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }
            >
              {sector.ativo ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
        </div>
        <CardDescription className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 min-h-10">
          {sector.descricao || 'Sem descrição informada.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="py-2">
        {/* Contadores separados sem somar sem rotular */}
        <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
          <div
            className="flex items-center gap-1.5"
            title="Quantidade de membros com papel 'membro'"
          >
            <Users className="w-4 h-4 text-indigo-500" />
            <span>
              <strong className="text-slate-900 dark:text-slate-100">
                {sector.qtd_membros}
              </strong>{' '}
              {sector.qtd_membros === 1 ? 'membro' : 'membros'}
            </span>
          </div>
          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
          <div
            className="flex items-center gap-1.5"
            title="Quantidade de líderes com papel 'lider'"
          >
            <Crown className="w-4 h-4 text-amber-500" />
            <span>
              <strong className="text-slate-900 dark:text-slate-100">
                {sector.qtd_lideres}
              </strong>{' '}
              {sector.qtd_lideres === 1 ? 'líder' : 'líderes'}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 flex flex-col gap-2.5 border-t border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center justify-between gap-2 w-full flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Botão de explorar / conhecer a equipe */}
            <Button
              size="sm"
              variant="outline"
              onClick={handleVerDetalhes}
              className="text-xs h-8 gap-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-900 dark:text-indigo-300"
            >
              <Eye className="w-3.5 h-3.5" />
              Conhecer Setor
            </Button>

            {/* Selecionar para Weekly apenas se for membro deste setor */}
            {isMember && (
              <Button
                size="sm"
                variant={isSelected ? 'default' : 'secondary'}
                onClick={handleSelect}
                className="text-xs h-8 gap-1.5"
                disabled={!sector.ativo}
              >
                {isSelected ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Selecionado
                  </>
                ) : (
                  'Selecionar'
                )}
              </Button>
            )}
          </div>

          {isAdmin && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleManage}
              className="text-xs h-8 gap-1.5 border-slate-200 dark:border-slate-700"
            >
              <Settings className="w-3.5 h-3.5" />
              Gerenciar
            </Button>
          )}
        </div>

        {/* Acompanhamento visível apenas para líder deste setor ou administrador */}
        {(isLeader || isAdmin) && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleAcompanhamento}
            className="w-full justify-between text-xs h-8 border-amber-200/80 bg-amber-50/40 text-amber-900 hover:bg-amber-100/60 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-300 transition-colors"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <Activity className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Acompanhamento Setorial
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-amber-600/70 dark:text-amber-400/70" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
