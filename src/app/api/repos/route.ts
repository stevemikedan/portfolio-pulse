import { NextResponse } from "next/server";
import { getRepoPaths, setRepoPaths } from "@/lib/repo-store";

export async function GET() {
  return NextResponse.json(getRepoPaths());
}

export async function PUT(req: Request) {
  let paths: unknown;
  try {
    paths = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(paths) || paths.some((p) => typeof p !== "string")) {
    return NextResponse.json({ error: "Body must be a string array" }, { status: 400 });
  }

  setRepoPaths(paths as string[]);
  return NextResponse.json(getRepoPaths());
}
