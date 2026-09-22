import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';

const COLUMNS = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'backlog', label: 'Backlog' },
  { id: 'done', label: 'Done' },
];

const SEED = [
  { id: 'seed-1', col: 'today', text: 'Revise Rotational formulas', tag: 'Physics', mins: 20 },
  { id: 'seed-2', col: 'week', text: 'Finish Wave Optics PYQs', tag: 'Physics', mins: 45 },
  { id: 'seed-3', col: 'backlog', text: 'Mock 4 — Sunday', tag: 'Mock', mins: 90 },
];

function load() {
  try {
    const raw = localStorage.getItem('learnium_study_plan');
    if (!raw) return SEED;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED;
  } catch {
    return SEED;
  }
}

export default function StudyPlan() {
  const [tasks, setTasks] = useState(load);
  const [draft, setDraft] = useState({ text: '', tag: '', mins: '', col: 'today' });
  const [dragId, setDragId] = useState(null);

  useEffect(() => {
    localStorage.setItem('learnium_study_plan', JSON.stringify(tasks));
  }, [tasks]);

  function addTask(e) {
    e.preventDefault();
    if (!draft.text.trim()) return;
    setTasks((prev) => [
      ...prev,
      {
        id: `t-${Date.now()}`,
        col: draft.col,
        text: draft.text.trim(),
        tag: draft.tag.trim() || 'General',
        mins: draft.mins ? Number(draft.mins) : null,
      },
    ]);
    setDraft({ text: '', tag: '', mins: '', col: 'today' });
  }

  function move(id, col) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, col } : t)));
  }

  function remove(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  const doneCount = tasks.filter((t) => t.col === 'done').length;

  return (
    <div className="bg-white min-h-screen px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <Link to="/dashboard" className="text-caption text-ink/60 hover:text-ink">
          ← Dashboard
        </Link>
        <h1 className="font-display font-medium text-heading-xl text-ink-deep mt-4 mb-1">
          Study Plan
        </h1>
        <p className="text-body-md text-ink/60 mb-6">
          {doneCount} task{doneCount === 1 ? '' : 's'} done. Drag cards between columns.
        </p>

        <form
          onSubmit={addTask}
          className="flex flex-wrap gap-2 mb-6 bg-white rounded-xl border border-hairline-cloud p-4"
        >
          <input
            value={draft.text}
            onChange={(e) => setDraft({ ...draft, text: e.target.value })}
            placeholder="New task, e.g. Revise Electrostatics notes"
            className="flex-1 min-w-52 px-3 py-2 rounded-sm border border-hairline-cool text-ink focus:outline-none focus:ring-2 focus:ring-ring-focus"
          />
          <input
            value={draft.tag}
            onChange={(e) => setDraft({ ...draft, tag: e.target.value })}
            placeholder="Topic"
            className="w-28 px-3 py-2 rounded-sm border border-hairline-cool text-ink focus:outline-none focus:ring-2 focus:ring-ring-focus"
          />
          <input
            value={draft.mins}
            onChange={(e) => setDraft({ ...draft, mins: e.target.value })}
            placeholder="Min"
            type="number"
            min="1"
            className="w-20 px-3 py-2 rounded-sm border border-hairline-cool text-ink focus:outline-none focus:ring-2 focus:ring-ring-focus"
          />
          <select
            value={draft.col}
            onChange={(e) => setDraft({ ...draft, col: e.target.value })}
            className="px-3 py-2 rounded-sm border border-hairline-cool text-ink"
          >
            {COLUMNS.filter((c) => c.id !== 'done').map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-white text-sm font-bold uppercase tracking-[0.2px] hover:bg-ink-press transition"
          >
            <Plus size={15} />
            Add
          </button>
        </form>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map((col) => {
            const items = tasks.filter((t) => t.col === col.id);
            return (
              <div
                key={col.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragId) move(dragId, col.id);
                  setDragId(null);
                }}
                className={`rounded-xl border p-3 min-h-40 transition ${
                  col.id === 'done' ? 'border-lime bg-lime/10' : 'border-hairline-cloud bg-gray-50/50'
                }`}
              >
                <p className="text-micro-cap font-semibold uppercase tracking-[0.15em] text-ink/50 px-1 mb-2">
                  {col.label} · {items.length}
                </p>
                <div className="space-y-2">
                  {items.map((t) => (
                    <div
                      key={t.id}
                      draggable
                      onDragStart={() => setDragId(t.id)}
                      onDragEnd={() => setDragId(null)}
                      className={`bg-white rounded-md border border-hairline-cloud p-3 cursor-grab active:cursor-grabbing transition ${
                        dragId === t.id ? 'opacity-50 border-violet' : 'hover:border-violet'
                      }`}
                    >
                      <p className={`text-body-md ${col.id === 'done' ? 'line-through text-ink/50' : 'text-ink-deep'}`}>
                        {t.text}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-micro-cap font-semibold uppercase text-violet bg-violet/10 rounded-xs px-1.5 py-0.5">
                          {t.tag}
                        </span>
                        {t.mins && <span className="text-caption text-ink/50">{t.mins} min</span>}
                        <button
                          onClick={() => remove(t.id)}
                          title="Delete task"
                          className="ml-auto text-ink/30 hover:text-pink transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <p className="text-caption text-ink/40 px-1 py-4 text-center">Drop tasks here</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
