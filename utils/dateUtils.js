// utils/dateUtils.js
export const formatRange = (startDate, startTime, endDate, endTime) => {
  const sd = new Date(`${startDate}T${startTime}`);
  const ed = new Date(`${endDate}T${endTime}`);
  const opts = { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
  const startStr = sd.toLocaleString('en-US', opts);
  const endStr = ed.toLocaleTimeString('en-US', opts);
  return `${startStr} – ${endStr}`;
};
