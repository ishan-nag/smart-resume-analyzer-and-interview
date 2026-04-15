import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function SkillTag({ label, type = 'matched', className }) {
  // matched / missing / nice-to-have
  let colorClass = 'bg-brand-successBg dark:bg-green-500/10 text-brand-success dark:text-green-400 border-brand-success/20 dark:border-green-500/20';
  if (type === 'missing') {
    colorClass = 'bg-brand-errorBg dark:bg-red-500/10 text-brand-error dark:text-red-400 border-brand-error/20 dark:border-red-500/20';
  } else if (type === 'nice-to-have') {
    colorClass = 'bg-brand-warningBg dark:bg-amber-500/10 text-brand-warning dark:text-amber-400 border-brand-warning/20 dark:border-amber-500/20';
  }

  return (
    <span className={twMerge(clsx(
      'px-3 py-1 rounded-full text-sm font-medium border border-[0.5px]',
      colorClass,
      className
    ))}>
      {label}
    </span>
  );
}
