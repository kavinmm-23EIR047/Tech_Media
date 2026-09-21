/**
 * CRM Action Tasks Module Page
 * Dynamically linked with real backend enquiries
 */

"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { CheckSquare, Plus, Clock, CheckCircle2, User, Inbox } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { enquiryService } from "@/features/enquiries/services/enquiry.service";
import { Enquiry } from "@/features/enquiries/types/enquiry.types";

interface TaskItem {
  id: string;
  title: string;
  enquiryId: string;
  customerName: string;
  dueDate: string;
  assignee: string;
  isCompleted: boolean;
  priority: "High" | "Medium" | "Low";
}

const STORAGE_KEY = "crm_live_user_tasks";

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedEnquiry, setSelectedEnquiry] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load persisted user-created tasks
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch {}
    }

    // Load backend enquiries to link tasks
    enquiryService
      .getEnquiries(
        {
          search: "",
          status: "All",
          group: "All",
          employee: "All",
          startDate: "",
          endDate: "",
          sortBy: "creation",
          sortOrder: "desc",
        },
        { page: 1, pageSize: 50 }
      )
      .then((res) => {
        setEnquiries(res.enquiries);
        if (res.enquiries.length > 0) {
          setSelectedEnquiry(res.enquiries[0].name);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const persistTasks = (newTasks: TaskItem[]) => {
    setTasks(newTasks);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
  };

  const toggleTask = (id: string) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
    persistTasks(updated);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const matchedEnquiry = enquiries.find((enq) => enq.name === selectedEnquiry);

    const newTask: TaskItem = {
      id: `tsk-${Date.now()}`,
      title: newTaskTitle.trim(),
      enquiryId: selectedEnquiry || "General",
      customerName: matchedEnquiry?.customerName || "Customer Follow-up",
      dueDate: new Date().toISOString().split("T")[0],
      assignee: matchedEnquiry?.userEmployeeName || "Sales Lead",
      isCompleted: false,
      priority: "Medium",
    };

    persistTasks([newTask, ...tasks]);
    setNewTaskTitle("");
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-violet-600 mb-1">
            <span>CRM Workspace</span>
            <span>/</span>
            <span className="text-slate-500">Action Items</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Enquiry Action Tasks</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 font-bold border border-violet-200">
              {tasks.filter((t) => !t.isCompleted).length} Pending
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Follow-up calls, proposal deliveries, and client meeting tasks linked to your live backend records
          </p>
        </div>

        {/* Task Creator */}
        <form onSubmit={handleAddTask} className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-card flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Describe action item or follow-up note..."
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-violet-500"
          />

          {enquiries.length > 0 && (
            <select
              value={selectedEnquiry}
              onChange={(e) => setSelectedEnquiry(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-violet-500"
            >
              {enquiries.map((enq) => (
                <option key={enq.name} value={enq.name}>
                  {enq.name} - {enq.customerName}
                </option>
              ))}
            </select>
          )}

          <Button type="submit" variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Create Task
          </Button>
        </form>

        {/* Tasks List */}
        {tasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3 shadow-card">
            <CheckSquare className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-800">No action tasks created yet</div>
            <div className="text-xs text-slate-500 max-w-sm mx-auto">
              Add follow-up reminders or customer deliverables using the input above.
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card divide-y divide-slate-100 overflow-hidden">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`p-4 flex items-center justify-between gap-4 cursor-pointer transition-colors hover:bg-slate-50 ${
                  task.isCompleted ? "bg-slate-50/50 opacity-60" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={task.isCompleted}
                    onChange={() => toggleTask(task.id)}
                    className="w-4 h-4 text-violet-600 rounded cursor-pointer accent-violet-600"
                  />
                  <div>
                    <div className={`text-sm font-semibold ${task.isCompleted ? "line-through text-slate-400" : "text-slate-900"}`}>
                      {task.title}
                    </div>
                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3 mt-1">
                      <span>Enquiry: <strong className="text-violet-700">{task.enquiryId}</strong> ({task.customerName})</span>
                      <span>Due: {task.dueDate}</span>
                      <span>Assignee: {task.assignee}</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                    task.priority === "High"
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
