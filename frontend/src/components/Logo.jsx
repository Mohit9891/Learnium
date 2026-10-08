import { useState } from 'react';

const SRC = '/learniumlogo.png';

// Single brand mark used across in-app surfaces (browse cards, headers,
// sidebar, admin). Landing + auth cards are frozen and keep their text marks.
// Hides itself if the file is missing so a bad deploy never shows a broken icon.
export default function Logo({ className = 'h-7 w-auto', rounded = '' }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return (
    <img
      src={SRC}
      alt="Learnium"
      draggable={false}
      className={`${className} ${rounded}`}
      onError={() => setOk(false)}
    />
  );
}
