import React from 'react';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  copy?: string;
  action?: React.ReactNode;
  light?: boolean;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({ eyebrow, title, copy, action, light = false }) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      {eyebrow && <p className={`text-[11px] font-black uppercase tracking-[0.18em] ${light ? 'text-[#efad67]' : 'text-[#b8472e]'}`}>{eyebrow}</p>}
      <h2 className={`mt-2 font-display text-3xl font-bold leading-none tracking-[-0.045em] sm:text-5xl ${light ? 'text-[#fff9ed]' : 'text-[#1d2a1d]'}`}>{title}</h2>
      {copy && <p className={`mt-3 max-w-xl text-sm leading-6 ${light ? 'text-[#d8decf]' : 'text-[#6e6d63]'}`}>{copy}</p>}
    </div>
    {action}
  </div>
);
