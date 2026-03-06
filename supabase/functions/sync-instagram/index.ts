import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

    // Fetch latest posts from Instagram Graph API
    const fields = "id,media_type,media_url,thumbnail_url,caption,permalink,like_count,timestamp";
    const limit = 25;
    const igResponse = await fetch(
      `${INSTAGRAM_GRAPH_URL}/me/media?fields=${fields}&limit=${limit}&access_token=${INSTAGRAM_ACCESS_TOKEN}`
    );

    if (!igResponse.ok) {
      const errorData = await igResponse.text();
      throw new Error(`Instagram API error [${igResponse.status}]: ${errorData}`);
    }

    const igData = await igResponse.json();
    const posts: InstagramPost[] = igData.data || [];

    if (posts.length === 0) {
      return new Response(
        JSON.stringify({ success: true, synced: 0, message: "No posts found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Include IMAGE, CAROUSEL_ALBUM, and VIDEO (Reels)
    const imagePosts = posts.filter(
      (p) => p.media_type === "IMAGE" || p.media_type === "CAROUSEL_ALBUM" || p.media_type === "VIDEO"
    );

    // Upsert posts — uses instagram_id UNIQUE constraint to avoid duplicates
    const upsertData = imagePosts.map((post) => ({
      instagram_id: post.id,
      media_type: post.media_type,
      media_url: post.media_url,
      thumbnail_url: post.thumbnail_url || null,
      caption: post.caption || null,
      permalink: post.permalink,
      like_count: post.like_count || 0,
      timestamp: post.timestamp,
      cached_image_url: post.media_url, // Instagram CDN URL serves as cache
      updated_at: new Date().toISOString(),
    }));

    const { error: upsertError, count } = await supabase
      .from("instagram_posts")
      .upsert(upsertData, {
        onConflict: "instagram_id",
        ignoreDuplicates: false,
      });

    if (upsertError) {
      throw new Error(`Database upsert error: ${upsertError.message}`);
    }

    console.log(`Synced ${imagePosts.length} Instagram posts`);

    return new Response(
      JSON.stringify({
        success: true,
        synced: imagePosts.length,
        total_fetched: posts.length,
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
