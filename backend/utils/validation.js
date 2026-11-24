const MAX_ID = 2147483647;

function integer(value) {
  if (typeof value !== 'number' && (typeof value !== 'string' || !/^\d+$/.test(value))) {
    return NaN;
  }
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : NaN;
}

function validId(value) {
  const id = integer(value);
  return id > 0 && id <= MAX_ID;
}

function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000')) {
    return false;
  }
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

module.exports = { MAX_ID, integer, validId, validDate };
