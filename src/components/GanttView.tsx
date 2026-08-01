import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Task, Column } from '../types/project';
import { Calendar, AlertCircle, Edit3, Move } from 'lucide-react';

interface GanttViewProps {
  tasks: Task[];
  columns: Column[];
  onEditTask: (task: Task) => void;
  onUpdateTaskDates?: (taskId: string, startDate?: string, dueDate?: string) => void;
}

interface DragState {
  taskId: string;
  type: 'move' | 'resize-start' | 'resize-end';
  startX: number;
  initialStart: Date;
  initialDue: Date;
  timelineWidth: number;
  currentDeltaHours: number;
}

const EXPAND_FLEX = 8; // Expanded day is 8x wider than a normal day
const HOUR_TICKS = [0, 3, 6, 9, 12, 15, 18, 21]; // Hour markers shown in expanded column

const formatDateStr = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  // Show time portion only when it's not midnight
  if (d.getHours() === 0 && d.getMinutes() === 0) {
    return `${year}-${month}-${day}`;
  }
  return `${year}-${month}-${day} ${hours}:${mins}`;
};

const formatDateTimeLocal = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${mins}`;
};

export const GanttView: React.FC<GanttViewProps> = ({
  tasks,
  columns,
  onEditTask,
  onUpdateTaskDates,
}) => {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingDayRef = useRef<number | null>(null);

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

  // Convert a fractional day offset to a percentage, accounting for expanded column
  // Expansion is ONLY active during drag
  const activeHover = dragState ? hoveredDayIndex : null;

  const dateToPercent = useCallback((date: Date): number => {
    const dayOffset = (date.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24);

    if (activeHover === null || activeHover === undefined) {
      return (dayOffset / totalDays) * 100;
    }

    const totalFlex = (totalDays - 1) + EXPAND_FLEX;
    const normalPct = (1 / totalFlex) * 100;
    const expandedPct = (EXPAND_FLEX / totalFlex) * 100;

    const wholeDays = Math.floor(dayOffset);
    const fracDay = dayOffset - wholeDays;

    let pct = 0;
    const limit = Math.min(wholeDays, totalDays);
    for (let i = 0; i < limit; i++) {
      pct += (i === activeHover) ? expandedPct : normalPct;
    }
    // Add fractional part
    if (wholeDays < totalDays) {
      pct += fracDay * ((wholeDays === activeHover) ? expandedPct : normalPct);
    }

    return pct;
  }, [minDate, totalDays, activeHover]);

  // Handle Drag Events
  const handleMouseDown = (
    e: React.MouseEvent,
    task: Task,
    type: 'move' | 'resize-start' | 'resize-end'
  ) => {
    e.stopPropagation();
    e.preventDefault();

    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();

    // Default dates if missing
    const initialStart = task.startDate ? new Date(task.startDate) : new Date(task.createdAt);
    const initialDue = task.dueDate ? new Date(task.dueDate) : new Date(initialStart.getTime() + 2 * 24 * 60 * 60 * 1000);

    setDragState({
      taskId: task.id,
      type,
      startX: e.clientX,
      initialStart,
      initialDue,
      timelineWidth: rect.width,
      currentDeltaHours: 0,
    });
  };

  useEffect(() => {
    if (!dragState) return;

    const handleMouseMove = (e: MouseEvent) => {
      const pxPerHour = dragState.timelineWidth / (totalDays * 24);
      const deltaX = e.clientX - dragState.startX;
      const deltaHours = Math.round(deltaX / pxPerHour);

      // Determine which day column the cursor is over with debounce delay
      if (timelineRef.current) {
        const rect = timelineRef.current.getBoundingClientRect();
        const relX = e.clientX - rect.left;
        const colWidth = rect.width / totalDays;
        const idx = Math.max(0, Math.min(totalDays - 1, Math.floor(relX / colWidth)));

        // Only reset timer if the column changed
        if (idx !== pendingDayRef.current) {
          pendingDayRef.current = idx;
          if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
          // If moved away from currently expanded column, collapse immediately
          setHoveredDayIndex(null);
          hoverTimerRef.current = setTimeout(() => {
            setHoveredDayIndex(idx);
          }, 500);
        }
      }

      setDragState((prev) => (prev ? { ...prev, currentDeltaHours: deltaHours } : null));
    };

    const handleMouseUp = () => {
      if (!dragState) return;

      const { taskId, type, initialStart, initialDue, currentDeltaHours } = dragState;

      let newStart = new Date(initialStart);
      let newDue = new Date(initialDue);

      if (type === 'move') {
        newStart = new Date(initialStart.getTime() + currentDeltaHours * 60 * 60 * 1000);
        newDue = new Date(initialDue.getTime() + currentDeltaHours * 60 * 60 * 1000);
      } else if (type === 'resize-start') {
        newStart = new Date(initialStart.getTime() + currentDeltaHours * 60 * 60 * 1000);
        if (newStart > newDue) {
          newStart = new Date(newDue);
        }
      } else if (type === 'resize-end') {
        newDue = new Date(initialDue.getTime() + currentDeltaHours * 60 * 60 * 1000);
        if (newDue < newStart) {
          newDue = new Date(newStart);
        }
      }

      if (onUpdateTaskDates) {
        onUpdateTaskDates(taskId, formatDateTimeLocal(newStart), formatDateTimeLocal(newDue));
      }

      setDragState(null);
      setHoveredDayIndex(null);
      pendingDayRef.current = null;
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, totalDays, onUpdateTaskDates]);

  // Compute flex style for each day column
  const getColFlex = (index: number): React.CSSProperties => {
    if (activeHover === index) {
      return { flex: EXPAND_FLEX, minWidth: 0, transition: 'flex 0.3s cubic-bezier(0.4,0,0.2,1)' };
    }
    return { flex: 1, minWidth: activeHover !== null ? 0 : 36, transition: 'flex 0.3s cubic-bezier(0.4,0,0.2,1)' };
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden bg-slate-50 dark:bg-slate-950 select-none">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-500" /> 项目甘特图 / 时间线视图
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            拖拽任务条时停留在某天可展开小时刻度 · 按住线段拖拽平移 · 拉伸手柄调整起止 · 精确到小时 ({totalDays} 天范围)
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
          <div ref={timelineRef} className="flex-1 flex min-w-[700px]">
            {datesHeader.map((d, index) => {
              const isToday = d.toDateString() === new Date().toDateString();
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;
              const isExpanded = activeHover === index;
              return (
                <div
                  key={index}
                  style={getColFlex(index)}
                  className={`text-center py-2 border-r border-slate-200/50 dark:border-slate-800/50 overflow-hidden cursor-default ${
                    isToday ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold' : isWeekend ? 'bg-slate-50 dark:bg-slate-900/50 text-slate-400' : 'text-slate-500 dark:text-slate-400'
                  } ${isExpanded ? 'bg-slate-50 dark:bg-slate-800/50' : ''}`}
                >
                  <div className="font-semibold">{d.getMonth() + 1}/{d.getDate()}</div>
                  {!isExpanded && (
                    <div className="text-[9px] scale-90 opacity-70">
                      {['日', '一', '二', '三', '四', '五', '六'][d.getDay()]}
                    </div>
                  )}
                  {/* Expanded hour ticks */}
                  {isExpanded && (
                    <div className="flex w-full mt-0.5">
                      {HOUR_TICKS.map((h) => (
                        <div
                          key={h}
                          className="flex-1 text-[8px] text-slate-400 dark:text-slate-500 font-medium border-r border-slate-200 dark:border-slate-700 last:border-r-0"
                        >
                          {h}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Task Rows */}
        <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-800/60">
          {tasks.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              暂无任何任务，点击顶部"新建任务"开始。
            </div>
          ) : (
            tasks.map((task) => {
              const isDraggingThis = dragState?.taskId === task.id;

              // Calculate current effective dates considering active drag
              let startDate = task.startDate ? new Date(task.startDate) : new Date(task.createdAt);
              let endDate = task.dueDate ? new Date(task.dueDate) : new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000);

              if (isDraggingThis && dragState) {
                const deltaMs = dragState.currentDeltaHours * 60 * 60 * 1000;
                if (dragState.type === 'move') {
                  startDate = new Date(dragState.initialStart.getTime() + deltaMs);
                  endDate = new Date(dragState.initialDue.getTime() + deltaMs);
                } else if (dragState.type === 'resize-start') {
                  startDate = new Date(dragState.initialStart.getTime() + deltaMs);
                  if (startDate > endDate) startDate = new Date(endDate);
                } else if (dragState.type === 'resize-end') {
                  endDate = new Date(dragState.initialDue.getTime() + deltaMs);
                  if (endDate < startDate) endDate = new Date(startDate);
                }
              }

              // For the end display: if endDate is midnight (pure date), treat as end-of-day for width
              const displayEnd = new Date(endDate);
              if (displayEnd.getHours() === 0 && displayEnd.getMinutes() === 0) {
                displayEnd.setHours(23, 59);
              }

              const leftPercent = dateToPercent(startDate);
              const rightPercent = dateToPercent(displayEnd);
              const widthPercent = Math.max(2, rightPercent - leftPercent);
              const durationHours = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)));

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
                      title="编辑任务信息与日期"
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Right Timeline Bar */}
                  <div
                    className="flex-1 relative h-12 flex items-center min-w-[700px] px-1"
                  >
                    {/* Background grid lines - use same flex as header */}
                    <div className="absolute inset-0 flex pointer-events-none">
                      {datesHeader.map((_, i) => (
                        <div
                          key={i}
                          style={getColFlex(i)}
                          className={`border-r border-slate-100 dark:border-slate-800/40 h-full ${
                            activeHover === i ? 'bg-slate-100 dark:bg-slate-800/50' : ''
                          }`}
                        >
                          {/* Hour grid lines inside expanded column */}
                          {activeHover === i && (
                            <div className="flex h-full">
                              {HOUR_TICKS.map((h) => (
                                <div
                                  key={h}
                                  className="flex-1 border-r border-brand-500/10 dark:border-brand-400/10 last:border-r-0 h-full"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Gantt Bar Component */}
                    <div
                      onMouseDown={(e) => handleMouseDown(e, task, 'move')}
                      className={`absolute h-7 rounded-lg shadow-sm flex items-center justify-between px-3 text-[11px] font-semibold text-white cursor-grab active:cursor-grabbing transition-shadow z-10 group/bar ${
                        isDraggingThis ? 'ring-2 ring-brand-500 shadow-xl scale-[1.01] z-30 opacity-95' : 'hover:brightness-110'
                      }`}
                      style={{
                        left: `${Math.min(95, Math.max(0, leftPercent))}%`,
                        width: `${Math.min(100 - leftPercent, Math.max(2, widthPercent))}%`,
                        backgroundColor: colColor,
                      }}
                      title={`${task.title} (${formatDateStr(startDate)} ~ ${formatDateStr(endDate)})`}
                    >
                      {/* Left Resize Handle */}
                      <div
                        onMouseDown={(e) => handleMouseDown(e, task, 'resize-start')}
                        title="按住向左右拖拽改变开始日期"
                        className="absolute left-0 top-0 bottom-0 w-3.5 cursor-ew-resize flex items-center justify-center transition-colors group/handle z-20 hover:bg-black/15 dark:hover:bg-white/15 rounded-l-lg"
                      >
                        <div className="w-1 h-3.5 bg-white/70 group-hover/handle:bg-white group-hover/handle:w-1.5 group-hover/handle:shadow-[0_0_8px_rgba(255,255,255,0.9)] rounded-full transition-all" />
                      </div>

                      {/* Bar Content */}
                      <div className="flex items-center gap-1.5 min-w-0 truncate px-2">
                        <Move className="w-3 h-3 shrink-0 opacity-40 group-hover/bar:opacity-90 transition-opacity" />
                        <span className="truncate">{task.title}</span>
                      </div>

                      {/* Right Resize Handle */}
                      <div
                        onMouseDown={(e) => handleMouseDown(e, task, 'resize-end')}
                        title="按住向左右拖拽改变截止日期"
                        className="absolute right-0 top-0 bottom-0 w-3.5 cursor-ew-resize flex items-center justify-center transition-colors group/handle z-20 hover:bg-black/15 dark:hover:bg-white/15 rounded-r-lg"
                      >
                        <div className="w-1 h-3.5 bg-white/70 group-hover/handle:bg-white group-hover/handle:w-1.5 group-hover/handle:shadow-[0_0_8px_rgba(255,255,255,0.9)] rounded-full transition-all" />
                      </div>

                      {/* Dragging Tooltip Floating Badge */}
                      {isDraggingThis && (
                        <div className="absolute top-full mt-2.5 left-1/2 -translate-x-1/2 px-4 py-2.5 bg-slate-900 text-white rounded-xl shadow-2xl pointer-events-none font-mono border border-slate-600 animate-fade-in z-50 min-w-[220px]">
                          {/* Arrow pointing up */}
                          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-l border-t border-slate-600 rotate-45" />
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-[11px]">
                              <span className="text-emerald-400 font-bold">起</span>
                              <span className="tracking-wide">{formatDateStr(startDate)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px]">
                              <span className="text-rose-400 font-bold">止</span>
                              <span className="tracking-wide">{formatDateStr(endDate)}</span>
                            </div>
                            <div className="border-t border-slate-700 pt-1 mt-0.5 text-center">
                              <span className="text-slate-300 font-bold text-xs">
                                ⏱ {durationHours >= 24 ? `${Math.floor(durationHours / 24)} 天 ${durationHours % 24 > 0 ? `${durationHours % 24} 小时` : ''}` : `${durationHours} 小时`}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {(!task.startDate || !task.dueDate) && !isDraggingThis && (
                      <span className="absolute right-4 text-[10px] text-amber-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> 未设置完备起止日期 (可拖拽自由调整)
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
