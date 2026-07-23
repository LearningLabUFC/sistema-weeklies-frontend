import Header from '@/components/Header/Header';

const Presence = () => {
  return (
    <div className="w-full max-w-3xl mx-auto py-6 sm:py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Header
        title="Gerenciar Presença"
        subtitle="Ative uma sessão de presença e acompanhe os check-ins em tempo real"
      />
    </div>
  );
};

export default Presence;
