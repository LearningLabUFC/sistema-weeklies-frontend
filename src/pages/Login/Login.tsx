import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import HeaderLogo from '@/components/HeaderLogo/HeaderLogo';
import LoginForm from '@/components/forms/LoginForm';

const Login = () => {
  return (
    <div className="min-h-screen px-4 sm:px-6 bg-linear-to-br from-indigo-100 via-white to-indigo-100 flex flex-col items-center justify-center font-sans text-slate-900">
      <HeaderLogo subtitle="Weekly Reports" />

      <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-120 shadow-sm border-transparent bg-white rounded-2xl">
        <CardHeader className="text-center py-5 sm:py-6">
          <CardTitle className="text-2xl sm:text-3xl font-semibold">
            Bem-vindo de volta
          </CardTitle>
        </CardHeader>

        <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
