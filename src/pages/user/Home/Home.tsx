import { Navigate } from 'react-router-dom';

import Header from '@/components/layout/Header/Header';
import { Spinner } from '@/components/ui/spinner';
import { isAdminRole, isSuperAdminRole } from '@/config/roles';
import { LeaderReviewCard } from '@/features/home/components/LeaderReviewCard';
import { PendingItemsCard } from '@/features/home/components/PendingItemsCard';
import { PresenceQuickCard } from '@/features/home/components/PresenceQuickCard';
import { QuickTimeClockCard } from '@/features/home/components/QuickTimeClockCard';
import { WeeklyOverviewCard } from '@/features/home/components/WeeklyOverviewCard';
import { useSectorContext } from '@/features/sectors/context/useSectorContext';
import {
  formatDateCivil,
  obterSemanaReferencia,
} from '@/features/weeklies/utils/dateUtils';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { user } = useAuth();
  const { mySectors, isLoading: isLoadingSectors } = useSectorContext();

  const isSuperAdmin = isSuperAdminRole(user?.global_role);
  const hasSectorLink = Boolean(mySectors && mySectors.length > 0);
  const isPureAdmin =
    isSuperAdmin ||
    (!isLoadingSectors && isAdminRole(user?.global_role) && !hasSectorLink);

  if (isPureAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (isLoadingSectors && isAdminRole(user?.global_role)) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const firstName = user?.nome_completo?.trim().split(' ')[0] || 'Membro';
  const currentWeekLabel = formatDateCivil(obterSemanaReferencia());
  const isLeader = mySectors.some(s => s.papel === 'lider');

  return (
    <div className="mx-auto w-full max-w-5xl py-6 sm:py-10 space-y-6 animate-in fade-in duration-300">
      <Header
        title={`Olá, ${firstName}`}
        subtitle={`Semana de referência: ${currentWeekLabel} · Resumo dos seus módulos`}
      />

      <WeeklyOverviewCard />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickTimeClockCard />
        <PresenceQuickCard />
        {isLeader ? (
          <>
            <PendingItemsCard />
            <LeaderReviewCard />
          </>
        ) : (
          <PendingItemsCard className="lg:col-span-2" horizontal />
        )}
      </div>
    </div>
  );
}
