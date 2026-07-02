import React, { useState } from "react";
import type { LinksData } from "../../../types";

interface LinksTabProps {
    linksData: LinksData;
    setLinksData: React.Dispatch<
        React.SetStateAction<LinksData>
    >;

    onUpdateLinksData: () => Promise<void>;
}

const LinksTab: React.FC<LinksTabProps> = ({
    linksData,
    setLinksData,
    onUpdateLinksData,
}) => {
    const [saving, setSaving] = useState(false);

    const isValidUrl = (url: string) => {
        if (!url) return true;

        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const handleSave = async () => {
        const urls = [
            { name: "찬양 리스트", value: linksData.songListUrl },
            { name: "찬양 악보", value: linksData.songSheetUrl },
            { name: "캠프 소개", value: linksData.campIntroUrl },
            { name: "인스타그램", value: linksData.instagramUrl },
            { name: "유튜브", value: linksData.youtubeUrl },
            { name: "후원하기", value: linksData.donationUrl },
            { name: "홈페이지", value: linksData.homepageUrl },
        ];

        for (const url of urls) {
            if (!isValidUrl(url.value)) {
                alert(`${url.name} 링크가 올바르지 않습니다.`);
                return;
            }
        }

        try {
            setSaving(true);
            await onUpdateLinksData();
            alert("링크가 저장되었습니다.");
        } catch (e) {
            console.error(e);
            alert("저장에 실패했습니다.");
        } finally {
            setSaving(false);
        }
    };

    const updateField = (key: keyof LinksData, value: string) => {
        setLinksData(prev => ({
            ...prev,
            [key]: value,
        }));
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 space-y-7">
                <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                        🎵 찬양 리스트
                    </label>
                    <input
                        className="w-full h-12 rounded-xl border border-gray-200 px-4 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://..."
                        value={linksData.songListUrl}
                        onChange={e =>
                            updateField("songListUrl", e.target.value)
                        }
                    />
                </div>

                <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                        🎼 찬양 악보
                    </label>
                    <input
                        className="w-full h-12 rounded-xl border border-gray-200 px-4 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://..."
                        value={linksData.songSheetUrl}
                        onChange={e =>
                            updateField("songSheetUrl", e.target.value)
                        }
                    />
                </div>

                <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                        📖 캠프 소개
                    </label>
                    <input
                        className="w-full h-12 rounded-xl border border-gray-200 px-4 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://..."
                        value={linksData.campIntroUrl}
                        onChange={e =>
                            updateField("campIntroUrl", e.target.value)
                        }
                    />
                </div>

                <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                        📷 인스타그램
                    </label>
                    <input
                        className="w-full h-12 rounded-xl border border-gray-200 px-4 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://..."
                        value={linksData.instagramUrl}
                        onChange={e =>
                            updateField("instagramUrl", e.target.value)
                        }
                    />
                </div>

                <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                        ▶️ 유튜브
                    </label>
                    <input
                        className="w-full h-12 rounded-xl border border-gray-200 px-4 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://..."
                        value={linksData.youtubeUrl}
                        onChange={e =>
                            updateField("youtubeUrl", e.target.value)
                        }
                    />
                </div>

                <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                        ❤️ 후원하기
                    </label>
                    <input
                        className="w-full h-12 rounded-xl border border-gray-200 px-4 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://..."
                        value={linksData.donationUrl}
                        onChange={e =>
                            updateField("donationUrl", e.target.value)
                        }
                    />
                </div>

                <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                        🏠 홈페이지
                    </label>
                    <input
                        className="w-full h-12 rounded-xl border border-gray-200 px-4 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://..."
                        value={linksData.homepageUrl}
                        onChange={e =>
                            updateField("homepageUrl", e.target.value)
                        }
                    />
                </div>

                <div className="pt-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full h-14 rounded-2xl bg-blue-600 text-white font-bold text-base shadow-lg transition hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                                저장 중...
                            </>
                        ) : (
                            <>
                                <i className="fa-solid mr-2"></i>
                                링크 저장
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default LinksTab;