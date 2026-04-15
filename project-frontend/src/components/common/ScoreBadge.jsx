import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function ScoreBadge({ score, className }) {
  let colorClass = 'bg-brand-errorBg text-brand-error border-brand-error/20'; // < 50
  if (score >= 75) {
    colorClass = 'bg-brand-successBg text-brand-success border-brand-success/20';
  } else if (score >= 50) {
    colorClass = 'bg-brand-warningBg text-brand-warning border-brand-warning/20';
  }

  return (
    <span className={twMerge(clsx(
      'px-2.5 py-0.5 rounded-full text-sm font-medium border border-[0.5px]',
      colorClass,
      className
    ))}>
      {score}%
    </span>
  );
}
