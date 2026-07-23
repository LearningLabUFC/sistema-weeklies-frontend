import Header from '@/components/Header/Header';

const AdminManagement = () => {
  return (
    <div className="w-full max-w-3xl mx-auto py-6 sm:py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Header
        title="Gerenciar Administradores"
        subtitle="Adicione ou remova permissões administrativas do sistema"
      />
    </div>
  );
};

export default AdminManagement;
