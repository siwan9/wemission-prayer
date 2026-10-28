import React, { useEffect, useState } from 'react';
import type { CampaignCreateDto, PrayerCampaign, SettingDataReadDto } from '../../../types';
import { listCampaigns, startCampaign } from '../../../services/CampaignService';

interface CampaignsTabProps {
  adminPin: string;
  settingData: SettingDataReadDto;
  onStarted: () => Promise<void>;
}

const CampaignsTab: React.FC<CampaignsTabProps> = ({ adminPin, settingData, onStarted }) => {
  const [campaigns, setCampaigns] = useState<PrayerCampaign[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<CampaignCreateDto>({
    year: settingData.campYear + 1,
    season: settingData.campSeason === '여름' ? '겨울' : '여름',
  });

  useEffect(() => {
    let cancelled = false;
    void listCampaigns().then(data => {
      if (!cancelled) setCampaigns(data);
    });
    return () => { cancelled = true; };
  }, [adminPin]);

  const handleStart = async () => {
    if (!confirm(
      `${form.year} ${form.season} 캠프를 새로 시작할까요?\n\n` +
      `기존 기도 신청은 이전 캠프 기록으로 보존되고, 캠프 차수 일정은 초기화됩니다.`
    )) return;

    setBusy(true);
    try {
      await startCampaign(adminPin, form);
      await onStarted();
    } catch (error) {
      alert(error instanceof Error ? error.message : '새 캠프 시작에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-green-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">현재 캠프</span>
            <h2 className="mt-4 text-2xl font-black">{settingData.campYear} {settingData.campSeason} 캠프</h2>
            <p className="mt-2 text-sm text-gray-500">아래 캠프 정보와 기도제목/소개 탭에서 운영 내용을 수정합니다.</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="rounded-2xl bg-black px-6 py-3 font-bold text-white">새 캠프 시작</button>
        </div>
      </section>

      {showForm && (
        <section className="rounded-3xl border-2 border-black bg-white p-6 shadow-sm md:p-8">
          <h3 className="text-xl font-black">새 캠프 생성</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">연도와 계절만 지정합니다. 기존 설정 내용은 유지되며, 전환 후 캠프 정보 탭에서 제목·기간·차수를 수정하면 됩니다.</p>
          <div className="mt-6 grid items-end gap-4 md:grid-cols-2">
            <label className="flex min-w-0 flex-col gap-2">
              <span className="h-5 text-sm font-semibold leading-5 text-gray-500">연도</span>
              <input
                type="number"
                value={form.year}
                onChange={e => setForm({ ...form, year: Number(e.target.value) })}
                className="admin-input h-12"
              />
            </label>
            <label className="flex min-w-0 flex-col gap-2">
              <span className="h-5 text-sm font-semibold leading-5 text-gray-500">계절</span>
              <div className="relative">
                <select
                  value={form.season}
                  onChange={e => setForm({ ...form, season: e.target.value as '여름' | '겨울' })}
                  className="admin-input h-12 appearance-none pr-12"
                >
                  <option>여름</option>
                  <option>겨울</option>
                </select>
                <i className="fa-solid fa-chevron-down pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400" />
              </div>
            </label>
          </div>
          <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
            새 캠프로 전환하면 기존 신청은 자동으로 지난 캠프 기록이 되며 수정·삭제 검색에서 제외됩니다. 위미션 소개, 기도제목, 말씀 등은 기존 값을 계속 사용합니다.
          </div>
          <button onClick={handleStart} disabled={busy} className="mt-5 w-full rounded-2xl bg-blue-600 py-4 font-bold text-white disabled:opacity-50">{busy ? '전환 중...' : '새 캠프 시작'}</button>
        </section>
      )}

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <h3 className="text-lg font-black">캠프별 기도 기록</h3>
        <div className="mt-4 divide-y divide-gray-100">
          {campaigns.map(campaign => {
            const current = campaign.year === settingData.campYear && campaign.season === settingData.campSeason;
            return (
              <div key={campaign.id} className="flex items-center justify-between py-4">
                <div><p className="font-bold">{campaign.year} {campaign.season} 캠프</p><p className="mt-1 text-xs text-gray-500">기도 신청 {campaign.registrationCount}건</p></div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${current ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{current ? '현재' : '이전'}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default CampaignsTab;
