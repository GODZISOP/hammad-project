-- ==============================================================================
-- ART PORTFOLIO SEED DATA
-- Default Categories, Initial Site Settings, Services & Sample Artworks
-- ==============================================================================

-- 1. Insert Initial Site Settings
INSERT INTO public.site_settings (
  id,
  site_name,
  site_logo_url,
  site_description,
  hero_label,
  hero_heading,
  hero_description,
  hero_image_url,
  primary_cta_text,
  primary_cta_link,
  secondary_cta_text,
  secondary_cta_link,
  about_heading,
  about_description,
  about_image_url,
  experience_text,
  stats_projects,
  stats_clients,
  stats_categories,
  contact_email,
  discord,
  instagram,
  twitter,
  artstation,
  footer_text,
  copyright_text,
  primary_color,
  secondary_color
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'LUMINA // Digital Art Studio',
  NULL,
  'High-end creative portfolio featuring character design, 3D modeling, VTuber avatars, stream assets, and digital art.',
  'DIGITAL ART & CREATIVE DESIGN',
  'Creative Art That Brings Ideas To Life',
  'A curated collection of original characters, virtual avatars, immersive overlays, and digital designs crafted with artistic obsession.',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
  'Explore Portfolio',
  '/gallery',
  'Start a Project',
  '/contact',
  'Crafting Immersive Visual Identities & Digital Worlds',
  'We specialize in transforming conceptual visions into breathtaking digital realities. From bespoke VTuber models to high-impact streaming packages and fantasy book covers, every piece is sculpted with precision and passion.',
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
  'Over 7 years designing for international creators, authors, streamers, and game studios.',
  '500+',
  '120+',
  '12',
  'commissions@luminastudio.art',
  'lumina_artist#0001',
  'https://instagram.com',
  'https://x.com',
  'https://artstation.com',
  'Elevating digital presence with bespoke characters, virtual avatars, and custom stream branding.',
  '© 2026 LUMINA Creative Studio. All rights reserved.',
  '#8b5cf6',
  '#ec4899'
) ON CONFLICT (id) DO UPDATE SET
  hero_heading = EXCLUDED.hero_heading,
  hero_description = EXCLUDED.hero_description;

