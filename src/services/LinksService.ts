import { supabase } from "../lib/supabase";
import type { LinksData } from "../types";

export async function getLinks(): Promise<LinksData> {
  const { data, error } = await supabase
    .from("links")
    .select("*")
    .single();

  if (error) throw error;

  return {
    songListUrl: data.song_list_url,
    songSheetUrl: data.song_sheet_url,
    campIntroUrl: data.camp_intro_url,
    instagramUrl: data.instagram_url,
    youtubeUrl: data.youtube_url,
    donationUrl: data.donation_url,
    homepageUrl: data.homepage_url,
  };
}

export async function updateLinks(
  data: LinksData,
  adminPin: string
): Promise<boolean> {
  const { data: success, error } = await supabase.rpc("update_links", {
    p_admin_pin: adminPin,

    p_song_list_url: data.songListUrl,
    p_song_sheet_url: data.songSheetUrl,
    p_camp_intro_url: data.campIntroUrl,
    p_instagram_url: data.instagramUrl,
    p_youtube_url: data.youtubeUrl,
    p_donation_url: data.donationUrl,
    p_homepage_url: data.homepageUrl,
  });

  if (error) throw error;

  return success as boolean;
}