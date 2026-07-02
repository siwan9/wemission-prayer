
import React, { useState } from 'react';

import type {
    SettingDataReadDto,
    CampDate,
    CampDateCreateDto,
    CampDateUpdateDto,
} from "../../../types";

interface CampTabProps {

    editingSettingData: SettingDataReadDto;
    setEditingSettingData: React.Dispatch<
        React.SetStateAction<SettingDataReadDto>
    >;

    editingCampdates: CampDate[];

    onSaveSettingData: () => Promise<void>;

    onCreateCampDate: (
        dto: CampDateCreateDto
    ) => Promise<void>;

    onUpdateCampDate: (
        dto: CampDateUpdateDto,
    ) => Promise<void>;

    onDeleteCampDate: (
        id: string,
    ) => Promise<void>;
}

const CampTab: React.FC<CampTabProps> = ({  
    editingSettingData, setEditingSettingData, editingCampdates, onSaveSettingData, onCreateCampDate, onUpdateCampDate, onDeleteCampDate
}) => {
    const [requesting, setRequesting] = useState(false);

    return (
        <div className="space-y-8">
            {/* 캠프 기본 정보 */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
              <h2 className="text-xl font-bold mb-6">
                캠프 기본 정보
              </h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-500">
                    캠프 제목
                  </label>

                  <input
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                    value={editingSettingData.campTitle}
                    onChange={e =>
                      setEditingSettingData({
                        ...editingSettingData,
                        campTitle: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-500">
                      캠프 년도
                    </label>

                    <input
                      type="number"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                      value={editingSettingData.campYear}
                      onChange={e =>
                        setEditingSettingData({
                          ...editingSettingData,
                          campYear: Number(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-500">
                      계절
                    </label>

                    <div className="relative">
                      <select
                          className="
                              w-full
                              appearance-none
                              rounded-xl
                              border
                              border-gray-300
                              bg-white
                              px-4
                              py-3
                              pr-12
                              focus:outline-none
                              focus:ring-2
                              focus:ring-black
                          "
                          value={editingSettingData.campSeason}
                          onChange={e =>
                              setEditingSettingData({
                                  ...editingSettingData,
                                  campSeason: e.target.value as "여름" | "겨울",
                              })
                          }
                      >
                          <option value="여름">여름</option>
                          <option value="겨울">겨울</option>
                      </select>

                      <svg
                          className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                      >
                          <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m19 9-7 7-7-7"
                          />
                      </svg>
                  </div>
                  </div>

                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-500">
                      금식기도 시작일
                    </label>

                    <input
                      type="date"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                      value={editingSettingData.serviceStartDate}
                      onChange={e =>
                        setEditingSettingData({
                          ...editingSettingData,
                          serviceStartDate: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-500">
                      금식기도 종료일
                    </label>

                    <input
                      type="date"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                      value={editingSettingData.serviceEndDate}
                      onChange={e =>
                        setEditingSettingData({
                          ...editingSettingData,
                          serviceEndDate: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    disabled={requesting}
                    onClick={async () => {
                        if (requesting) return;

                        try {
                            setRequesting(true);
                            await onSaveSettingData();
                        } finally {
                            setRequesting(false);
                        }
                    }}
                    className="w-full h-12 rounded-2xl bg-blue-600 text-white font-bold text-base shadow-lg transition hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                      저장
                </button>
                </div>
              </div>
            </div>

            {/* 캠프 일정 */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  캠프 일정
                </h2>

                <button
                  disabled={requesting}
                  className={`rounded-xl px-5 py-2 transition ${
                      requesting
                          ? "bg-gray-400 cursor-not-allowed text-white"
                          : "bg-black hover:bg-gray-800 text-white"
                  }`}
                  onClick={async () => {
                    if (requesting) return;

                    try {
                      setRequesting(true);

                      const today = new Date().toISOString().slice(0, 10);

                      await onCreateCampDate({
                          startDate: today,
                          endDate: today,
                      });
                    } finally {
                        setRequesting(false);
                    }
                  }}
              >
                  + 일정 추가
              </button>
              </div>

              <div className="space-y-3">

                {editingCampdates.map(camp => {

                  const isLast = camp.sortOrder === editingCampdates.length;

                  return (
                    <div
                      key={camp.id}
                      className="flex items-center gap-4 rounded-2xl border border-gray-200 px-5 py-4 hover:bg-gray-50 transition"
                    >

                      <div className="w-16 text-center font-bold text-lg">
                        {camp.sortOrder}차
                      </div>

                      <input
                        type="date"
                        className="rounded-xl border border-gray-300 px-3 py-2"
                        value={camp.startDate}
                        onChange={async e => {
                          if (requesting) return;

                          try {
                              setRequesting(true);

                              await onUpdateCampDate({
                                  id: camp.id,
                                  startDate: e.target.value,
                                  endDate: camp.endDate,
                                  sortOrder: camp.sortOrder,
                              });
                          } finally {
                              setRequesting(false);
                          }
                        }}
                      />

                      <span className="text-gray-400 font-semibold">~</span>

                      <input
                        type="date"
                        className="rounded-xl border border-gray-300 px-3 py-2"
                        value={camp.endDate}
                        onChange={async e => {
                          if (requesting) return;

                          try {
                              setRequesting(true);

                              await onUpdateCampDate({
                                  id: camp.id,
                                  startDate: camp.startDate,
                                  endDate: e.target.value,
                                  sortOrder: camp.sortOrder,
                              });
                          } finally {
                              setRequesting(false);
                          }
                        }}
                      />

                      <div className="ml-auto">
                        {isLast && (
                          <button
                            disabled={requesting}
                            className={`px-5 py-2 rounded-xl font-semibold transition ${
                                requesting
                                    ? "bg-gray-400 cursor-not-allowed text-white"
                                    : "bg-red-500 hover:bg-red-600 text-white"
                            }`}
                            onClick={async () => {
                                if (requesting) return;

                                try {
                                    setRequesting(true);
                                    await onDeleteCampDate(camp.id);
                                } finally {
                                    setRequesting(false);
                                }
                            }}
                          >
                            삭제
                          </button>
                        )}
                    </div>

                    </div>
                  );

                })}

              </div>
            </div>

          </div>
    );
}

export default CampTab;