import { AlertCircle, FolderKanban, RefreshCw } from 'lucide-react';
import { useCallback, useState } from 'react';

import Header from '@/components/layout/Header/Header';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { sectorsApi } from '@/features/sectors/api/sectorsApi';
import { SectorCard } from '@/features/sectors/components/SectorCard';
import { WeeklyPagination } from '@/features/weeklies/components/Pagination';
import { useAsyncQuery } from '@/hooks/useAsyncQuery';
import type { SectorListResponse } from '@/types/sectors';

export default function SectorsCatalog() {
  const [pagina, setPagina] = useState(1);
  const limite = 12;

  const queryFn = useCallback(async (): Promise<SectorListResponse> => {
    return sectorsApi.list({ pagina, limite });
  }, [pagina, limite]);

  const { data, isLoading, error, refetch } = useAsyncQuery(queryFn);

  const totalPages = data ? Math.ceil(data.total / limite) : 1;

  return (
    <div className="w-full max-w-6xl mx-auto py-6 sm:py-10 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      <Header
        title="Setores"
        subtitle="Catálogo geral de frentes e equipes do Learning Lab para descoberta, transparência e integração"
      />

      {isLoading && (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
          <Spinner className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm font-medium">Carregando setores...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="p-6 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="font-semibold text-rose-900 dark:text-rose-300">
            Não foi possível carregar os setores
          </h3>
          <p className="text-sm text-rose-600 dark:text-rose-400 max-w-md mx-auto">
            {error.message}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-2 border-rose-300 text-rose-700 hover:bg-rose-100"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </Button>
        </div>
      )}

      {!isLoading && !error && data && (
        <>
          {data.setores.length === 0 ? (
            <div className="py-20 text-center space-y-3 border border-dashed rounded-xl p-8 border-slate-300 dark:border-slate-800">
              <FolderKanban className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="font-semibold text-slate-700 dark:text-slate-300">
                Nenhum setor cadastrado
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                No momento não existem setores cadastrados no sistema.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.setores.map(sector => (
                <SectorCard key={sector.id} sector={sector} />
              ))}
            </div>
          )}

          <WeeklyPagination
            currentPage={pagina}
            totalPages={totalPages}
            onPageChange={setPagina}
          />
        </>
      )}
    </div>
  );
}
