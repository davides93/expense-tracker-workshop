import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from '../pages/Dashboard';

// Mock child components
jest.mock('../components/ExpensesList', () => {
  return function MockExpensesList({ expenses, categories, showAll }) {
    return (
      <div data-testid="expenses-list">
        <div>Expenses count: {expenses.length}</div>
        <div>Categories count: {categories.length}</div>
        <div>Show all: {showAll ? 'true' : 'false'}</div>
      </div>
    );
  };
});

jest.mock('../components/StatsCards', () => {
  return function MockStatsCards({ stats }) {
    return (
      <div data-testid="stats-cards">
        Stats: {stats ? 'loaded' : 'not loaded'}
      </div>
    );
  };
});

jest.mock('../components/ExpenseChart', () => {
  return function MockExpenseChart({ data, recentExpenses }) {
    return (
      <div data-testid="expense-chart">
        <div>Categories data: {data.length}</div>
        <div>Recent expenses: {recentExpenses.length}</div>
      </div>
    );
  };
});

describe('Dashboard Component', () => {
  const mockCategories = [
    { id: 1, name: 'Food', color: '#FF0000' },
    { id: 2, name: 'Transport', color: '#00FF00' }
  ];

  const mockExpenses = Array.from({ length: 7 }, (_, i) => ({
    id: i + 1,
    amount: 50 + i * 10,
    description: `Expense ${i + 1}`,
    category_id: 1
  }));

  const mockDashboardStats = {
    currentMonth: { total_expenses: 7, total_amount: 420 },
    expensesByCategory: [
      { category: 'Food', total: 300, count: 5 },
      { category: 'Transport', total: 120, count: 2 }
    ],
    recentExpenses: [
      { date: '2023-12-01', total: 50 },
      { date: '2023-12-02', total: 75 }
    ],
    budgetOverview: [
      {
        category: 'Food',
        color: '#FF0000',
        budget_amount: 400,
        spent_amount: 300,
        percentage_used: 75
      },
      {
        category: 'Transport',
        color: '#00FF00',
        budget_amount: 200,
        spent_amount: 180,
        percentage_used: 90
      }
    ]
  };

  describe('Basic Rendering', () => {
    it('renders dashboard header with current date', () => {
      render(
        <Dashboard 
          expenses={[]} 
          categories={[]} 
          dashboardStats={{}} 
        />
      );

      expect(screen.getByText('📊 Dashboard Overview')).toBeInTheDocument();
      
      // Check that date is displayed (format will depend on locale)
      const dateRegex = /\w+,\s+\w+\s+\d{1,2},\s+\d{4}/;
      expect(screen.getByText(dateRegex)).toBeInTheDocument();
    });

    it('renders all main sections', () => {
      render(
        <Dashboard 
          expenses={mockExpenses} 
          categories={mockCategories} 
          dashboardStats={mockDashboardStats} 
        />
      );

      expect(screen.getByTestId('stats-cards')).toBeInTheDocument();
      expect(screen.getByText('📈 Expense Analytics')).toBeInTheDocument();
      expect(screen.getByTestId('expense-chart')).toBeInTheDocument();
      expect(screen.getByText('💳 Recent Expenses')).toBeInTheDocument();
    });
  });

  describe('Expenses List Rendering', () => {
    it('shows recent expenses (first 5) in the recent section', () => {
      render(
        <Dashboard 
          expenses={mockExpenses} 
          categories={mockCategories} 
          dashboardStats={mockDashboardStats} 
        />
      );

      const expensesLists = screen.getAllByTestId('expenses-list');
      
      // First list should be recent expenses (5 items, showAll false)
      expect(expensesLists[0]).toHaveTextContent('Expenses count: 5');
      expect(expensesLists[0]).toHaveTextContent('Show all: false');
    });

    it('shows "All Expenses" section when more than 5 expenses', () => {
      render(
        <Dashboard 
          expenses={mockExpenses} 
          categories={mockCategories} 
          dashboardStats={mockDashboardStats} 
        />
      );

      expect(screen.getByText('📝 All Expenses')).toBeInTheDocument();
      
      const expensesLists = screen.getAllByTestId('expenses-list');
      // Second list should be all expenses (7 items, showAll true)
      expect(expensesLists[1]).toHaveTextContent('Expenses count: 7');
      expect(expensesLists[1]).toHaveTextContent('Show all: true');
    });

    it('shows expense count when more than 5 expenses', () => {
      render(
        <Dashboard 
          expenses={mockExpenses} 
          categories={mockCategories} 
          dashboardStats={mockDashboardStats} 
        />
      );

      expect(screen.getByText('Showing 5 of 7 expenses')).toBeInTheDocument();
    });

    it('does not show "All Expenses" section when 5 or fewer expenses', () => {
      const fewExpenses = mockExpenses.slice(0, 3);
      
      render(
        <Dashboard 
          expenses={fewExpenses} 
          categories={mockCategories} 
          dashboardStats={mockDashboardStats} 
        />
      );

      expect(screen.queryByText('📝 All Expenses')).not.toBeInTheDocument();
      expect(screen.queryByText(/Showing \d+ of \d+ expenses/)).not.toBeInTheDocument();
    });
  });

  describe('Charts and Stats', () => {
    it('passes correct data to chart component', () => {
      render(
        <Dashboard 
          expenses={mockExpenses} 
          categories={mockCategories} 
          dashboardStats={mockDashboardStats} 
        />
      );

      const chart = screen.getByTestId('expense-chart');
      expect(chart).toHaveTextContent('Categories data: 2');
      expect(chart).toHaveTextContent('Recent expenses: 2');
    });

    it('handles missing chart data gracefully', () => {
      render(
        <Dashboard 
          expenses={mockExpenses} 
          categories={mockCategories} 
          dashboardStats={{}} 
        />
      );

      const chart = screen.getByTestId('expense-chart');
      expect(chart).toHaveTextContent('Categories data: 0');
      expect(chart).toHaveTextContent('Recent expenses: 0');
    });

    it('passes stats to StatsCards component', () => {
      render(
        <Dashboard 
          expenses={mockExpenses} 
          categories={mockCategories} 
          dashboardStats={mockDashboardStats} 
        />
      );

      expect(screen.getByTestId('stats-cards')).toHaveTextContent('Stats: loaded');
    });
  });

  describe('Budget Overview', () => {
    it('renders budget overview when budget data exists', () => {
      render(
        <Dashboard 
          expenses={mockExpenses} 
          categories={mockCategories} 
          dashboardStats={mockDashboardStats} 
        />
      );

      expect(screen.getByText('🎯 Budget Overview')).toBeInTheDocument();
      expect(screen.getByText('Food')).toBeInTheDocument();
      expect(screen.getByText('Transport')).toBeInTheDocument();
      expect(screen.getByText('75.0%')).toBeInTheDocument();
      expect(screen.getByText('90.0%')).toBeInTheDocument();
    });

    it('shows correct budget amounts and spent amounts', () => {
      render(
        <Dashboard 
          expenses={mockExpenses} 
          categories={mockCategories} 
          dashboardStats={mockDashboardStats} 
        />
      );

      expect(screen.getByText('€300 / €400')).toBeInTheDocument();
      expect(screen.getByText('€180 / €200')).toBeInTheDocument();
    });

    it('does not render budget overview when no budget data', () => {
      const statsWithoutBudget = {
        ...mockDashboardStats,
        budgetOverview: []
      };

      render(
        <Dashboard 
          expenses={mockExpenses} 
          categories={mockCategories} 
          dashboardStats={statsWithoutBudget} 
        />
      );

      expect(screen.queryByText('🎯 Budget Overview')).not.toBeInTheDocument();
    });

    it('does not render budget overview when budgetOverview is undefined', () => {
      const statsWithoutBudget = {
        ...mockDashboardStats,
        budgetOverview: undefined
      };

      render(
        <Dashboard 
          expenses={mockExpenses} 
          categories={mockCategories} 
          dashboardStats={statsWithoutBudget} 
        />
      );

      expect(screen.queryByText('🎯 Budget Overview')).not.toBeInTheDocument();
    });

    it('handles budget items with missing data gracefully', () => {
      const statsWithIncompleteData = {
        ...mockDashboardStats,
        budgetOverview: [
          {
            // Missing category, color, amounts
            percentage_used: null
          }
        ]
      };

      render(
        <Dashboard 
          expenses={mockExpenses} 
          categories={mockCategories} 
          dashboardStats={statsWithIncompleteData} 
        />
      );

      expect(screen.getByText('🎯 Budget Overview')).toBeInTheDocument();
      expect(screen.getByText('General')).toBeInTheDocument(); // Default category
      expect(screen.getByText('0%')).toBeInTheDocument(); // Default percentage
      expect(screen.getByText('€0 / €0')).toBeInTheDocument(); // Default amounts
    });
  });

  describe('Component Integration', () => {
    it('passes correct props to all child components', () => {
      render(
        <Dashboard 
          expenses={mockExpenses} 
          categories={mockCategories} 
          dashboardStats={mockDashboardStats} 
        />
      );

      // Check StatsCards
      expect(screen.getByTestId('stats-cards')).toHaveTextContent('Stats: loaded');

      // Check ExpenseChart
      const chart = screen.getByTestId('expense-chart');
      expect(chart).toHaveTextContent('Categories data: 2');
      expect(chart).toHaveTextContent('Recent expenses: 2');

      // Check ExpensesList components
      const expensesLists = screen.getAllByTestId('expenses-list');
      expect(expensesLists[0]).toHaveTextContent('Categories count: 2');
      expect(expensesLists[1]).toHaveTextContent('Categories count: 2');
    });
  });
});