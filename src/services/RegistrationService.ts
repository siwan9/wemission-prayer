import { supabase } from "../lib/supabase";
import type {
  ArchivedRegistrationCandidate,
  ArchivedRegistrationDetail,
  AdminRegistrationPage,
  PrayerRegistration,
  PrayerDateCount,
  PrayerRegistrationReadDto,
  PrayerRegistrationUpdateDto,
} from "../types";

interface RegistrationRow {
  id: string;
  name: string;
  role: PrayerRegistration['role'];
  church_name: string;
  prayer_request: string;
  dates: string[];
  created_at?: string;
  camp_id: string;
}

interface AdminRegistrationRow extends RegistrationRow {
  pin: string | number;
}

const getCurrentCampId = async () => {
  const { data, error } = await supabase.from('settings').select('current_camp_id').single();
  if (error) throw error;
  return data.current_camp_id as string;
};

const mapRegistration = (row: RegistrationRow): PrayerRegistrationReadDto => ({
  id: row.id,
  name: row.name,
  role: row.role,
  churchName: row.church_name,
  prayerRequest: row.prayer_request,
  dates: row.dates,
  createdAt: row.created_at,
});

export async function getPrayerMonthCounts(monthStart: string, monthEnd: string): Promise<PrayerDateCount[]> {
  const { data, error } = await supabase.rpc('get_prayer_month_counts', {
    p_month_start: monthStart,
    p_month_end: monthEnd,
  });
  if (error) throw error;
  return (data ?? []).map((row: { date: string; count: number }) => ({
    date: row.date,
    count: Number(row.count),
  }));
}

export async function getPrayersByDate(date: string): Promise<PrayerRegistrationReadDto[]> {
  const { data, error } = await supabase.rpc('get_prayers_by_date', {
    p_date: date,
  });
  if (error) throw error;
  return (data ?? []).map(mapRegistration);
}

export async function searchCurrentRegistrations(keyword: string): Promise<PrayerRegistrationReadDto[]> {
  const { data, error } = await supabase.rpc('search_current_prayers', {
    p_keyword: keyword.trim(),
    p_limit: 50,
  });
  if (error) throw error;
  return (data ?? []).map(mapRegistration);
}

export async function getAdminRegistrations(
  campId: string,
  adminPin: string,
  page = 1,
  pageSize = 10,
): Promise<AdminRegistrationPage> {
  const { data, error } = await supabase.rpc('get_admin_registrations', {
    p_admin_pin: adminPin,
    p_camp_id: campId,
    p_page: page,
    p_page_size: pageSize,
  });
  if (error) throw error;
  if (data === null) throw new Error('관리자 PIN이 올바르지 않습니다.');
  return {
    items: (data.items ?? []).map((row: AdminRegistrationRow) => ({
      ...mapRegistration(row),
      pin: String(row.pin),
    })),
    total: Number(data.total ?? 0),
  };
}

export async function createRegistration(reg: Omit<PrayerRegistration, 'id'>) {
  const currentCampId = await getCurrentCampId();
  const { error } = await supabase.from('registrations').insert({
    name: reg.name,
    role: reg.role,
    church_name: reg.churchName,
    prayer_request: reg.prayerRequest,
    dates: reg.dates,
    pin: reg.pin,
    camp_id: currentCampId,
    created_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function updateRegistration(prayer: PrayerRegistrationUpdateDto): Promise<boolean> {
  const { data, error } = await supabase.rpc('update_registration', {
    p_id: prayer.id,
    p_original_pin: prayer.originalPin,
    p_new_pin: prayer.newPin,
    p_name: prayer.name,
    p_role: prayer.role,
    p_church_name: prayer.churchName,
    p_prayer_request: prayer.prayerRequest,
    p_dates: prayer.dates,
  });
  if (error) throw error;
  if (!data) throw new Error('현재 캠프의 신청만 수정할 수 있습니다.');
  return true;
}

export async function deleteRegistration(id: string, pin: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('delete_registration', { p_id: id, p_pin: pin });
  if (error) throw error;
  if (!data) throw new Error('현재 캠프의 신청만 삭제할 수 있습니다.');
  return true;
}

export async function verifyUserPin(id: string, pin: string): Promise<PrayerRegistration | null> {
  const { data, error } = await supabase.rpc('get_current_prayer', {
    p_id: id,
    p_pin: pin,
  });
  if (error) throw error;
  if (!data) return null;
  return { ...mapRegistration(data), pin };
}

export async function searchArchivedRegistrations(keyword: string): Promise<ArchivedRegistrationCandidate[]> {
  const { data, error } = await supabase.rpc('search_archived_prayers', {
    p_keyword: keyword.trim(),
    p_limit: 50,
  });
  if (error) throw error;
  return (data ?? []).map((row: {
    id: string;
    name: string;
    church_name: string;
    dates: string[];
    camp_id: string;
    camp_year: number;
    camp_season: '여름' | '겨울';
  }) => ({
    id: row.id,
    name: row.name,
    churchName: row.church_name,
    dates: row.dates,
    campId: row.camp_id,
    campaignCode: `${row.camp_year}-${row.camp_season}`,
    campaignYear: row.camp_year,
    campaignSeason: row.camp_season,
  }));
}

export async function getArchivedRegistration(id: string, pin: string): Promise<ArchivedRegistrationDetail | null> {
  const { data, error } = await supabase.rpc('get_archived_prayer', {
    p_id: id,
    p_pin: pin,
  });
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    name: data.name,
    role: data.role,
    churchName: data.church_name,
    prayerRequest: data.prayer_request,
    dates: data.dates,
    campId: data.camp_id,
    campaignCode: `${data.camp_year}-${data.camp_season}`,
    campaignYear: data.camp_year,
    campaignSeason: data.camp_season,
  };
}
