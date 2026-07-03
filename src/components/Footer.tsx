
import React from 'react';
import type { LinksData } from '../types';

interface FooterProps {
  linksData: LinksData;
  onPhoneClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ linksData, onPhoneClick }) => {
  return (
    <footer className="mt-12 py-8 flex flex-col items-center border-t border-white/15 space-y-4">
    <a
      href={linksData.homepageUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs text-gray-300 uppercase tracking-[0.3em] hover:text-white transition-colors"
    >
      wemission.com
    </a>

    <button
      onClick={onPhoneClick}
      className="text-xs text-gray-300 hover:text-white transition-colors"
    >
      문의: 010-7528-9595
    </button>

    <div className="text-[11px] text-gray-400">
      © 2026 WEMISSION. All rights reserved.
    </div>
  </footer>
  );
};

export default Footer;
