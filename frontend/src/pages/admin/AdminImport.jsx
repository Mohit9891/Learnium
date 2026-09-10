import { useState } from 'react';
import { adminApi, csvTemplate } from '../../api/admin';

export default function AdminImport() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function downloadTemplate() {
    const blob = new Blob([csvTemplate()], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'learnium-questions-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport() {
    setError('');
    setResult(null);
    if (!file) {
      setError('Choose a CSV file first.');
      return;
    }
    setLoading(true);
    try {
      const res = await adminApi.importCsv(file);
      setResult(res);
    } catch (err) {
      setError(err.response?.data?.message || 'Import failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-display font-bold text-heading-xl text-ink-deep mb-2">CSV Import</h1>
      <p className="text-body-md text-ink/60 mb-6">
        Bulk-upload questions. Columns: examName, examSlug, subjectName, subjectSlug, chapterName, chapterSlug,
        orderIndex, questionText, optionA–E, correctOption, explanation, difficulty, year, tags (semicolon-separated).
      </p>

      <div className="flex flex-wrap gap-3 mb-4">
        <button onClick={downloadTemplate} className="px-4 py-2 rounded-md border border-hairline-cool text-sm font-medium">
          Download template
        </button>
      </div>

      <div className="rounded-xxl border border-hairline-cloud p-5 mb-4">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="text-sm mb-3"
        />
        {file && <p className="text-caption text-ink/60 mb-3">{file.name} · {Math.round(file.size / 1024)} KB</p>}
        <button
          onClick={handleImport}
          disabled={loading || !file}
          className="px-6 py-3 rounded-md bg-primary text-white text-sm font-bold uppercase tracking-[0.2px] disabled:opacity-40"
        >
          {loading ? 'Importing...' : 'Import CSV'}
        </button>
      </div>

      {error && <p className="mb-3 text-caption text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>}

      {result && (
        <div className="rounded-xxl border border-hairline-cloud p-5">
          <p className="font-medium text-ink-deep mb-1">
            Imported {result.imported} · Failed {result.failed}
          </p>
          {result.errors?.length > 0 && (
            <ul className="mt-2 text-caption text-red-600 space-y-1">
              {result.errors.map((e, i) => (
                <li key={i}>Row {e.line}: {e.error}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
