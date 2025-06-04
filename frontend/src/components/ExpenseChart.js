import React, { useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ExpenseChart = ({ data, recentExpenses }) => {
  // Prepare data for doughnut chart (expenses by category)
  const doughnutData = {
    labels: data.map(item => item.category || 'Other'),
    datasets: [
      {
        label: 'Expenses by Category',
        data: data.map(item => parseFloat(item.total) || 0),
        backgroundColor: data.map(item => item.color || '#667eea'),
        borderColor: '#fff',
        borderWidth: 3,
        hoverBorderWidth: 5,
      },
    ],
  };

  // Prepare data for line chart (recent expenses trend)
  const lineData = {
    labels: recentExpenses.map(item => {
      try {
        return new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } catch {
        return item.date;
      }
    }),
    datasets: [
      {
        label: 'Daily Expenses',
        data: recentExpenses.map(item => parseFloat(item.total) || 0),
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#667eea',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            weight: '600',
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#667eea',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `${context.label}: €${parseFloat(context.parsed || context.raw).toFixed(2)}`;
          }
        }
      },
    },
  };

  const lineOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value) {
            return '€' + value.toFixed(0);
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📊</div>
        <h3>No data to display</h3>
        <p>Add some expenses to see your analytics!</p>
      </div>
    );
  }

  return (
    <div style={{ height: '400px', position: 'relative' }}>
      {data.length > 0 && (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, marginBottom: '20px' }}>
            <h4 style={{ textAlign: 'center', marginBottom: '15px', color: '#333' }}>
              💰 Expenses by Category
            </h4>
            <Doughnut data={doughnutData} options={chartOptions} />
          </div>
          
          {recentExpenses && recentExpenses.length > 0 && (
            <div style={{ height: '200px', marginTop: '20px' }}>
              <h4 style={{ textAlign: 'center', marginBottom: '15px', color: '#333' }}>
                📈 7-Day Trend
              </h4>
              <Line data={lineData} options={lineOptions} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpenseChart;