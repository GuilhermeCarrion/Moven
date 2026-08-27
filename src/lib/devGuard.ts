import { NextResponse } from "next/server";

export function devOnly() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }
  return null;
}
