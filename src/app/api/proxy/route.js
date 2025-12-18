import { parse } from "cookie";

async function handleProxy(request) {
  try {
    const url = new URL(request.url);
    const path = url.searchParams.get("path");
    if (!path) {
      return new Response(
        JSON.stringify({ error: "Missing path query param" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Build target URL (trim slashes)
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(
      /\/+$/,
      ""
    );
    const cleanPath = path.replace(/^\/+/, "");
    const fullUrl = `${base}/${cleanPath}`;

    // Parse cookies from incoming request
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = parse(cookieHeader);
    const accessToken = cookies.accessToken || "";

    // if (!accessToken) {
    //   return new Response(JSON.stringify({ error: "Access token missing from cookies" }), {
    //     status: 401,
    //     headers: { "Content-Type": "application/json" },
    //   });
    // }

    // Build headers to forward
    const forwardHeaders = new Headers();
    const incomingAuthHeader = request.headers.get("authorization");

    if (incomingAuthHeader) {
      // Use the Authorization header from the request (Firebase token for login)
      forwardHeaders.set("Authorization", incomingAuthHeader);
    } else if (accessToken) {
      forwardHeaders.set("Authorization", `Bearer ${accessToken}`);
    }

    if (process.env.NEXT_PUBLIC_AUTH_TOKEN) {
      forwardHeaders.set("auth-token", process.env.NEXT_PUBLIC_AUTH_TOKEN);
    }
    forwardHeaders.set("platform", "web");

    // Forward user's content-type (if any)
    const incomingContentType = request.headers.get("content-type");
    if (incomingContentType)
      forwardHeaders.set("Content-Type", incomingContentType);

    const fetchOptions = {
      method: request.method,
      headers: forwardHeaders,
      redirect: "follow",
    };

    // Forward body for non-GET/HEAD requests
    if (request.method !== "GET" && request.method !== "HEAD") {
      // read raw bytes and forward as-is so JSON, form-data, etc. all work
      const bodyBuffer = await request.arrayBuffer();
      if (bodyBuffer && bodyBuffer.byteLength > 0) {
        fetchOptions.body = bodyBuffer;
      }
    }

    const backendRes = await fetch(fullUrl, fetchOptions);

    // Return backend response (status + headers + body) to the client
    // Read response as ArrayBuffer to pipe it through exactly.
    const respBuffer = await backendRes.arrayBuffer();
    // Copy headers so browser can read content-type, etc.
    const respHeaders = new Headers(backendRes.headers);

    return new Response(respBuffer, {
      status: backendRes.status,
      headers: respHeaders,
    });
  } catch (err) {
    console.error("Proxy error:", err);
    console.log("Proxy error:", err);
    return new Response(JSON.stringify({ error: "Proxy failed" , message: err }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(request) {
  return handleProxy(request);
}

export async function GET(request) {
  return handleProxy(request);
}

export async function PUT(request) {
  return handleProxy(request);
}

export async function DELETE(request) {
  return handleProxy(request);
}

export async function PATCH(request) {
  return handleProxy(request);
}
