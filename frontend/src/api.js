import axios from 'axios';

const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export const errMsg = (e) => e?.response?.data?.message || 'Cannot reach the server. Is the backend running?';

export async function downloadReport(id) {
  const res = await api.get(`/predictions/${id}/report`, { responseType: 'blob' });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url; a.download = `health-report-${id}.pdf`; a.click();
  URL.revokeObjectURL(url);
}

export default api;
