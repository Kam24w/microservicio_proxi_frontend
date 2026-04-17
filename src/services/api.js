import axios from 'axios';

// Cambia esta URL por la URL de tu backend en Railway al desplegar
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Servicios ──────────────────────────────────────────────────────────────

export const callService = (service, operation, params = []) =>
  api.post(`/api/services/${service}/${operation}`, { params });

// ── Métricas ───────────────────────────────────────────────────────────────

export const getSummary = () =>
  api.get('/api/metrics/summary');

export const getLogs = (filters = {}) => {
  const { service, status, from, to, page = 0, size = 20 } = filters;
  const params = new URLSearchParams();
  if (service) params.append('service', service);
  if (status)  params.append('status', status);
  if (from)    params.append('from', from);
  if (to)      params.append('to', to);
  params.append('page', page);
  params.append('size', size);
  return api.get(`/api/metrics/logs?${params.toString()}`);
};

export const simulateLoad = () =>
  api.post('/api/metrics/simulate-load');
