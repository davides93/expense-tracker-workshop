import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Expenses API
export const fetchExpenses = async (params = {}) => {
  const response = await api.get('/expenses', { params });
  return response.data;
};

export const createExpense = async (expense) => {
  const response = await api.post('/expenses', expense);
  return response.data;
};

export const updateExpense = async (id, expense) => {
  const response = await api.put(`/expenses/${id}`, expense);
  return response.data;
};

export const deleteExpense = async (id) => {
  const response = await api.delete(`/expenses/${id}`);
  return response.data;
};

// Categories API
export const fetchCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const createCategory = async (category) => {
  const response = await api.post('/categories', category);
  return response.data;
};

// Budgets API
export const fetchBudgets = async () => {
  const response = await api.get('/budgets');
  return response.data;
};

export const createBudget = async (budget) => {
  const response = await api.post('/budgets', budget);
  return response.data;
};

// Stats API
export const fetchDashboardStats = async () => {
  const response = await api.get('/stats/dashboard');
  return response.data;
};

export const fetchMonthlyStats = async () => {
  const response = await api.get('/stats/monthly');
  return response.data;
};

export default api;