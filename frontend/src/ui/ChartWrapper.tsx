import React from 'react';

interface ChartWrapperProps {
  title?: string;
  children: React.ReactNode;
  height?: number | string;
}

export const ChartWrapper = ({ title, children, height = 240 }: ChartWrapperProps) => {
  return (
    <div className="bg-surface border border-border rounded p-4 flex flex-col gap-3" style={{ height }}>
      {title && <h3 className="text-[12px] font-semibold text-text uppercase tracking-wider m-0">{title}</h3>}
      <div className="flex-1 w-full min-h-0">
        {children}
      </div>
    </div>
  );
};
