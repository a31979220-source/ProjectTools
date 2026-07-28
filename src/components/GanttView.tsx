import React, { useMemo } from 'react';
import { Task, Column } from '../types/project';
import { Calendar, AlertCircle, Edit3 } from 'lucide-react';

interface GanttViewProps {
  tasks: Task[];
  columns: Column[];
  onEditTask: (task: Task) => void;
}

export const GanttView: React.FC<GanttViewProps> = ({ tasks, columns, onEditTask }) => {
  // Compute earliest and latest date bounds across all tasks
  const { minDate, totalDays, datesHeader } = useMemo(() => {
    let earliest = new Date();
    let latest = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days ahead by default

    tasks.forEach((t) => {
      if (t.startDate) {
        const s = new Date(t.startDate);
        if (s < earliest) earliest = s;
      }
      if (t.dueDate) {
        const d = new Date(t.dueDate);
        if (d > latest) latest = d;
      }
    });

    // Reset to start of day
    earliest = new Date(earliest.getFullYear(), earliest.getMonth(), earliest.getDate());
    latest = new Date(latest.getFullYear(), latest.getMonth(), latest.getDate() + 3); // add 3 days padding

    const daysCount = Math.max(14, Math.ceil((latest.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24)));

    const daysArray: Date[] = [];
    for (let i = 0; i < daysCount; i++) {
      const d = new Date(earliest);
      d.setDate(earliest.getDate() + i);
      daysArray.push(d);
    }

    return {
      minDate: earliest,
      maxDate: latest,
      totalDays: daysCount,
      datesHeader: daysArray,
    };
  }, [tasks]);

  const columnColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    columns.forEach((c) => {
      map[c.id] = c.color;
    });
    return map;
  }, [columns]);

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden bg-slate-50 dark:bg-slate-950 select-none">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-500" /> 项目甘特图 / 时间线视图
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            自动根据起止日期绘制任务线段 ({totalDays} 天范围)
          </p>
        </div>
      </div>

      {/* Gantt Table Container */}
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-auto flex flex-col">
        {/* Dates Header */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur z-10 font-mono text-[11px]">
          {/* Left info column */}
          <div className="w-64 shrink-0 px-4 py-3 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">
            任务名称 & 状态
          </div>

          {/* Timeline columns */}
          <div className="flex-1 flex min-w-[700px]">
            {datesHeader.map((d, index) => {
              const isToday = d.toDateString() === new Date().toDateString();
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;
              return (
                <div
                  key={index}
                  className={`flex-1 text-center py-2 border-r border-slate-200/50 dark:border-slate-800/50 min-w-[36px] ${
                    isToday ? 'bg-brand-500/10 text-brand-500 font-bold' : isWeekend ? 'bg-slate-50 dark:bg-slate-900/50 text-slate-400' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <div>{d.getMonth() + 1}/{d.getDate()}</div>
                  <div className="text-[9px] scale-90 opacity-70">
                    {['日', '一', '二', '三', '四', '五', '六'][d.getDay()]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Task Rows */}
        <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-800/60">
          {tasks.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              暂无任何任务，点击顶部“新建任务”开始。
            </div>
          ) : (
            tasks.map((task) => {
              // Calculate offset and width percentage
              const startDate = task.startDate ? new Date(task.startDate) : new Date(task.createdAt);
              const endDate = task.dueDate ? new Date(task.dueDate) : new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000);

              const startOffsetDays = Math.max(0, (startDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
              const durationDays = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1);

              const leftPercent = (startOffsetDays / totalDays) * 100;
              const widthPercent = (durationDays / totalDays) * 100;

              const colColor = columnColorMap[task.columnId] || '#3b82f6';

              return (
                <div
                  key={task.id}
                  className="flex items-center hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group"
                >
                  {/* Left task title */}
                  <div className="w-64 shrink-0 px-4 py-3 border-r border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: colColor }}
                      />
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {task.title}
                      </span>
                    </div>

                    <button
                      onClick={() => onEditTask(task)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Right Timeline Bar */}
                  <div className="flex-1 relative h-12 flex items-center min-w-[700px] px-1">
                    {/* Background grid lines */}
                    <div className="absolute inset-0 flex pointer-events-none">
                      {datesHeader.map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 border-r border-slate-100 dark:border-slate-800/40 h-full"
                        />
                      ))}
                    </div>

                    {/* Gantt Bar */}
                    <div
                      onClick={() => onEditTask(task)}
                      className="relative h-7 rounded-lg shadow-sm flex items-center px-2.5 text-[11px] font-semibold text-white cursor-pointer hover:brightness-110 transition-all z-10 truncate"
                      style={{
                        left: `${Math.min(95, Math.max(0, leftPercent))}%`,
                        width: `${Math.min(100 - leftPercent, Math.max(3, widthPercent))}%`,
                        backgroundColor: colColor,
                      }}
                      title={`${task.title} (${task.startDate || '未设开始'} ~ ${task.dueDate || '未设截止'})`}
                    >
                      <span className="truncate">{task.title}</span>
                    </div>

                    {(!task.startDate || !task.dueDate) && (
                      <span className="absolute right-4 text-[10px] text-amber-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> 未设置完备起止日期
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
