import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  gradient?: string;
  action?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
  gradient = 'from-blue-500 to-indigo-600',
  action,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/45 p-6 backdrop-blur-md transition-all duration-300 hover:translate-y-[-2px] hover:border-slate-700/80 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
      {/* Background Glow */}
      <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-2xl`} />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400 font-sans tracking-wide uppercase">{title}</p>
          <h3 className="mt-2 font-display text-3xl font-bold text-white tracking-tight">{value}</h3>
          {description && (
            <p className="mt-1 text-xs text-slate-500 font-normal">{description}</p>
          )}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg shadow-indigo-500/10`}>
          {icon}
        </div>
      </div>
      {action && <div className="mt-4 border-t border-slate-800/60 pt-3">{action}</div>}
    </div>
  );
};
