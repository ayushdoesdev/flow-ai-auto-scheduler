/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CalendarEvent, Task } from '../types';
import { Calendar, Clock, AlertCircle, Plus, Trash2, Link, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CalendarTimelineProps {
  events: CalendarEvent[];
  tasks: Task[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
}

export default function CalendarTimeline({ events, tasks, onAddEvent, onDeleteEvent }: CalendarTimelineProps) {
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [isDeadline, setIsDeadline] = useState(true);
  const [associatedTaskId, setAssociatedTaskId] = useState('');
  const [urgencyScore, setUrgencyScore] = useState(5);
  const [isAdding, setIsAdding] = useState(false);

  // Sort events by starting date-time
  const sortedEvents = [...events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !start || !end) return;

    onAddEvent({
      title,
      start: new Date(start).toISOString(),
      end: new Date(end).toISOString(),
      isDeadline,
      associatedTaskId: associatedTaskId || undefined,
      urgencyScore,
    });

    setTitle('');
    setStart('');
    setEnd('');
    setIsDeadline(true);
    setAssociatedTaskId('');
    setUrgencyScore(5);
    setIsAdding(false);
  };

  const getTaskTitle = (taskId?: string) => {
    return tasks.find(t => t.id === taskId)?.title || 'No task associated';
  };

  return (
    <div id="calendar-timeline-card" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-800 flex items-center gap-2">
            Calendar & Milestones
            <span className="text-xs font-mono font-medium bg-amber-50 border border-amber-100 text-amber-600 px-2.5 py-0.5 rounded-full">
              {events.length} deadlines
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">SaaS integration to manage commitments</p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          id="btn-toggle-add-event"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 border border-slate-200 hover:border-blue-600 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-all duration-150 cursor-pointer"
        >
          <Plus size={14} />
          Add Milestone
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form
            key="add-milestone-form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border border-slate-200 bg-slate-50/50 rounded-xl p-4 mb-4 space-y-3"
            id="add-event-form"
          >
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Milestone Name</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. VC Presentation Pitch"
                required
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 text-ellipsis"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Start Date/Time</label>
                <input
                  type="datetime-local"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">End Date/Time</label>
                <input
                  type="datetime-local"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Link to Task</label>
                <select
                  value={associatedTaskId}
                  onChange={(e) => setAssociatedTaskId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
                >
                  <option value="">-- Optional Associated Task --</option>
                  {tasks.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Urgency (1 - 10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={urgencyScore}
                  onChange={(e) => setUrgencyScore(Number(e.target.value))}
                  className="w-full accent-blue-600 mt-2"
                />
                <span className="text-[10px] text-slate-500 font-mono flex justify-between mt-1">
                  <span>Urgency:</span>
                  <span className="text-blue-600 font-bold">{urgencyScore}/10</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDeadline"
                checked={isDeadline}
                onChange={(e) => setIsDeadline(e.target.checked)}
                className="accent-blue-600 w-3.5 h-3.5 cursor-pointer"
              />
              <label htmlFor="isDeadline" className="text-xs text-slate-600 cursor-pointer font-medium">
                Strict hard deadline (Forces high priority ranking)
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors cursor-pointer"
              >
                Add Commitment
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto pr-1 space-y-3 max-h-[380px]">
        {sortedEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 border border-dashed border-slate-200 rounded-xl text-center p-4">
            <Calendar className="text-slate-400 mb-2" size={24} />
            <p className="text-sm font-medium text-slate-500">No calendar sync events</p>
            <p className="text-xs text-slate-400 mt-1">Connect your Google calendar or add custom milestones above.</p>
          </div>
        ) : (
          <div className="relative border-l border-slate-200 ml-3 pl-4 space-y-4 py-2">
            {sortedEvents.map((event) => {
              const startDate = new Date(event.start);
              const endDate = new Date(event.end);
              const isToday = startDate.toDateString() === new Date().toDateString();

              return (
                <div key={event.id} className="relative group" id={`calendar-row-${event.id}`}>
                  {/* Timeline dot */}
                  <span className={`absolute -left-[21.5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 ${
                    event.isDeadline 
                      ? 'bg-red-500 border-white ring-2 ring-red-100' 
                      : 'bg-blue-600 border-white ring-2 ring-blue-100'
                  }`} />

                  <div className="bg-white border border-slate-200 p-3.5 rounded-xl hover:border-slate-300 hover:shadow-xs transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded font-semibold ${
                            event.isDeadline 
                              ? 'bg-red-50 text-red-600 border border-red-100' 
                              : 'bg-blue-50 text-blue-600 border border-blue-100'
                          }`}>
                            {event.isDeadline ? 'Hard Deadline' : 'Calendar Event'}
                          </span>
                          {isToday && (
                            <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold animate-pulse">
                              Today
                            </span>
                          )}
                          <span className="text-[9px] text-slate-500 bg-slate-100 border border-slate-200/50 px-1.5 py-0.5 rounded font-mono font-medium">
                            Urgency: {event.urgencyScore}/10
                          </span>
                        </div>

                        <h3 className="text-sm font-semibold text-slate-800 mt-1.5 font-display text-ellipsis overflow-hidden">
                          {event.title}
                        </h3>

                        <div className="flex items-center gap-3 text-xs text-slate-500 font-mono mt-1">
                          <span className="flex items-center gap-1">
                            <Clock size={11} className="text-slate-400" />
                            {startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-slate-400 font-medium">
                            {startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        {event.associatedTaskId && (
                          <div className="flex items-center gap-1.5 mt-2 bg-slate-50 px-2 py-1 rounded-md text-xs text-slate-700 border border-slate-200/60 w-fit font-medium">
                            <Link size={10} className="text-blue-500" />
                            <span className="font-mono text-[9px] text-slate-400 font-semibold uppercase">Linked:</span>
                            <span className="truncate max-w-[150px]">{getTaskTitle(event.associatedTaskId)}</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => onDeleteEvent(event.id)}
                        id={`btn-delete-event-${event.id}`}
                        className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-all self-start cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
