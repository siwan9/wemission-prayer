
import React, { useEffect, useState, useMemo } from 'react';
import { Roles } from '../../types';
import { CAMP_COLORS } from '../../constants';
import type { PrayerRegistration, SettingDataReadDto, PrayerRegistrationReadDto, PrayerFormData, PrayerRegistrationUpdateDto, CampDate } from '../../types';
import { formatDate, getCalendarDaysForMonth, getMonthKey, getMonthTitle, parseLocalDate, shiftMonth } from '../../utils/calendar';
import RelayFormModal from '../modal/RelayFormModal';
import EditPrayerModal from '../modal/edit/EditPrayerModal'
import PastPrayerModal from '../modal/PastPrayerModal';
import { getPrayerMonthCounts, getPrayersByDate } from '../../services/RegistrationService';

interface PrayerTabProps {
  settingData: SettingDataReadDto;
  campDates: CampDate[];
  onRegister: (reg: Omit<PrayerRegistration, 'id'>) => Promise<void>;

  onVerifyPin: (
    id: string,
    pin: string
  ) => Promise<PrayerRegistration | null>;

  onUpdate: (registration: PrayerRegistrationUpdateDto) => Promise<void>;
  onDelete: (id: string, pin: string) => Promise<void>;
}

const PrayerTab: React.FC<PrayerTabProps> = ({ 
  settingData, campDates, onRegister, onVerifyPin, onUpdate, onDelete }) => {

  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPastPrayerModal, setShowPastPrayerModal] = useState(false);
  const [editingPrayer, setEditingPrayer] = useState<PrayerRegistration | null>(null);
  const [dateCounts, setDateCounts] = useState<Map<string, number>>(new Map());
  const [selectedRegistrations, setSelectedRegistrations] = useState<PrayerRegistrationReadDto[]>([]);

  const getTodayString = () => formatDate(new Date());

  const getInitialSelectedDate = () => {
    const today = getTodayString();

    if (
      today >= settingData.serviceStartDate &&
      today <= settingData.serviceEndDate
    ) {
      return today;
    }

    return settingData.serviceStartDate;
  };
  const [selectedDate, setSelectedDate] = useState<string | null>(getInitialSelectedDate());
  const [visibleMonth, setVisibleMonth] = useState(() => getMonthKey(getInitialSelectedDate()));
  const firstMonth = getMonthKey(settingData.serviceStartDate);
  const lastMonth = getMonthKey(settingData.serviceEndDate);

  const calendarDays = useMemo(
    () => getCalendarDaysForMonth(visibleMonth),
    [visibleMonth],
  );

  const moveMonth = (amount: number) => {
    const nextMonth = shiftMonth(visibleMonth, amount);
    if (nextMonth < firstMonth || nextMonth > lastMonth) return;
    setVisibleMonth(nextMonth);
  };

  const getMonthRange = (month: string) => {
    const [year, monthNumber] = month.split('-').map(Number);
    const lastDay = new Date(year, monthNumber, 0).getDate();
    return {
      start: `${month}-01`,
      end: `${month}-${String(lastDay).padStart(2, '0')}`,
    };
  };

  const loadMonthCounts = async () => {
    const range = getMonthRange(visibleMonth);
    const counts = await getPrayerMonthCounts(range.start, range.end);
    setDateCounts(new Map(counts.map(item => [item.date, item.count])));
  };

  const loadSelectedDate = async () => {
    if (!selectedDate) {
      setSelectedRegistrations([]);
      return;
    }
    setSelectedRegistrations(await getPrayersByDate(selectedDate));
  };

  useEffect(() => {
    let cancelled = false;
    const range = getMonthRange(visibleMonth);
    void getPrayerMonthCounts(range.start, range.end).then(counts => {
      if (!cancelled) setDateCounts(new Map(counts.map(item => [item.date, item.count])));
    });
    return () => { cancelled = true; };
  }, [visibleMonth, settingData.currentCampId]);

  useEffect(() => {
    let cancelled = false;
    if (!selectedDate) {
      return;
    }
    void getPrayersByDate(selectedDate).then(items => {
      if (!cancelled) setSelectedRegistrations(items);
    });
    return () => { cancelled = true; };
  }, [selectedDate, settingData.currentCampId]);

  const refreshPrayerData = async () => {
    await Promise.all([loadMonthCounts(), loadSelectedDate()]);
  };

  const handleUpdate = async (data: PrayerFormData) => {
    if (!editingPrayer) return;

    await onUpdate({
        id: editingPrayer.id,
        originalPin: editingPrayer.pin,
        newPin: data.pin,

        name: data.name,
        role: data.role,
        churchName: data.churchName,
        prayerRequest: data.prayerRequest,
        dates: data.dates,
    });
    await refreshPrayerData();
    
    setEditingPrayer(null);
  };
  
  const handleDelete = async (id: string) => {
      if (!editingPrayer) return;

      await onDelete(id, editingPrayer.pin);
      await refreshPrayerData();

      setEditingPrayer(null);
  };

  const getCampInfo = (dateStr: string) => {
    const index = campDates.findIndex(
      camp => dateStr >= camp.startDate && dateStr <= camp.endDate
    );

    if (index === -1) return null;

    return {
      ...campDates[index],
      color: CAMP_COLORS[index % CAMP_COLORS.length],
    };
  };

  const calendarCells = useMemo(() => calendarDays.map((dateStr) => {
    const date = parseLocalDate(dateStr);
    const campIndex = campDates.findIndex(
      camp => dateStr >= camp.startDate && dateStr <= camp.endDate
    );
    const isCurrentMonth = getMonthKey(dateStr) === visibleMonth;

    return {
      date,
      dateStr,
      count: dateCounts.get(dateStr) ?? 0,
      camp: campIndex === -1 ? null : {
        ...campDates[campIndex],
        color: CAMP_COLORS[campIndex % CAMP_COLORS.length],
      },
      isInRange: isCurrentMonth && dateStr >= settingData.serviceStartDate && dateStr <= settingData.serviceEndDate,
      isSunday: date.getDay() === 0,
      isSaturday: date.getDay() === 6,
    };
  }), [calendarDays, campDates, dateCounts, settingData.serviceEndDate, settingData.serviceStartDate, visibleMonth]);
  const selectedCamp = selectedDate ? getCampInfo(selectedDate) : null;
  const shouldScrollParticipants = selectedRegistrations.length >= 10;

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto items-start px-1 animate-fadeIn">
      <div className="lg:col-span-8 bg-white/5 rounded-[2rem] p-4 md:p-8 border border-white/10 shadow-2xl [contain:layout_paint]">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => moveMonth(-1)}
            disabled={visibleMonth <= firstMonth}
            aria-label="이전 달"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10 disabled:cursor-default disabled:opacity-20"
          >
            <i className="fa-solid fa-chevron-left" />
          </button>
          <h3 className="text-lg font-black text-white md:text-xl">
            {getMonthTitle(visibleMonth)}
          </h3>
          <button
            type="button"
            onClick={() => moveMonth(1)}
            disabled={visibleMonth >= lastMonth}
            aria-label="다음 달"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10 disabled:cursor-default disabled:opacity-20"
          >
            <i className="fa-solid fa-chevron-right" />
          </button>
        </div>
        <div className="grid grid-cols-7 mb-4">
          {weekDays.map(day => (
            <div key={day} className={`text-center text-[10px] md:text-xs font-bold py-2 ${day === '일' ? 'text-red-500' : day === '토' ? 'text-purple-400' : 'text-gray-400'}`}>
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5 md:gap-2">
          {calendarCells.map(({ dateStr, date, count, camp, isInRange, isSunday, isSaturday }) => {
            const isSelected = selectedDate === dateStr;

            return (
              <button
                key={dateStr}
                onClick={() => isInRange && setSelectedDate(dateStr)}
                disabled={!isInRange}
                className={`relative
                  aspect-[0.95]
                  sm:aspect-square
                  rounded-xl
                  overflow-hidden
                  transition-[background-color,box-shadow,transform]
                  duration-200
                  ${
                    !isInRange
                      ? "opacity-[0.15] cursor-default"
                      : isSelected
                      ? "ring-2 ring-red-600 z-10 scale-100 md:scale-105 bg-white/15 shadow-xl shadow-red-900/20"
                      : "hover:bg-white/10 bg-white/5"
                  }`}
              >
                {camp && isInRange && (
                  <div
                    className={`absolute inset-0 ${camp.color} opacity-40 rounded-xl`}
                  />
                )}

                {/* 내용 */}
                <div
                  className="
                    absolute inset-0
                    flex flex-col
                    items-center
                    justify-between
                    py-[10%]
                    pointer-events-none
                  "
                >
                  <div className="h-[18%]" />

                  {/* 날짜 */}
                  <div className="flex-1 flex items-center justify-center">
                    <span
                      className={`
                        leading-none
                        text-[13px]
                        sm:text-[20px]
                        md:text-[32px]
                        ${
                          isSunday
                            ? "text-red-500"
                            : isSaturday
                            ? "text-purple-400"
                            : "text-white"
                        }
                        ${isSelected ? "font-black scale-110" : "font-medium"}
                      `}
                    >
                      {date.getDate()}
                    </span>
                  </div>

                  {/* 명수 */}
                  <div className="h-[18%] flex items-center justify-center">
                    {count > 0 && isInRange ? (
                      <span
                        className="
                          px-1.5
                          py-[1px]
                          rounded-full
                          bg-red-500/15
                          border-red-400/20

                          text-[5.5px]
                          sm:text-[7px]
                          md:text-[9px]

                          text-red-200
                          font-black
                          leading-none
                          whitespace-nowrap

                          shadow-sm
                        "
                      >
                        {count}명
                      </span>
                    ) : (
                      <span />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 justify-center border-t border-white/15 pt-6">
           {campDates.map((camp, index) => (
              <div key={camp.id} className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    CAMP_COLORS[index % CAMP_COLORS.length]
                  } border border-white/50 shadow-sm`}
                />
                <span className="text-xs text-gray-200 font-bold">
                  {camp.sortOrder}차 캠프
                </span>
              </div>
            ))}
        </div>
      </div>

      <div className="lg:col-span-4 flex flex-col gap-4 w-full">
        <div className={`bg-black/40 rounded-[2rem] border border-white/10 transition-all duration-700 ease-in-out flex flex-col ${selectedDate ? 'p-6' : 'p-4'}`}>
          {!selectedDate ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-600 py-10 space-y-4 min-h-[300px]">
              <i className="fa-solid fa-calendar-day text-4xl opacity-10"></i>
              <p className="text-sm font-light leading-relaxed">달력에서 날짜를 선택하여<br/>참여 인원을 확인해주세요</p>
            </div>
          ) : (
            <div key={selectedDate} className="animate-fadeIn flex flex-col h-full">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-black text-white leading-tight">
                    {new Date(selectedDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Relay Prayer</span>
                    {selectedCamp && (
                      <span className="text-[10px] font-bold text-purple-400">• {selectedCamp.sortOrder}차 캠프</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-2xl font-black text-white">{selectedRegistrations.length}</span>
                  <span className="text-[8px] text-gray-500 font-bold uppercase">Participants</span>
                </div>
              </div>
              
              <div className={`space-y-3 ${shouldScrollParticipants ? 'max-h-[680px] overflow-y-auto overscroll-contain pr-2 [scrollbar-gutter:stable]' : ''}`}>
                {selectedRegistrations.length === 0 ? (
                  <div className="text-xs text-gray-600 text-center py-20 border-2 border-dashed border-white/5 rounded-2xl italic">
                    이날의 기도자가 되어주세요
                  </div>
                ) : (
                  selectedRegistrations.map(reg => (
                    <div key={reg.id} className="bg-white/5 rounded-2xl overflow-hidden border border-white/5 hover:border-white/10 transition-all duration-300">
                      <button 
                        onClick={() => setExpandedId(expandedId === reg.id ? null : reg.id)}
                        className="w-full flex justify-between items-center p-4 text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-white font-bold group-hover:text-red-400 transition-colors">{reg.name}</span>
                          <span className={`text-[9px] px-2 py-0.5 rounded-md font-black tracking-tighter ${
                            reg.role === Roles.STAFF ? 'bg-red-500/20 text-red-400' : 
                            reg.role === Roles.PARTICIPANT ? 'bg-purple-500/20 text-purple-400' : 
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {reg.role}
                          </span>
                        </div>
                        <i className={`fa-solid fa-chevron-down text-[10px] text-gray-700 transition-transform duration-500 ${expandedId === reg.id ? 'rotate-180 text-white' : ''}`}></i>
                      </button>
                      {expandedId === reg.id && (
                        <div className="p-4 pt-0 text-xs space-y-4 animate-fadeIn">
                          <div className="h-px bg-white/5 w-full"></div>
                          <div className="flex items-center gap-3">
                            <span className="text-gray-500 w-12 font-bold uppercase tracking-tighter">Church</span>
                            <span className="text-gray-300 font-medium">{reg.churchName}</span>
                          </div>
                          <div className="flex flex-col gap-2">
                            <span className="text-gray-500 font-bold uppercase tracking-tighter">Prayer</span>
                            <p className="text-gray-200 bg-white/5 p-4 rounded-xl leading-relaxed italic border border-white/5 font-light">
                              "{reg.prayerRequest}"
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-2 flex flex-col gap-3">
          <button
            onClick={() => setShowForm(true)}
            className="group flex h-16 w-full items-center justify-center gap-3 rounded-[2rem] bg-red-600 px-5 text-base font-black text-white shadow-2xl shadow-red-900/40 transition-all hover:bg-red-700 active:scale-[0.97]"
          >
            <i className="fa-solid fa-user-plus w-5 text-center group-hover:animate-bounce" aria-hidden="true" />
            참여하기
          </button>

          <button
            onClick={() => setShowEditModal(true)}
            className="group flex h-16 w-full items-center justify-center gap-3 rounded-[2rem] bg-red-600 px-5 text-base font-black text-white shadow-2xl shadow-red-900/40 transition-all hover:bg-red-700 active:scale-[0.97]"
          >
            <i className="fa-solid fa-pen-to-square w-5 text-center group-hover:animate-bounce" aria-hidden="true" />
            신청 수정하기
          </button>

          <button
            onClick={() => setShowPastPrayerModal(true)}
            className="flex h-16 w-full items-center justify-center gap-3 rounded-[2rem] border border-white/15 bg-black/60 px-5 text-base font-black text-gray-200 transition-all hover:border-yellow-300/50 hover:text-yellow-200 active:scale-[0.97]"
          >
            <i className="fa-solid fa-box-archive w-5 text-center" aria-hidden="true" />
            지난 캠프 기도 기록 보기
          </button>
        </div>

      </div>

      {showForm && (
        <RelayFormModal 
          settingData={settingData}
          campDates={campDates}
          onClose={() => setShowForm(false)} 
          onSubmit={async (data) => {
            await onRegister(data);
            await refreshPrayerData();
            setShowForm(false);
            alert("기도 참여가 성공적으로 등록되었습니다!\n달력에서 확인해보세요.");
          }}
          initialDate={selectedDate || undefined}
        />
      )}
      {showEditModal && (
        <EditPrayerModal
          onVerifyPin={onVerifyPin}
          onClose={() => setShowEditModal(false)}
          onEdit={(prayer) => {
              setShowEditModal(false);
              setEditingPrayer(prayer);
          }}
        />
      )}
      {editingPrayer && (
          <RelayFormModal
              settingData={settingData}
              campDates={campDates}
              initialData={editingPrayer}
              onSubmit={handleUpdate}
              onDelete={async () => {
                  await handleDelete(editingPrayer.id);
                  setEditingPrayer(null);
              }}
              onClose={() => setEditingPrayer(null)}
          />
      )}
      {showPastPrayerModal && (
        <PastPrayerModal onClose={() => setShowPastPrayerModal(false)} />
      )}
    </div>
  );
};

export default PrayerTab;
