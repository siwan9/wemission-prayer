import type { LinksData, SettingDataReadDto } from "./types";

export const ADMIN_PASSWORD = '1199';

export const LINKS: LinksData = {
  songListUrl: 'https://youtube.com/playlist?list=PLKixBkYt0ZrOD76h64bH_CDNj56oHAyUg&si=5Bf_6kdogM51Atse',
  songSheetUrl: 'https://www.dropbox.com/scl/fo/9ys48effnul4m1ifhgj32/AI0f2RAjT4CBBlznzpc2t9s?rlkey=f0vgeg8piejanrhh57i43sfot&st=8wxq9jla&dl=0',
  campIntroUrl: 'https://wemission.com/camp-teenager/',
  instagramUrl: 'https://www.instagram.com/we.mission/',
  youtubeUrl: 'https://www.youtube.com/@WEMISSION',
  donationUrl: 'https://wemission.com/sponsorship/',
  homepageUrl: 'https://wemission.com/'
};

export const CAMP_COLORS = [
  'bg-indigo-600/40',
  'bg-pink-600/40',
  'bg-emerald-600/40',
  "bg-yellow-600/40",
  "bg-purple-600/40",
  "bg-green-600/40",
];

export const INITIAL_SETTING_DATA: SettingDataReadDto = {
  campYear: 2026,
  campSeason: '여름',
  campTitle: 'GOD',

  serviceStartDate: '2026-01-22',
  serviceEndDate: '2026-01-24',

  guide: `준비 중 입니다.`,
  prayerPoints: `준비 중 입니다.`,

  bibleTitle: `준비 중 입니다.`,
  bibleContent: `준비 중 입니다.`
};
