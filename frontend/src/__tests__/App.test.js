import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import * as api from '../utils/api';

// Mock the API functions
jest.mock('../utils/api');

// Mock child components to focus on App logic
jest.mock('../pages/Dashboard', () => {
  return function MockDashboard({ expenses, categories, dashboardStats }) {
    return (
      <div data-testid="dashboard">
        <div>Expenses: {expenses.length}</div>
        <div>Categories: {categories.length}</div>
        <div>Stats: {dashboardStats ? 'loaded' : 'not loaded'}</div>
      </div>
    );
  };
});

jest.mock('../components/ExpenseForm', () => {
  return function MockExpenseForm({ categories, onExpenseAdded }) {
    return (
      <div data-testid="expense-form">
        <div>Categories: {categories.length}</div>
        <button onClick={onExpenseAdded}>Add Expense</button>
      </div>
    );
  };
});

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Data Loading', () => {
    it('renders loading state initially', () => {
      // Mock API calls to never resolve
      api.fetchExpenses.mockImplementation(() => new Promise(() => {}));
      api.fetchCategories.mockImplementation(() => new Promise(() => {}));
      api.fetchDashboardStats.mockImplementation(() => new Promise(() => {}));

      render(<App />);

      expect(screen.getByText('💰 Loading your expense tracker...')).toBeInTheDocument();
    });

    it('loads initial data successfully', async () => {
      const mockExpenses = { expenses: [{ id: 1, amount: 100 }] };
      const mockCategories = [{ id: 1, name: 'Food' }];
      const mockStats = { totalExpenses: 10 };

      api.fetchExpenses.mockResolvedValue(mockExpenses);
      api.fetchCategories.mockResolvedValue(mockCategories);
      api.fetchDashboardStats.mockResolvedValue(mockStats);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });

      expect(screen.getByText('Expenses: 1')).toBeInTheDocument();
      expect(screen.getByText('Categories: 1')).toBeInTheDocument();
      expect(screen.getByText('Stats: loaded')).toBeInTheDocument();
    });

    it('handles loading error', async () => {
      api.fetchExpenses.mockRejectedValue(new Error('API Error'));
      api.fetchCategories.mockRejectedValue(new Error('API Error'));
      api.fetchDashboardStats.mockRejectedValue(new Error('API Error'));

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('❌ Failed to load data. Please try again.')).toBeInTheDocument();
      });

      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('retries loading data when try again is clicked', async () => {
      // First calls fail
      api.fetchExpenses.mockRejectedValueOnce(new Error('API Error'));
      api.fetchCategories.mockRejectedValueOnce(new Error('API Error'));
      api.fetchDashboardStats.mockRejectedValueOnce(new Error('API Error'));

      // Second calls succeed
      api.fetchExpenses.mockResolvedValue({ expenses: [] });
      api.fetchCategories.mockResolvedValue([]);
      api.fetchDashboardStats.mockResolvedValue({});

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Try Again'));

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    beforeEach(async () => {
      api.fetchExpenses.mockResolvedValue({ expenses: [] });
      api.fetchCategories.mockResolvedValue([]);
      api.fetchDashboardStats.mockResolvedValue({});
    });

    it('renders header and navigation', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('💰 Expense Tracker')).toBeInTheDocument();
      });

      expect(screen.getByText('Modern Financial Management Made Simple')).toBeInTheDocument();
      expect(screen.getByText('📊 Dashboard')).toBeInTheDocument();
      expect(screen.getByText('➕ Add Expense')).toBeInTheDocument();
      expect(screen.getByText('🔄 Refresh')).toBeInTheDocument();
    });

    it('starts with dashboard view', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('expense-form')).not.toBeInTheDocument();
    });

    it('switches to add expense view when button clicked', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('➕ Add Expense'));

      expect(screen.getByTestId('expense-form')).toBeInTheDocument();
      expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
    });

    it('switches back to dashboard view when dashboard button clicked', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });

      // Switch to add expense
      fireEvent.click(screen.getByText('➕ Add Expense'));
      expect(screen.getByTestId('expense-form')).toBeInTheDocument();

      // Switch back to dashboard
      fireEvent.click(screen.getByText('📊 Dashboard'));
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      expect(screen.queryByTestId('expense-form')).not.toBeInTheDocument();
    });

    it('refreshes data when refresh button clicked', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });

      // Clear previous calls
      jest.clearAllMocks();

      fireEvent.click(screen.getByText('🔄 Refresh'));

      expect(api.fetchExpenses).toHaveBeenCalled();
      expect(api.fetchCategories).toHaveBeenCalled();
      expect(api.fetchDashboardStats).toHaveBeenCalled();
    });
  });

  describe('Expense Management', () => {
    beforeEach(async () => {
      api.fetchExpenses.mockResolvedValue({ expenses: [] });
      api.fetchCategories.mockResolvedValue([]);
      api.fetchDashboardStats.mockResolvedValue({});
    });

    it('handles expense added callback', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });

      // Switch to add expense form
      fireEvent.click(screen.getByText('➕ Add Expense'));
      expect(screen.getByTestId('expense-form')).toBeInTheDocument();

      // Clear previous API calls
      jest.clearAllMocks();

      // Simulate adding an expense
      fireEvent.click(screen.getByText('Add Expense'));

      // Should refresh data and return to dashboard
      await waitFor(() => {
        expect(api.fetchExpenses).toHaveBeenCalled();
        expect(api.fetchCategories).toHaveBeenCalled();
        expect(api.fetchDashboardStats).toHaveBeenCalled();
      });

      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      expect(screen.queryByTestId('expense-form')).not.toBeInTheDocument();
    });
  });

  describe('Button States', () => {
    beforeEach(async () => {
      api.fetchExpenses.mockResolvedValue({ expenses: [] });
      api.fetchCategories.mockResolvedValue([]);
      api.fetchDashboardStats.mockResolvedValue({});
    });

    it('shows correct active state for dashboard button', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });

      const dashboardButton = screen.getByText('📊 Dashboard');
      const addExpenseButton = screen.getByText('➕ Add Expense');

      expect(dashboardButton).toHaveClass('btn-primary');
      expect(addExpenseButton).toHaveClass('btn-success');
    });

    it('shows correct active state for add expense button', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('➕ Add Expense'));

      const dashboardButton = screen.getByText('📊 Dashboard');
      const addExpenseButton = screen.getByText('➕ Add Expense');

      expect(dashboardButton).toHaveClass('btn-warning');
      expect(addExpenseButton).toHaveClass('btn-primary');
    });
  });
});