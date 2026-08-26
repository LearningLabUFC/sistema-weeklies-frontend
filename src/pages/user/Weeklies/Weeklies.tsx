import Header from '@/components/layout/Header/Header';

const Weeklies = () => {
  return (
    <div className="w-full max-w-3xl mx-auto py-6 sm:py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Header
        title="Relatório de weeklies"
        subtitle="Registre suas atividades semanais nos seus projetos"
      />
    </div>
  );
};

export default Weeklies;
