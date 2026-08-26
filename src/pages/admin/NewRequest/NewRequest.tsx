import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/Header/Header';

import { api } from '@/lib/api';
import { useAlertDialog } from '@/context/AlertDialogContext';

import {
  RequestCard,
  type PendingUser,
} from '@/components/RequestCard/RequestCard';
import { EmptyRequests } from '@/components/EmptyRequests/EmptyRequests';

interface Curso {
  id: string;
  nome: string;
}

const NewRequest = () => {
  const [requests, setRequests] = useState<PendingUser[]>([]);
  const [cursos, setCursos] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isProcessingAll, setIsProcessingAll] = useState(false);

  const { showAlertDialog } = useAlertDialog();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersResponse, cursosResponse] = await Promise.all([
          api.get<PendingUser[]>('/admin/users/pending'),
          api.get<Curso[]>('/domain/cursos'),
        ]);

        setRequests(usersResponse.data);

        const cursosMap: Record<string, string> = {};
        cursosResponse.data.forEach(curso => {
          cursosMap[curso.id] = curso.nome;
        });
        setCursos(cursosMap);
      } catch {
        showAlertDialog({
          type: 'error',
          title: 'Erro de carregamento',
          message:
            'Não foi possível carregar a lista de solicitações pendentes.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showAlertDialog]);

  const handleUpdateStatus = async (
    id: string,
    status: 'ativo' | 'inativo',
  ) => {
    try {
      await api.patch(`/admin/users/${id}/status`, { novo_status: status });
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch {
      showAlertDialog({
        type: 'error',
        title: 'Erro de atualização',
        message: `Ocorreu um erro ao tentar ${status === 'ativo' ? 'aprovar' : 'rejeitar'} o usuário.`,
      });
    }
  };

  const handleAcceptAll = async () => {
    try {
      setIsProcessingAll(true);

      const promises = requests.map(request =>
        api.patch(`/admin/users/${request.id}/status`, {
          novo_status: 'ativo',
        }),
      );

      await Promise.all(promises);
      setRequests([]);
    } catch {
      showAlertDialog({
        type: 'error',
        title: 'Erro ao aprovar todos',
        message: 'Ocorreu um erro ao tentar aprovar todas as solicitações.',
      });
    } finally {
      setIsProcessingAll(false);
    }
  };

  return (
    <div className="w-full py-6 sm:py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Header
        title="Solicitações"
        subtitle="Gerencie solicitações de novos participantes no LearningLab."
      />

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {!loading && requests.length > 0 && (
            <div className="flex items-center gap-3">
              <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60 border-none px-3 py-1.5 text-sm font-medium">
                {requests.length}{' '}
                {requests.length === 1 ? 'pendente' : 'pendentes'}
              </Badge>
              <Button
                onClick={handleAcceptAll}
                disabled={isProcessingAll}
                className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white h-9 px-4 text-sm shadow-sm transition-all"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {isProcessingAll ? 'Aprovando...' : 'Aceitar todos'}
              </Button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4"
              >
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map(request => (
              <RequestCard
                key={request.id}
                request={request}
                cursoNome={cursos[request.curso_id]}
                isProcessingAll={isProcessingAll}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </div>
        ) : (
          <EmptyRequests />
        )}
      </div>
    </div>
  );
};

export default NewRequest;
