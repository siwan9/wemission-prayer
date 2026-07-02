interface StatusTabProps {
    registrationCount: number;
    isConnected: boolean;
}

const StatusTab: React.FC<StatusTabProps> = ({
    registrationCount,
    isConnected
}) => {
    return (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6 animate-fadeIn">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <i className="fa-solid fa-database text-green-500"></i>
                Supabase 연결 상태
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="text-xs font-bold text-gray-400 uppercase mb-2">
                        Supabase Database
                    </div>

                    <div className="flex items-center gap-2">
                        <div
                            className={`w-3 h-3 rounded-full ${
                                isConnected ? "bg-green-500" : "bg-red-500"
                            }`}
                        />

                        <span className="font-bold">
                            {isConnected ? "정상 작동 중" : "연결 실패"}
                        </span>
                    </div>

                    <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                        데이터가 조회되지 않는다면 Supabase 프로젝트와 API URL,
                        Anon Key, RLS 정책 및 RPC 설정을 확인해주세요.
                    </p>
                </div>

                <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="text-xs font-bold text-gray-400 uppercase mb-2">
                        총 신청 건수
                    </div>

                    <div className="text-3xl font-black text-black">
                        {registrationCount} 건
                    </div>

                    <p className="text-xs text-gray-500 mt-3 italic">
                        현재 등록되어 있는 전체 신청 수입니다.
                    </p>
                </div>
            </div>

            <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 text-blue-800 text-sm">
                <h4 className="font-bold mb-2">운영자 팁</h4>

                <ul className="list-disc list-inside space-y-1">
                    <li>
                        Supabase Dashboard에서 신청 데이터와 캠프 일정을 직접
                        확인하거나 수정할 수 있습니다.
                    </li>
                    <li>
                        관리자 PIN과 캠프 정보는 설정 페이지에서 변경할 수
                        있습니다.
                    </li>
                    <li>
                        RLS를 사용하는 경우 정책 또는 RPC 권한이 올바르게
                        설정되어 있는지 확인하세요.
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default StatusTab;