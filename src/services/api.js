const BASE_URL = import.meta.env.VITE_API_URL || '';

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    if (res.status === 401 && token) {
      localStorage.removeItem('token');
    }
    const data = await res.json().catch(() => ({}));
    const error = new Error(data.detail || 'Erro de rede');
    error.status = res.status;
    throw error;
  }

  return res.json();
}

const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
};

export default api;
