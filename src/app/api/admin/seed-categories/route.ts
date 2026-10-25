import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_CATEGORY_SEEDS } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const supabase = await createClient();

    // Fetch existing categories
    const { data: existing, error: fetchErr } = await supabase
      .from("categories")
      .select("slug");

    if (fetchErr) {
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    const existingSlugs = new Set((existing || []).map((c) => c.slug));
    const toInsert = DEFAULT_CATEGORY_SEEDS.filter(
      (c) => c.slug && !existingSlugs.has(c.slug)
    ).map((c, i) => ({
      name: c.name,
      slug: c.slug,
      description: `Premium ${c.name} concept artworks, commission designs, and client showcases.`,
      cover_image_url: c.cover_image_url,
      sort_order: c.sort_order || i + 1,
      is_active: true,
    }));

    if (toInsert.length === 0) {
      return NextResponse.json({
        message: "All categories already exist in database.",
        inserted: 0,
      });
    }

    const { data, error: insertErr } = await supabase
      .from("categories")
      .insert(toInsert)
      .select();

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({
      message: `Successfully seeded ${toInsert.length} categories.`,
      inserted: toInsert.length,
      data,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
