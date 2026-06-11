"use client";
// src/components/admin/AdminGuard.jsx
// Admin sayfalarını korur: oturum yoksa login'e (next= ile), isAdmin değilse ana sayfaya.
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Skeleton from "@/components/ui/Skeleton";

export default function AdminGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    else if (!user.isAdmin) router.replace("/");
  }, [user, loading, router, pathname]);

  if (loading || !user?.isAdmin) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-8">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return children;
}
