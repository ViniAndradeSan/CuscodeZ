import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    NODE_ENV: process.env.NODE_ENV ?? null,
    PROJECT_ROOT: process.cwd(),
    GROQ_API_KEY: process.env.GROQ_API_KEY ? "SET" : "UNSET",
    GROQ_API_KEY_LENGTH: process.env.GROQ_API_KEY?.length ?? 0,
    GROQ_API_URL: process.env.GROQ_API_URL ?? null,
  });
}
