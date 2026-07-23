import { useSearchParams, Navigate } from 'react-router-dom';

import HeaderLogo from '@/components/HeaderLogo/HeaderLogo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VerifyCodeForm } from '@/components/forms/VerifyCodeForm';

const VerifyCode = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');

  if (!email) {
    return <Navigate to="/forgot-password" replace />;
  }

  const formatHiddenEmail = (fullEmail: string) => {
    const [name, domain] = fullEmail.split('@');
    if (!name || !domain) return fullEmail;
    return `${name.slice(0, 3)}***@${domain}`;
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 bg-linear-to-br from-indigo-100 via-white to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col items-center justify-center font-sans text-slate-900 dark:text-slate-50 transition-colors">
      <HeaderLogo subtitle="Recuperação de Senha" />

      <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-120 shadow-sm border-transparent dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl mt-4">
        <CardHeader className="text-center py-5 sm:py-6 pb-2">
          <CardTitle className="text-2xl sm:text-3xl font-semibold">
            Insira o código
          </CardTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Enviamos um código de 6 dígitos para o email{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {formatHiddenEmail(email)}
            </span>
          </p>
        </CardHeader>

        <CardContent className="px-5 pb-6 sm:px-8 sm:pb-8 pt-4">
          <VerifyCodeForm email={email} />
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyCode;
