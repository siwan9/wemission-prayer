import React, { useCallback, useState, useEffect } from 'react';
import type { AdminTabType } from '../../types'
import type { SettingDataReadDto, PrayerRegistration, CampDate, CampDateCreateDto, CampDateUpdateDto, LinksData, PrayerCampaign} from '../../types';
import { deleteRegistration, getAdminRegistrations, updateRegistration } from '../../services/RegistrationService';
import { listCampaigns } from '../../services/CampaignService';

import ContentTab from "./tabs/ContentTab";
import RegistrationsTab from "./tabs/RegistrationsTab";
import CampTab from './tabs/CampTab';
import AdminTab from './tabs/AdminTab';
import StatusTab from './tabs/StatusTab';
import LinksTab from './tabs/LinksTab';
import CampaignsTab from './tabs/CampaignsTab';

interface SettingsViewProps {
  settingData: SettingDataReadDto;
  adminPin: string | null;
  campDates: CampDate[];
  linksData: LinksData;
  onSaveSettingData: (data: SettingDataReadDto, originalAdminPin: string | null, newAdminPin: string | null) => Promise<void>;
  onCreateCampDate: (dto: CampDateCreateDto, adminPin: string) => Promise<void>;
  onUpdateCampDate: (dto: CampDateUpdateDto, adminPin: string) => Promise<void>;
  onDeleteCampDate: (id: string, adminPin: string) => Promise<void>;
  onUpdateLinksData: (data: LinksData, adminPin: string) => Promise<void>;
  onCampaignStarted: () => Promise<void>;
  onClose: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({  
  settingData, 
  adminPin,
  campDates,
  linksData,
  onSaveSettingData, 
  onCreateCampDate,
  onUpdateCampDate,
  onDeleteCampDate,
  onUpdateLinksData,
  onCampaignStarted,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTabType>('CAMPAIGNS');
  
  const [isConnected, setIsConnected] = useState(false);

  const [editingSettingData, setEditingSettingData] = useState(settingData);
  const [editingLinksData, setEditingLinksData] = useState(linksData);
  const [originalAdminPin, setOriginalLocalAdminPin] = useState(adminPin);
  const [newAdminPin, setNewAdminPin] = useState(adminPin);
  const [registrations, setRegistrations ] = useState<PrayerRegistration[]>([]);
  const [registrationTotal, setRegistrationTotal] = useState(0);
  const [registrationPage, setRegistrationPage] = useState(1);
  const [campaigns, setCampaigns] = useState<PrayerCampaign[]>([]);
  const [selectedRegistrationCampId, setSelectedRegistrationCampId] = useState(settingData.currentCampId);
      

  const tabs: {
    id: AdminTabType;
    label: string;
  }[] = [
      { id: "CAMPAIGNS", label: "캠프 운영" },
      { id: "CONTENT", label: "기도제목/소개" },
      { id: "CAMP", label: "캠프 정보" },
      { id: "REGS", label: `기도자 목록 (${registrationTotal})` },
      { id: "ADMIN", label: "관리자 비밀번호 관리" },
      { id: "LINKS", label: "관련 링크 관리" },
      { id: "STATUS", label: "시스템 상태" },
  ];

  
  const loadAdminRegistrations = useCallback(async (
    campId: string,
    page: number,
  ) => {
    try {
      if (!adminPin) return;
      let effectivePage = page;
      let data = await getAdminRegistrations(campId, adminPin, effectivePage);

      if (effectivePage > 1 && data.items.length === 0 && data.total > 0) {
        effectivePage -= 1;
        data = await getAdminRegistrations(campId, adminPin, effectivePage);
      }

      setRegistrations(data.items);
      setRegistrationTotal(data.total);
      setRegistrationPage(effectivePage);
      setIsConnected(true);
    } catch (err) {
      console.error(err);
      setIsConnected(false);
      alert("설정을 불러오지 못했습니다.");
    }
  }, [adminPin]);

  useEffect(() => {
    if (!adminPin) return;
    let cancelled = false;
    void Promise.all([
      listCampaigns(),
      getAdminRegistrations(settingData.currentCampId, adminPin, 1),
    ]).then(([campaignItems, registrationData]) => {
      if (cancelled) return;
      setCampaigns(campaignItems);
      setRegistrations(registrationData.items);
      setRegistrationTotal(registrationData.total);
      setRegistrationPage(1);
      setIsConnected(true);
    }).catch(error => {
      console.error(error);
      if (!cancelled) setIsConnected(false);
    });
    return () => { cancelled = true; };
  }, [adminPin, settingData.currentCampId]);
  
  const handleSaveSettings = async () => {
    try{
      await onSaveSettingData(editingSettingData, originalAdminPin, newAdminPin);
      setOriginalLocalAdminPin(newAdminPin);
      alert('설정 내용이 저장되었습니다.');
    } catch {
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
      <header className="mx-auto mb-8 flex w-full max-w-5xl items-center justify-between gap-4">
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
          className="flex shrink-0 items-center gap-2 rounded-2xl bg-black px-6 py-3 text-sm font-bold text-white shadow-lg transition-all active:scale-95"
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
        {activeTab === "CAMPAIGNS" && adminPin && (
          <CampaignsTab
            adminPin={adminPin}
            settingData={settingData}
            onStarted={async () => {
              await onCampaignStarted();
              setActiveTab('CAMP');
            }}
          />
        )}

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

        {activeTab === "REGS" && (
          <RegistrationsTab
              key={selectedRegistrationCampId}
              registrations={registrations}
              settingData={settingData}
              campDates={campDates}
              campaigns={campaigns}
              selectedCampId={selectedRegistrationCampId}
              totalRegistrations={registrationTotal}
              currentPage={registrationPage}
              onSelectCamp={async campId => {
                setSelectedRegistrationCampId(campId);
                await loadAdminRegistrations(campId, 1);
              }}
              onPageChange={page => loadAdminRegistrations(selectedRegistrationCampId, page)}
              onUpdateRegistration={async updated => {
                await updateRegistration(updated);
              }}
              onDeleteRegistration={async (id, pin) => {
                await deleteRegistration(id, pin);
              }}
              loadAdminRegistrations={() => loadAdminRegistrations(selectedRegistrationCampId, registrationPage)}
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
            registrationCount={registrationTotal}
            isConnected={isConnected}
          />
        )}

      </main>
    </div>
  );
};

export default SettingsView;
