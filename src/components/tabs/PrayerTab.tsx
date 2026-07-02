
import React, { useState, useMemo } from 'react';
import { Roles } from '../../types';
import { CAMP_COLORS } from '../../constants';
import type { PrayerRegistration, SettingDataReadDto, PrayerRegistrationReadDto, PrayerFormData, PrayerRegistrationUpdateDto, CampDate } from '../../types';
import RelayFormModal from '../modal/RelayFormModal';
import EditPrayerModal from '../modal/edit/EditPrayerModal'

interface PrayerTabProps {
  registrations: PrayerRegistrationReadDto[];
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
  registrations, settingData, campDates, onRegister, onVerifyPin, onUpdate, onDelete }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(settingData.serviceStartDate);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPrayer, setEditingPrayer] = useState<PrayerRegistration | null>(null);

  const calendarDays = useMemo(() => {
    const days = [];
    const start = new Date(settingData.serviceStartDate);
    const end = new Date(settingData.serviceEndDate);
    
    const firstDay = new Date(start);
    while (firstDay.getDay() !== 0) {
      firstDay.setDate(firstDay.getDate() - 1);
    }

    const lastDay = new Date(end);
    while (lastDay.getDay() !== 6) {
      lastDay.setDate(lastDay.getDate() + 1);
    }

    const curr = new Date(firstDay);
    while (curr <= lastDay) {
      days.push(curr.toISOString().split('T')[0]);
      curr.setDate(curr.getDate() + 1);
    }
    return days;
  }, []);

  const getRegistrationsForDate = (date: string) => {
    return registrations.filter(r => r.dates.includes(date));
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
    
    setEditingPrayer(null);
  };
  
  const handleDelete = async (id: string) => {
      if (!editingPrayer) return;

      await onDelete(id, editingPrayer.pin);

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

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto items-start px-1 animate-fadeIn">
      <div className="lg:col-span-8 bg-white/5 rounded-[2rem] p-4 md:p-8 border border-white/10 shadow-2xl backdrop-blur-sm">
        <div className="grid grid-cols-7 mb-4">
          {weekDays.map(day => (
            <div key={day} className={`text-center text-[10px] md:text-xs font-bold py-2 ${day === '일' ? 'text-red-500' : day === '토' ? 'text-purple-400' : 'text-gray-500'}`}>
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5 md:gap-2">
          {calendarDays.map((dateStr) => {
            const date = new Date(dateStr);
            const isSelected = selectedDate === dateStr;
            const dailyRegs = getRegistrationsForDate(dateStr);
            const count = dailyRegs.length;
            const camp = getCampInfo(dateStr);
            const isInRange = dateStr >= settingData.serviceStartDate && dateStr <= settingData.serviceEndDate;
            
            const isSunday = date.getDay() === 0;
            const isSaturday = date.getDay() === 6;

            return (
              <button
                key={dateStr}
                onClick={() => isInRange && setSelectedDate(dateStr)}
                disabled={!isInRange}
                className={`relative aspect-square flex flex-col items-center justify-center rounded-xl transition-all duration-500 ${
                  !isInRange ? 'opacity-[0.05] cursor-default' :
                  isSelected ? 'ring-2 ring-red-600 z-10 scale-105 bg-white/15 shadow-xl shadow-red-900/20' : 'hover:bg-white/10 bg-white/5'
                }`}
              >
                {camp && isInRange && (
                  <div className={`absolute inset-0 ${camp.color} opacity-40 rounded-xl`}></div>
                )}
                
                <span className={`relative text-sm md:text-lg font-medium ${
                  isSunday ? 'text-red-500' : 
                  isSaturday ? 'text-purple-400' : 
                  'text-white'
                } ${isSelected ? 'font-black scale-110' : ''}`}>
                  {date.getDate()}
                </span>

                {count > 0 && isInRange && (
                  <div className="relative mt-1 flex gap-0.5 justify-center flex-wrap px-1">
                     <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
                     {count > 1 && <div className="w-1 h-1 bg-red-500 rounded-full"></div>}
                  </div>
                )}
                {count > 0 && isInRange && (
                  <span className="relative text-[8px] md:text-[10px] text-gray-400 font-bold mt-0.5">{count}명</span>
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 justify-center border-t border-white/5 pt-6">
           {campDates.map((camp, index) => (
              <div key={camp.id} className="flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    CAMP_COLORS[index % CAMP_COLORS.length]
                  } border border-white/20`}
                />
                <span className="text-[10px] text-gray-500 font-medium">
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
                    {getCampInfo(selectedDate) && (
                      <span className="text-[10px] font-bold text-purple-400">• {getCampInfo(selectedDate)?.sortOrder}차 캠프</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-2xl font-black text-white">{getRegistrationsForDate(selectedDate).length}</span>
                  <span className="text-[8px] text-gray-500 font-bold uppercase">Participants</span>
                </div>
              </div>
              
              <div className="space-y-3">
                {getRegistrationsForDate(selectedDate).length === 0 ? (
                  <div className="text-xs text-gray-600 text-center py-20 border-2 border-dashed border-white/5 rounded-2xl italic">
                    이날의 기도자가 되어주세요
                  </div>
                ) : (
                  getRegistrationsForDate(selectedDate).map(reg => (
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

        <button 
          onClick={() => setShowForm(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-red-900/40 transform transition-all active:scale-[0.97] flex items-center justify-center gap-3 text-lg mt-2 group"
        >
          <i className="fa-solid fa-fire-pulse group-hover:animate-bounce"></i>
          참여하기
        </button>

        <button
          onClick={() => setShowEditModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-red-900/40 transform transition-all active:scale-[0.97] flex items-center justify-center gap-3 text-lg mt-2 group"
        >
          <i className="fa-solid fa-pen-to-square group-hover:animate-bounce"></i>
          신청 수정하기
        </button>

      </div>

      {showForm && (
        <RelayFormModal 
          settingData={settingData}
          onClose={() => setShowForm(false)} 
          onSubmit={async (data) => {
            onRegister(data);
            setShowForm(false);
          }}
          initialDate={selectedDate || undefined}
        />
      )}
      {showEditModal && (
        <EditPrayerModal
          registrations={registrations}
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
              initialData={editingPrayer}
              onSubmit={handleUpdate}
              onDelete={async () => {
                  await handleDelete(editingPrayer.id);
                  setEditingPrayer(null);
              }}
              onClose={() => setEditingPrayer(null)}
          />
      )}
    </div>
  );
};

export default PrayerTab;
