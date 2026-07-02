import React, { useState, useMemo } from 'react';
import { Roles } from '../../types';
import type { Role, PrayerRegistration, PrayerFormData, SettingDataReadDto } from '../../types';

interface RelayFormModalProps {
  settingData : SettingDataReadDto;
  onClose: () => void;
  onSubmit: (reg: PrayerFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  initialDate?: string;
  initialData?: PrayerRegistration | null;
}

const RelayFormModal = ({
  settingData,
  onClose,
  onSubmit,
  onDelete,
  initialDate,
  initialData,
}: RelayFormModalProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [prayerformData, setPrayerFormData] = useState<PrayerFormData>(() => ({
      name: initialData?.name ?? "",
      role: initialData?.role ?? Roles.PARTICIPANT,
      churchName: initialData?.churchName ?? "",
      prayerRequest: initialData?.prayerRequest ?? "",
      dates: initialData?.dates ?? (initialDate ? [initialDate] : []),
      pin: initialData?.pin ?? ""
  }));

  const calendarDays = useMemo(() => {
    const days: (string | null)[] = [];

    const start = new Date(settingData.serviceStartDate + "T12:00:00");
    const end = new Date(settingData.serviceEndDate + "T12:00:00");

    const firstDay = start.getDay();

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    const curr = new Date(start);

    while (curr <= end) {
      const year = curr.getFullYear();
      const month = String(curr.getMonth() + 1).padStart(2, "0");
      const day = String(curr.getDate()).padStart(2, "0");

      days.push(`${year}-${month}-${day}`);

      curr.setDate(curr.getDate() + 1);
    }

    // 마지막 줄도 7칸이 되도록 빈칸 추가
    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return days;
  }, [settingData.serviceStartDate, settingData.serviceEndDate]);

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
    if (!pinRegex.test(prayerformData.pin)) {
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-md animate-fadeIn">
        <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-lg rounded-[2.5rem] p-6 md:p-10 shadow-2xl flex flex-col max-h-[90vh]">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">금식기도 신청</h2>
              <p className="text-xs text-gray-500 mt-1">하나님 앞에서 기도로 준비합니다</p>
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
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-inset transition-all"
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
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-inset transition-all"
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
                    <div className="grid grid-cols-7 gap-1">
                      {['일','월','화','수','목','금','토'].map(d => <div key={d} className="text-[10px] text-center text-gray-600 py-1">{d}</div>)}
                      {calendarDays.map((dateStr, index) => {
                        if (dateStr === null) {
                          return (
                            <div
                              key={`empty-${index}`}
                              className="aspect-square"
                            />
                          );
                        }

                        const isSelected = prayerformData.dates.includes(dateStr);
                        const day = Number(dateStr.slice(8, 10));

                        return (
                          <button
                            key={dateStr}
                            type="button"
                            onClick={() => toggleDate(dateStr)}
                            className={`aspect-square flex items-center justify-center rounded-lg text-xs transition-all ${
                              isSelected
                                ? "bg-red-600 text-white font-bold shadow-lg shadow-red-900/30"
                                : "text-gray-400 hover:bg-white/10"
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
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
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 pr-14 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-inset transition-all"
                  placeholder="6자리 숫자"
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
                  * 신청 내용을 수정하거나 삭제할 때 필요한 6자리 숫자입니다.
                </p>
              </div>


              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">기도제목</label>
                <textarea
                  required
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-inset transition-all resize-none"
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
