import { createClient } from "./supabase/server";
import { DEFAULT_SETTINGS, DEFAULT_CATEGORY_SEEDS } from "./utils";
import type { SiteSettings, Category, Artwork, ServiceItem } from "@/types/database";

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .limit(1)
      .single();

    if (error || !data) {
      return DEFAULT_SETTINGS;
    }
    return data as SiteSettings;
  } catch (err) {
    console.warn("Failed to fetch site settings, using fallback:", err);
    return DEFAULT_SETTINGS;
  }
}

export async function getActiveCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*, artworks(count)")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_CATEGORY_SEEDS.map((c, i) => ({
        id: `fallback-${i}`,
        name: c.name || "",
        slug: c.slug || "",
        sort_order: c.sort_order || i + 1,
        is_active: true,
        cover_image_url:
          c.cover_image_url ||
          "/images/hero-art.jpg",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        artworks_count: 1,
      }));
    }

    return data.map((cat: any) => ({
      ...cat,
      artworks_count: cat.artworks?.[0]?.count || 0,
    })) as Category[];
  } catch (err) {
    console.warn("Categories fetch error:", err);
    return [];
  }
}

const FALLBACK_ARTWORKS: Artwork[] = [
  {
    id: "art-1",
    title: "Viper-07: Cyber Assassin Reaver",
    slug: "viper-07-cyber-assassin",
    category: {
      id: "cat-1",
      name: "OC Character",
      slug: "oc-character",
      sort_order: 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    short_description: "Futuristic dual-blade techwear assassin in Neo-Kyoto.",
    description: "Original character concept exploring tactical techwear, energy katana slash particles, and dark cyberpunk street architecture.",
    main_image_url: "/images/cat-oc-character.jpg",
    tags: ["OC Character", "Techwear", "Katana", "Cyberpunk"],
    is_featured: true,
    is_published: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "art-2",
    title: "Runes of the Dragon King",
    slug: "runes-of-the-dragon-king",
    category: {
      id: "cat-2",
      name: "Book Cover",
      slug: "book-cover",
      sort_order: 2,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    short_description: "Epic dark fantasy light novel book cover with glowing dragon runes.",
    description: "Full wrap-around fantasy novel cover typography and key art illustrating the dragon portal awakening.",
    main_image_url: "/images/cat-book-cover.jpg",
    tags: ["Book Cover", "Fantasy", "Light Novel", "Dragon"],
    is_featured: true,
    is_published: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "art-3",
    title: "Astraea: Celestial Star Spellcaster",
    slug: "astraea-celestial-spellcaster",
    category: {
      id: "cat-3",
      name: "2D Character",
      slug: "2d-character",
      sort_order: 3,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    short_description: "Vibrant cel-shaded anime battle mage summoning starry pentagram glyphs.",
    description: "2D character splash art with dynamic twin-tails, celestial magic circles, and cosmic stellar dust.",
    main_image_url: "/images/cat-2d-character.jpg",
    tags: ["2D Character", "Cel Shaded", "Anime", "Magic"],
    is_featured: true,
    is_published: true,
    sort_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "art-4",
    title: "Apex Mecha Valkyrie 3D",
    slug: "apex-mecha-valkyrie-3d",
    category: {
      id: "cat-4",
      name: "3D Character",
      slug: "3d-character",
      sort_order: 4,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    short_description: "Next-gen 3D cybernetic warrior sculpt render with emissive conduits.",
    description: "Hard-surface modeling in ZBrush and Blender with PBR texturing and modular armor plating.",
    main_image_url: "/images/cat-3d-character.jpg",
    tags: ["3D Character", "ZBrush", "Blender", "Octane"],
    is_featured: true,
    is_published: true,
    sort_order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "art-5",
    title: "Cyberpunk Stream Broadcast Suite",
    slug: "cyberpunk-stream-broadcast-suite",
    category: {
      id: "cat-5",
      name: "Overlay",
      slug: "overlay",
      sort_order: 5,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    short_description: "Broadcast stream overlay package with cybernetic HUD and camera borders.",
    description: "Custom tailored Twitch streaming package including animated Starting Soon screen and transparent glass cards.",
    main_image_url: "/images/cat-overlay.jpg",
    tags: ["Overlay", "Twitch", "Stream Design", "HUD"],
    is_featured: true,
    is_published: true,
    sort_order: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "art-6",
    title: "Kitsune & Catgirl Emote Pack",
    slug: "kitsune-catgirl-emote-pack",
    category: {
      id: "cat-6",
      name: "Emotes",
      slug: "emotes",
      sort_order: 6,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    short_description: "Set of 6 expressive anime stickers for Twitch sub badges and Discord servers.",
    description: "Pixel-perfect readability at 28px, 56px, and 112px featuring Hype, Cry, Boba, Rage, GG, and Lurk.",
    main_image_url: "/images/cat-emotes.jpg",
    tags: ["Emotes", "Chibi", "Twitch", "Discord"],
    is_featured: true,
    is_published: true,
    sort_order: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "art-7",
    title: "Volt Strike God Mode Clutch",
    slug: "volt-strike-god-mode-clutch",
    category: {
      id: "cat-7",
      name: "Thumbnail",
      slug: "thumbnail",
      sort_order: 7,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    short_description: "High-voltage YouTube gaming anime thumbnail with lightning overdrive.",
    description: "Optimized click-through rate design with electric aura effects, bold typographic styling, and action speed lines.",
    main_image_url: "/images/cat-thumbnail.jpg",
    tags: ["Thumbnail", "YouTube", "Gaming", "CTR"],
    is_featured: true,
    is_published: true,
    sort_order: 7,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "art-8",
    title: "Tokyo 20XX Nights Unleashed",
    slug: "tokyo-20xx-nights-unleashed",
    category: {
      id: "cat-8",
      name: "Banner",
      slug: "banner",
      sort_order: 8,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    short_description: "Panoramic neon cyberpunk cityscape banner with towering titan mecha.",
    description: "High-resolution banner artwork crafted for Twitch, YouTube header, and Twitter/X branding.",
    main_image_url: "/images/cat-banner.jpg",
    tags: ["Banner", "Header", "Twitch", "Cyberpunk"],
    is_featured: true,
    is_published: true,
    sort_order: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "art-9",
    title: "Cybernetic Samurai Esports Crest",
    slug: "cybernetic-samurai-esports-crest",
    category: {
      id: "cat-9",
      name: "Logos",
      slug: "logos",
      sort_order: 9,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    short_description: "Fierce robotic samurai mascot emblem on carbon fiber weave.",
    description: "Vector-grade esports logo mark with glowing red eyes, golden horn crest, and aggressive silhouette.",
    main_image_url: "/images/cat-logos.jpg",
    tags: ["Logos", "Mascot", "Esports", "Samurai"],
    is_featured: false,
    is_published: true,
    sort_order: 9,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "art-10",
    title: "Kitsune Shrine Maiden Live2D",
    slug: "kitsune-shrine-maiden-live2d",
    category: {
      id: "cat-10",
      name: "VTuber",
      slug: "vtuber",
      sort_order: 10,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    short_description: "Full-body Live2D model with nine glowing tails and ceremonial cyber-kimono.",
    description: "Detailed VTuber model illustration cut into 150+ layers for facial tracking and physics simulation in VTube Studio.",
    main_image_url: "/images/cat-vtuber.jpg",
    tags: ["VTuber", "Live2D", "Anime", "Kitsune"],
    is_featured: true,
    is_published: true,
    sort_order: 10,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "art-11",
    title: "Aetheria Celestial Floating Sanctum",
    slug: "aetheria-celestial-floating-sanctum",
    category: {
      id: "cat-11",
      name: "Art Scenes",
      slug: "art-scenes",
      sort_order: 11,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    short_description: "Floating oriental sky palace amidst glowing waterfalls and twin moons.",
    description: "Cinematic anime environment scene inspired by Makoto Shinkai's cloudscapes and Genshin Impact architecture.",
    main_image_url: "/images/cat-art-scenes.jpg",
    tags: ["Art Scenes", "Background", "Environment", "Anime"],
    is_featured: true,
    is_published: true,
    sort_order: 11,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "art-12",
    title: "Cybernix VRChat Avatar",
    slug: "cybernix-vrchat-avatar",
    category: {
      id: "cat-12",
      name: "VRChat Avatars",
      slug: "vrchat-avatars",
      sort_order: 12,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    short_description: "Optimized humanoid VRChat avatar with physbones and neon emission toggles.",
    description: "Medium performance rank avatar setup in Unity with custom facial gestures and audio-link reactivity.",
    main_image_url: "/images/cat-vrchat-avatar.jpg",
    tags: ["VRChat Avatars", "Unity", "PhysBones", "Anime"],
    is_featured: true,
    is_published: true,
    sort_order: 12,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function getFeaturedArtworks(): Promise<Artwork[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("artworks")
      .select("*, category:categories(*)")
      .eq("is_published", true)
      .eq("is_featured", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(6);

    const dbArtworks = (!error && data) ? (data as Artwork[]) : [];
    const existingSlugs = new Set(dbArtworks.map((a) => a.slug));
    const merged = [
      ...dbArtworks,
      ...FALLBACK_ARTWORKS.filter((a) => a.is_featured && !existingSlugs.has(a.slug)),
    ];
    return merged.slice(0, 6);
  } catch (err) {
    console.warn("Featured artworks fetch error, using fallback:", err);
    return FALLBACK_ARTWORKS.filter((a) => a.is_featured).slice(0, 6);
  }
}

export async function getRecentArtworks(): Promise<Artwork[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("artworks")
      .select("*, category:categories(*)")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(6);

    const dbArtworks = (!error && data) ? (data as Artwork[]) : [];
    const existingSlugs = new Set(dbArtworks.map((a) => a.slug));
    const merged = [
      ...dbArtworks,
      ...FALLBACK_ARTWORKS.filter((a) => !existingSlugs.has(a.slug)),
    ];
    return merged.slice(0, 6);
  } catch (err) {
    console.warn("Recent artworks fetch error, using fallback:", err);
    return FALLBACK_ARTWORKS.slice(0, 6);
  }
}

export async function getActiveServices(): Promise<ServiceItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error || !data) return [];
    return data as ServiceItem[];
  } catch (err) {
    console.warn("Services fetch error:", err);
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .single();

    if (!error && data) {
      return data as Category;
    }
  } catch (err) {
    console.warn("Category fetch by slug error:", err);
  }

  // Fallback to default seeds
  const found = DEFAULT_CATEGORY_SEEDS.find(
    (c) => c.slug === slug || (c.name && c.name.toLowerCase().replace(/\s+/g, "-") === slug)
  );

  if (found) {
    return {
      id: `fallback-${found.slug}`,
      name: found.name || "",
      slug: found.slug || slug,
      description: `Bespoke, high-end ${found.name} collection engineered for professional creators and clients.`,
      cover_image_url: found.cover_image_url || "/images/hero-art.jpg",
      sort_order: found.sort_order || 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return null;
}

export async function getArtworksByCategory(
  categoryId: string,
  categorySlug?: string
): Promise<Artwork[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("artworks")
      .select("*, category:categories(*)")
      .eq("category_id", categoryId)
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    const dbArtworks = (!error && data) ? (data as Artwork[]) : [];
    const existingSlugs = new Set(dbArtworks.map((a) => a.slug));

    const fallbackMatches = FALLBACK_ARTWORKS.filter(
      (art) =>
        !existingSlugs.has(art.slug) &&
        (art.category?.id === categoryId ||
          art.category?.slug === categorySlug ||
          (categorySlug && art.category?.slug?.includes(categorySlug)) ||
          (categorySlug && categorySlug.includes(art.category?.slug || "")))
    );

    return [...dbArtworks, ...fallbackMatches];
  } catch (err) {
    console.warn("Artworks by category fetch error:", err);
    return FALLBACK_ARTWORKS.filter(
      (art) =>
        art.category?.id === categoryId ||
        art.category?.slug === categorySlug
    );
  }
}

export async function getArtworkBySlug(slug: string): Promise<Artwork | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("artworks")
      .select("*, category:categories(*), artwork_images(*)")
      .eq("slug", slug)
      .single();

    if (!error && data) {
      return data as Artwork;
    }
  } catch (err) {
    console.warn("Artwork fetch by slug error:", err);
  }

  // Fallback
  const found = FALLBACK_ARTWORKS.find((a) => a.slug === slug);
  if (found) {
    return {
      ...found,
      artwork_images: [
        {
          id: `img-${found.id}-1`,
          artwork_id: found.id,
          image_url: found.main_image_url,
          sort_order: 1,
          caption: "Primary Master Render",
          created_at: new Date().toISOString(),
        },
      ],
    };
  }

  return null;
}

export async function getRelatedArtworks(
  categoryId: string,
  excludeId: string
): Promise<Artwork[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("artworks")
      .select("*, category:categories(*)")
      .eq("category_id", categoryId)
      .eq("is_published", true)
      .neq("id", excludeId)
      .limit(4);

    if (!error && data && data.length > 0) {
      return data as Artwork[];
    }
  } catch (err) {
    console.warn("Related artworks fetch error:", err);
  }

  return FALLBACK_ARTWORKS.filter(
    (a) => a.id !== excludeId && (a.category?.id === categoryId || true)
  ).slice(0, 4);
}
