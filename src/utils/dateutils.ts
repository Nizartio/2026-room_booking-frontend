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

// Format date as "DD Month YYYY" (e.g., "26 February 2026")
export const formatDateLong = (dateString: string) => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  };
  return date.toLocaleDateString('id-ID', options);
};

// Format date as "DD-MM-YYYY"
export const formatDateShort = (dateString: string) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};
