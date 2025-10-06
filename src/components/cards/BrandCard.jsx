import Link from "next/link";

export default function BrandCard({ id, name, href, imageUrl }) {
  const to = href || `/brands/${id}`;
  const defaultImg = "https://images.unsplash.com/photo-1667840578922-98e2a31aff95?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  const img = imageUrl || defaultImg; // DB'den gelmezse global varsayılan görsel

  return (
    <Link
      href={to}
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-white shadow-md border border-neutral-200 transition hover:shadow-xl hover:scale-[1.02]"
    >
      <div className="relative aspect-[4/3] w-full">
        <img
          src={img}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
        <h3 className="absolute bottom-3 left-3 text-lg font-bold text-white drop-shadow-md">
          {name}
        </h3>
      </div>

      <div className="mt-auto flex items-center justify-center bg-[#FFE2A7] text-neutral-900 text-sm font-bold px-3 py-2 transition group-hover:bg-[#FFD88A]">
        Marka sayfası →
      </div>
    </Link>
  );
}
