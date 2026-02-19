import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const auth = process.env.OPTIMIZELY_GRAPH_AUTH;
  if (!auth) {
    return NextResponse.json({ error: "Missing OPTIMIZELY_GRAPH_AUTH in environment" }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const res = await fetch(`https://cg.optimizely.com/content/v2?auth=${encodeURIComponent(auth)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "content-type": "application/json" },
  });
}
