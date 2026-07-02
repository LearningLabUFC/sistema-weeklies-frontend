import {
  useState,
  useRef,
  type KeyboardEvent,
  type ClipboardEvent,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAlertDialog } from '@/context/AlertDialogContext';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';

interface VerifyCodeFormProps {
  email: string;
}

export const VerifyCodeForm = ({ email }: VerifyCodeFormProps) => {
  const navigate = useNavigate();
  const { showAlertDialog } = useAlertDialog();

  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState<string[]>(Array(6).fill(''));

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData('text')
      .slice(0, 6)
      .replace(/\D/g, '');

    if (pastedData) {
      const newCode = [...code];
      for (let i = 0; i < pastedData.length; i++) {
        newCode[i] = pastedData[i];
      }
      setCode(newCode);

      const lastIndex = pastedData.length - 1;
      inputRefs.current[lastIndex < 5 ? lastIndex + 1 : 5]?.focus();
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');

    if (fullCode.length < 6) {
      showAlertDialog({
        type: 'error',
        title: 'Código Inválido',
        message: 'Por favor, preencha os 6 dígitos do código.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/verify-code', {
        email: email,
        codigo: fullCode,
      });

      const { token_redefinicao } = response.data;

      navigate('/reset-password', {
        state: { email, token: token_redefinicao },
        replace: true,
      });
    } catch (error) {
      let errorMessage = 'Não foi possível validar o código. Tente novamente.';

      if (error instanceof AxiosError) {
        const apiMessage = error.response?.data?.mensagem;
        const apiDetail = error.response?.data?.detail;

        if (apiMessage) {
          errorMessage = apiMessage;
        } else if (Array.isArray(apiDetail) && apiDetail[0]?.msg) {
          errorMessage = apiDetail[0].msg;
        } else if (typeof apiDetail === 'string') {
          errorMessage = apiDetail;
        }
      }

      showAlertDialog({
        type: 'error',
        title: 'Erro na Verificação',
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex justify-between gap-2 sm:gap-3">
        {code.map((digit, index) => (
          <Input
            key={index}
            ref={el => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={digit}
            onChange={e => handleChange(index, e.target.value)}
            onKeyDown={e => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={isLoading}
            className="w-10 h-12 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold text-indigo-900 bg-slate-100 border-transparent focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-0 focus-visible:bg-white transition-all disabled:opacity-70"
          />
        ))}
      </div>

      <div className="space-y-3">
        <Button
          type="submit"
          disabled={isLoading || code.join('').length < 6}
          className="w-full cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white h-11 sm:h-12 rounded-lg text-sm sm:text-base font-medium transition-colors disabled:opacity-70"
        >
          {isLoading ? 'Verificando...' : 'Verificar Código'}
        </Button>

        <Button
          type="button"
          onClick={() => navigate('/forgot-password')}
          disabled={isLoading}
          className="w-full cursor-pointer bg-transparent hover:bg-transparent text-slate-500 hover:text-indigo-600 hover:underline flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
      </div>
    </form>
  );
};
