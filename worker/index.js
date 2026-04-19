export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request),
      });
    }

    if (!url.pathname.startsWith('/api')) {
      return new Response('Not Found', { status: 404 });
    }

    const backendPath = url.pathname.replace(/^\/api/, '');
    const backendUrl = `${env.BACKEND_URL}${backendPath}${url.search}`;

    const headers = new Headers(request.headers);
    headers.delete('host');

    const res = await fetch(backendUrl, {
      method: request.method,
      headers,
      body: request.method !== 'GET' && request.method !== 'HEAD'
        ? request.body
        : undefined,
    });

    const responseHeaders = new Headers(res.headers);
    Object.entries(corsHeaders(request)).forEach(([k, v]) => {
      responseHeaders.set(k, v);
    });

    return new Response(res.body, {
      status: res.status,
      headers: responseHeaders,
    });
  },
};

function corsHeaders(request) {
  return {
    'Access-Control-Allow-Origin': request.headers.get('Origin') || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}
