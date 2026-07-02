
import React from 'react';
import type { LinksData } from '../types';

interface FooterProps {
  linksData: LinksData;
  onPhoneClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ linksData, onPhoneClick }) => {
  return (
    <footer className="mt-8 py-6 flex flex-col items-center border-t border-white/5 space-y-3">
      <a 
        href={linksData.homepageUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-[10px] text-gray-500 uppercase tracking-widest hover:text-white transition-colors"
      >
        wemission.com
      </a>
      <button 
        onClick={onPhoneClick}
        className="text-[10px] text-gray-500 select-none cursor-default active:text-white"
      >
        문의: 010-7528-9595
      </button>
      <div className="text-[10px] text-gray-600">
        © 2026 WEMISSION. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
