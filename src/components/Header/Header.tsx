interface HeaderProps {
  title: string;
  subtitle?: string;
}

const Header = ({ title = 'LearningLab', subtitle }: HeaderProps) => {
  return (
    <div className="mb-8 flex items-start ">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          {title}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
      </div>
    </div>
  );
};

export default Header;
