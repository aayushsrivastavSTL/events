import { serialize } from "cookie";

export async function POST(request) {
  const { accessToken } = await request.json();

  if (!accessToken) {
    return new Response(JSON.stringify({ message: "Missing token" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const headers = new Headers();

  // Access token (only set if not "none")
  if (accessToken !== "none") {
    headers.append(
      "Set-Cookie",
      serialize("accessToken", accessToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 365 * 50,
        sameSite: "lax",
        path: "/",
      })
    );
  }

  headers.append("Content-Type", "application/json");

  return new Response(
    JSON.stringify({ message: "Cookies set successfully" }),
    { status: 200, headers }
  );
}
