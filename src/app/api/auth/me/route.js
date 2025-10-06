// src/app/api/auth/me/route.js
export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response("Yetkilendirme gerekli", {
        status: 401,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }

    const token = authHeader.substring(7);
    const backendUrl = process.env.BACKEND_URL || "https://localhost:7220";
    
    const response = await fetch(`${backendUrl}/auth/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(errorText, {
        status: response.status,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }

    const data = await response.json();
    
    return Response.json(data);
  } catch (error) {
    return new Response("Sunucu hatası", {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}

