import { AlertCircle, RefreshCw, Search, UserPlus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { sectorsApi } from '@/features/sectors/api/sectorsApi';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useAsyncMutation } from '@/hooks/useAsyncMutation';
import { api } from '@/lib/api';
import { parseApiError } from '@/lib/errorHandler';
import type { SectorMemberRole } from '@/types/sectors';

interface UserOption {
  id: string;
  nome_completo: string;
  email: string;
  role_nome?: string;
}

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectorId: string;
  onSuccess: () => void;
  existingMemberIds?: string[];
}

export function AddMemberModal({
  isOpen,
  onClose,
  sectorId,
  onSuccess,
  existingMemberIds = [],
}: AddMemberModalProps) {
  const { showAlertDialog } = useAlertDialog();

  const [search, setSearch] = useState('');
  const [rawUsers, setRawUsers] = useState<UserOption[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [papel, setPapel] = useState<SectorMemberRole>('membro');
  const [dataIngresso, setDataIngresso] = useState<string>('');

  // Filtra membros já associados e usuários com cargo super_admin
  const existingMemberIdsSet = useMemo(
    () => new Set(existingMemberIds),
    [existingMemberIds],
  );

  const availableUsers = useMemo(
    () =>
      rawUsers.filter(
        u =>
          u.role_nome?.toLowerCase() !== 'super_admin' &&
          !existingMemberIdsSet.has(u.id),
      ),
    [rawUsers, existingMemberIdsSet],
  );

  const handleClose = useCallback(() => {
    setSearch('');
    setSelectedUserId('');
    setLoadError(null);
    setPapel('membro');
    setDataIngresso('');
    onClose();
  }, [onClose]);

  // Busca administrativa paginada com debounce estável
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const timer = setTimeout(async () => {
      setLoadError(null);
      setIsLoadingUsers(true);
      try {
        let loadedUsers: UserOption[] = [];
        let currentPage = 1;
        let totalUsers = 0;

        do {
          const params = new URLSearchParams({
            status: 'ativo',
            limite: '100',
            pagina: String(currentPage),
          });
          if (search.trim()) {
            params.append('busca', search.trim());
          }

          const res = await api.get<{
            usuarios: UserOption[];
            total?: number;
          }>(`/admin/users?${params.toString()}`);

          if (!isMounted) return;

          const fetched = res.data.usuarios || [];
          loadedUsers = [...loadedUsers, ...fetched];
          totalUsers =
            typeof res.data.total === 'number'
              ? res.data.total
              : loadedUsers.length;
          currentPage++;
        } while (loadedUsers.length < totalUsers && currentPage <= 10);

        if (isMounted) {
          setRawUsers(loadedUsers);
          setLoadError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const parsed = parseApiError(err);
          console.error('Erro ao buscar usuários:', err);
          setLoadError(
            parsed.message || 'Erro ao carregar lista de usuários ativos.',
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingUsers(false);
        }
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen, search, reloadKey]);

  const addMutation = useAsyncMutation(
    async () => {
      if (!selectedUserId) {
        throw new Error('Selecione um usuário para adicionar ao setor.');
      }

      return sectorsApi.addMember(sectorId, {
        usuario_id: selectedUserId,
        papel,
        data_ingresso: dataIngresso ? dataIngresso : undefined,
      });
    },
    {
      onSuccess: res => {
        showAlertDialog({
          type: 'success',
          title: 'Membro adicionado',
          message: res.mensagem || 'Usuário vinculado ao setor com sucesso.',
        });
        onSuccess();
        handleClose();
      },
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.execute();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-600" />
              Adicionar Membro ao Setor
            </DialogTitle>
            <DialogDescription>
              Selecione um usuário ativo do sistema e defina o papel neste
              setor.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {addMutation.error && (
              <div className="p-3 text-xs rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200">
                {addMutation.error.message}
              </div>
            )}

            {loadError && (
              <div className="p-3 text-xs rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loadError}</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setReloadKey(k => k + 1)}
                  className="h-7 text-xs px-2.5 rounded-md border-rose-300 dark:border-rose-800 gap-1 shrink-0"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Repetir</span>
                </Button>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="search-user">Buscar usuário ativo</Label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  id="search-user"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Filtrar por nome ou e-mail..."
                  className="pl-9"
                  disabled={addMutation.isMutating}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="select-user">
                  Usuário <span className="text-rose-500">*</span>
                </Label>
                {!isLoadingUsers && !loadError && rawUsers.length > 0 && (
                  <span className="text-[11px] text-muted-foreground">
                    {availableUsers.length}{' '}
                    {availableUsers.length === 1 ? 'disponível' : 'disponíveis'}
                  </span>
                )}
              </div>
              {isLoadingUsers ? (
                <div className="flex items-center gap-2 p-2.5 text-sm text-slate-500 border rounded-md">
                  <Spinner className="w-4 h-4 animate-spin" />
                  Carregando usuários...
                </div>
              ) : (
                <Select
                  value={selectedUserId}
                  onValueChange={setSelectedUserId}
                  disabled={
                    addMutation.isMutating ||
                    Boolean(loadError) ||
                    availableUsers.length === 0
                  }
                >
                  <SelectTrigger id="select-user">
                    <SelectValue
                      placeholder={
                        loadError
                          ? 'Falha no carregamento dos usuários'
                          : availableUsers.length === 0
                            ? search.trim()
                              ? 'Nenhum usuário encontrado para esta busca'
                              : 'Nenhum usuário disponível encontrado'
                            : 'Selecione um usuário'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {availableUsers.map(u => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.nome_completo} ({u.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="select-role">Papel no setor</Label>
              <Select
                value={papel}
                onValueChange={(val: SectorMemberRole) => setPapel(val)}
                disabled={addMutation.isMutating}
              >
                <SelectTrigger id="select-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="membro">Membro</SelectItem>
                  <SelectItem value="lider">Líder</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-400">
                Líderes podem avaliar weeklies e gerenciar tarefas deste setor.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="data-ingresso">Data de ingresso (opcional)</Label>
              <Input
                id="data-ingresso"
                type="date"
                value={dataIngresso}
                onChange={e => setDataIngresso(e.target.value)}
                disabled={addMutation.isMutating}
              />
              <p className="text-xs text-slate-400">
                Se omitida, será adotada a data atual pelo servidor.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={addMutation.isMutating}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={addMutation.isMutating || !selectedUserId}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              {addMutation.isMutating && <Spinner className="w-4 h-4" />}
              Adicionar ao setor
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
