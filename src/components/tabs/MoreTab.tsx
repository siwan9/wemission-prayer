
import React from 'react';
import type { LinksData } from '../../types';
interface MoreTabProps {
  linksData: LinksData;
}

const MoreTab: React.FC<MoreTabProps> = ({linksData}) => {
  const menus = [
    { name: '캠프 찬양 리스트', icon: 'fa-music', url: linksData.songListUrl, color: 'bg-indigo-600', subtitle: '캠프를 준비하며 함께 찬양해요' },
    { name: '캠프 찬양 악보', icon: 'fa-file-lines', url: linksData.songSheetUrl, color: 'bg-teal-600', subtitle: '예배를 위한 악보 다운로드' },
    { name: '위미션 캠프소개', icon: 'fa-campground', url: linksData.campIntroUrl, color: 'bg-red-500', subtitle: '캠프 일정 및 상세 안내' },
    { name: '위미션 인스타그램', icon: 'fa-brands fa-instagram', url: linksData.instagramUrl, color: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600', subtitle: '@we.mission 공식 계정' },
    { name: '위미션 유튜브', icon: 'fa-brands fa-youtube', url: linksData.youtubeUrl, color: 'bg-red-600', subtitle: '사역 영상 및 실시간 스트리밍' },
    { name: '캠프 후원하기', icon: 'fa-heart', url: linksData.donationUrl, color: 'bg-purple-600', subtitle: '다음 세대를 세우는 일에 동참해주세요' }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 max-w-4xl mx-auto animate-fadeIn">
      {menus.map((menu, i) => (
        <a 
          key={i}
          href={menu.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl overflow-hidden transition-all group"
        >
          <div className="flex items-center gap-4 p-5">
            <div className={`w-12 h-12 ${menu.color} rounded-xl flex items-center justify-center text-white text-xl shadow-lg transform group-hover:scale-110 transition-transform shrink-0`}>
              <i className={menu.icon.startsWith('fa-') ? `fa-solid ${menu.icon}` : menu.icon}></i>
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <span className="text-white font-bold break-words leading-tight">
                {menu.name}
              </span>

              <span className="text-[11px] text-gray-400 leading-snug">
                {menu.subtitle}
              </span>
            </div>
            <i className="fa-solid fa-chevron-right text-gray-700"></i>
          </div>
        </a>
      ))}
    </div>
  );
};

export default MoreTab;
