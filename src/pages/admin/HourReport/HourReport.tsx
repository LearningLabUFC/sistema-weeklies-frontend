import Header from '@/components/layout/Header/Header';

const HourReport = () => {
  return (
    <div className="w-full max-w-3xl mx-auto py-6 sm:py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Header
        title="Relatório de Horas"
        subtitle="Acompanhe a dedicação semanal de cada membro da equipe"
      />
    </div>
  );
};

export default HourReport;
