const BASE_URL = import.meta.env.VITE_API_URL || 'https://pi4-backend-pfok.onrender.com';

async function handleResponse(res) {
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('token');
    }
    const data = await res.json().catch(() => ({}));
    const error = new Error(data.detail || 'Erro de rede');
    error.status = res.status;
    throw error;
  }
  if (res.status === 204) return null;
  return res.json();
}

function getAuthHeaders() {
  const headers = {};
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json', ...getAuthHeaders() };
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
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
      body: formData,
    });
    return handleResponse(res);
  },
};

export default api;
