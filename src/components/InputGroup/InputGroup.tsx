import { useState } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InputGroupProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  registration: UseFormRegisterReturn;
}

const InputGroup = ({
  id,
  label,
  error,
  registration,
  ...props
}: InputGroupProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = props.type === 'password';

  const inputType = isPassword && showPassword ? 'text' : props.type;

  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="font-semibold text-sm text-slate-900 dark:text-slate-200"
      >
        {label}
      </Label>

      <div className="relative">
        <Input
          id={id}
          className={`bg-slate-100 dark:bg-slate-900 focus-visible:ring-indigo-600 focus-visible:ring-offset-0 focus-visible:bg-white dark:focus-visible:bg-slate-950 text-slate-900 dark:text-slate-50 h-11 ${
            error ? 'ring-2 ring-red-500 focus-visible:ring-red-500' : ''
          } ${isPassword ? 'pr-10' : ''}`}
          {...registration}
          {...props}
          type={inputType}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};

export default InputGroup;
