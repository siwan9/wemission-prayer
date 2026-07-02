export const Roles = {
  STAFF : '스탭',
  PARTICIPANT : '참가자',
  PRAYER_PARTNER : '기도후원자'
} as const
export type Role = typeof Roles[keyof typeof Roles];

export interface PrayerFormData {
  name: string;
  role: Role;
  churchName: string;
  prayerRequest: string;
  dates: string[];
  pin: string;
}

export interface PrayerRegistration {
  id: string;
  name: string;
  role: Role;
  churchName: string;
  prayerRequest: string;
  dates: string[];
  pin: string;
  createdAt?: string; // 정렬을 위해 추가
}

export interface PrayerRegistrationUpdateDto {
  id: string;
  name: string;
  role: Role;
  churchName: string;
  prayerRequest: string;
  dates: string[];
  originalPin: string;
  newPin: string;
}

export interface PrayerRegistrationReadDto {
  id: string;
  name: string;
  role: Role;
  churchName: string;
  prayerRequest: string;
  dates: string[];
  createdAt?: string;
}

export interface SettingDataReadDto {
  campYear: number;
  campSeason: "여름" | "겨울";
  campTitle: string;

  serviceStartDate: string;
  serviceEndDate: string;

  guide: string;
  prayerPoints: string;

  bibleTitle: string;
  bibleContent: string;
}

export interface SettingDataUpdateDto {
  campYear: number;
  campSeason: "여름" | "겨울";
  campTitle: string;

  serviceStartDate: string;
  serviceEndDate: string;

  guide: string;
  prayerPoints: string;

  bibleTitle: string;
  bibleContent: string;

  originalAdminPin: string;
  newAdminPin: string;
}

export interface CampDate {
  id: string;

  sortOrder: number;

  startDate: string;
  endDate: string;
}

export interface CampDateCreateDto {
  startDate: string;
  endDate: string;
}

export interface CampDateUpdateDto {
  id: string;

  startDate: string;
  endDate: string;

  sortOrder: number;
}

export interface LinksData {
    songListUrl: string;
    songSheetUrl: string;

    campIntroUrl: string;

    instagramUrl: string;
    youtubeUrl: string;

    donationUrl: string;
    homepageUrl: string;
}

export type HomeTabType = 'PRAYER' | 'GUIDE' | 'MORE';

export type EditStep = 'SEARCH' | 'PIN' ;

export type AdminTabType =
  | "CONTENT"
  | "CAMP"
  | "CALENDAR"
  | "REGS"
  | "ADMIN"
  | "LINKS"
  | "STATUS";
