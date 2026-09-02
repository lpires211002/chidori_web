import { SITE } from '../config.js';

export default function Footer() {
  const line = [SITE.author, SITE.institution, SITE.congress, SITE.year]
    .filter(Boolean)
    .join(' · ');

  return (
    <footer className="border-t border-hairline">
      <div className="w-full max-w-[720px] mx-auto px-5 py-6">
        <p className="label text-ink-low">{line}</p>
      </div>
    </footer>
  );
}
