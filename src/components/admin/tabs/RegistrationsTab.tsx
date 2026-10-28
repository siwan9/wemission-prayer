import React, { useState } from 'react';

import type {
    PrayerRegistration, PrayerRegistrationUpdateDto, SettingDataReadDto, CampDate, PrayerCampaign,
} from "../../../types";
import { Roles } from "../../../types";

import RelayFormModal from '../../modal/RelayFormModal';

interface RegistrationsTabProps {

    registrations: PrayerRegistration[];

    settingData: SettingDataReadDto;
    campDates: CampDate[];
    campaigns: PrayerCampaign[];
    selectedCampId: string;
    totalRegistrations: number;
    currentPage: number;
    onSelectCamp: (campId: string) => Promise<void>;
    onPageChange: (page: number) => Promise<void>;

    onUpdateRegistration: (
        updated: PrayerRegistrationUpdateDto
    ) => Promise<void>;

    onDeleteRegistration: (
        id: string,
        pin: string
    ) => Promise<void>;

    loadAdminRegistrations: () => Promise<void>;
}
const RegistrationsTab: React.FC<RegistrationsTabProps> = ({
    registrations, settingData, campDates, campaigns, selectedCampId,
    totalRegistrations, currentPage, onSelectCamp, onPageChange,
    onUpdateRegistration, onDeleteRegistration, loadAdminRegistrations
}) => {
    const PAGE_SIZE = 10;
    const [editingRegistration, setEditingRegistration] = useState<PrayerRegistration | null>(null);
    const isCurrentCamp = selectedCampId === settingData.currentCampId;
    const totalPages = Math.max(1, Math.ceil(totalRegistrations / PAGE_SIZE));

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-end md:justify-between md:p-6">
                <label className="w-full space-y-2 md:max-w-sm">
                    <span className="block text-sm font-semibold text-gray-500">캠프 선택</span>
                    <div className="relative">
                        <select
                            value={selectedCampId}
                            onChange={e => void onSelectCamp(e.target.value)}
                            className="admin-input h-12 appearance-none pr-12 font-bold"
                        >
                            {campaigns.map(campaign => (
                                <option key={campaign.id} value={campaign.id}>
                                    {campaign.year} {campaign.season} 캠프{campaign.id === settingData.currentCampId ? ' (현재)' : ''}
                                </option>
                            ))}
                        </select>
                        <i className="fa-solid fa-chevron-down pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400" />
                    </div>
                </label>
                <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${isCurrentCamp ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {isCurrentCamp ? '현재 캠프 · 수정 가능' : '이전 캠프 · 읽기 전용'}
                    </span>
                    <span className="text-sm font-bold text-gray-700">총 {totalRegistrations}명</span>
                </div>
            </div>

            {registrations.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 text-gray-400 italic shadow-sm">이 캠프의 기도자 데이터가 비어 있습니다.</div>
            ) : (
                registrations.map(reg => (
                <div
                    key={reg.id}
                    className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-start gap-4"
                >
                    <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-lg font-bold">{reg.name}</span>

                            <span
                                className={`text-[10px] px-2 py-1 rounded-full ${
                                    reg.role === Roles.STAFF
                                        ? "bg-red-100 text-red-600"
                                        : "bg-blue-100 text-blue-600"
                                }`}
                            >
                                {reg.role}
                            </span>

                            <span className="text-sm text-gray-500">
                                {reg.churchName}
                            </span>

                            <span className="rounded-lg bg-gray-100 px-2 py-1 font-mono text-xs font-bold text-gray-600">
                                PIN {reg.pin}
                            </span>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-1">
                            {reg.dates.map(date => (
                                <span
                                    key={date}
                                    className="text-[10px] px-2 py-1 rounded bg-gray-100"
                                >
                                    {date}
                                </span>
                            ))}
                        </div>

                        <p className="mt-4 text-sm text-gray-700 whitespace-pre-wrap">
                            {reg.prayerRequest}
                        </p>
                    </div>

                    {isCurrentCamp && (
                        <button
                            onClick={() => setEditingRegistration(reg)}
                            className="w-10 h-10 rounded-xl bg-blue-50 hover:bg-blue-100"
                        >
                            <i className="fa-solid fa-pen"></i>
                        </button>
                    )}
                </div>
                ))
            )}

            {totalRegistrations > 0 && (
                <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm sm:flex-row">
                    <p className="text-sm text-gray-500">
                        전체 <span className="font-bold text-gray-900">{totalRegistrations}명</span> 중{' '}
                        <span className="font-bold text-gray-900">
                            {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, totalRegistrations)}명
                        </span>
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => void onPageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-700 transition hover:bg-gray-50 disabled:cursor-default disabled:opacity-30"
                            aria-label="이전 페이지"
                        >
                            <i className="fa-solid fa-chevron-left" />
                        </button>
                        <span className="min-w-20 text-center text-sm font-bold text-gray-700">
                            {currentPage} / {totalPages}
                        </span>
                        <button
                            type="button"
                            onClick={() => void onPageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-700 transition hover:bg-gray-50 disabled:cursor-default disabled:opacity-30"
                            aria-label="다음 페이지"
                        >
                            <i className="fa-solid fa-chevron-right" />
                        </button>
                    </div>
                </div>
            )}
        
            {isCurrentCamp && editingRegistration && (
                <RelayFormModal
                    settingData={settingData}
                    campDates={campDates}
                    initialData={editingRegistration}
                    onClose={() => setEditingRegistration(null)}
                    onSubmit={async (data) => {
                        try {
                            await onUpdateRegistration({
                            id: editingRegistration.id,
                            originalPin: editingRegistration.pin,
                            newPin: data.pin,

                            name: data.name,
                            role: data.role,
                            churchName: data.churchName,
                            prayerRequest: data.prayerRequest,
                            dates: data.dates,
                            });
                        } finally {
                            await loadAdminRegistrations();
                            setEditingRegistration(null);
                        }
                    }}
                    onDelete={async () => {
                        try {
                            await onDeleteRegistration(editingRegistration.id, editingRegistration.pin);
                        } finally {
                            await loadAdminRegistrations();
                            setEditingRegistration(null);
                        }
                    }}
                />
        )}
        </div>
    );
}

export default RegistrationsTab;
