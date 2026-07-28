import React from 'react';
import { Task, Column, Priority } from '../types/project';
import { CheckCircle2, Clock, AlertTriangle, Layers, Tag as TagIcon, BarChart2 } from 'lucide-react';

interface StatsViewProps {
  tasks: Task[];
  columns: Column[];
}

export const StatsView: React.FC<StatsViewProps> = ({ tasks, columns }) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.columnId === 'done').length;
  const inProgress = tasks.filter((t) => t.columnId === 'in_progress').length;
  const overdue = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate).getTime() < new Date().setHours(0,0,0,0) && t.columnId !== 'done'
  ).length;

  const priorityCounts: Record<Priority, number> = {
    urgent: tasks.filter((t) => t.priority === 'urgent').length,
    high: tasks.filter((t) => t.priority === 'high').length,
    medium: tasks.filter((t) => t.priority === 'medium').length,
    low: tasks.filter((t) => t.priority === 'low').length,
  };

  const tagMap: Record<string, number> = {};
  tasks.forEach((t) => {
    t.tags.forEach((tag) => {
      tagMap[tag] = (tagMap[tag] || 0) + 1;
    });
  });

  return (
    <div className="h-full p-6 overflow-y-auto bg-slate-50 dark:bg-slate-950 select-none space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-brand-500/10 text-brand-500 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{total}</div>
            <div className="text-xs text-slate-500">任务总计</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{completed}</div>
            <div className="text-xs text-slate-500">已完成 ({total === 0 ? 0 : Math.round((completed / total) * 100)}%)</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{inProgress}</div>
            <div className="text-xs text-slate-500">进行中</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-rose-500">{overdue}</div>
            <div className="text-xs text-slate-500">逾期未完成</div>
          </div>
        </div>
      </div>

      {/* Main Charts Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-brand-500" /> 看板状态分布
          </h4>
          <div className="space-y-3">
            {columns.map((col) => {
              const count = tasks.filter((t) => t.columnId === col.id).length;
              const pct = total === 0 ? 0 : Math.round((count / total) * 100);
              return (
                <div key={col.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                      {col.title}
                    </span>
                    <span>{count} 个 ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: col.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-amber-500" /> 任务优先级分布
          </h4>
          <div className="space-y-3">
            {[
              { key: 'urgent', label: '🔴 紧急', count: priorityCounts.urgent, color: '#ef4444' },
              { key: 'high', label: '🟠 高', count: priorityCounts.high, color: '#f59e0b' },
              { key: 'medium', label: '🟡 中', count: priorityCounts.medium, color: '#3b82f6' },
              { key: 'low', label: '🔵 低', count: priorityCounts.low, color: '#64748b' },
            ].map((p) => {
              const pct = total === 0 ? 0 : Math.round((p.count / total) * 100);
              return (
                <div key={p.key} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                    <span>{p.label}</span>
                    <span>{p.count} 个 ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: p.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tags Cloud */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <TagIcon className="w-4 h-4 text-emerald-500" /> 任务标签汇总
        </h4>
        <div className="flex flex-wrap gap-2">
          {Object.keys(tagMap).length === 0 ? (
            <span className="text-xs text-slate-400">暂无标签数据</span>
          ) : (
            Object.entries(tagMap).map(([tag, count]) => (
              <span
                key={tag}
                className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
              >
                #{tag} <span className="text-[10px] px-1.5 py-0.2 rounded bg-brand-500 text-white font-mono">{count}</span>
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
