import { FileText } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

const EmptyWeeklies = () => {
  return (
    <Card className="rounded-2xl shadow-sm border-transparent dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <CardContent className="p-6 text-center sm:p-8 space-y-6 sm:space-y-8">
        <FileText className="w-16 h-16 text-slate-500 dark:text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-slate-50 mb-2">
          Nenhuma weekly registrada
        </h3>
        <p className="text-muted-foreground">
          Comece criando sua primeira weekly no Dashboard
        </p>
      </CardContent>
    </Card>
  );
};

export default EmptyWeeklies;
