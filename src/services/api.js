const BASE_URL = import.meta.env.VITE_API_URL || 'https://pi4-backend-pfok.onrender.com';

function getAuthHeaders() {
  const token = sessionStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res) {
  if (res.status === 401) sessionStorage.removeItem('token');
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const error = new Error(data.detail || 'Erro de rede');
    error.status = res.status;
    throw error;
  }
  if (res.status === 204) return null;
  return res.json();
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json', ...getAuthHeaders() };
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse(res);
}

const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),
  upload: async (path, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: formData,
    });
    return handleResponse(res);
  },
};

export default api;
