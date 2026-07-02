import { supabase } from "../lib/supabase";
import type { PrayerRegistrationReadDto, PrayerRegistrationUpdateDto, PrayerRegistration } from "../types";

export async function getRegistrations() {
  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getRegistrations 실패", error);
    throw error;
  }

  return (data ?? []).map(row => ({
    id: row.id,
    name: row.name,
    role: row.role,
    churchName: row.church_name,
    prayerRequest: row.prayer_request,
    dates: row.dates,
  })) as PrayerRegistrationReadDto[];
}

export async function getRegistrationsWithPin() {
  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getRegistrationsWithPin 실패", error);
    throw error;
  }


  return (data ?? []).map(row => ({
    id: row.id,
    name: row.name,
    role: row.role,
    churchName: row.church_name,
    prayerRequest: row.prayer_request,
    dates: row.dates,
    pin: row.pin,
  })) as PrayerRegistration[];
}

export async function createRegistration(
  reg: Omit<PrayerRegistration, "id">
) {
  const { error } = await supabase
    .from("registrations")
    .insert({
      name: reg.name,
      role: reg.role,
      church_name: reg.churchName,
      prayer_request: reg.prayerRequest,
      dates: reg.dates,
      pin: reg.pin,
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error("createRegistration 실패", error);
    throw error;
  }

}

export async function updateRegistration(
  prayer: PrayerRegistrationUpdateDto
): Promise<boolean> {
  const { data, error } = await supabase.rpc(
    "update_registration",
    {
      p_id: prayer.id,
      p_original_pin: prayer.originalPin,
      p_new_pin: prayer.newPin,
      p_name: prayer.name,
      p_role: prayer.role,
      p_church_name: prayer.churchName,
      p_prayer_request: prayer.prayerRequest,
      p_dates: prayer.dates,
    }
  );

  if (error) {
    console.error("updateRegistration 실패", error);
    throw error;
  }

  return data as boolean;
}

export async function deleteRegistration(
  id: string,
  pin: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc(
    "delete_registration",
    {
      p_id: id,
      p_pin: pin,
    }
  );

  if (error) {
    console.error("deleteRegistration 실패", error);
    throw error;
  }

  return data as boolean;
}


export async function verifyUserPin(id: string, pin: string): Promise<PrayerRegistration | null> {
  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("verifyUserPin 실패", error);
    throw error;
  }

  if (data.pin !== pin) {
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    role: data.role,
    churchName: data.church_name,
    prayerRequest: data.prayer_request,
    dates: data.dates,
    pin: data.pin,
    createdAt: data.created_at,
  };
}