import Header from '@/components/layout/Header/Header';

const TimeClock = () => {
  return (
    <div className="w-full max-w-3xl mx-auto py-6 sm:py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Header
        title="Controle de horas"
        subtitle="Registre seu tempo de dedicação aos projetos"
      />
    </div>
  );
};

export default TimeClock;
