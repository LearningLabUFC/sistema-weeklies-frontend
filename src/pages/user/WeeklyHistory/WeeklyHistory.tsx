import { FileText } from 'lucide-react';
import { useState } from 'react';

import Header from '@/components/layout/Header/Header';
import EmptyState from '@/components/shared/EmptyState/EmptyState';
import { WeeklyPagination } from '@/features/weeklies/components/Pagination';
import { WeeklyCard } from '@/features/weeklies/components/WeeklyCard';
import { MOCK_WEEKLIES } from '@/mock/weeklies';
import type { Weekly } from '@/types/weeklies';

const ITEMS_PER_PAGE = 3;

const WeeklyHistory = () => {
  const [weeklies] = useState<Weekly[]>(MOCK_WEEKLIES);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(weeklies.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const currentWeeklies = weeklies.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-0 py-6 sm:py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Header
        title="Minhas weeklies"
        subtitle="Histórico de relatórios semanais"
      />

      {weeklies.length > 0 ? (
        <>
          <div className="space-y-6 mt-6">
            {currentWeeklies.map(weekly => (
              <WeeklyCard
                key={weekly.id}
                dateWeek={weekly.date_week}
                tasks={weekly.tasks}
              />
            ))}
          </div>

          <WeeklyPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <EmptyState
          icon={FileText}
          title="Nenhuma weekly registrada"
          description="Comece criando sua primeira weekly no Dashboard"
        />
      )}
    </div>
  );
};

export default WeeklyHistory;
