import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { adminApi } from '../../api/admin';

const EMPTY_Q = {
  questionText: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctOption: 'A',
  explanation: '',
  difficulty: 'medium',
  year: '',
  tags: '',
};

function toPayload(chapterId, f) {
  const options = [
    { id: 'A', text: f.optionA },
    { id: 'B', text: f.optionB },
    { id: 'C', text: f.optionC },
    ...(f.optionD ? [{ id: 'D', text: f.optionD }] : []),
  ].filter((o) => o.text.trim());
  return {
    chapterId,
    questionText: f.questionText.trim(),
    options,
    correctOption: f.correctOption,
    explanation: f.explanation,
    difficulty: f.difficulty,
    year: f.year ? Number(f.year) : undefined,
    tags: f.tags ? f.tags.split(';').map((t) => t.trim()).filter(Boolean) : [],
  };
}

function fromDoc(q) {
  const byId = Object.fromEntries((q.options || []).map((o) => [o.id, o.text]));
  return {
    questionText: q.questionText || '',
    optionA: byId.A || '',
    optionB: byId.B || '',
    optionC: byId.C || '',
    optionD: byId.D || '',
    correctOption: q.correctOption || 'A',
    explanation: q.explanation || '',
    difficulty: q.difficulty || 'medium',
    year: q.year || '',
    tags: (q.tags || []).join(';'),
  };
}

