import type { ReactNode } from 'react';

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  align?: 'left' | 'center';
  children?: ReactNode;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  children,
}: SectionHeaderProps) {
  const centered = align === 'center';

  return (
    <div className={centered ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="mt-6 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-8 text-muted-foreground sm:text-lg">{description}</p>
      {children ? <div className={centered ? 'mt-6 flex justify-center' : 'mt-6'}>{children}</div> : null}
    </div>
  );
}
