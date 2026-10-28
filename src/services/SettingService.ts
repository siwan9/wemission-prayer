import { supabase } from "../lib/supabase";
import type { SettingDataReadDto, SettingDataUpdateDto } from "../types";

export async function getSetting(): Promise<SettingDataReadDto> {
  const { data, error } = await supabase.from("settings").select(
    "current_camp_id,camp_year,camp_season,camp_title,service_start_date,service_end_date,guide,prayer_points,bible_title,bible_content"
  ).single();
  if (error) throw error;

  return {
    currentCampId: data.current_camp_id,
    campYear: data.camp_year,
    campSeason: data.camp_season,
    campTitle: data.camp_title,
    serviceStartDate: data.service_start_date,
    serviceEndDate: data.service_end_date,
    guide: data.guide,
    prayerPoints: data.prayer_points,
    bibleTitle: data.bible_title,
    bibleContent: data.bible_content,
  };
}

export async function updateSetting(settings: SettingDataUpdateDto): Promise<void> {
  const { data, error } = await supabase.rpc("update_setting", {
    p_camp_year: settings.campYear,
    p_camp_season: settings.campSeason,
    p_camp_title: settings.campTitle,
    p_service_start_date: settings.serviceStartDate,
    p_service_end_date: settings.serviceEndDate,
    p_guide: settings.guide,
    p_prayer_points: settings.prayerPoints,
    p_bible_title: settings.bibleTitle,
    p_bible_content: settings.bibleContent,
    p_original_admin_pin: settings.originalAdminPin,
    p_new_admin_pin: settings.newAdminPin,
  });
  if (error) throw error;
  if (!data) throw new Error("관리자 PIN이 올바르지 않습니다.");
}

export async function verifyAdminPin(pin: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("verify_admin_pin", {
    p_pin: pin,
  });
  if (error) throw error;
  return data === true;
}
