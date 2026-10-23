import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { WeeklyDetailView } from '@/features/weeklies/components/WeeklyDetailView';
import type { WeeklyResponse } from '@/types/weeklies';

interface WeeklyDetailModalProps {
  isOpen: boolean;
  weeklyId: string | null;
  onClose: () => void;
  onWeeklyUpdated?: (weekly: WeeklyResponse) => void;
  isLeaderOrAdmin?: boolean;
  currentUserId?: string;
}

export const WeeklyDetailModal = ({
  isOpen,
  weeklyId,
  onClose,
  onWeeklyUpdated,
  isLeaderOrAdmin = false,
  currentUserId,
}: WeeklyDetailModalProps) => {
  if (!isOpen || !weeklyId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Detalhes da Weekly</DialogTitle>
          <DialogDescription>
            Visualização completa do relatório semanal, snapshots e avaliações.
          </DialogDescription>
        </DialogHeader>

        <WeeklyDetailView
          weeklyId={weeklyId}
          onClose={onClose}
          onWeeklyUpdated={onWeeklyUpdated}
          isModal={true}
          isLeaderOrAdmin={isLeaderOrAdmin}
          currentUserId={currentUserId}
        />
      </DialogContent>
    </Dialog>
  );
};
