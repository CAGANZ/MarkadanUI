"use client";
// src/components/ui/Button.jsx
// Tek buton bileşeni — tüm projede sabit renk yerine tema utility'leri.
import { cloneElement } from "react";

const VARIANTS = {
  primary:
    "bg-primary text-white hover:opacity-90 active:opacity-80 disabled:opacity-40",
  secondary:
    "bg-primary-soft text-primary hover:bg-line active:opacity-80 disabled:opacity-40",
  ghost:
    "bg-transparent text-ink hover:bg-primary-soft active:opacity-80 disabled:opacity-40",
  danger:
    "bg-danger text-white hover:opacity-90 active:opacity-80 disabled:opacity-40",
  accent:
    "bg-accent text-white hover:opacity-90 active:opacity-80 disabled:opacity-40",
};

const SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className = "",
  type = "button",
  asChild = false,
  ...props
}) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-base font-semibold transition-colors select-none ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  if (asChild) {
    return cloneElement(children, {
      className: `${cls} ${children.props.className ?? ""}`.trim(),
      ...props,
    });
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cls}
      {...props}
    >
      {loading && (
        <span
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden
        />
      )}
      {children}
    </button>
  );
}
