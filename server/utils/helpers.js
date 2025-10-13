// helpers.js
export const generateID = (prefix = 'ID') => {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const calculateWorkingDays = (startDate, endDate) => {
  let count = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
};

export const generateEmployeeId = (count) => {
  return `EMP${String(count + 1).padStart(4, '0')}`;
};

export default {
  generateID,
  formatDate,
  formatTime,
  calculateWorkingDays,
  generateEmployeeId
};
