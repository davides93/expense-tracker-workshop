import { fetchExpenses } from './api';

function cell(value) {
  const raw = String(value ?? '');
  const safe = /^[\s]*[=+\-@]|^[\t\r\n]/.test(raw) ? "'" + raw : raw;
  return '"' + safe.replace(/"/g, '""') + '"';
}

export async function exportExpenses(filters) {
  const rows = ['Date,Description,Category,Amount,Currency'];
  let offset = 0;
  let more;
  do {
    const { expenses, hasMore } = await fetchExpenses({ ...filters, offset, limit: 100 });
    for (const expense of expenses) {
      rows.push([
        expense.expense_date.slice(0, 10), expense.description, expense.category_name,
        expense.amount, expense.currency || 'EUR',
      ].map(cell).join(','));
    }
    offset += expenses.length;
    more = hasMore && expenses.length > 0;
  } while (more);

  const url = URL.createObjectURL(new Blob(['\uFEFF', rows.join('\r\n')], { type: 'text/csv;charset=utf-8' }));
  const download = document.createElement('a');
  download.href = url;
  download.download = 'expenses.csv';
  download.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
