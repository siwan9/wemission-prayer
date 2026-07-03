
import React, { useState, useEffect, useMemo } from 'react';
import type { HomeTabType, PrayerRegistrationReadDto, PrayerRegistration, SettingDataReadDto, PrayerRegistrationUpdateDto, SettingDataUpdateDto, CampDate, CampDateCreateDto, CampDateUpdateDto, LinksData} from './types';
import { LINKS } from './constants';
import '../App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import LoadingView from './LoadingView.tsx';
import PrayerTab from './components/tabs/PrayerTab';
import GuideTab from './components/tabs/GuideTab.tsx';
import MoreTab from './components/tabs/MoreTab.tsx';
import SettingsView from './components/admin/SettingsView';
import AdminAuthModal from './components/admin/AdminAuthModal';
import {
    getRegistrations,
    createRegistration,
    updateRegistration,
    deleteRegistration,
    verifyUserPin
} from "./services/RegistrationService";
import {
    getSetting,
    updateSetting,
    verifyAdminPin
} from "./services/SettingService";
import { 
  getCampDates, 
  createCampDate, 
  updateCampDate,
  deleteCampDate
} from "./services/CampDateService.ts";
import { 
  getLinks, 
  updateLinks
} from "./services/LinksService.ts";


const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<HomeTabType>('PRAYER');
  const [registrations, setRegistrations] = useState<PrayerRegistrationReadDto[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [settingData, setSettingData] = useState<SettingDataReadDto | null>(null);
  const [campDates, setCampDates] = useState<CampDate[]>([]);
  const [linkData, setLinkData] = useState<LinksData>(LINKS);
  const [adminPin, setAdminPin] = useState<string | null>(null);

  useEffect(() => {
    init();
  }, []);
  const init = async () => {
    try {
      const settings = await getSetting();
      setSettingData(settings);
    } catch (err) {
      console.error(err);
      alert("설정을 불러오지 못했습니다.");
      throw err;
    } finally {
      setLoading(false);
    }
  };
  // 서비스 종료 여부 판단
  const isServiceExpired = useMemo(() => {
    if (!settingData) return false;

    const today = new Date();

    return (
      today < new Date(settingData.serviceStartDate) ||
      today > new Date(settingData.serviceEndDate)
    );
  }, [settingData]);



  const loadRegistrations = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const data = await getRegistrations();
      setRegistrations(data);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };
  const loadCampDates = async () => {
    try {
      const data = await getCampDates();

      setCampDates(data);
    } catch (e) {
      console.error(e);
      alert("캠프 일정을 불러오지 못했습니다.");
      throw e;
    }
  };
  const loadLinks = async () => {
    try {
      const data = await getLinks();
      setLinkData(data);
    } catch (e) {
      console.error(e);
      alert("관련 링크를 불러오지 못했습니다.");
      throw e;
    }
  };

  // 실시간 기도 신청 내역 동기화
  // 기도 신청 내역 조회
  useEffect(() => {
    if (isServiceExpired && !showSettings) {
      setLoading(false);
      return;
    }

    loadCampDates();
    loadRegistrations();
    loadLinks();
  }, [isServiceExpired, showSettings]);



  const handlePhoneClick = () => {
    const newCount = clickCount + 1;
    if (newCount >= 5) {
      setShowAdminAuth(true);
      setClickCount(0);
    } else {
      setClickCount(newCount);
      setTimeout(() => setClickCount(0), 2000);
    }
  };

  const handleAdminSuccess = (adminPin: string) => {
    setShowAdminAuth(false);
    setShowSettings(true);
    setAdminPin(adminPin);
  };

  const handleAddRegistration = async (reg: Omit<PrayerRegistration, 'id'>) => {
    await createRegistration(reg);
    await loadRegistrations();
  };

  const handleUserUpdateRegistration = async (updated: PrayerRegistrationUpdateDto) => {
    try {
      await updateRegistration(updated);
      await loadRegistrations();
      alert("수정되었습니다.");
    } catch (err) {
      console.error(err);
      alert("수정에 실패했습니다.");
      throw err;
    }
  };

  const handleAdminUpdateRegistration = async (updated: PrayerRegistrationUpdateDto) => {
    try {
      await updateRegistration(updated);
    } catch (e) {
      console.error("수정 실패:", e);
      throw e;
    }
  };

  const handleUserDeleteRegistration = async (id: string, pin: string) => {
    try {
      await deleteRegistration(id, pin);
      await loadRegistrations();
    } catch (e) {
      console.error("삭제 실패:", e);
      throw e;
    }
  };
  const handleAdminDeleteRegistration = async (id: string, pin: string) => {
    try {
      await deleteRegistration(id, pin);
    } catch (e) {
      console.error("삭제 실패:", e);
      throw e;
    }
  };

  const handleUpdateSettingData = async (
    data: SettingDataReadDto,
    originalAdminPin: string | null,
    newAdminPin: string | null ) => {
    try {
      if (!originalAdminPin) {
        throw new Error("관리자 인증이 필요합니다.");
      }

      const updateDto: SettingDataUpdateDto = {
        ...data,
        originalAdminPin: originalAdminPin,
        newAdminPin: newAdminPin ?? originalAdminPin,
      };

      await updateSetting(updateDto);

      setSettingData(data);
    } catch (e) {
      console.error("저장 실패:", e);
      throw e;
    }
  };

  const handleVerifyUserPin = async (
    id: string,
    pin: string
  ): Promise<PrayerRegistration | null> => {
    try {
      return await verifyUserPin(id, pin);
    } catch (err) {
      console.error(err);
      alert("PIN 확인 중 오류가 발생했습니다.");
      throw err;
    }
  };

  const handleVerifyAdminPin = async (
    pin: string
  ): Promise<boolean> => {
    try {
      return await verifyAdminPin(pin);
    } catch (err) {
      console.error(err);
      alert("PIN 확인 중 오류가 발생했습니다.");
      return false;
    }
  };

  const handleCreateCampDate = async (
    dto: CampDateCreateDto,
    adminPin: string
  ) => {
      await createCampDate(dto, adminPin!);

      await loadCampDates();
  };

  const handleUpdateCampDate = async (
    dto: CampDateUpdateDto,
    adminPin: string
  ) => {
      await updateCampDate(dto, adminPin!);

      await loadCampDates();
  };

  const handleDeleteCampDate = async (
    id: string,
    adminPin: string
  ) => {
      await deleteCampDate(id, adminPin!);

      await loadCampDates();
  };

  const handleUpdateLinksData = async(
    data: LinksData,
    adminPin: string
  ) => {
      await updateLinks(data, adminPin);

      await loadLinks();
  };

  if (!settingData || loading) {
    return (
        <div className="flex-1 flex items-center justify-center">
            <LoadingView />
        </div>
    );
  }
  if (isServiceExpired && !showSettings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center space-y-12 animate-fadeIn">
        <div className="space-y-6">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10 mx-auto">
            <i className="fa-solid fa-flag-checkered text-3xl text-red-500"></i>
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Service Completed</h1>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
              2026 여름 위미션 캠프 릴레이 금식기도가<br/>
              성령님의 은혜 속에 모두 마무리되었습니다.<br/>
              함께 기도로 동참해주신 모든 분들께 감사드립니다.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="h-px w-12 bg-red-600/30"></div>
          <a href={linkData.homepageUrl} className="text-xs text-red-500 font-bold tracking-widest hover:text-white transition-colors uppercase">wemission.com</a>
          <button onClick={() => setShowAdminAuth(true)} className="mt-10 text-[10px] text-gray-700 hover:text-gray-500 transition-colors flex items-center gap-2">
            <i className="fa-solid fa-lock"></i> 기록 확인 (관리자 전용)
          </button>
        </div>
        {showAdminAuth && <AdminAuthModal 
          onSuccess={handleAdminSuccess} onClose={() => setShowAdminAuth(false)} onVerifyPin={handleVerifyAdminPin}/>}
      </div>
    );
  }

  if (showSettings) {
    return (
      <SettingsView 
        settingData={settingData}
        adminPin={adminPin}
        campDates={campDates}
        linksData={linkData}
        onSaveSettingData={handleUpdateSettingData}
        onUpdateRegistration={handleAdminUpdateRegistration}
        onDeleteRegistration={handleAdminDeleteRegistration}
        onCreateCampDate={handleCreateCampDate}
        onUpdateCampDate={handleUpdateCampDate}
        onDeleteCampDate={handleDeleteCampDate}
        onUpdateLinksData={handleUpdateLinksData}
        onClose={() => setShowSettings(false)}
      />
    );
  }
  return (
    <div
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-black
        text-white
      "
    >
      {/* Grass Background */}
      <div
        className="
          fixed inset-0 z-0
          bg-cover
          bg-center
          bg-no-repeat
        "
        style={{
          backgroundImage: "url('/images/background.png')",
        }}
      />

      {/* 배경 어둡게 덮기 */}
      <div className="fixed inset-0 -z-10 bg-black/35" />

      {/* 포스터 느낌 그라데이션 */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(255,155,215,0.22),transparent_35%),linear-gradient(to_bottom,rgba(0,0,0,0.1),rgba(0,0,0,0.65))]" />

      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6">
        <div
          className="
            relative
            flex min-h-screen flex-col
            px-6 lg:px-8 pb-20
            bg-black/45
            backdrop-blur-md
            rounded-[40px]
            border border-pink-300/20
            shadow-[0_25px_80px_rgba(0,0,0,0.45)]
          "
        >
        <Header settingData={settingData}/>

        <nav
          className="
            grid grid-cols-3 gap-2
            mt-6 mb-8
            rounded-2xl
            border border-pink-300/70
            bg-black/85
            p-2
            shadow-[0_0_24px_rgba(255,130,210,0.35)]
            backdrop-blur-sm
          "
        >
          <TabButton active={activeTab === 'PRAYER'} onClick={() => setActiveTab('PRAYER')} label="금식기도" />
          <TabButton active={activeTab === 'GUIDE'} onClick={() => setActiveTab('GUIDE')} label="위미션 소개" />
          <TabButton active={activeTab === 'MORE'} onClick={() => setActiveTab('MORE')} label="더보기" />
        </nav>

        <main className="flex-1 w-full relative">
          <div
            className={`transition-all duration-700 ease-out transform ${
              activeTab === 'PRAYER'
                ? 'opacity-100 translate-y-0 relative'
                : 'opacity-0 translate-y-12 absolute inset-0 pointer-events-none'
            }`}
          >
            <PrayerTab
              registrations={registrations}
              settingData={settingData}
              campDates={campDates}
              onRegister={handleAddRegistration}
              onVerifyPin={handleVerifyUserPin}
              onUpdate={handleUserUpdateRegistration}
              onDelete={handleUserDeleteRegistration}
            />
          </div>

          <div
            className={`transition-all duration-700 ease-out transform ${
              activeTab === 'GUIDE'
                ? 'opacity-100 translate-y-0 relative'
                : 'opacity-0 translate-y-12 absolute inset-0 pointer-events-none'
            }`}
          >
            <GuideTab data={settingData} />
          </div>

          <div
            className={`transition-all duration-700 ease-out transform ${
              activeTab === 'MORE'
                ? 'opacity-100 translate-y-0 relative'
                : 'opacity-0 translate-y-12 absolute inset-0 pointer-events-none'
            }`}
          >
            <MoreTab linksData={linkData} />
          </div>
        </main>

        <footer className="mt-auto pt-16 pb-4">
          <Footer
            linksData={linkData}
            onPhoneClick={handlePhoneClick}
          />
        </footer>
        {showAdminAuth && (
          <AdminAuthModal
            onSuccess={handleAdminSuccess}
            onClose={() => setShowAdminAuth(false)}
            onVerifyPin={handleVerifyAdminPin}
          />
        )}
      </div>
    </div>
    </div>
  );
};

interface TabButtonProps { active: boolean; onClick: () => void; label: string; }
const TabButton: React.FC<TabButtonProps> = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`
      rounded-xl py-3 px-2
      text-xs md:text-sm
      font-black
      tracking-tight
      transition-all duration-300
      border
      ${
        active
          ? `
            bg-pink-300
            text-black
            border-pink-200
            shadow-[0_0_18px_rgba(255,130,210,0.75)]
            scale-[1.02]
          `
          : `
            bg-black/70
            text-white
            border-white/15
            hover:border-pink-300/70
            hover:text-pink-200
          `
      }
    `}
  >
    {label}
  </button>
);

export default App;
