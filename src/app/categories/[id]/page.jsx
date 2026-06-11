import { redirect } from "next/navigation";

export default async function CategoryDetailPage({ params }) {
  const { id } = await params;
  redirect(`/products?categoryId=${id}`);
}
