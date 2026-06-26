/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Task } from '../types';
import { Plus, Check, Clock, AlertTriangle, Trash2, Tag, Calendar, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TaskManagerProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  onToggleTask: (id: string, completed: boolean) => void;
  onDeleteTask: (id: string) => void;
  isPro: boolean;
}

export default function TaskManager({ tasks, onAddTask, onToggleTask, onDeleteTask, isPro }: TaskManagerProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [category, setCategory] = useState('Work');
  const [dueDate, setDueDate] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddTask({
      title,
      priority,
      durationMinutes,
      category,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    });
    setTitle('');
    setPriority('medium');
    setDurationMinutes(30);
    setCategory('Work');
    setDueDate('');
    setIsAdding(false);
  };

  const getPriorityColor = (p: Task['priority']) => {
    switch (p) {
      case 'urgent': return 'bg-red-50 text-red-700 border-red-100';
      case 'high': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'medium': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'low': return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div id="task-manager-card" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-800 flex items-center gap-2">
            Tasks & Automations
            <span className="text-xs font-mono font-medium bg-blue-50 border border-blue-100 text-blue-600 px-2.5 py-0.5 rounded-full">
              {tasks.length} items
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">Real-time bi-directional task list</p>
        </div>
        
        <button
          onClick={() => setIsAdding(!isAdding)}
          id="btn-toggle-add-task"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-150 shadow-xs cursor-pointer"
        >
          <Plus size={14} />
          Add Task
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form
            key="add-task-form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border border-slate-200 bg-slate-50/50 rounded-xl p-4 mb-4 space-y-3"
            id="add-task-form"
          >
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Task Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Finalize quarterly marketing metrics"
                required
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 text-ellipsis"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Task['priority'])}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Duration</label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={60}>1 Hour</option>
                  <option value={90}>1.5 Hours</option>
                  <option value={120}>2 Hours</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Work, Dev, Chores..."
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Due Date</label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
                />
              </div>
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
                Create Task
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 max-h-[380px]">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 border border-dashed border-slate-200 rounded-xl text-center p-4">
            <AlertTriangle className="text-slate-400 mb-2" size={24} />
            <p className="text-sm font-medium text-slate-500">No active tasks</p>
            <p className="text-xs text-slate-400 mt-1">Create or sync a task to get started.</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                layoutId={`task-${task.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                id={`task-row-${task.id}`}
                className={`group flex items-start justify-between p-3.5 rounded-xl border transition-all duration-150 ${
                  task.completed 
                    ? 'bg-slate-50/60 border-slate-200/50 text-slate-400' 
                    : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => onToggleTask(task.id, !task.completed)}
                    id={`btn-toggle-status-${task.id}`}
                    className={`mt-1 flex items-center justify-center w-5 h-5 rounded-md border transition-all duration-150 cursor-pointer ${
                      task.completed 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'border-slate-300 hover:border-blue-600 bg-white'
                    }`}
                  >
                    {task.completed && <Check size={12} strokeWidth={3} />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-1.5 items-center mb-1.5">
                      {task.aiRank && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-mono bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded-md font-semibold animate-pulse">
                          <Sparkles size={8} />
                          AI Rank #{task.aiRank}
                        </span>
                      )}
                      <span className={`text-[9px] uppercase font-mono tracking-wider px-2 py-0.5 border rounded-sm font-semibold ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className="text-[9px] text-slate-500 bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded-md flex items-center gap-1 font-mono font-medium">
                        <Tag size={10} className="text-blue-500" />
                        {task.category}
                      </span>
                    </div>

                    <p className={`text-sm font-semibold transition-all ${task.completed ? 'line-through text-slate-400 font-normal' : 'text-slate-800'}`}>
                      {task.title}
                    </p>

                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-slate-400" />
                        {task.durationMinutes}m
                      </span>
                      {task.dueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="text-slate-400" />
                          {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>

                    {task.reasoning && !task.completed && (
                      <p className="mt-1.5 text-xs text-blue-800 bg-blue-50/50 border-l-2 border-blue-600 pl-2 py-1 italic rounded-r-md">
                        {task.reasoning}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onDeleteTask(task.id)}
                  id={`btn-delete-task-${task.id}`}
                  className="text-slate-400 hover:text-red-500 p-1.5 rounded-md hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
