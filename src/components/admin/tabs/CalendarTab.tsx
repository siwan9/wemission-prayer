import React, { useMemo } from 'react';

import type {
    PrayerRegistration,
} from "../../../types";


interface CalendarTabProps {
    registrations: PrayerRegistration[];

    serviceStartDate: string;

    serviceEndDate: string;
}

const CalendarTab: React.FC<CalendarTabProps> = ({
    registrations, serviceStartDate, serviceEndDate
}) => {
    const parseLocalDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split("-").map(Number);
        return new Date(year, month - 1, day);
    };

    const formatDate = (date: Date) => {
        return `${date.getFullYear()}-${String(
            date.getMonth() + 1
        ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    };

    const calendarDays = useMemo(() => {
        const days: string[] = [];

        const start = parseLocalDate(serviceStartDate);
        const end = parseLocalDate(serviceEndDate);

        const firstDay = new Date(start);
        while (firstDay.getDay() !== 0) {
            firstDay.setDate(firstDay.getDate() - 1);
        }

        const lastDay = new Date(end);
        while (lastDay.getDay() !== 6) {
            lastDay.setDate(lastDay.getDate() + 1);
        }

        const curr = new Date(firstDay);

        while (curr <= lastDay) {
            days.push(formatDate(curr));
            curr.setDate(curr.getDate() + 1);
        }

        return days;
    }, [serviceStartDate, serviceEndDate]);

    return (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <i className="fa-solid fa-calendar-days text-blue-500"></i>
                전체 신청 현황
            </h2>
            <div className="grid grid-cols-7 gap-3">
                {['일','월','화','수','목','금','토'].map(d => <div key={d} className="text-center text-sm font-bold text-gray-500 pb-2">{d}</div>)}
                {calendarDays.map((dateStr, idx) => {
                const dayRegs = registrations.filter(r => r.dates.includes(dateStr));
                const date = parseLocalDate(dateStr);

                const prevDate =
                    idx > 0 ? parseLocalDate(calendarDays[idx - 1]) : null;

                const showMonth =
                    dateStr === serviceStartDate ||
                    (prevDate && prevDate.getMonth() !== date.getMonth());

                const isInRange =
                    dateStr >= serviceStartDate &&
                    dateStr <= serviceEndDate;

                const isSunday = date.getDay() === 0;
                const isSaturday = date.getDay() === 6;
                
                return (
                    <div
                        key={dateStr}
                        className={`min-h-[100px] border rounded-2xl p-2 flex flex-col items-center transition-colors ${
                            isInRange
                                ? "bg-gray-50/30 border-gray-100"
                                : "bg-gray-50/10 border-gray-100 opacity-30"
                        }`}
                    >
                    <div className="flex flex-col items-center mb-2">
                        <div className="h-3 flex items-center justify-center">
                            {showMonth && (
                                <span className="text-xs md:text-sm font-bold text-gray-600 whitespace-nowrap">
                                    {date.getMonth() + 1}
                                </span>
                            )}
                        </div>

                        <span
                            className={`text-base md:text-lg font-bold ${
                                isSunday
                                    ? "text-red-500"
                                    : isSaturday
                                    ? "text-blue-500"
                                    : "text-gray-900"
                            }`}
                        >
                            {date.getDate()}
                        </span>
                    </div>
                   <div className="flex flex-col gap-0.5 w-full mt-1">
    {dayRegs.slice(0, 3).map(reg => (
        <div
            key={reg.id}
            className="truncate text-center text-[10px] md:text-[11px] font-medium text-gray-700"
            title={reg.name}
        >
            {reg.name}
        </div>
    ))}

    {dayRegs.length > 3 && (
        <div className="text-[10px] text-center text-blue-600 font-semibold">
            +{dayRegs.length - 3}명
        </div>
    )}
</div>
                    </div>
                );
                })}
            </div>
        </div>
    );
}

export default CalendarTab;