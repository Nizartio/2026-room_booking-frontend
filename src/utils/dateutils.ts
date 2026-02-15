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

// Convert ISO string to datetime-local input format (YYYY-MM-DDTHH:MM) in local timezone
export const toDateTimeLocalString = (isoString: string): string => {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Convert datetime-local input format to ISO string without timezone shift
export const fromDateTimeLocalString = (localString: string): string => {
  // datetime-local format: "YYYY-MM-DDTHH:MM"
  // Parse as local time and convert to ISO with local offset
  const date = new Date(localString);
  return date.toISOString();
};
