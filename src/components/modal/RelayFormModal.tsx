import React, { useState, useMemo } from 'react';
import { Roles } from '../../types';
import { CAMP_COLORS } from '../../constants';
import type { Role, PrayerRegistration, PrayerRegistrationReadDto, PrayerFormData, SettingDataReadDto, CampDate } from '../../types';
import { getCalendarDaysForMonth, getMonthKey, getMonthTitle, shiftMonth } from '../../utils/calendar';

interface RelayFormModalProps {
  settingData : SettingDataReadDto;
  campDates: CampDate[];
  onClose: () => void;
  onSubmit: (reg: PrayerFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  initialDate?: string;
  initialData?: PrayerRegistration | PrayerRegistrationReadDto | null;
  pinRequired?: boolean;
}

const RelayFormModal = ({
  settingData,
  campDates,
  onClose,
  onSubmit,
  onDelete,
  initialDate,
  initialData,
  pinRequired = true,
}: RelayFormModalProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [prayerformData, setPrayerFormData] = useState<PrayerFormData>(() => ({
      name: initialData?.name ?? "",
      role: initialData?.role ?? Roles.PARTICIPANT,
      churchName: initialData?.churchName ?? "",
      prayerRequest: initialData?.prayerRequest ?? "",
      dates: initialData?.dates ?? (initialDate ? [initialDate] : []),
      pin: initialData && 'pin' in initialData ? initialData.pin : ""
  }));
  const firstMonth = getMonthKey(settingData.serviceStartDate);
  const lastMonth = getMonthKey(settingData.serviceEndDate);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    getMonthKey(initialData?.dates[0] ?? initialDate ?? settingData.serviceStartDate),
  );

  const calendarDays = useMemo(
    () => getCalendarDaysForMonth(visibleMonth),
    [visibleMonth],
  );

  const moveMonth = (amount: number) => {
    const nextMonth = shiftMonth(visibleMonth, amount);
    if (nextMonth < firstMonth || nextMonth > lastMonth) return;
    setVisibleMonth(nextMonth);
  };

  const toggleDate = (date: string) => {
    setPrayerFormData(prev => ({
      ...prev,
      dates: prev.dates.includes(date) 
        ? prev.dates.filter(d => d !== date) 
        : [...prev.dates, date]
    }));
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const name = prayerformData.name.trim();
    const churchName = prayerformData.churchName.trim();
    const prayerRequest = prayerformData.prayerRequest.trim();
    if (
      !name ||
      !churchName ||
      !prayerRequest
    ) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    if (prayerformData.dates.length === 0) {
      alert("금식 날짜를 하나 이상 선택해주세요.");
      return;
}

    const pinRegex = /^\d{6}$/;
    if ((pinRequired && !pinRegex.test(prayerformData.pin)) || (!pinRequired && prayerformData.pin && !pinRegex.test(prayerformData.pin))) {
        alert("PIN은 6자리 숫자만 입력할 수 있습니다.");
        return;
    }

    try {
        setSubmitting(true);
        await onSubmit(prayerformData);
        onClose();
    } finally {
        setSubmitting(false);
    }
  };
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/20 backdrop-blur-md animate-fadeIn">
        <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-2xl rounded-[2.5rem] p-4 md:p-10 shadow-2xl flex flex-col max-h-[90vh]">
          <div className="flex justify-between items-center mb-8 mt-2 ml-2">
            <div>
              <h2 className="text-2xl font-bold text-white">
                금식기도 신청
              </h2>

