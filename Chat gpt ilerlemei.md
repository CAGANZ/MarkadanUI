Sana bir proje aktarımı yapacağım. Bu projeyi “Markadan E-shopping” olarak düşünebilirsin. Lütfen bana bu proje hakkında tüm bilinmesi gerekenleri (teknik altyapı, mimari, ilişkiler, sprint yaklaşımı, aldığımız kararlar, yaşanmış hatalar ve çözümleri) özet halinde ver. Amacım, projeyi yeni bir sohbette sıfırdan başlatmak zorunda kalmamak.

Bilgiler şunlar:

- Proje Adı: Markadan (doğru yazım bu)
- Konsept: E-shopping platformu
- Backend: .NET 9, Onion Architecture, Entity Framework Core, JWT auth (role-based access)
- Frontend: React (Vite), Redux, Tailwind
- İlişkiler:
   • Ürün ↔ Kategori (bir ürün birden fazla kategoriye ait olabilir)  
   • Kullanıcı ↔ Rol (Admin/User)  
   • Sepet sistemi ileride eklenecek  

- Önemli Kararlar:  
   • Slug kullanılmayacak  
   • Sprint mantığında ilerliyoruz  
   • Admin ve User login süreçleri JWT ile güvenceye alınıyor  

- Sprint Yaklaşımı:  
   • Sprint-1: ürün ve kategori uç noktaları, temel backend yapı taşları  
   • Sprint-2: kullanıcı kayıt/giriş, JWT auth, admin yönetimi  
   • Sprint-3 ve sonrası: sepet sistemi, ödeme, ileri seviye özellikler  

- Daha Önce Yaşanan Sorunlar ve Çözümleri:  
   • Migration hatası: `Your target project 'IKPro.API' doesn't match your migrations assembly...` → Çözüm: Migration’lar DbContext’in bulunduğu katmandan (Infrastructure) alınmalı.  
   • Base64 logo kaydederken `String or binary data would be truncated` hatası → Çözüm: Logo kolonunun nvarchar(4000) yerine daha uygun veri tipi ve boyut kullanıldı.  
   • Next.js `fetch` ile API çağrılarında `agent` parametresi sorun çıkardı → Çözüm: `https.Agent` devre dışı bırakıldı, `cache: "no-store"` ile devam edildi.  
   • JWT claim’lerinde XML namespace formatlı keyler kullanıldığı için frontend decode sırasında özel parsing gerekti.  

Şimdi senden isteğim: Yukarıdaki bilgileri toparlayarak “Markadan projesi hakkında bilmem gereken her şeyi” (teknik yapı, mimari, sprint planı, önemli kararlar, geçmişte yaşanmış sorunlar ve çözümleri dahil) bana tek mesajda yeniden özetle. Böylece yeni sohbete geçtiğimde sıfırdan başlamama gerek kalmasın.
