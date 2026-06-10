"use client";
// src/components/ui/Input.jsx
// Etiket + hata mesajı destekli form girdisi.
import { useId } from "react";

export default function Input({
  label,
  error,
  hint,
  className = "",
  ...props
}) {
  const id = useId();
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className={`rounded-base border bg-surface-card px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/60 focus:border-primary ${
          error ? "border-danger" : "border-line"
        }`}
        {...props}
      />
      {hint && !error && <p className="text-xs text-ink-soft">{hint}</p>}
      {error && (
        <p id={`${id}-err`} className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
