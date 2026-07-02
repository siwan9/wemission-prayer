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
    const calendarDays = useMemo(() => {
        const days = [];
        const curr = new Date(serviceStartDate);
        const end = new Date(serviceEndDate);

        while (curr <= end) {
            days.push(curr.toISOString().split("T")[0]);
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
                {['일','월','화','수','목','금','토'].map(d => <div key={d} className="text-center text-xs font-bold text-gray-400 pb-2">{d}</div>)}
                {calendarDays.map((dateStr, idx) => {
                const dayRegs = registrations.filter(r => r.dates.includes(dateStr));
                const date = new Date(dateStr);
                const isSunday = idx % 7 === 0;
                const isSaturday = idx % 7 === 6;
                
                return (
                    <div key={dateStr} className="min-h-[100px] border border-gray-100 rounded-2xl p-2 flex flex-col items-center bg-gray-50/30">
                    <span className={`text-xs font-bold mb-1 ${isSunday ? 'text-red-500' : isSaturday ? 'text-blue-500' : 'text-gray-900'}`}>{date.getDate()}</span>
                    <div className="flex flex-col gap-1 w-full overflow-hidden">
                        {dayRegs.map(reg => (
                        <div key={reg.id} className="text-[9px] bg-white px-1 py-0.5 rounded border border-gray-200 truncate shadow-sm">
                            {reg.name}
                        </div>
                        ))}
                    </div>
                    </div>
                );
                })}
            </div>
        </div>
    );
}

export default CalendarTab;