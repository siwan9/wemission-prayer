import React, { useState } from 'react';
import type { SettingDataReadDto } from "../../../types";

interface ContentTabProps {
    editingSettingData: SettingDataReadDto;
    setEditingSettingData: React.Dispatch<
        React.SetStateAction<SettingDataReadDto>
    >;

    onSaveSettingData: () => Promise<void>;
}

export default function ContentTab({
    editingSettingData,
    setEditingSettingData,
    onSaveSettingData,
}: ContentTabProps) {
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (saving) return;

        try {
            setSaving(true);
            await onSaveSettingData();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-4">

                <label className="text-lg font-bold text-gray-900">
                    위미션 기도제목
                </label>

                <textarea
                    className="w-full border-2 border-gray-200 rounded-2xl p-6 min-h-[400px] text-base focus:border-black transition-colors bg-white shadow-inner leading-relaxed"
                    value={editingSettingData.prayerPoints}
                    onChange={e =>
                        setEditingSettingData({
                            ...editingSettingData,
                            prayerPoints: e.target.value,
                        })
                    }
                    placeholder="각 기도제목을 줄바꿈(Enter)으로 구분하여 입력하세요."
                />

            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-4">

                <label className="text-lg font-bold text-gray-900">
                    위미션 소개
                </label>

                <textarea
                    className="w-full border-2 border-gray-200 rounded-2xl p-6 min-h-[200px] text-base focus:border-black transition-colors bg-white shadow-inner leading-relaxed"
                    value={editingSettingData.guide}
                    onChange={e =>
                        setEditingSettingData({
                            ...editingSettingData,
                            guide: e.target.value,
                        })
                    }
                    placeholder='위미션 소개를 입력하세요.'
                />

            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                <label className="text-lg font-bold text-gray-900">
                    말씀
                </label>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-600">
                        말씀 제목
                    </label>

                    <input
                        className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-base focus:border-black transition-colors bg-white shadow-inner"
                        value={editingSettingData.bibleTitle}
                        onChange={e =>
                            setEditingSettingData({
                                ...editingSettingData,
                                bibleTitle: e.target.value,
                            })
                        }
                        placeholder="예) 요한복음 3:16"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-600">
                        말씀 내용
                    </label>

                    <textarea
                        className="w-full border-2 border-gray-200 rounded-2xl p-6 min-h-[180px] text-base focus:border-black transition-colors bg-white shadow-inner leading-relaxed"
                        value={editingSettingData.bibleContent}
                        onChange={e =>
                            setEditingSettingData({
                                ...editingSettingData,
                                bibleContent: e.target.value,
                            })
                        }
                        placeholder="말씀 본문을 입력하세요."
                    />
                </div>
                
                <div className="flex justify-end pt-2">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="
                        w-full
                        h-14
                        rounded-2xl
                        bg-blue-600
                        text-white
                        font-bold
                        text-base
                        shadow-lg
                        transition
                        hover:bg-blue-700
                        enabled:active:scale-[0.98]
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                    "
                >
                    {saving ? (
                        <span className="inline-flex items-center gap-2">
                            <svg
                                className="h-5 w-5 animate-spin"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-20"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-90"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                />
                            </svg>

                            저장 중...
                        </span>
                    ) : (
                        "저장"
                    )}
                </button>
            </div>
            </div>

        </div>
    );
}