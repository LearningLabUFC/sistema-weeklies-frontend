import type { UseFormRegisterReturn } from 'react-hook-form';
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
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="font-semibold text-sm">
        {label}
      </Label>
      <Input
        id={id}
        className={`bg-slate-100 border-transparent focus-visible:ring-indigo-600 focus-visible:ring-offset-0 focus-visible:bg-white h-11 ${
          error ? 'ring-2 ring-red-500 focus-visible:ring-red-500' : ''
        }`}
        {...registration}
        {...props}
      />
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};

export default InputGroup;
