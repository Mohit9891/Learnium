import { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function load(p = page) {
    setError('');
    try {
      const res = await adminApi.listUsers({ page: p, limit: 20, search: search || undefined, role: role || undefined });
      setUsers(res.users);
      setTotal(res.total);
      setPage(res.page);
    } catch {
      setError('Could not load users.');
    }
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  async function changeRole(id, nextRole) {
    setNotice('');
    try {
      await adminApi.setUserRole(id, nextRole);
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role: nextRole } : u)));
      setNotice('Role updated.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update role.');
    }
  }

  async function removeUser(id) {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    try {
      await adminApi.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      setNotice('User deleted.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete user.');
    }
  }

  return (
    <div>
      <h1 className="font-display font-bold text-heading-xl text-ink-deep mb-6">Users ({total})</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load(1)}
          placeholder="Search name or email"
          className="px-4 py-2 rounded-sm border border-hairline-cool text-ink focus:outline-none focus:ring-2 focus:ring-ring-focus"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="px-4 py-2 rounded-sm border border-hairline-cool text-ink"
        >
          <option value="">All roles</option>
          <option value="student">Students</option>
          <option value="admin">Admins</option>
        </select>
        <button
          onClick={() => load(1)}
          className="px-4 py-2 rounded-md bg-primary text-white text-sm font-bold uppercase tracking-[0.2px]"
        >
          Search
        </button>
      </div>

      {notice && <p className="mb-3 text-caption text-green-700 bg-lime/10 rounded-md px-3 py-2">{notice}</p>}
      {error && <p className="mb-3 text-caption text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>}

      <div className="rounded-xxl border border-hairline-cloud overflow-hidden">
        <table className="w-full text-left text-body-md">
          <thead className="bg-gray-50 text-caption uppercase text-ink/50">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t border-hairline-cloud">
                <td className="px-4 py-2">{u.name}</td>
                <td className="px-4 py-2 font-code text-[13px]">{u.email}</td>
                <td className="px-4 py-2">
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u._id, e.target.value)}
                    className="px-2 py-1 rounded-sm border border-hairline-cool text-sm"
                  >
                    <option value="student">student</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="px-4 py-2">
                  <button onClick={() => removeUser(u._id)} className="text-caption font-medium text-pink hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3 mt-4">
        <button
          disabled={page <= 1}
          onClick={() => load(page - 1)}
          className="px-4 py-2 rounded-md border border-hairline-cool text-sm disabled:opacity-40"
        >
          Prev
        </button>
        <span className="text-caption text-ink/60 self-center">Page {page}</span>
        <button onClick={() => load(page + 1)} className="px-4 py-2 rounded-md border border-hairline-cool text-sm">
          Next
        </button>
      </div>
    </div>
  );
}
