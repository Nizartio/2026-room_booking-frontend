export const generateDateRange = (start: string, end: string) => {
  const dates: string[] = [];

  const current = new Date(start);
  const last = new Date(end);

  while (current <= last) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

export const combineDateTime = (date: string, time: string) => {
  return new Date(`${date}T${time}:00`).toISOString();
};
