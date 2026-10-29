import type { PrayerRegistrationReadDto } from "../../../types";

interface SearchViewProps {
    keyword: string;
    onKeywordChange: (keyword: string) => void;
    onSearch: () => void;
    hasSearched: boolean;
    loading: boolean;

    registrations: PrayerRegistrationReadDto[];

    onSelect: (registration: PrayerRegistrationReadDto) => void;
}

export default function SearchView({
    keyword, onKeywordChange, onSearch, hasSearched, loading, registrations, onSelect
}: SearchViewProps) {
  return (
    <>
    <form
        className="mb-6 flex flex-col gap-3 sm:flex-row sm:gap-2"
        onSubmit={(event) => {
            event.preventDefault();
            onSearch();
        }}
    >
        <div className="relative min-w-0 flex-1">
            <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"/>

            <input
                value={keyword}
                onChange={(e) => onKeywordChange(e.target.value)}
                placeholder="이름 또는 교회명을 입력하세요"
                className="
                    w-full
                    rounded-xl sm:rounded-2xl
                    bg-white/5
                    border border-white/10
                    py-3.5 sm:py-4
                    pl-12
                    pr-4
                    text-white
                    placeholder:text-gray-500
                    focus:outline-none
                    focus:ring-2
                    focus:ring-red-500
                    transition
                "
            />
        </div>
        <button
            type="submit"
            disabled={loading}
            className="min-h-12 w-full shrink-0 rounded-xl bg-red-600 px-5 font-bold text-white transition hover:bg-red-500 disabled:opacity-50 sm:w-auto sm:rounded-2xl"
        >
            {loading ? '검색 중' : '검색'}
        </button>
    </form>
    

    {hasSearched && (
    <div className="mt-4">
        {registrations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <i className="fa-solid fa-magnifying-glass text-3xl mb-4 text-gray-600"></i>
                <p className="text-sm">검색 결과가 없습니다.</p>
                <p className="text-xs mt-2 text-gray-600">
                    이름 또는 교회명을 다시 확인해주세요.
                </p>
            </div>
        ) : (
            <div className="space-y-3">
                {registrations.map((r) => (
                    <button
                        key={r.id}
                        onClick={() => onSelect(r)}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-4 text-left"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="font-semibold text-white">
                                    {r.name}
                                </div>

                                <div className="text-sm text-gray-400">
                                    {r.churchName}
                                </div>

                                <div className="text-xs text-gray-500 mt-2">
                                    {r.dates.length}일 신청
                                </div>
                            </div>

                            <i className="fa-solid fa-chevron-right text-gray-500 mt-2"></i>
                        </div>
                    </button>
                ))}
            </div>
        )}
    </div>
    )}
    </>
  );
}
