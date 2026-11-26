
import React, { useEffect, useRef, useState } from 'react';
import type { LinksData } from '../../types';
interface MoreTabProps {
  linksData: LinksData;
}

const MoreTab: React.FC<MoreTabProps> = ({linksData}) => {
  const [unavailableMenu, setUnavailableMenu] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (unavailableMenu) dialogRef.current?.showModal();
  }, [unavailableMenu]);

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
      {menus.map((menu) => {
        const content = (
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
        );
        const className = 'w-full text-left flex flex-col bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl overflow-hidden transition-all group focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300';
        const url = menu.url?.trim();

        return url ? (
          <a key={menu.name} href={url} target="_blank" rel="noopener noreferrer" className={className}>
            {content}
          </a>
        ) : (
          <button key={menu.name} type="button" onClick={() => setUnavailableMenu(menu.name)} className={className}>
            {content}
          </button>
        );
      })}
      {unavailableMenu && (
        <dialog
          ref={dialogRef}
          onClose={() => setUnavailableMenu(null)}
          onClick={(event) => {
            if (event.target === event.currentTarget) dialogRef.current?.close();
          }}
          aria-labelledby="coming-soon-title"
          className="w-[calc(100%-2rem)] max-w-sm rounded-3xl border border-white/15 bg-gray-900 p-6 text-white shadow-2xl backdrop:bg-black/70 sm:p-8"
        >
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-300/15 text-2xl text-yellow-300" aria-hidden="true">
              <i className="fa-solid fa-clock"></i>
            </div>
            <h2 id="coming-soon-title" className="text-xl font-bold">준비중입니다</h2>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="mt-7 min-h-12 w-full rounded-xl bg-yellow-300 px-4 font-bold text-gray-950 transition-colors hover:bg-yellow-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              확인
            </button>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default MoreTab;
