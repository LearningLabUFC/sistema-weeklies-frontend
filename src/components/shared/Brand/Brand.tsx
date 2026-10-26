import { images } from '@/config/images';

interface BrandProps {
  title?: string;
  subtitle?: string;
}

const Brand = ({ title = 'LearningLab', subtitle }: BrandProps) => {
  return (
    <figure className="flex flex-col items-center mb-6 sm:mb-8 text-center">
      <div className="bg-indigo-600 flex items-center justify-center rounded-xl mb-3 shadow-sm p-3">
        <img
          src={images.white_logo}
          alt={`Logo do ${title}`}
          className="h-12 w-12 sm:h-14 sm:w-14"
        />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
        {title}
      </h1>
      {subtitle && (
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
          {subtitle}
        </p>
      )}
    </figure>
  );
};

export default Brand;
