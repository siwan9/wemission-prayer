import { useState } from "react";
import type { PrayerRegistrationReadDto } from "../../../types";

interface PinVerifyViewProps {
    prayer: PrayerRegistrationReadDto;

    onVerifyPin: (id: string, pin: string) => Promise<boolean>;

    onBack: () => void;
}

export default function PinVerifyView({
    prayer,
    onVerifyPin,
    onBack,
}: PinVerifyViewProps) {

    const [pin, setPin] = useState("");
    const [loading, setLoading] = useState(false);

    const handleVerify = async () => {

        if (pin.length !== 6) {
            alert("PIN 번호 6자리를 입력해주세요.");
            return;
        }

        setLoading(true);

        try {

            const success = await onVerifyPin(prayer.id, pin);

            if (!success) {
                alert("PIN 번호가 일치하지 않습니다.");
                return;
            }

        } finally {
            setLoading(false);
        }

    };

    return (
        <div className="space-y-4">

            <h2 className="text-xl font-bold">
                PIN 번호 확인
            </h2>

            <div className="rounded-lg border p-3">
                <div>{prayer.name}</div>
                <div className="text-sm text-gray-500">
                    {prayer.churchName}
                </div>
            </div>

            <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) =>
                    setPin(e.target.value.replace(/\D/g, ""))
                }
                placeholder="6자리 PIN"
                className="
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    px-4
                    py-3
                    text-black
                    placeholder:text-gray-400
                    caret-red-500
                    focus:outline-none
                    focus:ring-2
                    focus:ring-red-500
                "
            />

            <div className="flex gap-2">

                <button
                    onClick={onBack}
                    className="flex-1 border rounded-lg p-3"
                >
                    뒤로
                </button>

                <button
                    onClick={handleVerify}
                    disabled={loading}
                    className="flex-1 bg-red-600 text-white rounded-lg p-3"
                >
                    {loading ? "확인 중..." : "확인"}
                </button>

            </div>

        </div>
    );

}