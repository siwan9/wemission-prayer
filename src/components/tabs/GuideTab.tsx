
import React from 'react';
import type { SettingDataReadDto } from '../../types';

interface GuideTabProps {
  data: SettingDataReadDto;
}

const GuideTab: React.FC<GuideTabProps> = ({ data }) => {
  // Split prayer points by newline to render as a list
  const prayerLines = data.prayerPoints.split('\n').filter(line => line.trim() !== '');

  return (
    <div className="space-y-8 animate-fadeIn max-w-2xl mx-auto">
      {/* 위미션 기도제목 - Now First */}
      <section className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl">
        <h3 className="text-purple-400 font-bold flex items-center gap-2 mb-6 text-lg">
          <i className="fa-solid fa-hands-praying"></i>
          위미션 기도제목
        </h3>
        <ul className="space-y-4">
          {prayerLines.map((point, index) => (
            <li key={index} className="flex gap-3 text-gray-200 text-sm md:text-base leading-relaxed group">
              <span className="text-purple-500 font-black shrink-0">{index + 1}.</span>
              <span className="group-hover:text-white transition-colors">
                {point.replace(/^\d+\.\s*/, '')}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* 위미션 소개 - Now Second */}
      <section className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl">
        <h3 className="text-red-500 font-bold flex items-center gap-2 mb-4 text-lg">
          <i className="fa-solid fa-leaf"></i>
          위미션 소개
        </h3>
        <p className="text-gray-200 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
          {data.guide}
        </p>
      </section>

      <div className="text-center py-4">
        <p className="text-xs text-gray-400 italic leading-relaxed">
          "{data.bibleContent}"<br/>
          ({data.bibleTitle})
        </p>
      </div>
    </div>
  );
};

export default GuideTab;
