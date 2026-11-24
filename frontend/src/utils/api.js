import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Expenses API
export const fetchExpenses = async (params = {}, signal) => {
  const response = await api.get('/expenses', { params, signal });
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
export const fetchBudgets = async signal => {
  const response = await api.get('/budgets', { signal });
  return response.data;
};

export const createBudget = async (budget) => {
  const response = await api.post('/budgets', budget);
  return response.data;
};

export const updateBudget = async (id, budget) => {
  const response = await api.put(`/budgets/${id}`, budget);
  return response.data;
};

export const deleteBudget = async id => {
  await api.delete(`/budgets/${id}`);
};

// Stats API
export const fetchDashboardStats = async () => {
  const response = await api.get('/stats/dashboard');
  return response.data;
};

export const fetchMonthlyStats = async signal => {
  const response = await api.get('/stats/monthly', { signal });
  return response.data;
};

export default api;
