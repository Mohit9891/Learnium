import api from './axios';

export const adminApi = {
  overview: () => api.get('/admin/overview').then((r) => r.data),
  chapterStats: () => api.get('/admin/stats/chapters').then((r) => r.data),

  listUsers: (params = {}) => api.get('/admin/users', { params }).then((r) => r.data),
  setUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }).then((r) => r.data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`).then((r) => r.data),

  createExam: (payload) => api.post('/admin/exams', payload).then((r) => r.data),
  deleteExam: (id) => api.delete(`/admin/exams/${id}`).then((r) => r.data),
  createSubject: (payload) => api.post('/admin/subjects', payload).then((r) => r.data),
  deleteSubject: (id) => api.delete(`/admin/subjects/${id}`).then((r) => r.data),
  createChapter: (payload) => api.post('/admin/chapters', payload).then((r) => r.data),
  updateChapter: (id, payload) => api.patch(`/admin/chapters/${id}`, payload).then((r) => r.data),
  deleteChapter: (id) => api.delete(`/admin/chapters/${id}`).then((r) => r.data),

  listQuestions: (params = {}) => api.get('/admin/questions', { params }).then((r) => r.data),
  createQuestion: (payload) => api.post('/admin/questions', payload).then((r) => r.data),
  updateQuestion: (id, payload) => api.patch(`/admin/questions/${id}`, payload).then((r) => r.data),
  deleteQuestion: (id) => api.delete(`/admin/questions/${id}`).then((r) => r.data),
  bulkQuestions: (payload) => api.post('/admin/questions/bulk', payload).then((r) => r.data),
  importCsv: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/admin/questions/import', form).then((r) => r.data);
  },
};

export const CSV_COLUMNS = [
  'examName', 'examSlug', 'subjectName', 'subjectSlug', 'chapterName', 'chapterSlug', 'orderIndex',
  'questionText', 'optionA', 'optionB', 'optionC', 'optionD', 'optionE',
  'correctOption', 'explanation', 'difficulty', 'year', 'tags',
];

export function csvTemplate() {
  const header = CSV_COLUMNS.join(',');
  const sample = [
    'Class 11', 'class-11', 'Physics', 'physics', 'Laws of Motion', 'laws-of-motion', '2',
    '"A body stays at rest unless acted upon by force?"', '"True"', '"False"', '"Maybe"', '""', '""',
    'A', '"Newton first law"', 'easy', '2023', '"mechanics;nlm"',
  ].join(',');
  return `${header}\n${sample}\n`;
}
