import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';

import HeaderLogo from '@/components/HeaderLogo/HeaderLogo';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ForgotPasswordForm from '@/components/forms/ForgotPasswordForm';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);

  return (
    <div className="min-h-screen px-4 sm:px-6 bg-linear-to-br from-indigo-100 via-white to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col items-center justify-center font-sans text-slate-900 dark:text-slate-50 transition-colors">
      {!isSuccess && (
        <HeaderLogo
          title="Recuperar senha"
          subtitle="Digite seu email abaixo e enviaremos instruções para redefinir sua senha."
        />
      )}

      <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-120 shadow-sm border-transparent dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl mt-4">
        <CardContent className="px-5 py-6 sm:px-6 sm:py-8">
          {isSuccess ? (
            <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
              <div className="bg-green-100 dark:bg-green-900/30 text-green-500 dark:text-green-400 rounded-full p-4 mb-5 flex items-center justify-center">
                <Check className="w-8 h-8" strokeWidth={3} />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
                Link Enviado!
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                Verifique sua caixa de entrada para redefinir sua senha.
              </p>
              <Button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full cursor-pointer bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white h-11 sm:h-12 rounded-lg text-sm sm:text-base transition-colors"
              >
                Voltar para o Login
              </Button>
            </div>
          ) : (
            <ForgotPasswordForm onSuccess={() => setIsSuccess(true)} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
