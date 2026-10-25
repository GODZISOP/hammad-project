import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const startTime = Date.now();

    // Query lightweight table to keep database awake
    const { data, error } = await supabase
      .from("categories")
      .select("id")
      .limit(1);

    const duration = Date.now() - startTime;

    if (error) {
      return NextResponse.json(
        {
          status: "error",
          message: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "active",
      message: "Supabase database keep-alive heartbeat successful",
      latencyMs: duration,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Heartbeat failed";
    return NextResponse.json({ status: "error", message: msg }, { status: 500 });
  }
}
