import { Moon, Sun } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import useDarkMode from '@/hooks/useDarkMode';

export function ThemeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="flex items-center space-x-2">
      <Sun className="h-4 w-4 text-slate-500 dark:text-slate-400" />
      <Switch
        id="theme-mode"
        checked={isDarkMode}
        onCheckedChange={toggleDarkMode}
        className="dark:data-[state=checked]:bg-slate-800 [&>span]:dark:bg-slate-200"
      />
      <Moon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
    </div>
  );
}
