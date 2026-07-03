import React, { useState } from "react";

interface AdminAuthModalProps {
  onSuccess: (adminPin: string) => void;
  onClose: () => void;
  onVerifyPin: (pin: string) => Promise<boolean>;
}

const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  onSuccess,
  onClose,
  onVerifyPin,
}) => {
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const success = await onVerifyPin(pw);

      if (success) {
        onSuccess(pw);
      } else {
        alert("비밀번호가 올바르지 않습니다.");
        setPw("");
      }
    } catch (err) {
      console.error(err);
      alert("인증 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/15 backdrop-blur-sm transition-all duration-200">
      <div className="bg-white rounded-3xl p-8 w-full max-w-xs space-y-6">
        <div className="text-center">
          <i className="fa-solid fa-lock text-gray-400 text-3xl mb-4"></i>
          <h2 className="text-gray-900 text-lg font-bold">관리자 인증</h2>
          <p className="text-gray-500 text-xs">비밀번호를 입력하세요</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <input
            type="password"
            autoFocus
            disabled={loading}
            className="w-full text-center text-2xl tracking-[0.5em] border-b-2 border-gray-200 py-2 focus:border-red-500 focus:outline-none text-gray-900"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 text-gray-500 text-sm"
            >
              취소
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 text-white rounded-xl py-3 font-bold shadow-lg shadow-red-200"
            >
              {loading ? "확인 중..." : "입력"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAuthModal;