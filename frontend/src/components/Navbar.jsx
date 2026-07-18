import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="flex bg-blue-500  items-center gap-6 px-6 py-4 border-b">
      <Link to="/" className="font-bold text-lg">Learnium</Link>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/mistakes">Mistake Notebook</Link>
    </nav>
  );
}