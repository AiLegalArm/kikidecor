import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const INSTAGRAM_GRAPH_URL = "https://graph.instagram.com";

interface InstagramPost {
  id: string;
  media_type: string;
  media_url: string;
  thumbnail_url?: string;
  caption?: string;
  permalink: string;
  like_count?: number;
  timestamp: string;
}

interface PagingCursors {
  after?: string;
}

interface IGResponse {
  data: InstagramPost[];
  paging?: {
    cursors?: PagingCursors;
    next?: string;
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const INSTAGRAM_ACCESS_TOKEN = Deno.env.get("INSTAGRAM_ACCESS_TOKEN");
    if (!INSTAGRAM_ACCESS_TOKEN) {
      throw new Error("INSTAGRAM_ACCESS_TOKEN is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if this is a full historical import or regular sync
    let importAll = false;
    try {
      const body = await req.json();
      importAll = body?.import_all === true;
    } catch {
      // No body or invalid JSON — default sync
    }

    const fields = "id,media_type,media_url,thumbnail_url,caption,permalink,like_count,timestamp";
    const perPage = 25;
    let allPosts: InstagramPost[] = [];
    let nextUrl: string | null =
      `${INSTAGRAM_GRAPH_URL}/me/media?fields=${fields}&limit=${perPage}&access_token=${INSTAGRAM_ACCESS_TOKEN}`;

    // Fetch pages — single page for regular sync, all pages for import
    const maxPages = importAll ? 50 : 1; // up to ~1250 posts for full import
    let pageCount = 0;

    while (nextUrl && pageCount < maxPages) {
      const igResponse = await fetch(nextUrl);
      if (!igResponse.ok) {
        const errorData = await igResponse.text();
        throw new Error(`Instagram API error [${igResponse.status}]: ${errorData}`);
      }

      const igData: IGResponse = await igResponse.json();
      const posts = igData.data || [];
      allPosts = allPosts.concat(posts);
      pageCount++;

      nextUrl = igData.paging?.next || null;
    }

    if (allPosts.length === 0) {
      return new Response(
        JSON.stringify({ success: true, synced: 0, message: "No posts found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Include IMAGE, CAROUSEL_ALBUM, and VIDEO (Reels)
    const validPosts = allPosts.filter(
      (p) => p.media_type === "IMAGE" || p.media_type === "CAROUSEL_ALBUM" || p.media_type === "VIDEO"
    );

    // Upsert in batches of 50 to avoid payload limits
    const batchSize = 50;
    let totalSynced = 0;

    for (let i = 0; i < validPosts.length; i += batchSize) {
      const batch = validPosts.slice(i, i + batchSize);
      const upsertData = batch.map((post) => ({
        instagram_id: post.id,
        media_type: post.media_type,
        media_url: post.media_url,
        thumbnail_url: post.thumbnail_url || null,
        caption: post.caption || null,
        permalink: post.permalink,
        like_count: post.like_count || 0,
        timestamp: post.timestamp,
        cached_image_url: post.media_url,
        updated_at: new Date().toISOString(),
      }));

      const { error: upsertError } = await supabase
        .from("instagram_posts")
        .upsert(upsertData, {
          onConflict: "instagram_id",
          ignoreDuplicates: false,
        });

      if (upsertError) {
        throw new Error(`Database upsert error: ${upsertError.message}`);
      }

      totalSynced += batch.length;
    }

    console.log(`Synced ${totalSynced} Instagram posts (import_all=${importAll}, pages=${pageCount})`);

    return new Response(
      JSON.stringify({
        success: true,
        synced: totalSynced,
        total_fetched: allPosts.length,
        pages_fetched: pageCount,
        import_all: importAll,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Instagram sync error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
