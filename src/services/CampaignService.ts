import { supabase } from '../lib/supabase';
import type { CampaignCreateDto, PrayerCampaign } from '../types';

export async function listCampaigns(): Promise<PrayerCampaign[]> {
  const { data, error } = await supabase.rpc('list_camps_with_counts');
  if (error) throw error;
  return (data ?? []).map((row: {
    id: string;
    year: number;
    season: '여름' | '겨울';
    registration_count: number;
  }) => ({
    id: row.id,
    year: row.year,
    season: row.season,
    registrationCount: Number(row.registration_count ?? 0),
  }));
}

export async function startCampaign(adminPin: string, campaign: CampaignCreateDto): Promise<void> {
  const { data, error } = await supabase.rpc('start_camp', {
    p_admin_pin: adminPin,
    p_year: campaign.year,
    p_season: campaign.season,
  });
  if (error) throw error;
  if (!data) throw new Error('새 캠프 시작에 실패했습니다.');
}
