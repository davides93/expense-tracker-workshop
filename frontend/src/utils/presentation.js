export const currency = (value, code = 'EUR') => {
  const safeCode = /^[A-Z]{3}$/i.test(code) ? code.toUpperCase() : 'EUR';
  return new Intl.NumberFormat('en-IE', {
    style: 'currency', currency: safeCode, minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(Number(value) || 0);
};

export const dateKey = (date = new Date()) =>
  [String(date.getFullYear()).padStart(4, '0'), date.getMonth() + 1, date.getDate()]
    .map(value => String(value).padStart(2, '0')).join('-');

export const calendarDate = (value, options = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  value ? new Intl.DateTimeFormat('en-IE', { ...options, timeZone: 'UTC' })
    .format(new Date(value.slice(0, 10) + 'T00:00:00Z')) : '';

export const responseMessage = (error, fallback) =>
  typeof error.response?.data?.error === 'string' && [400, 404, 409].includes(error.response.status)
    ? error.response.data.error
    : fallback;
