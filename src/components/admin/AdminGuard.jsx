"use client";
// src/components/admin/AdminGuard.jsx
// Admin sayfalarını korur: oturum yoksa login'e, isAdmin değilse ana sayfaya.
// (Backend zaten 403 döner; bu katman kullanıcı deneyimi içindir.)
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Skeleton from "@/components/ui/Skeleton";

export default function AdminGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login?next=/admin");
    else if (!user.isAdmin) router.replace("/");
  }, [user, loading, router]);

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
