import React, { useCallback, useEffect, useState } from 'react';
import { fetchMonthlyStats } from '../utils/api';
import { calendarDate, currency, dateKey } from '../utils/presentation';
import { exportExpenses } from '../utils/exportExpenses';

export default function Reports({ revision }) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const load = useCallback(async signal => {
    setError('');
    try {
      const result = await fetchMonthlyStats(signal);
      if (!signal?.aborted) setRows(result);
    } catch {
      if (!signal?.aborted) setError('We couldn’t load the report. Try again.');
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load, revision]);

  const download = async () => {
    setExporting(true);
    setExportError('');
    try {
      await exportExpenses({});
    } catch {
      setExportError('We couldn’t export the transactions. Try again.');
    } finally {
      setExporting(false);
    }
  };

  const now = new Date();
  const months = new Map(rows?.map(row => [row.month.slice(0, 7), row]));
  const results = Array.from({ length: 12 }, (_, index) => {
    const key = dateKey(new Date(now.getFullYear(), now.getMonth() - index, 1)).slice(0, 7);
    const row = months.get(key);
    return { month: key + '-01', total: Number(row?.total ?? 0), count: Number(row?.count ?? 0) };
  });

  return (
    <>
      <header className="page-heading">
        <div><h1>Reports</h1><p className="muted">Monthly spending for the last 12 calendar months in EUR.</p></div>
        <div className="actions">
          <button className="btn btn-secondary" onClick={() => window.print()} disabled={!rows}>Print report</button>
          <button className="btn btn-primary" onClick={download} disabled={exporting}>
            {exporting ? 'Exporting…' : 'Export all expenses'}
          </button>
        </div>
      </header>
      {exportError && <p className="error" role="alert">{exportError}</p>}
      {error && <div className="error" role="alert"><p>{error}</p>
        <button className="btn btn-secondary" onClick={() => load()}>Reload report</button></div>}
      {!rows && !error && <p className="card" role="status">Loading report…</p>}
      {rows && (
        <section className="card" aria-labelledby="monthly-report">
          <h2 id="monthly-report">Monthly breakdown</h2>
          <table>
            <thead><tr><th scope="col">Month</th><th scope="col">Expenses</th><th scope="col">Total (EUR)</th>
              <th scope="col">vs. prior month</th></tr></thead>
            <tbody>
              {results.map((row, index) => (
                <tr key={row.month}>
                  <th scope="row">{calendarDate(row.month, { month: 'short', year: 'numeric' })}</th>
                  <td>{row.count}</td><td>{currency(row.total)}</td>
                  <td>{results[index + 1] ? currency(row.total - results[index + 1].total) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}
