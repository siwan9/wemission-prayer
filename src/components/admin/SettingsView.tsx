import React, { useState, useEffect } from 'react';
import type { AdminTabType } from '../../types'
import type { SettingDataReadDto, PrayerRegistration, PrayerRegistrationUpdateDto, CampDate, CampDateCreateDto, CampDateUpdateDto, LinksData} from '../../types';
import { getRegistrationsWithPin } from '../../services/RegistrationService';

import ContentTab from "./tabs/ContentTab";
import CalendarTab from "./tabs/CalendarTab";
import RegistrationsTab from "./tabs/RegistrationsTab";
import CampTab from './tabs/CampTab';
import AdminTab from './tabs/AdminTab';
import StatusTab from './tabs/StatusTab';
import LinksTab from './tabs/LinksTab';

interface SettingsViewProps {
  settingData: SettingDataReadDto;
  adminPin: string | null;
  campDates: CampDate[];
  linksData: LinksData;
  onSaveSettingData: (data: SettingDataReadDto, originalAdminPin: string | null, newAdminPin: string | null) => Promise<void>;
  onUpdateRegistration: (updated: PrayerRegistrationUpdateDto) => Promise<void>;
  onDeleteRegistration: (id: string, pin: string) => Promise<void>;
  onCreateCampDate: (dto: CampDateCreateDto, adminPin: string) => Promise<void>;
  onUpdateCampDate: (dto: CampDateUpdateDto, adminPin: string) => Promise<void>;
  onDeleteCampDate: (id: string, adminPin: string) => Promise<void>;
  onUpdateLinksData: (data: LinksData, adminPin: string) => Promise<void>;
  onClose: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({  
  settingData, 
  adminPin,
  campDates,
  linksData,
  onSaveSettingData, 
  onUpdateRegistration,
  onDeleteRegistration,
  onCreateCampDate,
  onUpdateCampDate,
  onDeleteCampDate,
  onUpdateLinksData,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTabType>('CONTENT');
  
  const [isConnected, setIsConnected] = useState(false);

  const [editingSettingData, setEditingSettingData] = useState(settingData);
  const [editingLinksData, setEditingLinksData] = useState(linksData);
  const [originalAdminPin, setOriginalLocalAdminPin] = useState(adminPin);
  const [newAdminPin, setNewAdminPin] = useState(adminPin);
  const [registrations, setRegistrations ] = useState<PrayerRegistration[]>([]);
      

  useEffect(() => {
    setEditingSettingData(settingData);
  }, [settingData]);

  useEffect(() => {
    loadAdminRegistrations();
  }, []);

  const tabs: {
    id: AdminTabType;
    label: string;
  }[] = [
      { id: "CONTENT", label: "기도제목/소개" },
      { id: "CAMP", label: "캠프 정보" },
      { id: "CALENDAR", label: "현황 달력" },
      { id: "REGS", label: `신청자 목록 (${registrations.length})` },
      { id: "ADMIN", label: "관리자 비밀번호 관리" },
      { id: "LINKS", label: "관련 링크 관리" },
      { id: "STATUS", label: "시스템 상태" },
  ];

  
  const loadAdminRegistrations = async () => {
    try {
      const data = await getRegistrationsWithPin();

      setRegistrations(data);
      setIsConnected(true);
    } catch (err) {
      console.error(err);
      setIsConnected(false);
      alert("설정을 불러오지 못했습니다.");
    }
  };
  
  const handleSaveSettings = async () => {
    try{
      await onSaveSettingData(editingSettingData, originalAdminPin, newAdminPin);
      setOriginalLocalAdminPin(newAdminPin);
      alert('설정 내용이 저장되었습니다.');
    } catch(e) {
      alert('저장에 실패하였습니다.');
    }
  };

  const handleCreateCampDate = async (
    dto: CampDateCreateDto) => {
    try {
      await onCreateCampDate(dto, originalAdminPin!);
    } catch {
        alert("추가에 실패했습니다.");
    }
  };

  const handleUpdateCampDate = async (
    dto: CampDateUpdateDto) => {
    try {
      await onUpdateCampDate(dto, originalAdminPin!);
    } catch {
        alert("수정에 실패했습니다.");
    }
  };

  const handleDeleteCampDate = async (
    id: string) => {
    try {
      await onDeleteCampDate(id, originalAdminPin!);
    } catch {
        alert("삭제에 실패했습니다.");
    }
  };
  const handleUpdateLinksData = async () => {
    try {
      await onUpdateLinksData(editingLinksData, originalAdminPin!);
    } catch {
        alert("삭제에 실패했습니다.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col p-4 md:p-8">
      <header className="flex justify-between items-center mb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight">
              관리자 설정
          </h1>

          <p className="text-sm text-gray-500">
              위미션 릴레이 기도 운영 환경 설정
          </p>
        </div>
        <button 
          onClick={onClose}
          className="bg-black text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-all"
        >
          <i className="fa-solid fa-house"></i>
          홈으로
        </button>
      </header>

      <nav className="max-w-5xl w-full mx-auto mb-8">
          <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm overflow-x-auto custom-scrollbar">
            {tabs.map(t => (
              <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`
                      shrink-0
                      px-6 py-3
                      rounded-xl
                      text-sm
                      font-medium
                      whitespace-nowrap
                      transition-all

                      md:flex-1
                      md:shrink

                      ${
                          activeTab === t.id
                              ? "bg-black text-white shadow-md"
                              : "text-gray-500 hover:bg-gray-100"
                      }
                  `}
              >
                  {t.label}
              </button>
            ))}
        </div>
      </nav>

      <main className="flex-1 max-w-5xl w-full mx-auto pb-10">
        {activeTab === "CAMP" && (
          <CampTab
            editingSettingData={editingSettingData}
            setEditingSettingData={setEditingSettingData}
            editingCampdates={campDates}
            onSaveSettingData={handleSaveSettings}
            onCreateCampDate={handleCreateCampDate}
            onUpdateCampDate={handleUpdateCampDate}
            onDeleteCampDate={handleDeleteCampDate}
          />
        )}

        {activeTab === "CONTENT" && (
          <ContentTab
              editingSettingData={editingSettingData}
              setEditingSettingData={setEditingSettingData}
              onSaveSettingData={handleSaveSettings}
          />
        )}

        {activeTab === "CALENDAR" && (
          <CalendarTab
            registrations={registrations}
            serviceStartDate={editingSettingData.serviceStartDate}
            serviceEndDate={editingSettingData.serviceEndDate}
          />
        )}

        {activeTab === "REGS" && (
          <RegistrationsTab
              registrations={registrations}
              settingData={settingData}
              onUpdateRegistration={onUpdateRegistration}
              onDeleteRegistration={onDeleteRegistration}
              loadAdminRegistrations={loadAdminRegistrations}
          />
        )}

        {activeTab === "ADMIN" && (
          <AdminTab
            newAdminPin={newAdminPin}
            setNewAdminPin={setNewAdminPin}
            onSaveSettingData={handleSaveSettings}
          />
        )}

        {activeTab === "LINKS" && (
          <LinksTab
            linksData={editingLinksData}
            setLinksData={setEditingLinksData}
            onUpdateLinksData={handleUpdateLinksData}
          />
        )}

        {activeTab === "STATUS" && (
          <StatusTab
            registrationCount={registrations.length}
            isConnected={isConnected}
          />
        )}

      </main>
    </div>
  );
};

export default SettingsView;
