import React, { useState } from 'react';

interface AdminTabProps {
    newAdminPin: string | null;
    setNewAdminPin: React.Dispatch<
        React.SetStateAction<string | null>
    >;

    onSaveSettingData: () => void;
}
const AdminTab: React.FC<AdminTabProps> = ({
  newAdminPin, setNewAdminPin, onSaveSettingData
}) => {
  const [showPin, setShowPin] = useState(false);
  const [saving, setSaving] = useState(false);
  const handleSave = async () => {
    try {
        setSaving(true);
        await onSaveSettingData();
    } catch (e) {
        console.error(e);
    } finally {
        setSaving(false);
    }
  };
    return (
        <div className="bg-white p-8 rounded-3xl shadow-sm border space-y-6">
            <label className="block text-sm font-bold mb-2">
                관리자 PIN
              </label>

            <div className="relative">
              <input
                  type={showPin ? "text" : "password"}
                  value={newAdminPin ?? ""}
                  maxLength={6}
                  onChange={e => setNewAdminPin(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 pr-12"
              />

              <button
                type="button"
                onClick={() => setShowPin(prev => !prev)}
                className="
                    absolute
                    inset-y-0
                    right-0
                    w-12
                    flex
                    items-center
                    justify-center
                    text-gray-500
                    hover:text-gray-700
                    transition-colors
                "
            >
                <i
                    className={`fa-solid ${
                        showPin ? "fa-eye-slash" : "fa-eye"
                    } text-xl`}
                />
            </button>
          </div>

            <button
              onClick={handleSave}
              className="w-full h-12 rounded-2xl bg-blue-600 text-white font-bold text-base shadow-lg transition hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                  <>
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                      저장 중...
                  </>
              ) : (
                  "관리자 PIN 저장"
              )}
            </button>
        </div>
    );
}
export default AdminTab;
