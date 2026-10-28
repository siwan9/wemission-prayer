export const formatDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

export const parseLocalDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const getMonthKey = (dateStr: string) => dateStr.slice(0, 7);

export const shiftMonth = (monthKey: string, amount: number) => {
  const [year, month] = monthKey.split("-").map(Number);
  return formatDate(new Date(year, month - 1 + amount, 1)).slice(0, 7);
};

export const getMonthTitle = (monthKey: string) => {
  const [year, month] = monthKey.split("-").map(Number);
  return `${year}년 ${month}월`;
};

export const getCalendarDaysForMonth = (monthKey: string) => {
  const [year, month] = monthKey.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);

  const gridStart = new Date(firstDay);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());

  const gridEnd = new Date(lastDay);
  gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));

  const days: string[] = [];
  const current = new Date(gridStart);

  while (current <= gridEnd) {
    days.push(formatDate(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
};