export default function AdminContent() {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [examId, setExamId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [qTotal, setQTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState(null); // question _id or 'new'
  const [form, setForm] = useState(EMPTY_Q);
  const [newName, setNewName] = useState({ exam: '', subject: '', chapter: '' });

  useEffect(() => {
    api.get('/exams').then((r) => {
      setExams(r.data.exams || []);
      if (r.data.exams?.length) setExamId(r.data.exams[0]._id);
    }).catch(() => setError('Could not load exams.'));
  }, []);

  useEffect(() => {
    if (!examId) return;
    api.get(`/exams/${examId}/subjects`).then((r) => {
      setSubjects(r.data.subjects || []);
      setSubjectId(r.data.subjects?.[0]?._id || '');
    }).catch(() => {});
  }, [examId, exams.length]);

  useEffect(() => {
    if (!subjectId) return;
    api.get(`/subjects/${subjectId}/chapters`).then((r) => {
      setChapters(r.data.chapters || []);
      setChapterId(r.data.chapters?.[0]?._id || '');
    }).catch(() => {});
  }, [subjectId]);

  async function loadQuestions() {
    if (!chapterId) return;
    try {
      const res = await adminApi.listQuestions({ chapterId, limit: 50, search: search || undefined });
      setQuestions(res.questions);
      setQTotal(res.total);
    } catch {
      setError('Could not load questions.');
    }
  }

  useEffect(() => {
    loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId]);

  function startNew() {
    setEditing('new');
    setForm(EMPTY_Q);
  }

  function startEdit(q) {
    setEditing(q._id);
    setForm(fromDoc(q));
  }

  async function saveQuestion() {
    setError('');
    setNotice('');
    try {
      const payload = toPayload(chapterId, form);
      if (editing === 'new') await adminApi.createQuestion(payload);
      else await adminApi.updateQuestion(editing, payload);
      setEditing(null);
      setNotice('Question saved.');
      loadQuestions();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save question.');
    }
  }

  async function removeQuestion(id) {
    if (!window.confirm('Delete this question?')) return;
    await adminApi.deleteQuestion(id);
    setQuestions((prev) => prev.filter((q) => q._id !== id));
  }

  async function createLevel(kind) {
    setError('');
    try {
      if (kind === 'exam' && newName.exam.trim()) {
        const { exam } = await adminApi.createExam({ name: newName.exam.trim() });
        setExams((p) => [...p, exam]);
        setExamId(exam._id);
      }
      if (kind === 'subject' && newName.subject.trim() && examId) {
        const { subject } = await adminApi.createSubject({ examId, name: newName.subject.trim() });
        setSubjects((p) => [...p, subject]);
        setSubjectId(subject._id);
      }
      if (kind === 'chapter' && newName.chapter.trim() && subjectId) {
        const { chapter } = await adminApi.createChapter({ subjectId, name: newName.chapter.trim() });
        setChapters((p) => [...p, chapter]);
        setChapterId(chapter._id);
      }
      setNewName({ exam: '', subject: '', chapter: '' });
      setNotice('Created.');
    } catch (err) {
      setError(err.response?.data?.message || 'Create failed.');
    }
  }

  return (
    <div>
      <h1 className="font-display font-bold text-heading-xl text-ink-deep mb-6">Content</h1>
      {notice && <p className="mb-3 text-caption text-green-700 bg-lime/10 rounded-md px-3 py-2">{notice}</p>}
      {error && <p className="mb-3 text-caption text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>}

      <div className="grid md:grid-cols-3 gap-3 mb-6">
        <label className="block">
          <span className="text-caption font-medium text-ink/60">Exam</span>
          <select value={examId} onChange={(e) => setExamId(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-sm border border-hairline-cool">
            {exams.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
          </select>
          <div className="flex gap-2 mt-2">
            <input value={newName.exam} onChange={(e) => setNewName({ ...newName, exam: e.target.value })} placeholder="New exam" className="flex-1 px-3 py-1.5 rounded-sm border border-hairline-cool text-sm" />
            <button onClick={() => createLevel('exam')} className="px-3 py-1.5 rounded-md bg-primary text-white text-xs font-bold uppercase">Add</button>
          </div>
        </label>
        <label className="block">
          <span className="text-caption font-medium text-ink/60">Subject</span>
          <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-sm border border-hairline-cool">
            {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <div className="flex gap-2 mt-2">
            <input value={newName.subject} onChange={(e) => setNewName({ ...newName, subject: e.target.value })} placeholder="New subject" className="flex-1 px-3 py-1.5 rounded-sm border border-hairline-cool text-sm" />
            <button onClick={() => createLevel('subject')} className="px-3 py-1.5 rounded-md bg-primary text-white text-xs font-bold uppercase">Add</button>
          </div>
        </label>
        <label className="block">
          <span className="text-caption font-medium text-ink/60">Chapter</span>
          <select value={chapterId} onChange={(e) => setChapterId(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-sm border border-hairline-cool">
            {chapters.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <div className="flex gap-2 mt-2">
            <input value={newName.chapter} onChange={(e) => setNewName({ ...newName, chapter: e.target.value })} placeholder="New chapter" className="flex-1 px-3 py-1.5 rounded-sm border border-hairline-cool text-sm" />
            <button onClick={() => createLevel('chapter')} className="px-3 py-1.5 rounded-md bg-primary text-white text-xs font-bold uppercase">Add</button>
          </div>
        </label>
      </div>

      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && loadQuestions()} placeholder="Search questions" className="px-4 py-2 rounded-sm border border-hairline-cool" />
        <button onClick={loadQuestions} className="px-4 py-2 rounded-md border border-hairline-cool text-sm">Search</button>
        <span className="text-caption text-ink/60">{qTotal} questions</span>
        <button onClick={startNew} className="ml-auto px-4 py-2 rounded-md bg-primary text-white text-sm font-bold uppercase">+ New question</button>
      </div>

      {editing && (
        <div className="rounded-xxl border border-violet p-5 mb-4">
          <h3 className="font-medium text-ink-deep mb-3">{editing === 'new' ? 'New question' : 'Edit question'}</h3>
          <textarea value={form.questionText} onChange={(e) => setForm({ ...form, questionText: e.target.value })} placeholder="Question text" rows={2} className="w-full px-3 py-2 rounded-sm border border-hairline-cool mb-2" />
          <div className="grid md:grid-cols-2 gap-2 mb-2">
            {['optionA', 'optionB', 'optionC', 'optionD'].map((k) => (
              <input key={k} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} placeholder={k} className="px-3 py-2 rounded-sm border border-hairline-cool font-code text-sm" />
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <select value={form.correctOption} onChange={(e) => setForm({ ...form, correctOption: e.target.value })} className="px-3 py-2 rounded-sm border border-hairline-cool text-sm">
              {['A', 'B', 'C', 'D'].map((o) => <option key={o} value={o}>Correct: {o}</option>)}
            </select>
            <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="px-3 py-2 rounded-sm border border-hairline-cool text-sm">
              <option value="easy">easy</option>
              <option value="medium">medium</option>
              <option value="hard">hard</option>
            </select>
            <input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="Year" className="px-3 py-2 rounded-sm border border-hairline-cool text-sm w-24" />
            <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="tags; separated" className="flex-1 px-3 py-2 rounded-sm border border-hairline-cool text-sm" />
          </div>
          <textarea value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} placeholder="Explanation" rows={2} className="w-full px-3 py-2 rounded-sm border border-hairline-cool mb-3" />
          <div className="flex gap-2">
            <button onClick={saveQuestion} className="px-4 py-2 rounded-md bg-primary text-white text-sm font-bold uppercase">Save</button>
            <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-md border border-hairline-cool text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {questions.map((q) => (
          <div key={q._id} className="rounded-md border border-hairline-cloud p-4">
            <p className="text-body-md text-ink-deep mb-1">{q.questionText}</p>
            <p className="text-caption text-ink/50 mb-2">Correct: {q.correctOption} · {q.difficulty} · {(q.tags || []).join(', ')}</p>
            <div className="flex gap-3">
              <button onClick={() => startEdit(q)} className="text-caption font-medium text-violet hover:underline">Edit</button>
              <button onClick={() => removeQuestion(q._id)} className="text-caption font-medium text-pink hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
