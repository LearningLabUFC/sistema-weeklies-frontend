import {
  AlertCircle,
  Check,
  Search,
  Send,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { tasksApi } from '@/features/weeklies/api/tasksApi';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useAsyncMutation } from '@/hooks/useAsyncMutation';
import type { EligibleCollaborator } from '@/types/weeklies';

function getInitials(name: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface InviteCollaboratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  taskTitulo: string;
  onSuccess: () => void;
}

export function InviteCollaboratorModal({
  isOpen,
  onClose,
  taskId,
  taskTitulo,
  onSuccess,
}: InviteCollaboratorModalProps) {
  const { showAlertDialog } = useAlertDialog();
  const [searchQuery, setSearchQuery] = useState('');
  const [collaborators, setCollaborators] = useState<EligibleCollaborator[]>(
    [],
  );
  const [selectedCollaborator, setSelectedCollaborator] =
    useState<EligibleCollaborator | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClose = () => {
    setSelectedCollaborator(null);
    setSearchQuery('');
    setCollaborators([]);
    setErrorMessage(null);
    onClose();
  };

  // Busca colaboradores elegíveis na abertura ou conforme o usuário digita
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const timer = setTimeout(async () => {
      setIsLoadingList(true);
      try {
        const res = await tasksApi.listEligibleCollaborators({
          task_id: taskId,
          busca: searchQuery.trim() || undefined,
          limite: 20,
        });
        if (isMounted) {
          setCollaborators(res.colaboradores);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Erro ao buscar colaboradores:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoadingList(false);
        }
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen, taskId, searchQuery]);

  const inviteMutation = useAsyncMutation(
    async () => {
      if (!selectedCollaborator) {
        throw new Error('Selecione um colaborador para enviar o convite.');
      }

      return await tasksApi.assign(taskId, {
        atribuido_id: selectedCollaborator.id,
      });
    },
    {
      onSuccess: () => {
        showAlertDialog({
          type: 'success',
          title: 'Convite enviado',
          message: `O convite de colaboração foi enviado com sucesso para ${selectedCollaborator?.nome_completo}.`,
        });
        onSuccess();
        handleClose();
      },
      onError: err => {
        setErrorMessage(err.message);
      },
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    inviteMutation.execute();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
            <UserPlus className="w-5 h-5" />
            <DialogTitle className="text-lg">Convidar Colaborador</DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Envie um convite de participação para a tarefa{' '}
            <strong className="text-foreground">"{taskTitulo}"</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Seletor ou Card do Colaborador Selecionado */}
          {selectedCollaborator ? (
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Colaborador selecionado:
              </Label>
              <div className="p-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-10 w-10 border border-indigo-200 dark:border-indigo-700 bg-indigo-100 text-indigo-700 font-semibold shrink-0">
                    <AvatarFallback>
                      {getInitials(selectedCollaborator.nome_completo)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {selectedCollaborator.nome_completo}
                      </p>
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 h-4 bg-indigo-100 text-indigo-700 border-none font-mono"
                      >
                        {selectedCollaborator.matricula}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {selectedCollaborator.email}
                    </p>
                    {selectedCollaborator.setores.length > 0 && (
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5 truncate">
                        {selectedCollaborator.setores.join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCollaborator(null)}
                  className="h-8 text-xs text-slate-500 hover:text-rose-600 gap-1 shrink-0"
                >
                  <X className="w-4 h-4" />
                  <span>Trocar</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label
                htmlFor="buscar-colaborador"
                className="text-xs font-semibold"
              >
                Buscar Colaborador *
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="buscar-colaborador"
                  placeholder="Buscar por nome, e-mail ou matrícula..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 text-xs rounded-xl"
                  disabled={inviteMutation.isMutating}
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Lista de Resultados */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-52 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50 p-1 space-y-1">
                {isLoadingList && (
                  <div className="py-6 flex items-center justify-center gap-2 text-slate-500 text-xs">
                    <Spinner className="w-4 h-4 text-indigo-600 animate-spin" />
                    <span>Buscando membros elegíveis...</span>
                  </div>
                )}

                {!isLoadingList && collaborators.length === 0 && (
                  <div className="py-6 text-center text-xs text-slate-500 space-y-1">
                    <Users className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                    <p className="font-medium">
                      Nenhum colaborador elegível encontrado.
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Membros já atribuídos, coordenadores e inativos não são
                      listados.
                    </p>
                  </div>
                )}

                {!isLoadingList &&
                  collaborators.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCollaborator(c)}
                      className="w-full text-left p-2.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all flex items-center justify-between gap-3 group border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar className="h-8 w-8 text-xs font-semibold bg-indigo-100 text-indigo-700 shrink-0">
                          <AvatarFallback>
                            {getInitials(c.nome_completo)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600">
                              {c.nome_completo}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-1 rounded">
                              {c.matricula}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">
                            {c.email}
                          </p>
                          {c.setores.length > 0 && (
                            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 truncate">
                              {c.setores.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 text-xs font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Selecionar</span>
                      </div>
                    </button>
                  ))}
              </div>

              <p className="text-[11px] text-muted-foreground">
                A colaboração entre setores é permitida. Ao aceitar, o servidor
                atribuirá a tarefa ao setor apropriado.
              </p>
            </div>
          )}

          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="text-xs">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="rounded-xl h-9 text-xs"
              disabled={inviteMutation.isMutating}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="rounded-xl h-9 text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              disabled={inviteMutation.isMutating || !selectedCollaborator}
            >
              {inviteMutation.isMutating ? (
                <>Enviando...</>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Convite</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
