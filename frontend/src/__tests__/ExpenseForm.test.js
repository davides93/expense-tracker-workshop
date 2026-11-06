import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExpenseForm from '../components/ExpenseForm';
import { createExpense } from '../utils/api';

// Mock the API
jest.mock('../utils/api');

describe('ExpenseForm Component', () => {
  const mockCategories = [
    { id: 1, name: 'Food & Dining' },
    { id: 2, name: 'Transportation' },
    { id: 3, name: 'Entertainment' }
  ];

  const mockOnExpenseAdded = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Initial Rendering', () => {
    it('renders form with all required fields', () => {
      render(<ExpenseForm categories={mockCategories} onExpenseAdded={mockOnExpenseAdded} />);

      expect(screen.getByText('➕ Add New Expense')).toBeInTheDocument();
      expect(screen.getByLabelText('💰 Amount *')).toBeInTheDocument();
      expect(screen.getByLabelText('💱 Currency')).toBeInTheDocument();
      expect(screen.getByLabelText('📅 Date *')).toBeInTheDocument();
      expect(screen.getByLabelText('🏷️ Category')).toBeInTheDocument();
      expect(screen.getByLabelText('📝 Description')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '✅ Add Expense' })).toBeInTheDocument();
    });

    it('has default values set correctly', () => {
      render(<ExpenseForm categories={mockCategories} onExpenseAdded={mockOnExpenseAdded} />);

      expect(screen.getByDisplayValue('EUR')).toBeInTheDocument();
      expect(screen.getByDisplayValue(new Date().toISOString().split('T')[0])).toBeInTheDocument();
      expect(screen.getByDisplayValue('')).toBeInTheDocument(); // amount
    });

    it('renders category options correctly', () => {
      render(<ExpenseForm categories={mockCategories} onExpenseAdded={mockOnExpenseAdded} />);

      const categorySelect = screen.getByLabelText('🏷️ Category');
      
      expect(screen.getByText('Select a category')).toBeInTheDocument();
      expect(screen.getByText('Food & Dining')).toBeInTheDocument();
      expect(screen.getByText('Transportation')).toBeInTheDocument();
      expect(screen.getByText('Entertainment')).toBeInTheDocument();
    });

    it('renders currency options correctly', () => {
      render(<ExpenseForm categories={mockCategories} onExpenseAdded={mockOnExpenseAdded} />);

      expect(screen.getByText('EUR (€)')).toBeInTheDocument();
      expect(screen.getByText('USD ($)')).toBeInTheDocument();
      expect(screen.getByText('GBP (£)')).toBeInTheDocument();
    });

    it('renders tips section', () => {
      render(<ExpenseForm categories={mockCategories} onExpenseAdded={mockOnExpenseAdded} />);

      expect(screen.getByText('💡 Quick Tips:')).toBeInTheDocument();
      expect(screen.getByText(/Be specific in your descriptions/)).toBeInTheDocument();
      expect(screen.getByText(/Choose the right category/)).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('updates form fields when user types', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<ExpenseForm categories={mockCategories} onExpenseAdded={mockOnExpenseAdded} />);

      const amountInput = screen.getByLabelText('💰 Amount *');
      const descriptionInput = screen.getByLabelText('📝 Description');

      await user.type(amountInput, '25.50');
      await user.type(descriptionInput, 'Lunch at restaurant');

      expect(amountInput).toHaveValue(25.50);
      expect(descriptionInput).toHaveValue('Lunch at restaurant');
    });

    it('updates category when selected', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<ExpenseForm categories={mockCategories} onExpenseAdded={mockOnExpenseAdded} />);

      const categorySelect = screen.getByLabelText('🏷️ Category');
      
      await user.selectOptions(categorySelect, '1');
      expect(categorySelect).toHaveValue('1');
    });

    it('updates currency when selected', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<ExpenseForm categories={mockCategories} onExpenseAdded={mockOnExpenseAdded} />);

      const currencySelect = screen.getByLabelText('💱 Currency');
      
      await user.selectOptions(currencySelect, 'USD');
      expect(currencySelect).toHaveValue('USD');
    });

    it('updates date when changed', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<ExpenseForm categories={mockCategories} onExpenseAdded={mockOnExpenseAdded} />);

      const dateInput = screen.getByLabelText('📅 Date *');
      
      await user.clear(dateInput);
      await user.type(dateInput, '2023-12-15');
      expect(dateInput).toHaveValue('2023-12-15');
    });
  });

  describe('Form Validation', () => {
    it('shows error when amount is missing', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<ExpenseForm categories={mockCategories} onExpenseAdded={mockOnExpenseAdded} />);

      const submitButton = screen.getByRole('button', { name: '✅ Add Expense' });
      
      await user.click(submitButton);

      expect(screen.getByText('❌ Amount and date are required')).toBeInTheDocument();
    });

    it('shows error when amount is zero or negative', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<ExpenseForm categories={mockCategories} onExpenseAdded={mockOnExpenseAdded} />);

      const amountInput = screen.getByLabelText('💰 Amount *');
      const submitButton = screen.getByRole('button', { name: '✅ Add Expense' });
      
      await user.type(amountInput, '0');
      await user.click(submitButton);

      expect(screen.getByText('❌ Amount must be greater than 0')).toBeInTheDocument();
    });

    it('clears error when user starts typing after validation error', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<ExpenseForm categories={mockCategories} onExpenseAdded={mockOnExpenseAdded} />);

      const submitButton = screen.getByRole('button', { name: '✅ Add Expense' });
      const amountInput = screen.getByLabelText('💰 Amount *');
      
      // Trigger validation error
      await user.click(submitButton);
      expect(screen.getByText('❌ Amount and date are required')).toBeInTheDocument();

      // Start typing to clear error
      await user.type(amountInput, '10');
      expect(screen.queryByText('❌ Amount and date are required')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('submits form with correct data', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      createExpense.mockResolvedValue({ id: 1 });

      render(<ExpenseForm categories={mockCategories} onExpenseAdded={mockOnExpenseAdded} />);

      // Fill out form
      await user.type(screen.getByLabelText('💰 Amount *'), '25.50');
      await user.type(screen.getByLabelText('📝 Description'), 'Coffee and pastry');
      await user.selectOptions(screen.getByLabelText('🏷️ Category'), '1');
      await user.selectOptions(screen.getByLabelText('💱 Currency'), 'USD');

      // Submit form
      await user.click(screen.getByRole('button', { name: '✅ Add Expense' }));

      expect(createExpense).toHaveBeenCalledWith({
        amount: 25.50,
        currency: 'USD',
        description: 'Coffee and pastry',
        expense_date: new Date().toISOString().split('T')[0],
        category_id: 1,
      });
    });

    it('shows loading state during submission', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      createExpense.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<ExpenseForm categories={mockCategories} onExpenseAdded={mockOnExpenseAdded} />);

      await user.type(screen.getByLabelText('💰 Amount *'), '25.50');
      await user.click(screen.getByRole('button', { name: '✅ Add Expense' }));

      expect(screen.getByRole('button', { name: '⏳ Adding...' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '⏳ Adding...' })).toBeDisabled();
    });

    it('shows success state after successful submission', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      createExpense.mockResolvedValue({ id: 1 });

      render(<ExpenseForm categories={mockCategories} onExpenseAdded={mockOnExpenseAdded} />);

      await user.type(screen.getByLabelText('💰 Amount *'), '25.50');
      await user.click(screen.getByRole('button', { name: '✅ Add Expense' }));

      await waitFor(() => {
        expect(screen.getByText('Expense Added Successfully!')).toBeInTheDocument();
      });

      expect(screen.getByText('✅')).toBeInTheDocument();
      expect(screen.getByText('Your expense has been recorded and will appear in your dashboard.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add Another Expense' })).toBeInTheDocument();
    });

    it('calls onExpenseAdded callback after successful submission', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      createExpense.mockResolvedValue({ id: 1 });

      render(<ExpenseForm categories={mockCategories} onExpenseAdded={mockOnExpenseAdded} />);

      await user.type(screen.getByLabelText('💰 Amount *'), '25.50');
      await user.click(screen.getByRole('button', { name: '✅ Add Expense' }));

      // Fast-forward the timeout
      jest.advanceTimersByTime(1500);

      await waitFor(() => {
        expect(mockOnExpenseAdded).toHaveBeenCalled();
      });
    });

    it('resets form after successful submission', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      createExpense.mockResolvedValue({ id: 1 });

      render(<ExpenseForm categories={mockCategories} onExpenseAdded={mockOnExpenseAdded} />);

      await user.type(screen.getByLabelText('💰 Amount *'), '25.50');
      await user.type(screen.getByLabelText('📝 Description'), 'Test expense');
      await user.click(screen.getByRole('button', { name: '✅ Add Expense' }));

      // Click "Add Another Expense" to return to form
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Add Another Expense' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Add Another Expense' }));

      // Form should be reset
      expect(screen.getByLabelText('💰 Amount *')).toHaveValue(null);
      expect(screen.getByLabelText('📝 Description')).toHaveValue('');
    });

    it('shows error when submission fails', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      createExpense.mockRejectedValue(new Error('API Error'));

      render(<ExpenseForm categories={mockCategories} onExpenseAdded={mockOnExpenseAdded} />);

      await user.type(screen.getByLabelText('💰 Amount *'), '25.50');
      await user.click(screen.getByRole('button', { name: '✅ Add Expense' }));

      await waitFor(() => {
        expect(screen.getByText('❌ Failed to add expense. Please try again.')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty categories array', () => {
      render(<ExpenseForm categories={[]} onExpenseAdded={mockOnExpenseAdded} />);

      const categorySelect = screen.getByLabelText('🏷️ Category');
      expect(screen.getByText('Select a category')).toBeInTheDocument();
      expect(categorySelect.children).toHaveLength(1); // Only the placeholder option
    });

    it('submits without category_id when none selected', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      createExpense.mockResolvedValue({ id: 1 });

      render(<ExpenseForm categories={mockCategories} onExpenseAdded={mockOnExpenseAdded} />);

      await user.type(screen.getByLabelText('💰 Amount *'), '25.50');
      await user.click(screen.getByRole('button', { name: '✅ Add Expense' }));

      expect(createExpense).toHaveBeenCalledWith({
        amount: 25.50,
        currency: 'EUR',
        description: '',
        expense_date: new Date().toISOString().split('T')[0],
        category_id: null,
      });
    });

    it('works without onExpenseAdded callback', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      createExpense.mockResolvedValue({ id: 1 });

      render(<ExpenseForm categories={mockCategories} />); // No callback

      await user.type(screen.getByLabelText('💰 Amount *'), '25.50');
      await user.click(screen.getByRole('button', { name: '✅ Add Expense' }));

      await waitFor(() => {
        expect(screen.getByText('Expense Added Successfully!')).toBeInTheDocument();
      });

      // Should not throw error when callback is undefined
      jest.advanceTimersByTime(1500);
    });
  });
});