import { supabase } from "../lib/supabase";
import type { CampDate, CampDateCreateDto, CampDateUpdateDto } from "../types";

export async function getCampDates(): Promise<CampDate[]> {
  const { data, error } = await supabase
    .from("camp_dates")
    .select("*")
    .order("sort_order");

  if (error) throw error;

  return data.map(c => ({
    id: c.id,

    startDate: c.start_date,
    endDate: c.end_date,

    sortOrder: c.sort_order,
  }));
}

export async function createCampDate(
  dto: CampDateCreateDto,
  adminPin: string
): Promise<void> {
  const { data, error } = await supabase.rpc("create_camp_date", {
    p_admin_pin: adminPin,
    p_start_date: dto.startDate,
    p_end_date: dto.endDate,
  });

  if (error) throw error;

  if (!data) {
    throw new Error("관리자 PIN이 올바르지 않습니다.");
  }
}

export async function updateCampDate(
  dto: CampDateUpdateDto,
  adminPin: string
): Promise<void> {
  const { data, error } = await supabase.rpc(
    "update_camp_date",
    {
      p_admin_pin: adminPin,
      p_id: dto.id,
      p_start_date: dto.startDate,
      p_end_date: dto.endDate,
      p_sort_order: dto.sortOrder,
    }
  );

  if (error) throw error;

  if (!data) {
    throw new Error("관리자 PIN이 올바르지 않습니다.");
  }
}

export async function deleteCampDate(
  id: string,
  adminPin: string
): Promise<void> {
  const { data, error } = await supabase.rpc(
    "delete_camp_date",
    {
      p_admin_pin: adminPin,
      p_id: id,
    }
  );

  if (error) throw error;

  if (!data) {
    throw new Error("관리자 PIN이 올바르지 않습니다.");
  }
}