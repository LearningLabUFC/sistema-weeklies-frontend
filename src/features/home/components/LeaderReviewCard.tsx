import { ArrowRight, ClipboardCheck, FolderKanban } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSectorContext } from '@/features/sectors/context/useSectorContext';
import { weekliesApi } from '@/features/weeklies/api/weekliesApi';

interface SectorPendingCount {
  sectorId: string;
  sectorName: string;
  pendingCount: number;
}

export function LeaderReviewCard() {
  const { mySectors } = useSectorContext();

  const leaderSectors = useMemo(
    () => mySectors.filter(s => s.papel === 'lider'),
    [mySectors],
  );

  const [counts, setCounts] = useState<SectorPendingCount[]>([]);
  const [isLoading, setIsLoading] = useState(leaderSectors.length > 0);

  useEffect(() => {
    if (leaderSectors.length === 0) {
      return;
    }

    let isCancelled = false;

    const loadLeaderCounts = async () => {
      setIsLoading(true);
      const results = await Promise.allSettled(
        leaderSectors.map(async sector => {
          const res = await weekliesApi.getSectorWeeklies(sector.id, {
            status: 'ENVIADA',
            pagina: 1,
            limite: 1,
          });
          return {
            sectorId: sector.id,
            sectorName: sector.nome,
            pendingCount: res.total ?? 0,
          };
        }),
      );

      if (isCancelled) return;

      const resolved: SectorPendingCount[] = results.map((result, idx) =>
        result.status === 'fulfilled'
          ? result.value
          : {
              sectorId: leaderSectors[idx].id,
              sectorName: leaderSectors[idx].nome,
              pendingCount: 0,
            },
      );

      setCounts(resolved);
      setIsLoading(false);
    };

    void loadLeaderCounts();

    return () => {
      isCancelled = true;
    };
  }, [leaderSectors]);

  if (leaderSectors.length === 0) {
    return null;
  }

  const totalPending = counts.reduce((acc, item) => acc + item.pendingCount, 0);

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
              Liderança — Weeklies para Avaliar
            </CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Acesso rápido ao acompanhamento dos seus setores
            </p>
          </div>
        </div>

        {!isLoading && totalPending > 0 && (
          <Badge className="bg-violet-100 text-violet-700 border border-violet-200 hover:bg-violet-100 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800">
            {totalPending} pendente(s)
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-5">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-14 rounded-xl" />
          </div>
        ) : (
          <div className="space-y-2.5">
            {counts.map(item => (
              <div
                key={item.sectorId}
                className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/30"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FolderKanban className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {item.sectorName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.pendingCount === 0
                        ? 'Nenhuma weekly aguardando avaliação'
                        : `${item.pendingCount} ${item.pendingCount === 1 ? 'weekly aguardando' : 'weeklies aguardando'}`}
                    </p>
                  </div>
                </div>

                <Button
                  asChild
                  size="sm"
                  variant={item.pendingCount > 0 ? 'default' : 'outline'}
                  className={
                    item.pendingCount > 0
                      ? 'gap-1.5 text-xs bg-violet-600 hover:bg-violet-700 text-white shrink-0'
                      : 'gap-1.5 text-xs shrink-0'
                  }
                >
                  <Link to={`/setores/${item.sectorId}/acompanhamento`}>
                    Avaliar
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
