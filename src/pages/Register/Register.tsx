import { Card, CardContent } from '@/components/ui/card';
import HeaderLogo from '@/components/HeaderLogo/HeaderLogo';
import RegisterForm from '@/components/forms/RegisterForm';

const Register = () => {
  return (
    <div className="min-h-screen px-6 sm:px-8 py-4 bg-linear-to-br from-indigo-100 via-white to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col items-center justify-center font-sans text-slate-900 dark:text-slate-50 transition-colors">
      <HeaderLogo subtitle="Crie sua Conta" />

      <Card className="w-full max-w-sm sm:max-w-md shadow-sm border-transparent dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl">
        <CardContent className="p-5 sm:p-6">
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
