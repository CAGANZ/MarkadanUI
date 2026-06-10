// src/components/catalog/Pager.jsx
// URL tabanlı sayfalama — RSC içinde kullanılır, JS gerektirmez.
import Link from "next/link";

function PageLink({ href, active, disabled, children, label }) {
  if (disabled) {
    return (
      <span className="rounded-base border border-line px-3 py-2 text-sm text-ink-soft opacity-40">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={`rounded-base border px-3 py-2 text-sm transition-colors ${
        active
          ? "border-primary bg-primary font-bold text-white"
          : "border-line bg-surface-card text-ink hover:bg-primary-soft"
      }`}
    >
      {children}
    </Link>
  );
}

export default function Pager({ page, totalPages, buildHref }) {
  if (totalPages <= 1) return null;

  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2" aria-label="Sayfalama">
      <PageLink href={buildHref(page - 1)} disabled={page <= 1} label="Önceki sayfa">
        ‹
      </PageLink>

      {start > 1 && (
        <>
          <PageLink href={buildHref(1)}>1</PageLink>
          {start > 2 && <span className="px-1 text-ink-soft">…</span>}
        </>
      )}

      {pages.map((p) => (
        <PageLink key={p} href={buildHref(p)} active={p === page} label={`${p}. sayfa`}>
          {p}
        </PageLink>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-ink-soft">…</span>}
          <PageLink href={buildHref(totalPages)}>{totalPages}</PageLink>
        </>
      )}

      <PageLink href={buildHref(page + 1)} disabled={page >= totalPages} label="Sonraki sayfa">
        ›
      </PageLink>
    </nav>
  );
}
