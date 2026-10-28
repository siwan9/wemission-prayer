
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
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-md flex items-center justify-center p-4">

            <div className="bg-[#0a0a0a]
                border border-white/10
                rounded-[2rem]
                shadow-2xl
                w-full
                max-w-2xl
                max-h-[90vh]
                overflow-hidden
                animate-fadeIn">

                <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">

                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            신청 내역 수정
                        </h2>

                        <p className="text-xs text-gray-500 mt-1">
                            이름 또는 교회명으로 검색하세요.
                        </p>
                    </div>

                    <button
                        onClick={handleClose}
                        className="w-10 h-10 rounded-full hover:bg-white/5"
                    >
                        <i className="fa-solid fa-xmark text-xl text-gray-400"/>
                    </button>

                </div>

                <div className="p-6 overflow-y-auto max-h-[75vh]">
                    {renderContent()}
                </div>

            </div>

        </div>
    );
}
export default EditPrayerModal;
