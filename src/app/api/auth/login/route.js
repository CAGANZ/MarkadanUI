// src/app/api/auth/login/route.js
export async function POST(request) {
  try {
    const body = await request.json();
    
    const backendUrl = process.env.BACKEND_URL || "https://localhost:7220";
    
    const response = await fetch(`${backendUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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

