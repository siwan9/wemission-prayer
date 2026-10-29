
import React, { useState } from 'react';
import type { PrayerRegistration, EditStep, PrayerRegistrationReadDto } from '../../../types';
import SearchView from './SearchView';
import PinVerifyView from './PinVerifyView';
import { searchCurrentRegistrations } from '../../../services/RegistrationService';

interface EditPrayerModalProps {
    onClose: () => void;
    onVerifyPin: (id: string, pin: string) => Promise<PrayerRegistration | null>;
    onEdit: (prayer: PrayerRegistration) => void;
}

const EditPrayerModal: React.FC<EditPrayerModalProps> = ({
    onClose, onVerifyPin, onEdit}) => {
    const [editStep, setEditStep] = useState<EditStep>("SEARCH");
    const [keyword, setKeyword] = useState("");
    const [searchResults, setSearchResults] = useState<PrayerRegistrationReadDto[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedPrayer, setSelectedPrayer] = useState<PrayerRegistrationReadDto | null>(null);

    const handleSearch = async () => {
        const search = keyword.trim().toLowerCase();

        if (!search) {
            alert("이름 또는 교회명을 입력해주세요.");
            return;
        }

        setLoading(true);
        try {
            setSearchResults(await searchCurrentRegistrations(search));
            setHasSearched(true);
            setSelectedPrayer(null);
        } catch (error) {
            console.error(error);
            alert('기도 기록을 검색하지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedPrayer(null);
        setEditStep("SEARCH");

        onClose();
    };
    

    const renderContent = () => {
        switch(editStep){
            case "SEARCH":
                return (
                    <SearchView
                        keyword={keyword}
                        onKeywordChange={(value) => {
                            setKeyword(value);
                            setHasSearched(false);
                            setSearchResults([]);
                            setSelectedPrayer(null);
                        }}
                        onSearch={() => void handleSearch()}
                        hasSearched={hasSearched}
                        loading={loading}
                        registrations={searchResults}
                        onSelect={(prayer)=>{
                            setSelectedPrayer(prayer);
                            setEditStep("PIN");
                        }}
                    />
                );

            case "PIN":
                if (!selectedPrayer) {
                    return null;
                }

                return (
                    <PinVerifyView
                        prayer={selectedPrayer}
                        onVerifyPin={async (id, pin) => {
                            const registration = await onVerifyPin(id, pin);

                            if (!registration) {
                                return false;
                            }

                            onEdit(registration);
                            onClose();
                            
                            return true;
                        }}

                        onBack={() => {
                            setSelectedPrayer(null);
                            setEditStep("SEARCH");
                        }}
                    />
                );
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-2 backdrop-blur-md sm:p-4">

            <div className="bg-[#0a0a0a]
                border border-white/10
                rounded-3xl sm:rounded-[2rem]
                shadow-2xl
                w-full
                max-w-2xl
                max-h-[calc(100dvh-1rem)] sm:max-h-[90vh]
                overflow-hidden
                flex flex-col
                animate-fadeIn">

                <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-8 sm:py-6">

                    <div className="min-w-0">
                        <h2 className="text-xl font-bold text-white sm:text-2xl">
                            신청 내역 수정
                        </h2>

                        <p className="text-xs text-gray-500 mt-1">
                            이름 또는 교회명으로 검색하세요.
                        </p>
                    </div>

                    <button
                        onClick={handleClose}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-white/5"
                        aria-label="신청 내역 수정 창 닫기"
                    >
                        <i className="fa-solid fa-xmark text-xl text-gray-400"/>
                    </button>

                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
                    {renderContent()}
                </div>

            </div>

        </div>
    );
}
export default EditPrayerModal;
