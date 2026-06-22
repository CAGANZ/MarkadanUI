"use client";
import { use, useEffect, useState } from "react";
import { api } from "@/lib/client/api";
import CouponForm from "../../CouponForm";
import Skeleton from "@/components/ui/Skeleton";

export default function EditCouponPage({ params }) {
  const { id } = use(params);
  const [coupon, setCoupon] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api(`/admin/coupons/${id}`)
      .then(setCoupon)
      .catch((err) => setError(err.detail || "Kupon yüklenemedi"));
  }, [id]);

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-8">
        <p role="alert" className="rounded-base bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
          {error}
        </p>
      </div>
    );
  }

  if (!coupon) {
    return (
      <div className="mx-auto max-w-xl space-y-4 px-4 py-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  return <CouponForm initial={coupon} couponId={id} />;
}
