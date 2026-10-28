import React, { useState } from 'react';
import type { ArchivedRegistrationCandidate, ArchivedRegistrationDetail } from '../../types';
import { getArchivedRegistration, searchArchivedRegistrations } from '../../services/RegistrationService';

interface PastPrayerModalProps {
  onClose: () => void;
}

const PastPrayerModal: React.FC<PastPrayerModalProps> = ({ onClose }) => {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<ArchivedRegistrationCandidate[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selected, setSelected] = useState<ArchivedRegistrationCandidate | null>(null);
  const [pin, setPin] = useState('');
  const [detail, setDetail] = useState<ArchivedRegistrationDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const formatPrayerDate = (date: string) => {
    const [year, month, day] = date.split('-').map(Number);
    return `${year}. ${month}. ${day}.`;
  };

  const handleSearch = async () => {
    if (keyword.trim().length < 2) {
      alert('이름 또는 교회명을 2글자 이상 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      setResults(await searchArchivedRegistrations(keyword));
      setHasSearched(true);
      setSelected(null);
      setDetail(null);
    } catch (error) {
      console.error(error);
      setHasSearched(false);
      alert('지난 캠프 기록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!selected || !/^\d{6}$/.test(pin)) {
      alert('6자리 PIN을 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      const verified = await getArchivedRegistration(selected.id, pin);
      if (!verified) {
        alert('PIN이 일치하지 않습니다.');
        return;
      }
      setDetail(verified);
    } catch (error) {
      console.error(error);
      alert('기도 기록을 확인하는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-md">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[2rem] border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl md:p-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">지난 캠프 기도 기록</h2>
            <p className="mt-2 text-xs text-gray-400">본인의 이름 또는 교회명으로 검색한 후 PIN을 확인해주세요.</p>
          </div>
          <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {!detail && (
          <>
            <div className="flex gap-2">
              <input
                value={keyword}
                onChange={e => {
                  setKeyword(e.target.value);
                  setHasSearched(false);
                  setResults([]);
                  setSelected(null);
                }}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="prayer-form-field min-w-0 flex-1 rounded-xl px-4 py-3"
                placeholder="이름 또는 교회명"
              />
              <button onClick={handleSearch} disabled={loading} className="rounded-xl bg-red-600 px-5 font-bold text-white disabled:opacity-50">
                검색
              </button>
            </div>

            {hasSearched && (
              <div className="mt-5 space-y-2">
                {results.map(result => (
                <button
                  key={result.id}
                  onClick={() => { setSelected(result); setPin(''); }}
                  className={`w-full rounded-2xl border p-4 text-left transition ${selected?.id === result.id ? 'border-red-500 bg-red-950/30' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-white">{result.name}</span>
                    <span className="shrink-0 text-xs font-bold text-yellow-300">{result.campaignYear} {result.campaignSeason}</span>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs">
                    <div className="flex gap-3">
                      <span className="w-16 shrink-0 font-bold text-gray-500">소속 교회</span>
                      <span className="text-gray-300">{result.churchName}</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="w-16 shrink-0 font-bold text-gray-500">참여 일자</span>
                      <span className="text-gray-300">{result.dates.map(formatPrayerDate).join(', ')}</span>
                    </div>
                  </div>
                </button>
                ))}
                {!loading && results.length === 0 && (
                  <p className="py-8 text-center text-sm text-gray-500">검색된 지난 기도 기록이 없습니다.</p>
                )}
              </div>
            )}

            {selected && (
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                <label className="mb-2 block text-xs font-bold text-gray-400">신청 당시 6자리 PIN</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={pin}
                    onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                    className="prayer-form-field min-w-0 flex-1 rounded-xl px-4 py-3 text-center tracking-[0.4em]"
                  />
                  <button onClick={handleVerify} disabled={loading} className="rounded-xl bg-red-600 px-5 font-bold text-white disabled:opacity-50">확인</button>
                </div>
              </div>
            )}
          </>
        )}

        {detail && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-yellow-300/20 bg-yellow-300/5 p-5">
              <p className="text-xs font-bold text-yellow-300">{detail.campaignYear} {detail.campaignSeason} 캠프</p>
              <h3 className="mt-2 text-xl font-black text-white">{detail.name}의 기도 기록</h3>
              <div className="mt-4 grid gap-3 text-sm">
                <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
                  <span className="shrink-0 font-bold text-gray-500 sm:w-32">소속 교회</span>
                  <span className="text-gray-200">{detail.churchName}</span>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
                  <span className="shrink-0 font-bold text-gray-500 sm:w-32">금식기도 참여 일자</span>
                  <span className="text-gray-200">{detail.dates.map(formatPrayerDate).join(', ')}</span>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="mb-3 text-xs font-bold text-gray-500">기도제목</p>
              <p className="whitespace-pre-wrap leading-relaxed text-gray-100">{detail.prayerRequest}</p>
            </div>
            <p className="text-center text-xs text-gray-500">지난 캠프 기록은 수정하거나 삭제할 수 없습니다.</p>
            <button onClick={() => { setDetail(null); setSelected(null); setPin(''); }} className="w-full rounded-2xl bg-white/10 py-4 font-bold text-white hover:bg-white/15">다른 기록 찾기</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PastPrayerModal;
