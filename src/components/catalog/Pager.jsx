// src/components/catalog/Pager.jsx
// URL tabanlı sayfalama — RSC içinde kullanılır, JS gerektirmez.
import Link from "next/link";

function PageBtn({ p, active, disabled, onPage, children, label }) {
  if (disabled) {
    return (
      <span className="rounded-base border border-line px-3 py-2 text-sm text-ink-soft opacity-40">
        {children}
      </span>
    );
  }
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? "page" : undefined}
      onClick={() => onPage(p)}
      className={`rounded-base border px-3 py-2 text-sm transition-colors ${
        active
          ? "border-primary bg-primary font-bold text-white"
          : "border-line bg-surface-card text-ink hover:bg-primary-soft"
      }`}
    >
      {children}
    </button>
  );
}

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

// onPage prop varsa client-side (onClick), yoksa URL tabanlı (buildHref)
export default function Pager({ page, totalPages, buildHref, onPage }) {
  if (totalPages <= 1) return null;

  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  if (onPage) {
    return (
      <nav className="flex flex-wrap items-center justify-center gap-2" aria-label="Sayfalama">
        <PageBtn p={page - 1} disabled={page <= 1} onPage={onPage} label="Önceki sayfa">‹</PageBtn>
        {start > 1 && (
          <>
            <PageBtn p={1} onPage={onPage} active={page === 1}>1</PageBtn>
            {start > 2 && <span className="px-1 text-ink-soft">…</span>}
          </>
        )}
        {pages.map((p) => (
          <PageBtn key={p} p={p} active={p === page} onPage={onPage} label={`${p}. sayfa`}>
            {p}
          </PageBtn>
        ))}
        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-1 text-ink-soft">…</span>}
            <PageBtn p={totalPages} onPage={onPage}>{totalPages}</PageBtn>
          </>
        )}
        <PageBtn p={page + 1} disabled={page >= totalPages} onPage={onPage} label="Sonraki sayfa">›</PageBtn>
      </nav>
    );
  }

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
