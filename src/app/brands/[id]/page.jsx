import { redirect } from "next/navigation";

export default async function BrandDetailPage({ params }) {
  const { id } = await params;
  redirect(`/products?brandId=${id}`);
}
