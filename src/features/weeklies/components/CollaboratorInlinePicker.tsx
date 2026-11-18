import { Check, Search, UserPlus, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { tasksApi } from '@/features/weeklies/api/tasksApi';
import type { EligibleCollaborator } from '@/types/weeklies';

function getInitials(name: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface CollaboratorInlinePickerProps {
  selectedCollaborator: EligibleCollaborator | null;
  onSelect: (collaborator: EligibleCollaborator | null) => void;
  disabled?: boolean;
}

/**
 * Seletor inline opcional de colaborador para convite imediato no ato de criação da tarefa.
 */
export function CollaboratorInlinePicker({
  selectedCollaborator,
  onSelect,
  disabled = false,
}: CollaboratorInlinePickerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [collaborators, setCollaborators] = useState<EligibleCollaborator[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isExpanded || selectedCollaborator) return;
    if (typeof tasksApi.listEligibleCollaborators !== 'function') return;

    let isMounted = true;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await tasksApi.listEligibleCollaborators({
          busca: searchQuery.trim() || undefined,
          limite: 15,
        });
        if (isMounted) {
          setCollaborators(res.colaboradores);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Erro ao buscar colaboradores elegíveis:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isExpanded, selectedCollaborator, searchQuery]);

  if (selectedCollaborator) {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">
          Colaborador convidado (opcional)
        </Label>
        <div className="p-2.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar className="h-8 w-8 text-xs font-semibold bg-indigo-100 text-indigo-700 shrink-0">
              <AvatarFallback>
                {getInitials(selectedCollaborator.nome_completo)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {selectedCollaborator.nome_completo}
                </span>
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 h-4 bg-indigo-100 text-indigo-700 border-none font-mono"
                >
                  {selectedCollaborator.matricula}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {selectedCollaborator.email}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => {
              onSelect(null);
              setIsExpanded(true);
            }}
            className="h-7 px-2 text-xs text-slate-500 hover:text-rose-600"
            aria-label="Remover colaborador selecionado"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">Colaboração (opcional)</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => setIsExpanded(prev => !prev)}
          className="h-7 px-2 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 gap-1"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>{isExpanded ? 'Ocultar convite' : 'Convidar colaborador'}</span>
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-2 rounded-lg border border-slate-200 dark:border-slate-800 p-2.5 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Buscar membro por nome, e-mail ou matrícula..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              disabled={disabled}
              className="pl-8 h-8 text-xs"
            />
          </div>

          <div className="max-h-36 overflow-y-auto space-y-1">
            {isLoading && (
              <div className="py-3 flex items-center justify-center gap-2 text-xs text-slate-500">
                <Spinner className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span>Buscando membros...</span>
              </div>
            )}

            {!isLoading && collaborators.length === 0 && (
              <div className="py-3 text-center text-[11px] text-slate-500 flex flex-col items-center gap-1">
                <Users className="w-4 h-4 text-slate-400" />
                <span>Nenhum colaborador elegível encontrado.</span>
              </div>
            )}

            {!isLoading &&
              collaborators.map(c => (
                <button
                  key={c.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onSelect(c);
                    setIsExpanded(false);
                  }}
                  className="w-full text-left p-2 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors flex items-center justify-between gap-2 group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600">
                        {c.nome_completo}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {c.matricula}
                      </span>
                    </div>
                    {c.setores.length > 0 && (
                      <p className="text-[10px] text-slate-500 truncate">
                        {c.setores.join(', ')}
                      </p>
                    )}
                  </div>
                  <Check className="w-3.5 h-3.5 text-indigo-600 opacity-0 group-hover:opacity-100 shrink-0" />
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