              <p className="mt-2 text-xs text-gray-500">
                하나님 앞에서 기도로 준비합니다.
              </p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
            <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto flex-1 pr-2 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">이름</label>
                    <input
                      type="text"
                      required
                      className="prayer-form-field w-full rounded-2xl px-5 py-4"
                      placeholder="본명 또는 닉네임"
                      value={prayerformData.name}
                      onChange={e => setPrayerFormData({ ...prayerformData, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">구분</label>
                    <div className="flex gap-2">
                      {(Object.values(Roles) as Role[]).map(r => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setPrayerFormData({ ...prayerformData, role: r })}
                          className={`flex-1 py-3 text-xs rounded-xl border transition-all ${
                            prayerformData.role === r 
                            ? 'bg-red-600 border-red-500 text-white font-bold' 
                            : 'bg-white/5 border-white/10 text-gray-500'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">교회</label>
                    <input
                      type="text"
                      required
                      className="prayer-form-field w-full rounded-2xl px-5 py-4"
                      placeholder="예: 위미션교회"
                      value={prayerformData.churchName}
                      onChange={e => setPrayerFormData({ ...prayerformData, churchName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                    금식 날짜 선택 ({prayerformData.dates.length}일 선택됨)
                  </label>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="mb-3 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => moveMonth(-1)}
                        disabled={visibleMonth <= firstMonth}
                        aria-label="이전 달"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs text-white transition hover:bg-white/10 disabled:cursor-default disabled:opacity-20"
                      >
                        <i className="fa-solid fa-chevron-left" />
                      </button>
                      <span className="text-sm font-black text-white">
                        {getMonthTitle(visibleMonth)}
                      </span>
                      <button
                        type="button"
                        onClick={() => moveMonth(1)}
                        disabled={visibleMonth >= lastMonth}
                        aria-label="다음 달"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs text-white transition hover:bg-white/10 disabled:cursor-default disabled:opacity-20"
                      >
                        <i className="fa-solid fa-chevron-right" />
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {['일','월','화','수','목','금','토'].map(d => <div key={d} className="text-[10px] text-center text-gray-600 py-1">{d}</div>)}
                      {calendarDays.map((dateStr) => {
                        const isSelected = prayerformData.dates.includes(dateStr);
                        const isSelectable =
                          getMonthKey(dateStr) === visibleMonth &&
                          dateStr >= settingData.serviceStartDate &&
                          dateStr <= settingData.serviceEndDate;
                        const day = Number(dateStr.slice(8, 10));
                        const campIndex = isSelectable ? campDates.findIndex(
                          camp => dateStr >= camp.startDate && dateStr <= camp.endDate
                        ) : -1;
                        const camp = campIndex === -1 ? null : campDates[campIndex];

                        return (
                          <button
                            key={dateStr}
                            type="button"
                            onClick={() => isSelectable && toggleDate(dateStr)}
                            disabled={!isSelectable}
                            className={`relative aspect-square flex items-center justify-center overflow-hidden rounded-lg text-xs transition-all ${
                              !isSelectable
                                ? "cursor-default text-gray-700 opacity-30"
                                : isSelected
                                ? "bg-red-600 text-white font-bold shadow-lg shadow-red-900/30"
                                : "text-gray-400 hover:bg-white/10"
                            }`}
                          >
                            {camp && !isSelected && (
                              <span
                                className={`absolute inset-0 ${CAMP_COLORS[campIndex % CAMP_COLORS.length]}`}
                                aria-hidden="true"
                              />
                            )}
                            <span className="relative z-10 font-bold">{day}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 border-t border-white/10 pt-3">
                      {campDates.map((camp, index) => (
                        <div key={camp.id} className="flex items-center gap-1.5">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${CAMP_COLORS[index % CAMP_COLORS.length]} border border-white/40`}
                          />
                          <span className="text-[9px] font-bold text-gray-300">
                            {camp.sortOrder}차 캠프
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-600 mt-2 italic">* 여러 날짜를 중복 선택하거나 기간으로 선택할 수 있습니다.</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                  수정용 PIN
                </label>
                <div className="relative">
                <input
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  required={pinRequired}
                  className="prayer-form-field w-full rounded-2xl px-5 py-4 pr-14"
                  placeholder={pinRequired ? "6자리 숫자" : "변경할 경우에만 6자리 입력"}
                  value={prayerformData.pin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setPrayerFormData({
                      ...prayerformData,
                      pin: value,
                    });
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPin(prev => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <i
                    className={`fa-solid ${
                      showPin ? "fa-eye-slash" : "fa-eye"
                    }`}
                  />
                </button>
              </div>
                <p className="text-[10px] text-gray-600">
                  {pinRequired
                    ? '* 신청 내용을 수정하거나 삭제할 때 필요한 6자리 숫자입니다.'
                    : '* 기존 PIN은 표시되지 않습니다. PIN을 변경할 때만 입력하세요.'}
                </p>
              </div>


              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">기도제목</label>
                <textarea
                  required
                  rows={3}
                  className="prayer-form-field w-full rounded-2xl px-5 py-4 resize-none"
                  placeholder="기도제목을 작성해주세요"
                  value={prayerformData.prayerRequest}
                  onChange={e => setPrayerFormData({ ...prayerformData, prayerRequest: e.target.value })}
                />
              </div>

              <div className="flex gap-3 mt-4">
                {onDelete && (
                    <button
                        type="button"
                        onClick={async () => {
                            if (!confirm("정말 삭제하시겠습니까?")) return;

                            await onDelete();
                        }}
                        className="flex-1 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 text-white font-black py-5 rounded-2xl shadow-xl transition-all active:scale-[0.98] text-lg uppercase tracking-widest"
                    >
                        삭제하기
                    </button>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    className={`${onDelete ? "flex-1" : "w-full"} bg-gradient-to-r from-red-600 to-purple-700 hover:from-red-500 hover:to-purple-600 text-white font-black py-5 rounded-2xl shadow-xl transition-all active:scale-[0.98] text-lg uppercase tracking-widest disabled:opacity-50`}
                >
                    {submitting
                        ? "등록 중..."
                        : initialData
                            ? "수정하기"
                            : "기도로 참여하기"}
                </button>
            </div>
            </form>
        </div>
      </div>
    );
  }

export default RelayFormModal;
