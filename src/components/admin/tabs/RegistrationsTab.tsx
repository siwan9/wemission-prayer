import React, { useState } from 'react';

import type {
    PrayerRegistration, PrayerRegistrationUpdateDto, SettingDataReadDto,
} from "../../../types";
import { Roles } from "../../../types";

import RelayFormModal from '../../modal/RelayFormModal';

interface RegistrationsTabProps {

    registrations: PrayerRegistration[];

    settingData: SettingDataReadDto;

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
    registrations, settingData, onUpdateRegistration, onDeleteRegistration, loadAdminRegistrations
}) => {
    const [editingRegistration, setEditingRegistration] = useState<PrayerRegistration | null>(null);

    return (
        <div className="space-y-4">
            {registrations.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 text-gray-400 italic shadow-sm">신청 데이터가 비어 있습니다.</div>
            ) : (
                registrations.sort((a, b) => (a.dates[0] || '').localeCompare(b.dates[0] || '')).map(reg => (
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

                    <button
                        onClick={() => setEditingRegistration(reg)}
                        className="w-10 h-10 rounded-xl bg-blue-50 hover:bg-blue-100"
                    >
                        <i className="fa-solid fa-pen"></i>
                    </button>
                </div>
                ))
            )}
        
            {editingRegistration && (
                <RelayFormModal
                    settingData={settingData}
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