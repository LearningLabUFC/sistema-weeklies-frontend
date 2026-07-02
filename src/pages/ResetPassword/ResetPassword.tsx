import { useState } from 'react';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';

import HeaderLogo from '@/components/HeaderLogo/HeaderLogo';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ResetPasswordForm } from '@/components/forms/ResetPasswordForm';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const token = location.state?.token;

  const [isSuccess, setIsSuccess] = useState(false);

  if (!token) {
    return <Navigate to="/forgot-password" replace />;
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 bg-linear-to-br from-indigo-100 via-white to-indigo-100 flex flex-col items-center justify-center font-sans text-slate-900">
      {!isSuccess && (
        <HeaderLogo
          title="Nova Senha"
          subtitle="Crie uma nova senha para acessar sua conta."
        />
      )}

      <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-120 shadow-sm border-transparent bg-white rounded-2xl mt-4">
        <CardContent className="px-5 py-6 sm:px-6 sm:py-8">
          {isSuccess ? (
            <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
              <div className="bg-green-100 text-green-500 rounded-full p-4 mb-5 flex items-center justify-center">
                <Check className="w-8 h-8" strokeWidth={3} />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                Senha Redefinida!
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                Sua senha foi alterada com sucesso. Você já pode acessar sua
                conta.
              </p>
              <Button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white h-11 sm:h-12 rounded-lg text-sm sm:text-base transition-colors"
              >
                Ir para o Login
              </Button>
            </div>
          ) : (
            <ResetPasswordForm
              token={token}
              onSuccess={() => setIsSuccess(true)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
