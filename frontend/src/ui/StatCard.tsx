import React from 'react';
import { Card } from '../components/ui/Card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: string; isUp: boolean };
  description?: string;
  className?: string;
}

export const StatCard = ({ label, value, icon, trend, description, className = '' }: StatCardProps) => {
  return (
    <Card className={cn(
      "relative overflow-hidden p-6 flex flex-col gap-6 group hover:border-primary/40 transition-all duration-500 shadow-2xl bg-background/40 backdrop-blur-md border-border/60",
      className
    )}>
      {/* Background Icon Watermark */}
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500 pointer-events-none">
        {icon && React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 80 }) : icon}
      </div>
      
      {/* Top Row: Icon + Trend */}
      <div className="flex items-center justify-between relative z-10">
        <div className="w-12 h-12 rounded-sm bg-primary/5 flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-lg shadow-primary/5">
          {icon && React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 22 }) : icon}
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 px-2.5 py-1 rounded-sm text-[10px] font-semibold uppercase tracking-widest backdrop-blur-sm border shadow-sm",
            trend.isUp 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
              : "bg-destructive/10 border-destructive/20 text-destructive"
          )}>
            {trend.isUp ? <ArrowUpRight size={12} strokeWidth={3} /> : <ArrowDownRight size={12} strokeWidth={3} />}
            {trend.value}
          </div>
        )}
      </div>
      
      {/* Value + Label */}
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
            <span className="w-4 h-px bg-primary opacity-30"></span>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em]">
                {label}
            </p>
        </div>
        <h3 className="text-3xl font-semibold text-foreground tracking-tighter group-hover:text-primary transition-colors duration-500 leading-none">
          {value}
        </h3>
        {description && (
          <p className="text-[11px] font-medium text-muted-foreground mt-3 uppercase tracking-tight flex items-center gap-1.5 opacity-70">
            <span className="w-1 h-1 rounded-full bg-primary"></span>
            {description}
          </p>
        )}
      </div>
    </Card>
  );
};