-- 2. Insert The 12 Default Categories
INSERT INTO public.categories (id, name, slug, description, cover_image_url, sort_order, is_active)
VALUES
  (
    'c0000000-0000-0000-0000-000000000001',
    'OC Character',
    'oc-character',
    'Bespoke original character concepts, detailed concept art, and vibrant costume turnarounds.',
    'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1000&q=80',
    1,
    true
  ),
  (
    'c0000000-0000-0000-0000-000000000002',
    'Book Cover',
    'book-cover',
    'Atmospheric fantasy, sci-fi, and romance book jacket illustrations and commercial typography.',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80',
    2,
    true
  ),
  (
    'c0000000-0000-0000-0000-000000000003',
    '2D Character',
    '2d-character',
    'Stylized digital 2D character illustrations, splash art, and anime-inspired visual assets.',
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1000&q=80',
    3,
    true
  ),
  (
    'c0000000-0000-0000-0000-000000000004',
    '3D Character',
    '3d-character',
    'Next-gen 3D sculpts, game-ready topology, and photorealistic or stylized character renders.',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
    4,
    true
  ),
  (
    'c0000000-0000-0000-0000-000000000005',
    'Overlay',
    'overlay',
    'Premium animated and static Twitch/YouTube stream screens, chat boxes, and HUD setups.',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1000&q=80',
    5,
    true
  ),
  (
    'c0000000-0000-0000-0000-000000000006',
    'Emotes',
    'emotes',
    'Expressive, readable custom Twitch & Discord emotes and channel badges designed to pop at all sizes.',
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=80',
    6,
    true
  ),
  (
    'c0000000-0000-0000-0000-000000000007',
    'Thumbnail',
    'thumbnail',
    'High-CTR, visually captivating YouTube thumbnail art engineered for maximum click impact.',
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1000&q=80',
    7,
    true
  ),
  (
    'c0000000-0000-0000-0000-000000000008',
    'Banner',
    'banner',
    'Branded header art and promotional banners for Twitter/X, YouTube, Kick, and Twitch channels.',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
    8,
    true
  ),
  (
    'c0000000-0000-0000-0000-000000000009',
    'Logos',
    'logos',
    'Distinctive gaming crests, streamer insignias, and esports brand marks with vector clarity.',
    'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1000&q=80',
    9,
    true
  ),
  (
    'c0000000-0000-0000-0000-000000000010',
    'VTuber',
    'vtuber',
    'Live2D cut models, advanced rigging separation, and full-body virtual streamer avatars.',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=80',
    10,
    true
  ),
  (
    'c0000000-0000-0000-0000-000000000011',
    'Art Scenes',
    'art-scenes',
    'Cinematic environments, cyberpunk cities, and moody fantasy landscape concept paintings.',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80',
    11,
    true
  ),
  (
    'c0000000-0000-0000-0000-000000000012',
    'VRChat Avatars',
    'vrchat-avatars',
    'Optimized 3D VRChat avatars equipped with physbones, gesture toggles, and dynamic shaders.',
    'https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?auto=format&fit=crop&w=1000&q=80',
    12,
    true
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  cover_image_url = EXCLUDED.cover_image_url,
  sort_order = EXCLUDED.sort_order;

-- 3. Insert Default Services
INSERT INTO public.services (id, title, slug, description, icon, sort_order, is_active)
VALUES
  (
    's0000000-0000-0000-0000-000000000001',
    'Custom Character Design',
    'custom-character-design',
    'From rough brainstorm sketch to finished splash art and detailed costume turnaround sheets for games and books.',
    'UserCheck',
    1,
    true
  ),
  (
    's0000000-0000-0000-0000-000000000002',
    'VTuber Models & Rigging',
    'vtuber-models',
    'High-resolution Live2D cut models with precise layer separation, physics rigging, and expressive facial toggles.',
    'Video',
    2,
    true
  ),
  (
    's0000000-0000-0000-0000-000000000003',
    'VRChat Avatar Creation',
    'vrchat-avatar-creation',
    'Custom Unity setup, quest compatibility options, dynamic bone physics, and custom emote wheel integration.',
    'Glasses',
    3,
    true
  ),
  (
    's0000000-0000-0000-0000-000000000004',
    'Stream Overlays & Branding',
    'stream-overlays-branding',
    'Complete broadcast packages including Starting, BRB, and Ending screens, camera borders, and stinger transitions.',
    'Layout',
    4,
    true
  ),
  (
    's0000000-0000-0000-0000-000000000005',
    'Illustrated Book Covers',
    'illustrated-book-covers',
    'Front, spine, and back cover layouts formatted for Amazon KDP, IngramSpark, and luxury hardcovers.',
    'BookOpen',
    5,
    true
  ),
  (
    's0000000-0000-0000-0000-000000000006',
    'Custom Emotes & Badges',
    'custom-emotes-badges',
    'Pixel-perfect illustrated emotes delivered in all required sub badge and emote resolutions.',
    'Smile',
    6,
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- 4. Insert Initial Portfolio Artworks
INSERT INTO public.artworks (
  id,
  title,
  slug,
  category_id,
  short_description,
  description,
  main_image_url,
  tags,
  external_url,
  is_featured,
  is_published,
  sort_order,
  seo_title,
  seo_description
) VALUES
  (
    'b0000000-0000-0000-0000-000000000001',
    'Aetheria: Celestial Sorceress',
    'aetheria-celestial-sorceress',
    'c0000000-0000-0000-0000-000000000001',
    'Original character concept exploring stellar energy and celestial robes.',
    'Aetheria is an original celestial sorceress designed for high-fantasy projects. Features deep amethyst and starlight color palettes, intricate hand-painted garment detailing, and magical starlight particles.',
    'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80',
    ARRAY['OC', 'Fantasy', 'Character Design', 'Digital Art', 'Magic'],
    'https://artstation.com',
    true,
    true,
    1,
    'Aetheria: Celestial Sorceress // OC Character Design',
    'Original character concept exploring stellar energy and celestial robes.'
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'Chronicles of the Iron Star',
    'chronicles-of-the-iron-star',
    'c0000000-0000-0000-0000-000000000002',
    'Sci-fi epic fantasy book cover jacket artwork and title lettering.',
    'Commissioned book cover artwork featuring the desolate desert planet of Kael-9 and a looming dreadnought class carrier. Painted in Clip Studio Paint and Photoshop.',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
    ARRAY['Book Cover', 'Sci-Fi', 'Illustration', 'Commercial Art'],
    NULL,
    true,
    true,
    2,
    'Chronicles of the Iron Star // Sci-Fi Book Cover',
    'Sci-fi epic fantasy book cover jacket artwork and title lettering.'
  ),
  (
    'b0000000-0000-0000-0000-000000000003',
    'Nyx: Midnight Assassin',
    'nyx-midnight-assassin',
    'c0000000-0000-0000-0000-000000000003',
    'Dynamic anime splash illustration with neon purple edge lighting.',
    'High-octane stylized 2D character piece. Developed for a mobile action RPG with complex shadow layers and vibrant lighting contrasts.',
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
    ARRAY['2D Character', 'Anime', 'Splash Art', 'Action'],
    NULL,
    true,
    true,
    3,
    'Nyx: Midnight Assassin // 2D Character Splash Art',
    'Dynamic anime splash illustration with neon purple edge lighting.'
  ),
  (
    'b0000000-0000-0000-0000-000000000004',
    'Apex Mecha Valkyrie',
    'apex-mecha-valkyrie',
    'c0000000-0000-0000-0000-000000000004',
    'Detailed 3D hard-surface sculpt and render in Blender & ZBrush.',
    'Full 3D character pipeline showcasing cybernetic wings, modular armor plating, and PBR texturing with emissive neon conduits.',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    ARRAY['3D Character', 'ZBrush', 'Blender', 'Cyberpunk', 'Mecha'],
    NULL,
    true,
    true,
    4,
    'Apex Mecha Valkyrie // 3D Character Model',
    'Detailed 3D hard-surface sculpt and render in Blender & ZBrush.'
  ),
  (
    'b0000000-0000-0000-0000-000000000005',
    'Cyberpunk Neo-Tokyo Stream Package',
    'cyberpunk-neo-tokyo-stream-package',
    'c0000000-0000-0000-0000-000000000005',
    'Complete broadcast overlay set with animated neon banners and alerts.',
    'Custom tailored Twitch streaming package including animated Starting Soon screen, Chatting scene with transparent glass cards, and reactive audio bars.',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    ARRAY['Overlay', 'Twitch', 'Stream Design', 'Neon', 'OBS'],
    NULL,
    true,
    true,
    5,
    'Cyberpunk Stream Package // Twitch & YouTube Overlay',
    'Complete broadcast overlay set with animated neon banners and alerts.'
  ),
  (
    'b0000000-0000-0000-0000-000000000006',
    'Chibi Boba Fox Emote Pack',
    'chibi-boba-fox-emote-pack',
    'c0000000-0000-0000-0000-000000000006',
    'Set of 6 hyper-expressive custom Twitch and Discord channel emotes.',
    'Designed for crystal clear readability at 28px, 56px, and 112px. Includes Hype, Cry, Sip, Rage, GG, and Lurk expressions.',
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
    ARRAY['Emotes', 'Chibi', 'Twitch', 'Discord', 'Fox'],
    NULL,
    false,
    true,
    6,
    'Chibi Boba Fox Emotes // Channel Emote Pack',
    'Set of 6 hyper-expressive custom Twitch and Discord channel emotes.'
  ),
  (
    'b0000000-0000-0000-0000-000000000007',
    '100 Days in Hardcore Survival',
    '100-days-in-hardcore-survival',
    'c0000000-0000-0000-0000-000000000007',
    'High CTR dramatic YouTube thumbnail with 3D compositing and painterly glow.',
    'Engineered for maximum click-through rate with bold focal character emotion, custom 3D environment depth, and cinematic rim lighting.',
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80',
    ARRAY['Thumbnail', 'YouTube', 'Gaming', 'CTR Design'],
    NULL,
    false,
    true,
    7,
    '100 Days in Hardcore // YouTube Thumbnail Design',
    'High CTR dramatic YouTube thumbnail with 3D compositing and painterly glow.'
  ),
  (
    'b0000000-0000-0000-0000-000000000008',
    'Nebula Drift Channel Header',
    'nebula-drift-channel-header',
    'c0000000-0000-0000-0000-000000000008',
    'Multi-platform wide banner for Twitter/X and YouTube with custom typography.',
    'Panoramic space aesthetic featuring cosmic dust, orbital rings, and custom vector typography built to scale on both mobile and 4K desktop displays.',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    ARRAY['Banner', 'Header', 'Twitter', 'YouTube', 'Branding'],
    NULL,
    false,
    true,
    8,
    'Nebula Drift // Multi-Platform Header Banner',
    'Multi-platform wide banner for Twitter/X and YouTube with custom typography.'
  ),
  (
    'b0000000-0000-0000-0000-000000000009',
    'Vanguard Esports Mascot Mark',
    'vanguard-esports-mascot-mark',
    'c0000000-0000-0000-0000-000000000009',
    'Razor-sharp vector gaming crest with stylized wolf motif.',
    'Custom vector esports branding package with primary, secondary, and sub-mark lockups. Optimized for embroidery, jerseys, and stream avatars.',
    'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1200&q=80',
    ARRAY['Logos', 'Esports', 'Vector', 'Branding', 'Mascot'],
    NULL,
    false,
    true,
    9,
    'Vanguard Esports // Mascot Logo Design',
    'Razor-sharp vector gaming crest with stylized wolf motif.'
  ),
  (
    'b0000000-0000-0000-0000-000000000010',
    'Kitsune Shrine Maiden Live2D',
    'kitsune-shrine-maiden-live2d',
    'c0000000-0000-0000-0000-000000000010',
    'Full-body Live2D model cut with 150+ layers for smooth facial tracking.',
    'Ready-for-rigging VTuber illustration. Includes 4 mouth states, teary eyes, angry chibi puff, fox ears physics separation, and nine-tails movement.',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
    ARRAY['VTuber', 'Live2D', 'Anime', 'Rigging', 'Kitsune'],
    NULL,
    true,
    true,
    10,
    'Kitsune Shrine Maiden // Live2D VTuber Model',
    'Full-body Live2D model cut with 150+ layers for smooth facial tracking.'
  ),
  (
    'b0000000-0000-0000-0000-000000000011',
    'The Forgotten Citadel',
    'the-forgotten-citadel',
    'c0000000-0000-0000-0000-000000000011',
    'Panoramic matte painting and concept art of an overgrown ancient sanctuary.',
    'Environmental matte painting blending 3D blockout with hand-painted textures, volumetric morning mist, and cinematic scale.',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    ARRAY['Art Scenes', 'Environment', 'Matte Painting', 'Concept Art'],
    NULL,
    true,
    true,
    11,
    'The Forgotten Citadel // Environment Matte Painting',
    'Panoramic matte painting and concept art of an overgrown ancient sanctuary.'
  ),
  (
    'b0000000-0000-0000-0000-000000000012',
    'Echo-09 Cyber Wolf VRChat Avatar',
    'echo-09-cyber-wolf-vrchat-avatar',
    'c0000000-0000-0000-0000-000000000012',
    'Optimized humanoid VRChat avatar with custom physbones and neon emission toggles.',
    'Under 70,000 polys, medium performance rank in VRChat, featuring custom audio link reactive clothing, toggleable cyber ears, and gesture facial expressions.',
    'https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?auto=format&fit=crop&w=1200&q=80',
    ARRAY['VRChat Avatars', 'Unity', 'PhysBones', 'Cyberpunk', '3D Avatar'],
    NULL,
    true,
    true,
    12,
    'Echo-09 Cyber Wolf // VRChat Optimized Avatar',
    'Optimized humanoid VRChat avatar with custom physbones and neon emission toggles.'
  )
ON CONFLICT (slug) DO NOTHING;

-- 5. Insert Multi-images for Artworks (Gallery details)
INSERT INTO public.artwork_images (artwork_id, image_url, caption, sort_order)
VALUES
  (
    'b0000000-0000-0000-0000-000000000001',
    'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80',
    'Full Body Render',
    1
  ),
  (
    'b0000000-0000-0000-0000-000000000001',
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
    'Facial Portrait Close-up',
    2
  ),
  (
    'b0000000-0000-0000-0000-000000000004',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    'Beauty Render with Emissive Conduits',
    1
  ),
  (
    'b0000000-0000-0000-0000-000000000004',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    'Clay Sculpt & Wireframe Breakdown',
    2
  ),
  (
    'b0000000-0000-0000-0000-000000000010',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
    'Model PSD Layer Separation Map',
    1
  ),
  (
    'b0000000-0000-0000-0000-000000000010',
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
    'Facial Expression Sheet',
    2
  )
ON CONFLICT DO NOTHING;
